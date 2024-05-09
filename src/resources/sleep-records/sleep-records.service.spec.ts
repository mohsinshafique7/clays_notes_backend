import { Test, TestingModule } from '@nestjs/testing';
import { SleepRecordsService } from './sleep-records.service';
import { SleepRecord } from './entities/sleep-record.entity';
import { DeleteResult, Repository, UpdateResult } from 'typeorm';
import { getRepositoryToken } from '@nestjs/typeorm';
import { InternalServerErrorException } from '@nestjs/common';

describe('SleepRecordsService', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });
  let service: SleepRecordsService;
  let sleepRecordRepository: Repository<SleepRecord>;
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SleepRecordsService,
        {
          provide: getRepositoryToken(SleepRecord),
          useValue: {
            save: jest.fn(),
            findAndCount: jest.fn(),
            findOne: jest.fn(),
            delete: jest.fn(),
            find: jest.fn(),
            createQueryBuilder: jest.fn().mockReturnThis(),
            where: jest.fn().mockReturnThis(),
            andWhere: jest.fn().mockReturnThis(),
            getMany: jest.fn(),
            select: jest.fn().mockReturnThis(),
            from: jest.fn().mockReturnThis(),
            getRawOne: jest.fn(),
            update: jest.fn().mockReturnThis(),
            set: jest.fn().mockReturnThis(),
            execute: jest
              .fn()
              .mockResolvedValue({ affected: 1 } as UpdateResult),
          },
        },
      ],
    }).compile();

    service = module.get<SleepRecordsService>(SleepRecordsService);
    sleepRecordRepository = module.get<Repository<SleepRecord>>(
      getRepositoryToken(SleepRecord),
    );
  });
  afterEach(() => {
    jest.resetAllMocks();
  });
  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('Update', () => {
    it('Should update a sleep record.', async () => {
      const mockValue = new SleepRecord();
      jest.spyOn(sleepRecordRepository, 'save').mockResolvedValue(mockValue);
      const result = await service.update(mockValue);
      expect(result).toEqual(mockValue);
    });
    it('Should raise an error if the database operation fails.', async () => {
      const mockValue = new SleepRecord();
      jest
        .spyOn(sleepRecordRepository, 'save')
        .mockRejectedValue(new Error('Database Error'));
      try {
        await service.update(mockValue);
      } catch (err) {
        expect(err).toBeInstanceOf(InternalServerErrorException);
        expect(err.message).toEqual('Error Updating Record');
      }
    });
  });
  describe('Create', () => {
    it('Should create a new sleep record.', async () => {
      const mockValue = new SleepRecord();
      jest.spyOn(sleepRecordRepository, 'save').mockResolvedValue(mockValue);
      const result = await service.create(mockValue);
      expect(result).toEqual(mockValue);
    });
    it('Should raise an error if the database operation fails.', async () => {
      const mockValue = new SleepRecord();
      jest
        .spyOn(sleepRecordRepository, 'save')
        .mockRejectedValue(new Error('Database Error'));
      await expect(service.create(mockValue)).rejects.toThrow(
        new InternalServerErrorException('Cannot create sleep record'),
      );
    });
  });
  describe('getLastSevenDaysRecords', () => {
    it('Should return a sleep record for a specific date and account ID.', async () => {
      const mockResult = new SleepRecord();
      const date = '2024-05-05';
      const accountId = 10;
      (
        sleepRecordRepository.createQueryBuilder as jest.Mock
      ).mockImplementation(() => ({
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValueOnce(mockResult),
      }));
      const result = await service.getByDate(date, accountId);
      expect(result).toEqual(mockResult);
    });
    it('Should raise an error if the database operation fails.', async () => {
      const date = '2024-05-05';
      const accountId = 10;
      (
        sleepRecordRepository.createQueryBuilder as jest.Mock
      ).mockImplementation(() => ({
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockRejectedValue(new Error('Database Error')),
      }));
      try {
        await service.getByDate(date, accountId);
      } catch (error) {
        expect(error).toBeInstanceOf(InternalServerErrorException);
        expect(error.message).toBe('Error Retrieving last seven days record');
      }
    });
    it('Should return an empty array if no records are found for the specified date and account ID.', async () => {
      const date = '2024-05-05';
      const accountId = 10;
      (
        sleepRecordRepository.createQueryBuilder as jest.Mock
      ).mockImplementation(() => ({
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValueOnce([]),
      }));
      const result = await service.getByDate(date, accountId);
      expect(result).toEqual([]);
    });
  });
  describe('findAll', () => {
    it('Should return all sleep records with pagination.', async () => {
      const mockValue: [SleepRecord[], number] = [[new SleepRecord()], 1];
      jest
        .spyOn(sleepRecordRepository, 'findAndCount')
        .mockResolvedValue(mockValue);
      const result = await service.findAll(10, 1);
      expect(result).toEqual(mockValue);
    });
    it('Should return empty data if no records are found.', async () => {
      const mockValue: [SleepRecord[], number] = [[], 0];

      jest
        .spyOn(sleepRecordRepository, 'findAndCount')
        .mockResolvedValue(mockValue);
      const result = await service.findAll(10, 1);
      expect(result).toEqual(mockValue);
    });
    it('Should raise an error if the database operation fails.', async () => {
      jest
        .spyOn(sleepRecordRepository, 'findAndCount')
        .mockRejectedValue(new Error('Database Error'));
      try {
        await service.findAll(10, 1);
      } catch (error) {
        expect(error).toBeInstanceOf(InternalServerErrorException);
        expect(error.message).toBe('Error retrieving sleep records');
      }
    });
  });
  describe('fineOne', () => {
    it('Should return a single sleep record by ID.', async () => {
      const mockValue: SleepRecord = new SleepRecord();
      jest.spyOn(sleepRecordRepository, 'findOne').mockResolvedValue(mockValue);
      const result = await service.findOne(1);
      expect(result).toEqual(mockValue);
    });
    it('Should return an empty object if no record is found.', async () => {
      jest
        .spyOn(sleepRecordRepository, 'findOne')
        .mockResolvedValue({} as SleepRecord);
      const result = await service.findOne(1);
      expect(result).toEqual({});
    });
    it('Should raise an error if the database operation fails.', async () => {
      jest
        .spyOn(sleepRecordRepository, 'findOne')
        .mockRejectedValue(new Error('Database Error'));
      try {
        await service.findOne(1);
      } catch (error) {
        expect(error).toBeInstanceOf(InternalServerErrorException);
        expect(error.message).toBe('Error retrieving sleep record');
      }
    });
  });
  describe('findByAccountIdAndDate', () => {
    it('Should return sleep records for a specific account ID and date.', async () => {
      const mockValue: SleepRecord[] = [new SleepRecord()];
      jest.spyOn(sleepRecordRepository, 'find').mockResolvedValue(mockValue);
      const result = await service.findByAccountIdAndDate(
        1,
        new Date('2025-05-14'),
      );
      expect(result).toEqual(mockValue);
    });
    it('Should return empty data if no records are found.', async () => {
      jest.spyOn(sleepRecordRepository, 'find').mockResolvedValue([]);
      const result = await service.findByAccountIdAndDate(
        1,
        new Date('2025-05-14'),
      );
      expect(result).toEqual([]);
    });
    it('Should raise an error if the database operation fails.', async () => {
      jest
        .spyOn(sleepRecordRepository, 'find')
        .mockRejectedValue(new Error('Database Error'));
      try {
        await service.findByAccountIdAndDate(1, new Date('2025-05-14'));
      } catch (error) {
        expect(error).toBeInstanceOf(InternalServerErrorException);
        expect(error.message).toBe('Error retrieving sleep record');
      }
    });
  });

  describe('Delete', () => {
    it('Should remove a sleep record.', async () => {
      const mockResult: DeleteResult = { raw: {}, affected: 1 };
      jest.spyOn(sleepRecordRepository, 'delete').mockResolvedValue(mockResult);
      const result = await service.remove(1);
      expect(result).toEqual(mockResult);
    });
    it('Should raise an error if the database operation fails.', async () => {
      jest
        .spyOn(sleepRecordRepository, 'delete')
        .mockRejectedValue(new Error('Database Error'));
      await expect(service.remove(1)).rejects.toThrow(
        new InternalServerErrorException('Error Deleting Sleep Record'),
      );
    });
  });
});
