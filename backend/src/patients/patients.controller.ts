import { Controller, Get, Patch, Body, Request, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Roles, RolesGuard } from '../auth/roles.guard';
import { UpdateIntakeDto } from './dto/update-intake.dto';

@Controller('patients')
@UseGuards(AuthGuard('jwt'), RolesGuard)
export class PatientsController {
  constructor(private readonly patientsService: PatientsService) {}

  @Get('intake')
  @Roles('PATIENT')
  getIntake(@Request() req: any) {
    return this.patientsService.getIntake(req.user.userId);
  }

  @Patch('intake')
  @Roles('PATIENT')
  updateIntake(@Request() req: any, @Body() body: UpdateIntakeDto) {
    return this.patientsService.updateIntake(req.user.userId, body);
  }
}
