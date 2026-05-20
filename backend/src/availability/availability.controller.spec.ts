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

  it('should run bulkUpdate with undefined data and succeed without throwing', async () => {
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

    // Should succeed with empty body
    const result1 = await controller.bulkUpdate(mockReq, {} as any);
    expect(result1).toEqual({ success: true, createdCount: 0, deletedCount: 0 });

    // Should succeed with explicit undefined fields
    const result2 = await controller.bulkUpdate(mockReq, { create: undefined, delete: undefined } as any);
    expect(result2).toEqual({ success: true, createdCount: 0, deletedCount: 0 });
  });
});
