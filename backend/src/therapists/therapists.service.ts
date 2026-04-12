import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class TherapistsService {
  constructor(private prisma: PrismaService) {}

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
        hourlyRate: data.hourlyRate,
        videoUrl: data.videoUrl, // if applicable
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

    return this.prisma.therapist.update({
      where: { id },
      data: { isVerified: true },
    });
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
}
