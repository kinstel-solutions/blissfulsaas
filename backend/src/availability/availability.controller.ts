import { Controller, Get, Post, Delete, Param, Body, UseGuards, Request, ParseUUIDPipe } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Roles, RolesGuard } from '../auth/roles.guard';
import { AvailabilityService } from './availability.service';

@Controller('availability')
@UseGuards(AuthGuard('jwt'), RolesGuard)
export class AvailabilityController {
  constructor(private readonly availabilityService: AvailabilityService) {}

  @Post()
  @Roles('THERAPIST')
  async create(@Request() req: any, @Body() data: { dayOfWeek: number; startTime: string; endTime: string; mode?: 'ONLINE' | 'IN_CLINIC' }) {
    // Current user is a therapist, find their therapist profile ID if needed
    // In this schema, User.id == Therapist.userId
    // We need to fetch the Therapist profile ID from the User ID
    const therapist = await (this.availabilityService as any).prisma.therapist.findUnique({
      where: { userId: req.user.userId }
    });
    return this.availabilityService.createSlot(therapist.id, data);
  }

  @Get()
  @Roles('THERAPIST')
  async getMySlots(@Request() req: any) {
    const therapist = await (this.availabilityService as any).prisma.therapist.findUnique({
      where: { userId: req.user.userId }
    });
    return this.availabilityService.getMySlots(therapist.id);
  }

  @Delete(':id')
  @Roles('THERAPIST')
  async remove(@Request() req: any, @Param('id', ParseUUIDPipe) id: string) {
    const therapist = await (this.availabilityService as any).prisma.therapist.findUnique({
      where: { userId: req.user.userId }
    });
    return this.availabilityService.deactivateSlot(therapist.id, id);
  }

  @Get('therapist/:id')
  @Roles('PATIENT', 'ADMIN')
  getTherapistSlots(@Param('id', ParseUUIDPipe) therapistId: string) {
    return this.availabilityService.getTherapistSlots(therapistId);
  }
}
