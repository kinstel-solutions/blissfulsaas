import * as dotenv from 'dotenv';
dotenv.config();

import { Test, TestingModule } from '@nestjs/testing';
import { AvailabilityController } from './availability.controller';
import { AvailabilityService } from './availability.service';
import { PrismaService } from '../prisma/prisma.service';
import { ConfigService } from '@nestjs/config';

describe('AvailabilityController (Unit)', () => {
  let controller: AvailabilityController;
  let service: AvailabilityService;
  let prisma: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AvailabilityController],
      providers: [
        AvailabilityService,
        PrismaService,
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn((key) => {
              if (key === 'DATABASE_URL') {
                return process.env.DATABASE_URL;
              }
              return null;
            }),
          },
        },
      ],
    }).compile();

    controller = module.get<AvailabilityController>(AvailabilityController);
    service = module.get<AvailabilityService>(AvailabilityService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  afterEach(async () => {
    await prisma.$disconnect();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should get schedule and return weekly rules', async () => {
    const therapist = await prisma.therapist.findFirst();
    if (!therapist) {
      console.log('No therapist found in DB for test');
      return;
    }

    const mockReq = {
      user: {
        userId: therapist.userId,
      },
    };

    // Should succeed and return an array
    const result = await controller.getSchedule(mockReq);
    expect(Array.isArray(result)).toBe(true);
  });

  it('should get overrides list', async () => {
    const therapist = await prisma.therapist.findFirst();
    if (!therapist) {
      console.log('No therapist found in DB for test');
      return;
    }

    const mockReq = {
      user: {
        userId: therapist.userId,
      },
    };

    const result = await controller.getOverrides(mockReq);
    expect(Array.isArray(result)).toBe(true);
  });
});
