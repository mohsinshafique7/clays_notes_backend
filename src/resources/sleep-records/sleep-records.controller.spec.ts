import { Test, TestingModule } from '@nestjs/testing';
import { SleepRecordsController } from './sleep-records.controller';
import { SleepRecordsService } from './sleep-records.service';
import { SleepRecord } from './entities/sleep-record.entity';
import { DeleteResult } from 'typeorm';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import * as moment from 'moment';
class MockedDeleteResult implements DeleteResult {
  raw: any; // Ensure raw property is present
  affected: number; // Ensure affected property is present

  constructor(raw: any, affected: number) {
    this.raw = raw;
    this.affected = affected;
  }
}
describe('SleepRecordsController', () => {
  let controller: SleepRecordsController;
  let service: SleepRecordsService;
  afterEach(() => {
    jest.clearAllMocks();
  });
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SleepRecordsController],
      providers: [
        {
          provide: SleepRecordsService,
          useValue: {
            findOne: jest.fn(),
            remove: jest.fn(),
            findAll: jest.fn(),
            create: jest.fn(),
            update: jest.fn(),
            getByDate: jest.fn(),
            findByAccountIdAndDate: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<SleepRecordsController>(SleepRecordsController);
    service = module.get<SleepRecordsService>(SleepRecordsService);
  });

  describe('delete', () => {
    it('Should delete a sleep record by ID', async () => {
      const mockSleep = new SleepRecord();
      mockSleep.id = 1;
      const mockedDeleteResult = { affected: 1 };

      jest.spyOn(service, 'findOne').mockResolvedValue(mockSleep);
      jest
        .spyOn(service, 'remove')
        .mockResolvedValue(mockedDeleteResult as MockedDeleteResult);

      const res = await controller.remove(1);

      expect(service.findOne).toHaveBeenCalledWith(1);
      expect(service.remove).toHaveBeenCalledWith(1);
      expect(res).toEqual({
        message: `Sleep Record 1 deleted successfully`,
      });
    });
    it('should raise 404 if record not found', async () => {
      jest.spyOn(service, 'findOne').mockResolvedValue(undefined);

      // Act & Assert
      await expect(controller.remove(1)).rejects.toThrow(
        new NotFoundException('Sleep record not found'),
      );
    });
  });
  describe('findOne', () => {
    it('Should return a single sleep record by ID', async () => {
      const mockSleep = new SleepRecord();
      mockSleep.id = 1;
      jest.spyOn(service, 'findOne').mockResolvedValue(mockSleep);
      const res = await controller.findOne('1');

      expect(res).toEqual({ row: mockSleep });
    });
  });
  describe('getLastSevenDaysRecords', () => {
    it('Should return the sleep records for the last seven days', async () => {
      const mockSleep = [
        {
          id: 1,
          date: moment('2024-05-04').format('YYYY-MM-DD'),
          sleepHours: 19,
          accountId: 1,
        },
        {
          id: 2,
          date: moment('2024-05-04').format('YYYY-MM-DD'),
          sleepHours: 2,
          accountId: 1,
        },
        {
          id: 3,
          date: moment('2024-05-03').format('YYYY-MM-DD'),
          sleepHours: 12,
          accountId: 1,
        },
      ];

      const expectedRes = {
        rows: [
          {
            date: '2024-05-04',
            sleepHours: 21,
          },
          {
            date: '2024-05-03',
            sleepHours: 12,
          },
        ],
      };
      jest
        .spyOn(service, 'getByDate')
        .mockResolvedValue(mockSleep as unknown as SleepRecord[]);
      const res = await controller.getLastSevenDaysRecord('1');

      expect(res).toEqual(expectedRes);
    });
  });
  describe('findAll', () => {
    const mockRecords = [
      [
        {
          id: 2,
          sleepHours: 5,
          date: '2024-05-01',
          accountId: 5,
        },
      ],
      1,
    ];

    it('Should return all sleep records with pagination', async () => {
      jest
        .spyOn(service, 'findAll')
        .mockResolvedValue(mockRecords as [SleepRecord[], number]);

      const res = await controller.findAll({
        perPage: 10,
        currentPage: 1,
      } as any);
      expect(service.findAll).toHaveBeenCalledWith(10, 1);

      expect(res).toEqual({
        rows: mockRecords[0],
        count: mockRecords[1],
      });
    });
  });
  describe('update', () => {
    it('Should raise an error if the record is not found.', async () => {
      const mockSleep = new SleepRecord();
      jest.spyOn(service, 'findOne').mockResolvedValue(null);
      await expect(controller.update('1', mockSleep)).rejects.toThrow(
        new BadRequestException(`Record not found for id ${1}`),
      );
      expect(service.findOne).toHaveBeenCalledTimes(1);
      expect(service.update).not.toHaveBeenCalled();
    });
    it('Should raise an error if sleep hours exceed the total hours saved in the database.', async () => {
      const mockedUpdateData = new SleepRecord();
      mockedUpdateData.sleepHours = 20;
      const mockedSavedData = [
        {
          id: 3,
          sleepHours: 8,
          date: new Date('2024-05-03'),
          accountId: 1,
        },
        {
          id: 4,
          sleepHours: 6,
          date: new Date('2024-05-06'),
          accountId: 1,
        },
      ] as unknown as SleepRecord[];

      jest.spyOn(service, 'findOne').mockResolvedValue(new SleepRecord());
      jest
        .spyOn(service, 'findByAccountIdAndDate')
        .mockResolvedValue(mockedSavedData);
      try {
        await controller.update('1', mockedUpdateData);
      } catch (err) {
        expect(err).toBeInstanceOf(BadRequestException);
      }
    });
    it('Should update the sleep record if found.', async () => {
      const mockedUpdateData = {
        id: 3,
        sleepHours: 8,
        date: '2024-05-03',
        accountId: 1,
      };
      const mockedSavedData = [
        {
          id: 3,
          sleepHours: 1,
          date: '2024-05-03',
          accountId: 1,
        },
        {
          id: 4,
          sleepHours: 1,
          date: '2024-05-06',
          accountId: 1,
        },
      ] as unknown as SleepRecord[];
      jest
        .spyOn(service, 'findOne')
        .mockResolvedValue(mockedUpdateData as unknown as SleepRecord);
      jest
        .spyOn(service, 'findByAccountIdAndDate')
        .mockResolvedValue(mockedSavedData);
      jest
        .spyOn(service, 'update')
        .mockResolvedValue(mockedUpdateData as unknown as SleepRecord);
      const result = await controller.update(
        '1',
        mockedUpdateData as unknown as SleepRecord,
      );
      expect(result.message).toEqual(`Sleep Record for 1 updated successfully`);
      expect(result.updatedRows).toEqual({
        id: 3,
        sleepHours: 8,
        date: '2024-05-03',
        accountId: 1,
      });
    });
  });
  describe('create', () => {
    it('Should raise an error if sleep hours exceed the total hours saved in the database.', async () => {
      const mockedCreateData = new SleepRecord();
      mockedCreateData.sleepHours = 20;
      const mockedSavedData = [
        {
          id: 3,
          sleepHours: 8,
          date: '2024-05-03',
          accountId: 1,
        },
        {
          id: 4,
          sleepHours: 6,
          date: '2024-05-06',
          accountId: 1,
        },
      ] as unknown as SleepRecord[];

      jest.spyOn(service, 'findOne').mockResolvedValue(new SleepRecord());
      jest
        .spyOn(service, 'findByAccountIdAndDate')
        .mockResolvedValue(mockedSavedData);
      try {
        await controller.create(mockedCreateData);
      } catch (err) {
        expect(err).toBeInstanceOf(BadRequestException);
      }
    });
    it('Should create a new sleep record if it does not exist.', async () => {
      const mockedUpdateData = {
        id: 3,
        sleepHours: 8,
        date: '2024-05-03',
        accountId: 1,
      };
      const mockedSavedData = [
        {
          id: 3,
          sleepHours: 1,
          date: '2024-05-03',
          accountId: 1,
        },
        {
          id: 4,
          sleepHours: 1,
          date: '2024-05-06',
          accountId: 1,
        },
      ] as unknown as SleepRecord[];
      jest
        .spyOn(service, 'findOne')
        .mockResolvedValue(mockedUpdateData as unknown as SleepRecord);
      jest
        .spyOn(service, 'findByAccountIdAndDate')
        .mockResolvedValue(mockedSavedData);
      jest
        .spyOn(service, 'create')
        .mockResolvedValue(mockedUpdateData as unknown as SleepRecord);
      const result = await controller.create(
        mockedUpdateData as unknown as SleepRecord,
      );
      expect(result.message).toEqual(`New Record Saved`);
      expect(result.new_record).toEqual({
        id: 3,
        sleepHours: 8,
        date: '2024-05-03',
        accountId: 1,
      });
    });
  });
});
