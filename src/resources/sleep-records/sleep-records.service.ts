import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { DeleteResult, Repository } from 'typeorm';
import { SleepRecord } from './entities/sleep-record.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateSleepRecordDto } from './dto/create-sleep-record.dto';

@Injectable()
export class SleepRecordsService {
  constructor(
    @InjectRepository(SleepRecord)
    private sleepRecordRepository: Repository<SleepRecord>,
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
  async findByAccountIdAndDate(
    accountId: number,
    date: Date,
  ): Promise<SleepRecord[]> {
    try {
      return await this.sleepRecordRepository.find({
        where: { accountId, date },
      });
    } catch (err) {
      throw new InternalServerErrorException('Error retrieving sleep record');
    }
  }

  async update(sleepRecord: Partial<SleepRecord>): Promise<SleepRecord> {
    try {
      return await this.sleepRecordRepository.save(sleepRecord);
    } catch (err) {
      throw new InternalServerErrorException('Error Updating Record');
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
