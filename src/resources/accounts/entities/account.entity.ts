import { ApiProperty } from '@nestjs/swagger';
import { SleepRecord } from '../../sleep-records/entities/sleep-record.entity';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
  Unique,
} from 'typeorm';

@Entity({ name: 'accounts' }) // Specify table name
@Unique(['name'])
export class Account {
  @ApiProperty({ example: 1, description: 'Primary key of Account' })
  @PrimaryGeneratedColumn()
  id: number;
  @ApiProperty({ example: 'Joe', required: true })
  @Column({ nullable: false })
  name: string;
  @ApiProperty({
    example: 'male',
    required: true,
    description: 'Value must be either male,female or other',
  })
  @Column({ nullable: false })
  gender: string;

  @OneToMany(() => SleepRecord, (sleepData) => sleepData.account, {
    cascade: true,
  })
  sleepRecord: SleepRecord[];
}
