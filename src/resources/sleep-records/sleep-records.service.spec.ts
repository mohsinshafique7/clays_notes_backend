import { Test, TestingModule } from '@nestjs/testing';
import { SleepRecordsService } from './sleep-records.service';
import { SleepRecord } from './entities/sleep-record.entity';
import { EntityManager, Repository, createQueryBuilder } from 'typeorm';
import { getEntityManagerToken, getRepositoryToken } from '@nestjs/typeorm';

describe('SleepRecordsService', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });
  let service: SleepRecordsService;
  let sleepRecordRepository: Repository<SleepRecord>;
  let entityManager: EntityManager;
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SleepRecordsService,
        {
          provide: getRepositoryToken(SleepRecord),
          useClass: Repository,
        },
        {
          provide: EntityManager,
          useValue: {
            transaction: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<SleepRecordsService>(SleepRecordsService);
    sleepRecordRepository = module.get<Repository<SleepRecord>>(
      getRepositoryToken(SleepRecord),
    );
    entityManager = module.get(EntityManager);
  });
  afterEach(() => {
    jest.clearAllMocks();
  });
  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
