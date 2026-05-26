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
export class TherapistsController {
  constructor(private readonly therapistsService: TherapistsService) {}

  @Get('pending')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('ADMIN')
  getPending() {
    return this.therapistsService.getPending();
  }

  @Get('verified')
  getVerified(
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '12'
  ) {
    return this.therapistsService.getAllVerified(parseInt(page), parseInt(limit));
  }

  @Get('profile')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('THERAPIST')
  getProfile(@Req() req: any) {
    return this.therapistsService.getProfile(req.user.userId);
  }

  @Patch('profile')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('THERAPIST')
  updateProfile(@Req() req: any, @Body() body: UpdateTherapistProfileDto) {
    return this.therapistsService.updateProfile(req.user.userId, body);
  }

  @Get('my-patients')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('THERAPIST')
  getMyPatients(@Req() req: any) {
    return this.therapistsService.getMyPatients(req.user.userId);
  }

  @Get('public/:id')
  getById(@Param('id', ParseUUIDPipe) id: string) {
    return this.therapistsService.getById(id);
  }

  @Patch(':id/verify')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('ADMIN')
  verify(@Param('id', ParseUUIDPipe) id: string) {
    return this.therapistsService.verify(id);
  }

  @Delete(':id')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('ADMIN')
  reject(
    @Param('id', ParseUUIDPipe) id: string,
    @Query('reason') reason?: string,
  ) {
    return this.therapistsService.reject(id, reason);
  }
}
