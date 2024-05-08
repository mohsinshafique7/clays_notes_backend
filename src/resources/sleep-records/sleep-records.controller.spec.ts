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
          },
        },
      ],
    }).compile();

    controller = module.get<SleepRecordsController>(SleepRecordsController);
    service = module.get<SleepRecordsService>(SleepRecordsService);
  });

  describe('delete', () => {
    it('should delete a sleep record by ID', async () => {
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
    it('should return a single sleep record by ID', async () => {
      const mockSleep = new SleepRecord();
      mockSleep.id = 1;
      jest.spyOn(service, 'findOne').mockResolvedValue(mockSleep);
      const res = await controller.findOne('1');

      expect(res).toEqual({ row: mockSleep });
    });
  });
  describe('getLastSevenDaysRecords', () => {
    it('should return last seven days record', async () => {
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

    it('should return all sleep records with pagination', async () => {
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
    it('If record not found thorw error', async () => {
      // { sleepHours: 5, date: "2024-05-02", accountId: 6 }
      const mockSleep = new SleepRecord();
      mockSleep.sleepHours = 5;
      mockSleep.accountId = 6;
      jest.spyOn(service, 'findOne').mockResolvedValue(null);
      await expect(controller.update('1', mockSleep)).rejects.toThrow(
        new BadRequestException(`Record not found for id ${1}`),
      );
      expect(service.findOne).toHaveBeenCalledTimes(1);
      expect(service.update).not.toHaveBeenCalled();
    });
    it('Update record if found', async () => {
      const mockedFoundData = new SleepRecord();
      const mockedUpdateData = new SleepRecord();

      jest.spyOn(service, 'findOne').mockResolvedValue(mockedFoundData);
      jest.spyOn(service, 'update').mockResolvedValue(1);
      const res = await controller.update('1', mockedUpdateData);
      expect(res).toEqual({
        message: 'Sleep Record for 1 updated successfully',
        affectedRows: 1,
      });
      expect(service.update).toHaveBeenCalledTimes(1);
    });
  });
  describe('create', () => {
    it('should create a new sleep record', async () => {
      const returnValue = new SleepRecord();
      jest.spyOn(service, 'create').mockResolvedValue(returnValue);
      const res = await controller.create(returnValue);

      expect(service.create).toHaveBeenCalledWith(returnValue);
      // const formattedData = moment(newData.date).format('YYYY-MM-DD');
      expect(res).toEqual({
        message: 'New Record Saved',
        new_record: returnValue,
      });
    });
  });
});
