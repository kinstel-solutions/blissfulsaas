import {
  Injectable,
  BadRequestException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ConsultationMode } from '@prisma/client';
import {
  UpsertWeeklyScheduleDto,
  CreateOverrideDto,
} from './dto/availability.dto';

// ---------------------------------------------------------------------------
// Helpers — all time math is done in HH:mm UTC strings and Date objects
// ---------------------------------------------------------------------------

/** Parse "HH:mm" → total minutes from midnight */
function parseTime(hhmm: string): number {
  const [h, m] = hhmm.split(':').map(Number);
  return h * 60 + m;
}

/** Total minutes → "HH:mm" */
function formatTime(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}

/** Return "YYYY-MM-DD" for a UTC Date */
function toDateString(d: Date): string {
  return d.toISOString().slice(0, 10);
}

/** Given a "YYYY-MM-DD" and "HH:mm", return Date in Indian Standard Time (IST, UTC+05:30) */
function toIstDate(dateStr: string, time: string): Date {
  return new Date(`${dateStr}T${time}:00+05:30`);
}

/** Check whether two UTC intervals overlap [s1,e1) ∩ [s2,e2) ≠ ∅ */
function intervalsOverlap(s1: Date, e1: Date, s2: Date, e2: Date): boolean {
  return s1 < e2 && e1 > s2;
}

export interface TimeSlot {
  startTime: string; // "HH:mm" UTC
  endTime: string; // "HH:mm" UTC
  startUtc: string; // ISO 8601
  endUtc: string; // ISO 8601
  mode: ConsultationMode;
  available: boolean;
}

@Injectable()
export class AvailabilityService {
  /** Session duration and buffer (minutes) */
  private readonly SESSION_DURATION = 50;
  private readonly BUFFER = 10;
  /** Total block per slot */
  private get SLOT_BLOCK() {
    return this.SESSION_DURATION + this.BUFFER;
  }

  constructor(private prisma: PrismaService) {}

  // ─────────────────────────────────────────────────────────────────────────
  // Auth helpers
  // ─────────────────────────────────────────────────────────────────────────

  async getTherapistByUserId(userId: string) {
    const therapist = await this.prisma.therapist.findUnique({
      where: { userId },
    });
    if (!therapist) throw new NotFoundException('Therapist profile not found');
    return therapist;
  }

  // ─────────────────────────────────────────────────────────────────────────
  // Weekly Schedule (baseline rules)
  // ─────────────────────────────────────────────────────────────────────────

  async getWeeklySchedule(therapistId: string) {
    return this.prisma.weeklyAvailability.findMany({
      where: { therapistId, isActive: true },
      orderBy: [{ dayOfWeek: 'asc' }, { mode: 'asc' }],
    });
  }

  /**
   * Full upsert — the frontend sends the complete desired state for all
   * days. We upsert each item and deactivate any days not mentioned.
   */
  async upsertWeeklySchedule(
    therapistId: string,
    dto: UpsertWeeklyScheduleDto,
  ) {
    return this.prisma.$transaction(async (tx) => {
      // Deactivate all existing rules for this therapist first
      await tx.weeklyAvailability.updateMany({
        where: { therapistId },
        data: { isActive: false },
      });

      // Upsert each item in the new schedule
      for (const item of dto.schedule) {
        if (!item.isActive && item.isActive !== undefined) continue; // skip inactive

        this.validateTimeRange(item.startTime, item.endTime);

        await tx.weeklyAvailability.upsert({
          where: {
            therapistId_dayOfWeek_mode: {
              therapistId,
              dayOfWeek: item.dayOfWeek,
              mode: item.mode as ConsultationMode,
            },
          },
          create: {
            therapistId,
            dayOfWeek: item.dayOfWeek,
            startTime: item.startTime,
            endTime: item.endTime,
            mode: item.mode as ConsultationMode,
            isActive: true,
          },
          update: {
            startTime: item.startTime,
            endTime: item.endTime,
            isActive: true,
          },
        });
      }

      return tx.weeklyAvailability.findMany({
        where: { therapistId, isActive: true },
        orderBy: [{ dayOfWeek: 'asc' }, { mode: 'asc' }],
      });
    });
  }

