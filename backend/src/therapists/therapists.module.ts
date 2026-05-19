import { Module } from '@nestjs/common';
import { TherapistsController } from './therapists.controller';
import { TherapistsPublicController } from './therapists.public.controller';
import { TherapistsService } from './therapists.service';
import { AuthModule } from '../auth/auth.module';
import { NotificationsModule } from '../notifications/notifications.module';
import { EmailModule } from '../email/email.module';

@Module({
  imports: [AuthModule, NotificationsModule, EmailModule],
  controllers: [TherapistsController, TherapistsPublicController],
  providers: [TherapistsService],
})
export class TherapistsModule {}
