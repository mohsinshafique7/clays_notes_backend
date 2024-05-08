import { Module } from '@nestjs/common';
import { SleepRecordsService } from './sleep-records.service';
import { SleepRecordsController } from './sleep-records.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SleepRecord } from './entities/sleep-record.entity';
@Module({
  imports: [TypeOrmModule.forFeature([SleepRecord])],
  controllers: [SleepRecordsController],
  providers: [SleepRecordsService],
  exports: [SleepRecordsService],
})
export class SleepRecordsModule {}
