import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
  Put,
  Query,
  Request,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ConsultationMode } from '@prisma/client';
import { Roles, RolesGuard } from '../auth/roles.guard';
import { AvailabilityService } from './availability.service';
import {
  CreateOverrideDto,
  UpsertWeeklyScheduleDto,
} from './dto/availability.dto';

@Controller('availability')
@UseGuards(AuthGuard('jwt'), RolesGuard)
export class AvailabilityController {
  constructor(private readonly availabilityService: AvailabilityService) {}

  // ─────────────────────────────────────────────────────────────────────────
  // Weekly Schedule (Therapist — baseline working hours)
  // ─────────────────────────────────────────────────────────────────────────

  /** GET /availability/schedule — therapist retrieves their own weekly rules */
  @Get('schedule')
  @Roles('THERAPIST')
  async getSchedule(@Request() req: any) {
    const therapist = await this.availabilityService.getTherapistByUserId(
      req.user.userId,
    );
    return this.availabilityService.getWeeklySchedule(therapist.id);
  }

  /** PUT /availability/schedule — full upsert of weekly availability rules */
  @Put('schedule')
  @Roles('THERAPIST')
  async upsertSchedule(
    @Request() req: any,
    @Body() dto: UpsertWeeklyScheduleDto,
  ) {
    const therapist = await this.availabilityService.getTherapistByUserId(
      req.user.userId,
    );
    return this.availabilityService.upsertWeeklySchedule(therapist.id, dto);
  }

  // ─────────────────────────────────────────────────────────────────────────
  // Schedule Overrides (Therapist — date-specific exceptions)
  // ─────────────────────────────────────────────────────────────────────────

  /** GET /availability/overrides — list therapist's own overrides */
  @Get('overrides')
  @Roles('THERAPIST')
  async getOverrides(@Request() req: any) {
    const therapist = await this.availabilityService.getTherapistByUserId(
      req.user.userId,
    );
    return this.availabilityService.getOverrides(therapist.id);
  }

  /** POST /availability/overrides — add or update a date override */
  @Post('overrides')
  @Roles('THERAPIST')
  async createOverride(@Request() req: any, @Body() dto: CreateOverrideDto) {
    const therapist = await this.availabilityService.getTherapistByUserId(
      req.user.userId,
    );
    return this.availabilityService.createOverride(therapist.id, dto);
  }

  /** DELETE /availability/overrides/:id — remove a date override */
  @Delete('overrides/:id')
  @Roles('THERAPIST')
  async deleteOverride(
    @Request() req: any,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    const therapist = await this.availabilityService.getTherapistByUserId(
      req.user.userId,
    );
    return this.availabilityService.deleteOverride(therapist.id, id);
  }

  // ─────────────────────────────────────────────────────────────────────────
  // Slot Generation — Therapist (preview their own slots)
  // ─────────────────────────────────────────────────────────────────────────

  /**
   * GET /availability/slots?date=YYYY-MM-DD&mode=ONLINE
   * Therapist previews what slots are available for a given date.
   */
  @Get('slots')
  @Roles('THERAPIST')
  async getMySlots(
    @Request() req: any,
    @Query('date') date: string,
    @Query('mode') mode?: ConsultationMode,
  ) {
    const therapist = await this.availabilityService.getTherapistByUserId(
      req.user.userId,
    );
    return this.availabilityService.getAvailableSlots(therapist.id, date, mode);
  }

  // ─────────────────────────────────────────────────────────────────────────
  // Public Slot Generation — for patients browsing therapist profiles
  // ─────────────────────────────────────────────────────────────────────────

  /**
   * GET /availability/therapist/:id/slots?date=YYYY-MM-DD&mode=ONLINE
   * Used by patient app to render available time slots for booking.
   */
  @Get('therapist/:id/slots')
  @Roles('PATIENT', 'ADMIN', 'THERAPIST')
  async getTherapistSlots(
    @Param('id', ParseUUIDPipe) therapistId: string,
    @Query('date') date: string,
    @Query('mode') mode?: ConsultationMode,
  ) {
    return this.availabilityService.getTherapistPublicSlots(
      therapistId,
      date,
      mode,
    );
  }

  /**
   * GET /availability/therapist/:id/schedule
   * Public view of the therapist's weekly schedule (for displaying
   * "available days" on the therapist discovery page).
   */
  @Get('therapist/:id/schedule')
  @Roles('PATIENT', 'ADMIN', 'THERAPIST')
  async getTherapistSchedule(@Param('id', ParseUUIDPipe) therapistId: string) {
    return this.availabilityService.getWeeklySchedule(therapistId);
  }
}
