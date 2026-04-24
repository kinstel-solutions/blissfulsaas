import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { NotificationsService } from '../notifications/notifications.service';
import { NotificationType, Prisma } from '@prisma/client';

@Injectable()
export class TherapistsService {
  constructor(
    private prisma: PrismaService,
    private notifications: NotificationsService,
  ) {}

  async getPending() {
    return this.prisma.therapist.findMany({
      where: {
        OR: [
          { isVerified: false },
          { pendingFields: { not: Prisma.DbNull } }
        ]
      },
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
        profileImageUrl: true,
        phone: true,
        // We don't need email for discovery yet
      }
    });
  }

  async getProfile(userId: string) {
    let profile = await this.prisma.therapist.findUnique({
      where: { userId },
    });

    if (!profile) {
      // Auto-create skeleton profile if missing (self-healing for sync gaps)
      profile = await this.prisma.therapist.create({
        data: {
          userId,
          firstName: 'New',
          lastName: 'Therapist',
          isVerified: false,
          hourlyRate: 0,
        }
      });
    }

    return profile;
  }

  async updateProfile(userId: string, data: any) {
    const profile = await this.getProfile(userId);
    
    if (profile.isVerified) {
      const existingPending = (profile.pendingFields as object) || {};
      return this.prisma.therapist.update({
        where: { id: profile.id },
        data: {
          pendingFields: {
            ...existingPending,
            ...data,
          },
        },
      });
    }

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
        profileImageUrl: data.profileImageUrl,
        phone: data.phone,
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

    let updatedData: any = { isVerified: true };
    const hasPendingEdits = !!therapist.pendingFields;

    if (hasPendingEdits) {
      updatedData = {
        ...updatedData,
        ...(therapist.pendingFields as object),
        pendingFields: Prisma.DbNull, // clear it out
      };
    }

    const updated = await this.prisma.therapist.update({
      where: { id },
      data: updatedData,
    });

    // Notify the therapist of their approval
    setImmediate(() => {
      this.notifications.create({
        userId: therapist.userId,
        type: NotificationType.THERAPIST_APPROVED,
        title: hasPendingEdits ? 'Profile Updates Approved 🎉' : 'Application Approved 🎉',
        body: hasPendingEdits 
          ? 'Your recent profile updates have been reviewed and approved.' 
          : 'Congratulations! Your therapist application has been reviewed and approved. You can now start accepting patients.',
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

    if (therapist.isVerified && therapist.pendingFields) {
      const updated = await this.prisma.therapist.update({
        where: { id },
        data: { pendingFields: Prisma.DbNull },
      });

      setImmediate(() => {
        this.notifications.create({
          userId: therapist.userId,
          type: NotificationType.GENERAL,
          title: 'Profile Updates Rejected',
          body: 'Your recent profile updates were not approved. Please contact support for more details.',
        }).catch(console.error);
      });

      return updated;
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
