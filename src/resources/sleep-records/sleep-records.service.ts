import { Injectable, InternalServerErrorException } from '@nestjs/common';
import {
  Connection,
  DeleteResult,
  EntityManager,
  Repository,
  UpdateResult,
  getManager,
} from 'typeorm';
import { SleepRecord } from './entities/sleep-record.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateSleepRecordDto } from './dto/create-sleep-record.dto';

@Injectable()
export class SleepRecordsService {
  constructor(
    @InjectRepository(SleepRecord)
    private sleepRecordRepository: Repository<SleepRecord>,
    private readonly entityManager: EntityManager,
  ) {}
  async create(sleepRecord: CreateSleepRecordDto): Promise<SleepRecord> {
    try {
      return await this.sleepRecordRepository.save(sleepRecord);
    } catch (err) {
      throw new InternalServerErrorException('Cannot create sleep record');
    }
  }
  async getByDate(date: string, accountId: number): Promise<SleepRecord[]> {
    try {
      return await this.sleepRecordRepository
        .createQueryBuilder('record')
        .where('record.date >= :date', { date: date })
        .andWhere('record.accountId = :accountId', { accountId })
        .getMany();
    } catch {
      throw new InternalServerErrorException(
        'Error Retrieving last seven days record',
      );
    }
  }

  async findAll(
    perPage: number,
    currentPage: number,
  ): Promise<[SleepRecord[], number]> {
    try {
      const skip = (currentPage - 1) * perPage;
      return await this.sleepRecordRepository.findAndCount({
        skip,
        take: perPage,
      });
    } catch {
      throw new InternalServerErrorException('Error retrieving sleep records');
    }
  }

  async findOne(id: number): Promise<SleepRecord> {
    try {
      return await this.sleepRecordRepository.findOne({ where: { id: id } });
    } catch (err) {
      throw new InternalServerErrorException('Error retrieving sleep record');
    }
  }
  findByAccountIdAndDate(
    accountId: number,
    date: Date,
  ): Promise<SleepRecord[]> {
    return this.sleepRecordRepository.find({ where: { accountId, date } });
  }

  async update(sleepRecord: SleepRecord): Promise<number> {
    try {
      // return await this.sleepRecordRepository.save(sleepRecord);
      let resp: UpdateResult;
      await this.entityManager.transaction(async (entityManager) => {
        const result = await entityManager
          .createQueryBuilder()
          .select('COALESCE(SUM(sleepRecord.sleepHours), 0)', 'totalSleepHours')
          .from(SleepRecord, 'sleepRecord')
          .where('sleepRecord.date = :date', { date: sleepRecord.date })
          .andWhere('sleepRecord.accountId = :accountId', {
            accountId: sleepRecord.accountId,
          })
          .getRawOne();

        // await entityManager.save(sleepRecord);
        const availableSleepHours = 24 - result.totalSleepHours;
        const updatedSleepHours = Math.min(
          sleepRecord.sleepHours,
          availableSleepHours,
        );
        resp = await entityManager
          .createQueryBuilder()
          .update(SleepRecord)
          .set({ sleepHours: updatedSleepHours })
          .where('date = :date', { date: sleepRecord.date })
          .andWhere('id = :id', {
            id: sleepRecord.id,
          })
          .execute();
      });
      return resp.affected;
    } catch (err) {
      throw new InternalServerErrorException(err);
    }
  }

  async remove(id: number): Promise<DeleteResult> {
    try {
      return await this.sleepRecordRepository.delete({ id: id });
    } catch {
      throw new InternalServerErrorException('Error Deleting Sleep Record');
    }
  }
}
