import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { TherapistsModule } from './therapists/therapists.module';
import { AvailabilityModule } from './availability/availability.module';
import { SessionsModule } from './sessions/sessions.module';
import { MessagesModule } from './messages/messages.module';
import { PatientsModule } from './patients/patients.module';
import { PaymentsModule } from './payments/payments.module';
import { NotificationsModule } from './notifications/notifications.module';
import { FeedbackModule } from './feedback/feedback.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule, 
    AuthModule, 
    TherapistsModule,
    AvailabilityModule,
    SessionsModule,
    MessagesModule,
    PatientsModule,
    PaymentsModule,
    NotificationsModule,
    FeedbackModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
