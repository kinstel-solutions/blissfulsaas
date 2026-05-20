import { Controller, Get, Post, Delete, Param, Body, UseGuards, Request, ParseUUIDPipe } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Roles, RolesGuard } from '../auth/roles.guard';
import { AvailabilityService } from './availability.service';
import { CreateSlotDto, BulkUpdateSlotsDto } from './dto/availability.dto';

@Controller('availability')
@UseGuards(AuthGuard('jwt'), RolesGuard)
export class AvailabilityController {
  constructor(private readonly availabilityService: AvailabilityService) {}

  @Post()
  @Roles('THERAPIST')
  async create(@Request() req: any, @Body() data: CreateSlotDto) {
    const therapist = await this.availabilityService.getTherapistByUserId(req.user.userId);
    return this.availabilityService.createSlot(therapist.id, data);
  }

  @Post('bulk')
  @Roles('THERAPIST')
  async bulkUpdate(
    @Request() req: any,
    @Body() data: BulkUpdateSlotsDto
  ) {
    const therapist = await this.availabilityService.getTherapistByUserId(req.user.userId);
    return this.availabilityService.bulkUpdateSlots(therapist.id, data);
  }
  @Get()
  @Roles('THERAPIST')
  async getMySlots(@Request() req: any) {
    const therapist = await this.availabilityService.getTherapistByUserId(req.user.userId);
    return this.availabilityService.getMySlots(therapist.id);
  }
  @Delete(':id')
  @Roles('THERAPIST')
  async remove(@Request() req: any, @Param('id', ParseUUIDPipe) id: string) {
    const therapist = await this.availabilityService.getTherapistByUserId(req.user.userId);
    return this.availabilityService.deactivateSlot(therapist.id, id);
  }

  @Get('therapist/:id')
  @Roles('PATIENT', 'ADMIN')
  getTherapistSlots(@Param('id', ParseUUIDPipe) therapistId: string) {
    return this.availabilityService.getTherapistSlots(therapistId);
  }
}
