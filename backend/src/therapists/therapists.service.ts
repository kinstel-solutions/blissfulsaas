import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { NotificationsService } from '../notifications/notifications.service';
import { NotificationType } from '@prisma/client';

@Injectable()
export class TherapistsService {
  constructor(
    private prisma: PrismaService,
    private notifications: NotificationsService,
  ) {}

  async getPending() {
    return this.prisma.therapist.findMany({
      where: { isVerified: false },
      include: {
        user: {
          select: {
            email: true,
          },
        },
      },
    });
  }

  async getAllVerified() {
    return this.prisma.therapist.findMany({
      where: { isVerified: true },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        bio: true,
        hourlyRate: true,
        specialities: true,
        qualifications: true,
        languages: true,
        yearsOfExperience: true,
        clinicAddress: true,
        // We don't need email for discovery yet
      }
    });
  }

  async getProfile(userId: string) {
    const profile = await this.prisma.therapist.findUnique({
      where: { userId },
    });
    if (!profile) throw new NotFoundException('Therapist profile not found');
    return profile;
  }

  async updateProfile(userId: string, data: any) {
    const profile = await this.getProfile(userId);
    
    return this.prisma.therapist.update({
      where: { id: profile.id },
      data: {
        firstName: data.firstName,
        lastName: data.lastName,
        bio: data.bio,
        specialities: data.specialities,
        languages: data.languages,
        qualifications: data.qualifications,
        yearsOfExperience: data.yearsOfExperience,
        hourlyRate: data.hourlyRate,
        videoUrl: data.videoUrl,
        clinicAddress: data.clinicAddress,
      },
    });
  }

  async getById(id: string) {
    const therapist = await this.prisma.therapist.findUnique({
      where: { id },
      include: {
        slots: {
          where: { isActive: true },
        }
      }
    });

    if (!therapist || !therapist.isVerified) {
      throw new NotFoundException('Therapist not found or not verified');
    }

    return therapist;
  }

  async verify(id: string) {
    const therapist = await this.prisma.therapist.findUnique({
      where: { id },
    });

    if (!therapist) {
      throw new NotFoundException('Therapist not found');
    }

    const updated = await this.prisma.therapist.update({
      where: { id },
      data: { isVerified: true },
    });

    // Notify the therapist of their approval
    setImmediate(() => {
      this.notifications.create({
        userId: therapist.userId,
        type: NotificationType.THERAPIST_APPROVED,
        title: 'Application Approved 🎉',
        body: 'Congratulations! Your therapist application has been reviewed and approved. You can now start accepting patients.',
        metadata: { therapistId: id },
      }).catch(console.error);
    });

    return updated;
  }

  async reject(id: string) {
    const therapist = await this.prisma.therapist.findUnique({
      where: { id },
    });

    if (!therapist) {
      throw new NotFoundException('Therapist not found');
    }

    return this.prisma.therapist.delete({
      where: { id },
    });
  }

  async getMyPatients(therapistUserId: string) {
    const therapist = await this.prisma.therapist.findUnique({
      where: { userId: therapistUserId },
    });

    if (!therapist) return [];

    const appointments = await this.prisma.appointment.findMany({
      where: { therapistId: therapist.id },
      include: {
        patient: {
          include: {
            user: { select: { email: true } }
          }
        }
      },
    });

    const patientMap = new Map();
    appointments.forEach(appt => {
      if (!patientMap.has(appt.patientId)) {
        patientMap.set(appt.patientId, {
          ...appt.patient,
          sessionCount: 0,
          latestSession: appt.scheduledAt,
          latestSessionNotes: appt.therapistNotes
        });
      }
      const p = patientMap.get(appt.patientId);
      p.sessionCount++;
      if (new Date(appt.scheduledAt) > new Date(p.latestSession)) {
        p.latestSession = appt.scheduledAt;
        p.latestSessionNotes = appt.therapistNotes;
      }
    });

    return Array.from(patientMap.values());
  }
}
