import { 
  Controller, 
  Get, 
  Patch, 
  Delete, 
  Param, 
  UseGuards, 
  ParseUUIDPipe,
  Req,
  Body,
  Query
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Roles, RolesGuard } from '../auth/roles.guard';
import { UpdateTherapistProfileDto } from './dto/update-profile.dto';
import { TherapistsService } from './therapists.service';

@Controller('therapists')
@UseGuards(AuthGuard('jwt'), RolesGuard)
export class TherapistsController {
  constructor(private readonly therapistsService: TherapistsService) {}

  @Get('pending')
  @Roles('ADMIN')
  getPending() {
    return this.therapistsService.getPending();
  }

  @Get('verified')
  @Roles('PATIENT', 'ADMIN')
  getVerified(
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '12'
  ) {
    return this.therapistsService.getAllVerified(parseInt(page), parseInt(limit));
  }

  @Get('profile')
  @Roles('THERAPIST')
  getProfile(@Req() req: any) {
    return this.therapistsService.getProfile(req.user.userId);
  }

  @Patch('profile')
  @Roles('THERAPIST')
  updateProfile(@Req() req: any, @Body() body: UpdateTherapistProfileDto) {
    return this.therapistsService.updateProfile(req.user.userId, body);
  }

  @Get('my-patients')
  @Roles('THERAPIST')
  getMyPatients(@Req() req: any) {
    return this.therapistsService.getMyPatients(req.user.userId);
  }

  @Get('public/:id')
  @Roles('PATIENT', 'ADMIN')
  getById(@Param('id', ParseUUIDPipe) id: string) {
    return this.therapistsService.getById(id);
  }

  @Patch(':id/verify')
  @Roles('ADMIN')
  verify(@Param('id', ParseUUIDPipe) id: string) {
    return this.therapistsService.verify(id);
  }

  @Delete(':id')
  @Roles('ADMIN')
  reject(
    @Param('id', ParseUUIDPipe) id: string,
    @Query('reason') reason?: string,
  ) {
    return this.therapistsService.reject(id, reason);
  }
}
