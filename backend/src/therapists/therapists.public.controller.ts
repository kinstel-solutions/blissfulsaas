import { Controller, Post, Body } from '@nestjs/common';
import { TherapistsService } from './therapists.service';

@Controller('public/therapists')
export class TherapistsPublicController {
  constructor(private readonly therapistsService: TherapistsService) {}

  @Post('onboard-email')
  async onboardEmail(@Body() body: { email: string; firstName: string; lastName: string }) {
    await this.therapistsService.handleOnboardEmail(body.email, body.firstName, body.lastName);
    return { success: true };
  }
}