  // ─────────────────────────────────────────────────────────────────────────
  // Schedule Overrides (date-specific exceptions)
  // ─────────────────────────────────────────────────────────────────────────

  async getOverrides(therapistId: string) {
    return this.prisma.scheduleOverride.findMany({
      where: {
        therapistId,
        date: { gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) }, // last 30 days + future
      },
      orderBy: { date: 'asc' },
    });
  }

  async createOverride(therapistId: string, dto: CreateOverrideDto) {
    // Normalise the date to midnight UTC
    const dateMidnight = new Date(`${dto.date}T00:00:00.000Z`);

    if (dto.isAvailable) {
      if (!dto.startTime || !dto.endTime) {
        throw new BadRequestException(
          'startTime and endTime are required when isAvailable is true',
        );
      }
      this.validateTimeRange(dto.startTime, dto.endTime);
    }

    return this.prisma.scheduleOverride.upsert({
      where: {
        therapistId_date_mode: {
          therapistId,
          date: dateMidnight,
          mode: (dto.mode as ConsultationMode) ?? null,
        },
      },
      create: {
        therapistId,
        date: dateMidnight,
        isAvailable: dto.isAvailable,
        startTime: dto.startTime ?? null,
        endTime: dto.endTime ?? null,
        mode: (dto.mode as ConsultationMode) ?? null,
        reason: dto.reason ?? null,
      },
      update: {
        isAvailable: dto.isAvailable,
        startTime: dto.startTime ?? null,
        endTime: dto.endTime ?? null,
        mode: (dto.mode as ConsultationMode) ?? null,
        reason: dto.reason ?? null,
      },
    });
  }

  async deleteOverride(therapistId: string, id: string) {
    const override = await this.prisma.scheduleOverride.findUnique({
      where: { id },
    });
    if (!override) throw new NotFoundException('Override not found');
    if (override.therapistId !== therapistId)
      throw new ForbiddenException('Not your override');

    return this.prisma.scheduleOverride.delete({ where: { id } });
  }

  // ─────────────────────────────────────────────────────────────────────────
  // Slot Generation Pipeline
  // The core "calendar math" — runs entirely in UTC
  // ─────────────────────────────────────────────────────────────────────────

  /**
   * For a given therapistId, date (YYYY-MM-DD) and optional mode, returns
   * all available time slots after applying the three-step pipeline:
   *   1. Check ScheduleOverride for that date
   *   2. Fallback to WeeklyAvailability for that day-of-week
   *   3. Chop into SESSION_DURATION slots, subtract existing Appointments
   */
  async getAvailableSlots(
    therapistId: string,
    dateStr: string,
    mode?: ConsultationMode,
  ): Promise<TimeSlot[]> {
    const dateMidnight = new Date(`${dateStr}T00:00:00.000Z`);
    const dayOfWeek = dateMidnight.getUTCDay();

    const modesToCheck: ConsultationMode[] = mode
      ? [mode]
      : [ConsultationMode.ONLINE, ConsultationMode.IN_CLINIC];

    // --- Step 1 & 2: Determine active time blocks per mode ------------------
    const activeBlocks: Array<{
      startMin: number;
      endMin: number;
      mode: ConsultationMode;
    }> = [];

    for (const m of modesToCheck) {
      const block = await this.resolveActiveBlock(
        therapistId,
        dateMidnight,
        dayOfWeek,
        m,
      );
      if (block) activeBlocks.push({ ...block, mode: m });
    }

    if (activeBlocks.length === 0) return [];

    // --- Step 3: Load existing appointments (bookings) for the day ----------
    // Since we are operating in IST (+05:30), a date day starts at 00:00 IST and ends at 23:59:59 IST.
    // In UTC, this corresponds to:
    // Start: dateStr T 00:00:00+05:30 -> (previous day) 18:30 UTC
    // End: dateStr T 23:59:59.999+05:30 -> (current day) 18:29:59.999 UTC
    const dayStart = new Date(`${dateStr}T00:00:00+05:30`);
    const dayEnd = new Date(`${dateStr}T23:59:59.999+05:30`);

    const bookings = await this.prisma.appointment.findMany({
      where: {
        therapistId,
        scheduledAt: { gte: dayStart, lte: dayEnd },
        status: { in: ['PENDING', 'CONFIRMED'] },
      },
      select: {
        scheduledAt: true,
        duration: true,
        mode: true,
      },
    });

    // --- Step 4: Generate and filter slots ----------------------------------
    const allSlots: TimeSlot[] = [];

    for (const block of activeBlocks) {
      let cursor = block.startMin;

      while (cursor + this.SLOT_BLOCK <= block.endMin) {
        const slotStart = toIstDate(dateStr, formatTime(cursor));
        const slotEnd = toIstDate(
          dateStr,
          formatTime(cursor + this.SESSION_DURATION),
        );

        // Check if this slot collides with any booking (any mode — therapist
        // is a single person, so in-clinic blocks online too)
        const isBooked = bookings.some((b) => {
          const bStart = new Date(b.scheduledAt);
          const bEnd = new Date(bStart.getTime() + b.duration * 60 * 1000);
          return intervalsOverlap(slotStart, slotEnd, bStart, bEnd);
        });

        // Return all slots, but mark past slots as unavailable
        const now = new Date();
        allSlots.push({
          startTime: formatTime(cursor),
          endTime: formatTime(cursor + this.SESSION_DURATION),
          startUtc: slotStart.toISOString(),
          endUtc: slotEnd.toISOString(),
          mode: block.mode,
          available: !isBooked && slotStart > now,
        });

        cursor += 15;
      }
    }

    return allSlots;
  }

  /**
   * Resolves the effective time block for a given therapist / date / mode.
   * Returns null if the therapist is unavailable (override = off, or no
   * weekly schedule found).
   *
   * Priority: ScheduleOverride (mode-specific) → ScheduleOverride (null mode)
   *           → WeeklyAvailability
   */
  private async resolveActiveBlock(
    therapistId: string,
    dateMidnight: Date,
    dayOfWeek: number,
    mode: ConsultationMode,
  ): Promise<{ startMin: number; endMin: number } | null> {
    // Check mode-specific override first, then catch-all (mode = null)
    const override = await this.prisma.scheduleOverride.findFirst({
      where: {
        therapistId,
        date: dateMidnight,
        OR: [{ mode }, { mode: null }],
      },
      orderBy: { mode: 'asc' }, // mode-specific (non-null) sorts before null
    });

    if (override) {
      if (!override.isAvailable) return null; // Day blocked
      if (override.startTime && override.endTime) {
        return {
          startMin: parseTime(override.startTime),
          endMin: parseTime(override.endTime),
        };
      }
      // isAvailable=true but no custom hours → shouldn't normally happen,
      // fall through to weekly schedule
    }

    // Fallback to weekly schedule
    const weekly = await this.prisma.weeklyAvailability.findUnique({
      where: {
        therapistId_dayOfWeek_mode: { therapistId, dayOfWeek, mode },
      },
    });

    if (!weekly || !weekly.isActive) return null;

    return {
      startMin: parseTime(weekly.startTime),
      endMin: parseTime(weekly.endTime),
    };
  }

  // ─────────────────────────────────────────────────────────────────────────
  // Public-facing: slots for patient booking
  // ─────────────────────────────────────────────────────────────────────────

  async getTherapistPublicSlots(
    therapistId: string,
    dateStr: string,
    mode?: ConsultationMode,
  ) {
    // Verify therapist exists and is verified
    const therapist = await this.prisma.therapist.findUnique({
      where: { id: therapistId },
      select: { isVerified: true, clinicAddress: true },
    });
    if (!therapist) throw new NotFoundException('Therapist not found');

    const slots = await this.getAvailableSlots(therapistId, dateStr, mode);
    return {
      date: dateStr,
      therapistId,
      slots,
    };
  }

  // ─────────────────────────────────────────────────────────────────────────
  // Validation helpers
  // ─────────────────────────────────────────────────────────────────────────

  private validateTimeRange(startTime: string, endTime: string) {
    const start = parseTime(startTime);
    const end = parseTime(endTime);
    if (end <= start) {
      throw new BadRequestException('endTime must be after startTime');
    }
    if (end - start < this.SLOT_BLOCK) {
      throw new BadRequestException(
        `Time range must be at least ${this.SLOT_BLOCK} minutes`,
      );
    }
  }
}
