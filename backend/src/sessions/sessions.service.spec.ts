import { Test, TestingModule } from '@nestjs/testing';
import { SessionsService } from './sessions.service';
import { PrismaService } from '../prisma/prisma.service';
import { NotificationsService } from '../notifications/notifications.service';
import { EmailService } from '../email/email.service';
import {
  ForbiddenException,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { RtcTokenBuilder } from 'agora-token';
import { AppointmentStatus } from '@prisma/client';

describe('SessionsService', () => {
  let service: SessionsService;

  const mockPrisma = {
    appointment: {
      findUnique: jest.fn(),
      update: jest.fn(),
      findFirst: jest.fn(),
    },
    patient: {
      findUnique: jest.fn(),
    },
    therapist: {
      findUnique: jest.fn(),
    },
  };

  const mockNotifications = {
    create: jest.fn(),
  };

  const mockEmail = {
    sendAppointmentNotification: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SessionsService,
        { provide: PrismaService, useValue: mockPrisma },
        { provide: NotificationsService, useValue: mockNotifications },
        { provide: EmailService, useValue: mockEmail },
      ],
    }).compile();

    service = module.get<SessionsService>(SessionsService);

    process.env.AGORA_APP_ID = 'test-app-id';
    process.env.AGORA_APP_CERTIFICATE = 'test-certificate';
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should throw ForbiddenException if user is not patient or therapist of the appointment', async () => {
    const mockAppointment = {
      id: 'appt-1',
      patient: { userId: 'patient-id' },
      therapist: { userId: 'therapist-id' },
      status: 'CONFIRMED',
      scheduledAt: new Date(Date.now() - 5 * 60000), // 5 min ago
    };
    mockPrisma.appointment.findUnique.mockResolvedValue(mockAppointment);

    await expect(
      service.generateToken('third-party-id', 'appt-1'),
    ).rejects.toThrow(ForbiddenException);
  });

  it('should throw ForbiddenException if appointment is not PENDING or CONFIRMED', async () => {
    const mockAppointment = {
      id: 'appt-1',
      patient: { userId: 'patient-id' },
      therapist: { userId: 'therapist-id' },
      status: 'CANCELLED',
      scheduledAt: new Date(Date.now() - 5 * 60000),
    };
    mockPrisma.appointment.findUnique.mockResolvedValue(mockAppointment);

    await expect(service.generateToken('patient-id', 'appt-1')).rejects.toThrow(
      ForbiddenException,
    );
  });

  it('should throw ForbiddenException if requested more than 15 minutes before the session', async () => {
    const mockAppointment = {
      id: 'appt-1',
      patient: { userId: 'patient-id' },
      therapist: { userId: 'therapist-id' },
      status: 'CONFIRMED',
      scheduledAt: new Date(Date.now() + 20 * 60000), // 20 min in future
      duration: 50,
    };
    mockPrisma.appointment.findUnique.mockResolvedValue(mockAppointment);

    await expect(service.generateToken('patient-id', 'appt-1')).rejects.toThrow(
      /video room is not open yet/,
    );
  });

  it('should throw ForbiddenException if requested after the join window (session ended over 1 hour ago)', async () => {
    const mockAppointment = {
      id: 'appt-1',
      patient: { userId: 'patient-id' },
      therapist: { userId: 'therapist-id' },
      status: 'CONFIRMED',
      scheduledAt: new Date(Date.now() - 3 * 60 * 60000), // 3 hours ago
      duration: 50,
    };
    mockPrisma.appointment.findUnique.mockResolvedValue(mockAppointment);

    await expect(service.generateToken('patient-id', 'appt-1')).rejects.toThrow(
      /video room is closed/,
    );
  });

  it('should generate token with correctly calculated privilegeExpiredTs', async () => {
    const fixedNow = 1719129600000; // June 23, 2024
    const dateSpy = jest.spyOn(Date, 'now').mockReturnValue(fixedNow);

    const scheduledAt = new Date(fixedNow - 5 * 60000); // 5 min ago
    const duration = 50; // 50 min
    const mockAppointment = {
      id: 'appt-1',
      patient: { userId: 'patient-id' },
      therapist: { userId: 'therapist-id' },
      status: 'CONFIRMED',
      scheduledAt,
      duration,
      videoRoomId: 'channel-123',
      actualStartedAt: null,
    };
    mockPrisma.appointment.findUnique.mockResolvedValue(mockAppointment);
    mockPrisma.appointment.update.mockResolvedValue({});

    const buildTokenSpy = jest.spyOn(RtcTokenBuilder, 'buildTokenWithUid');

    const result = await service.generateToken('patient-id', 'appt-1');

    const expectedExpiry = 3000; // (50 - 5) * 60 + 300 = 3000

    expect(buildTokenSpy).toHaveBeenCalledWith(
      'test-app-id',
      'test-certificate',
      'channel-123',
      expect.any(Number),
      expect.any(Number),
      expectedExpiry,
      expectedExpiry,
    );

    expect(result).toHaveProperty('token');
    expect(result.channel).toBe('channel-123');

    dateSpy.mockRestore();
  });

  describe('getSessionById', () => {
    it('should throw NotFoundException if role is THERAPIST and therapist profile does not exist', async () => {
      mockPrisma.therapist.findUnique.mockResolvedValue(null);

      await expect(
        service.getSessionById('therapist-id', 'appt-1', 'THERAPIST'),
      ).rejects.toThrow(NotFoundException);
      expect(mockPrisma.therapist.findUnique).toHaveBeenCalledWith({
        where: { userId: 'therapist-id' },
      });
    });
  });

  describe('cancelSession', () => {
    it('should throw ConflictException if trying to cancel a COMPLETED session', async () => {
      const mockAppointment = {
        id: 'appt-1',
        status: AppointmentStatus.COMPLETED,
        patient: { userId: 'patient-id' },
        therapist: { userId: 'therapist-id' },
      };
      mockPrisma.appointment.findUnique.mockResolvedValue(mockAppointment);

      await expect(
        service.cancelSession('patient-id', 'appt-1', 'PATIENT'),
      ).rejects.toThrow(ConflictException);
    });

    it('should throw ConflictException if trying to cancel a CANCELLED session', async () => {
      const mockAppointment = {
        id: 'appt-1',
        status: AppointmentStatus.CANCELLED,
        patient: { userId: 'patient-id' },
        therapist: { userId: 'therapist-id' },
      };
      mockPrisma.appointment.findUnique.mockResolvedValue(mockAppointment);

      await expect(
        service.cancelSession('patient-id', 'appt-1', 'PATIENT'),
      ).rejects.toThrow(ConflictException);
    });
  });

  describe('completeSession', () => {
    it('should throw ConflictException if trying to complete a PENDING session', async () => {
      const mockAppointment = {
        id: 'appt-1',
        status: AppointmentStatus.PENDING,
        therapist: { userId: 'therapist-id' },
        patient: { userId: 'patient-id', user: { email: 'patient@test.com' } },
      };
      mockPrisma.appointment.findUnique.mockResolvedValue(mockAppointment);

      await expect(
        service.completeSession('therapist-id', 'appt-1'),
      ).rejects.toThrow(ConflictException);
    });

    it('should throw ConflictException if trying to complete a CANCELLED session', async () => {
      const mockAppointment = {
        id: 'appt-1',
        status: AppointmentStatus.CANCELLED,
        therapist: { userId: 'therapist-id' },
        patient: { userId: 'patient-id', user: { email: 'patient@test.com' } },
      };
      mockPrisma.appointment.findUnique.mockResolvedValue(mockAppointment);

      await expect(
        service.completeSession('therapist-id', 'appt-1'),
      ).rejects.toThrow(ConflictException);
    });
  });
});
