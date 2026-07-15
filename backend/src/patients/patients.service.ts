import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class PatientsService {
  constructor(private prisma: PrismaService) {}

  async getIntake(userId: string) {
    let patient = await this.prisma.patient.findUnique({
      where: { userId },
    });

    if (!patient) {
      // Auto-create skeleton patient profile if missing
      patient = await this.prisma.patient.create({
        data: {
          userId,
          firstName: 'New',
          lastName: 'Patient',
        },
      });
    }

    return patient;
  }

  async updateIntake(
    userId: string,
    data: {
      fullName?: string;
      age?: string;
      pronouns?: string;
      city?: string;
      reasonForSeeking?: string;
      mentalHealthHistory?: string;
      currentMedications?: string;
      emergencyContactName?: string;
      emergencyContactPhone?: string;
    },
  ) {
    await this.prisma.patient.findUniqueOrThrow({ where: { userId } });

    return this.prisma.patient.update({
      where: { userId },
      data: {
        ...data,
        intakeCompleted: true,
      },
      select: {
        intakeCompleted: true,
        fullName: true,
        age: true,
        pronouns: true,
        city: true,
        reasonForSeeking: true,
        mentalHealthHistory: true,
        currentMedications: true,
        emergencyContactName: true,
        emergencyContactPhone: true,
      },
    });
  }
}
