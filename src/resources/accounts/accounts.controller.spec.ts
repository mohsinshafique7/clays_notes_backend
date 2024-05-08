import { Test, TestingModule } from '@nestjs/testing';
import { AccountsController } from './accounts.controller';
import { AccountsService } from './accounts.service';
import { DeleteResult } from 'typeorm';
import { Account } from './entities/account.entity';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { SleepRecordsService } from '../sleep-records/sleep-records.service';
import { SleepRecord } from '../sleep-records/entities/sleep-record.entity';
class MockedDeleteResult implements DeleteResult {
  raw: any; // Ensure raw property is present
  affected: number; // Ensure affected property is present

  constructor(raw: any, affected: number) {
    this.raw = raw;
    this.affected = affected;
  }
}
export class RootTestModule {}
describe('AccountsController', () => {
  let controller: AccountsController;
  let accountService: AccountsService;
  let sleepService: SleepRecordsService;
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AccountsController],
      imports: [],
      providers: [
        {
          provide: AccountsService,
          useValue: {
            findOne: jest.fn(),
            delete: jest.fn(),
            findAll: jest.fn(),
            remove: jest.fn(),
            update: jest.fn(),
            findByName: jest.fn(),
            create: jest.fn(),
            exists: jest.fn(),
          },
        },
        {
          provide: SleepRecordsService,
          useValue: {
            findByAccountIdAndDate: jest.fn(),
            create: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<AccountsController>(AccountsController);
    accountService = module.get<AccountsService>(AccountsService);
    sleepService = module.get<SleepRecordsService>(SleepRecordsService);
  });
  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
  beforeEach(() => {
    jest.clearAllMocks();
  });
  describe('Delete', () => {
    it('should delete a sleep record by ID', async () => {
      const mockedDeleteResult = { affected: 1 };
      const mockedRetrievedByIdValue = {
        id: 1,
        name: 'mohsin',
        gender: 'male',
      };

      jest.spyOn(accountService, 'exists').mockResolvedValue(true);
      jest
        .spyOn(accountService, 'remove')
        .mockResolvedValue(mockedDeleteResult as MockedDeleteResult);

      const res = await controller.remove('1');

      expect(accountService.remove).toHaveBeenCalledWith(
        mockedRetrievedByIdValue.id,
      );
      expect(accountService.remove).toHaveBeenCalledWith(
        mockedRetrievedByIdValue.id,
      );
      expect(res).toEqual({ message: `Account Id 1 deleted successfully` });
    });
    it('Raise error if not found', async () => {
      jest.spyOn(accountService, 'exists').mockResolvedValue(false);
      await expect(controller.remove('1')).rejects.toThrow(
        new NotFoundException('Account record not found'),
      );

      expect(accountService.remove).not.toHaveBeenCalled();
      expect(accountService.exists).toHaveBeenCalledTimes(1);
    });
  });
  describe('findOne', () => {
    it('should return a single account record by ID', async () => {
      const mockedData = new Account();
      jest.spyOn(accountService, 'findOne').mockResolvedValue(new Account());

      const res = await controller.findOne('1');

      expect(accountService.findOne).toHaveBeenCalledWith(1);
      expect(res).toEqual({ row: mockedData });
    });
  });
  describe('findAll', () => {
    it('should return all sleep records with pagination', async () => {
      const raw_data = {
        accounts: [
          {
            id: 7,
            name: 'mohsin',
            gender: 'male',
            sleepRecord: [],
          },
          { id: 8, name: 'mohsinaa', gender: 'male', sleepRecord: [] },
          { id: 9, name: 'asim', gender: 'male', sleepRecord: [] },
        ],
        totalCount: 3,
      };
      jest.spyOn(accountService, 'findAll').mockResolvedValue(raw_data as any);
      const res = await controller.findAll({
        perPage: 10,
        currentPage: 1,
      } as any);
      expect(res).toEqual({
        count: 3,
        rows: [
          {
            gender: 'male',
            id: 7,
            name: 'Mohsin',
            noOfEntries: 0,
          },
          {
            gender: 'male',
            id: 8,
            name: 'Mohsinaa',
            noOfEntries: 0,
          },
          {
            gender: 'male',
            id: 9,
            name: 'Asim',
            noOfEntries: 0,
          },
        ],
      });
    });
  });
  describe('update', () => {
    // params: { id: "6" },
    // body: { sleepHours: 5, date: "2024-05-02", accountId: 6 },
    it('Raise error Record not found', async () => {
      jest.spyOn(accountService, 'findOne').mockResolvedValue(null);

      await expect(controller.update('6', new Account())).rejects.toThrow(
        new BadRequestException(`Record not found for id 6`),
      );
    });
    it('Update as  Record found', async () => {
      const updatedRecord = new Account();

      jest.spyOn(accountService, 'findOne').mockResolvedValue(new Account());
      jest.spyOn(accountService, 'update').mockResolvedValue(updatedRecord);

      const res = await controller.update('1', updatedRecord);
      expect(accountService.findOne).toHaveBeenCalledTimes(1);
      expect(accountService.update).toHaveBeenCalledWith(updatedRecord);
      expect(res).toEqual({
        message: `Account 1 updated successfully`,
        record: updatedRecord,
      });
    });
  });
  describe('create', () => {
    it('create new record', async () => {
      const mockNewData = {
        name: 'string',
        gender: 'male',
        sleepRecord: {
          sleepHours: 10,
          date: '2024-05-02',
        },
      };
      jest.spyOn(accountService, 'findByName').mockResolvedValue(null);
      jest.spyOn(accountService, 'create').mockResolvedValue(new Account());

      const res = await controller.create(mockNewData as any);

      // Assertions
      expect(accountService.findByName).toHaveBeenCalledWith(mockNewData.name);
      expect(accountService.create).toHaveBeenCalled();
      expect(res).toEqual({
        message: 'New Record Saved',
        data: expect.any(Account),
      });
    });
    it('record exist raise error for more than 24 hours', async () => {
      const mockNewData = {
        name: 'string',
        gender: 'male',
        sleepRecord: {
          sleepHours: 10,
          date: '2024-05-02',
        },
      };

      jest.spyOn(accountService, 'findByName').mockResolvedValue(new Account());

      const s: SleepRecord = {
        id: 70,
        sleepHours: 23,
        date: new Date('2024-05-02'),
        accountId: 9,
        account: new Account(),
      };
      jest.spyOn(sleepService, 'findByAccountIdAndDate').mockResolvedValue([s]);

      await expect(controller.create(mockNewData as any)).rejects.toThrow(
        new BadRequestException('Sleep Hours can not be more than 24 hours'),
      );

      // Assertions

      expect(accountService.findByName).toHaveBeenCalledWith(mockNewData.name);
      expect(sleepService.findByAccountIdAndDate).toHaveBeenCalledTimes(1);
    });
    it('record exist update record', async () => {
      const mockNewData = {
        name: 'string',
        gender: 'male',
        sleepRecord: {
          sleepHours: 10,
          date: '2024-05-02',
        },
      };
      const acc = new Account();
      jest.spyOn(accountService, 'findByName').mockResolvedValue(acc);

      const s = new SleepRecord();
      s.accountId = 1;
      s.sleepHours = 3;
      s.date = new Date('2024-03-03');
      s.id = 1;
      const updatedData = new SleepRecord();
      jest.spyOn(sleepService, 'findByAccountIdAndDate').mockResolvedValue([s]);
      jest.spyOn(sleepService, 'create').mockResolvedValue(updatedData);

      const res = await controller.create(mockNewData as any);

      // Assertions
      expect(accountService.findByName).toHaveBeenCalledWith(mockNewData.name);

      expect(sleepService.findByAccountIdAndDate).toHaveBeenCalledTimes(1);
      expect(res).toEqual({
        message: `Record Updated For User ${mockNewData.name}`,
        data: updatedData,
      });
    });
  });
});
