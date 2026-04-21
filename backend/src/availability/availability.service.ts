import { Injectable, ConflictException, ForbiddenException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ConsultationMode } from '@prisma/client';

@Injectable()
export class AvailabilityService {
  constructor(private prisma: PrismaService) {}

  async createSlot(therapistId: string, data: { dayOfWeek: number; startTime: string; endTime: string; mode?: ConsultationMode }) {
    const mode = data.mode ?? ConsultationMode.ONLINE;
    // Check for duplicates
    const existing = await this.prisma.availabilitySlot.findUnique({
      where: {
        therapistId_dayOfWeek_startTime_mode: {
          therapistId,
          dayOfWeek: data.dayOfWeek,
          startTime: data.startTime,
          mode,
        },
      },
    });

    if (existing) {
      if (existing.isActive) {
        throw new ConflictException('A slot already exists for this time and mode');
      } else {
        // Reactivate inactive slot
        return this.prisma.availabilitySlot.update({
          where: { id: existing.id },
          data: { isActive: true, endTime: data.endTime },
        });
      }
    }

    return this.prisma.availabilitySlot.create({
      data: {
        dayOfWeek: data.dayOfWeek,
        startTime: data.startTime,
        endTime: data.endTime,
        mode,
        therapistId,
      },
    });
  }

  async getMySlots(therapistId: string) {
    return this.prisma.availabilitySlot.findMany({
      where: { therapistId, isActive: true },
      orderBy: [
        { dayOfWeek: 'asc' },
        { startTime: 'asc' },
      ],
    });
  }

  async deactivateSlot(therapistId: string, id: string) {
    const slot = await this.prisma.availabilitySlot.findUnique({
      where: { id },
    });

    if (!slot) throw new NotFoundException('Slot not found');
    if (slot.therapistId !== therapistId) throw new ForbiddenException('Not your slot');

    return this.prisma.availabilitySlot.update({
      where: { id },
      data: { isActive: false },
    });
  }

  async getTherapistSlots(therapistId: string) {
    const slots = await this.prisma.availabilitySlot.findMany({
      where: { therapistId, isActive: true },
      include: {
        therapist: {
          select: { clinicAddress: true }
        }
      },
      orderBy: [
        { dayOfWeek: 'asc' },
        { startTime: 'asc' },
      ],
    });

    // Fetch all upcoming appointments for this therapist across ALL slots/modes
    const allAppointments = await this.prisma.appointment.findMany({
      where: {
        therapistId,
        status: { in: ['PENDING', 'CONFIRMED'] },
        scheduledAt: { gte: new Date() }
      }
    });

    // Return slots and include the therapist's entire schedule for collision detection
    return slots.map(slot => ({
      ...slot,
      appointments: allAppointments // Map to 'appointments' key for frontend compatibility
    }));
  }
}
