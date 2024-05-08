import { ApiProperty } from '@nestjs/swagger';
import { Account } from '../../accounts/entities/account.entity';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';

@Entity({ name: 'sleep_record' }) // Specify table name
export class SleepRecord {
  @ApiProperty({
    example: 1,
    required: true,
    description: 'Primary key of Sleep Record',
  })
  @PrimaryGeneratedColumn()
  id: number;
  @ApiProperty({
    example: '1 to 24',
    required: true,
    description: 'Value must be between 1 and 24',
  })
  @Column({
    type: 'int',
    nullable: false,
    unsigned: true,
    default: 0,
  })
  sleepHours: number;
  @ApiProperty({
    example: '2024-05-01',
    required: true,
    description:
      'Data must be in YYYY-MM-DD format and should not be future date',
  })
  @Column({ type: 'date', nullable: false })
  date: Date;
  @ApiProperty({
    example: 1,
    required: true,
    description: 'Id of Account',
  })
  @Column({ nullable: false }) // Define accountId as a column
  accountId: number;

  @ManyToOne(() => Account, (account) => account.sleepRecord, {
    onDelete: 'CASCADE',
    orphanedRowAction: 'delete',
  })
  @JoinColumn({ name: 'accountId' }) // Specify the column name for the foreign key
  account: Account;
}
