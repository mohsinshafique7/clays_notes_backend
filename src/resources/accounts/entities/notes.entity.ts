import { ApiProperty } from '@nestjs/swagger';
import { Entity, PrimaryGeneratedColumn, Column,CreateDateColumn } from 'typeorm';

@Entity({ name: 'notes' })
export class Note {
  @ApiProperty({ example: 1, description: 'Primary key of Account' })
  @PrimaryGeneratedColumn()
  id: number;
  @ApiProperty({
    example: 'My Grocery List',
    required: true,
    description: 'Note title goes here',
  })
  @Column({ nullable: false })
  title: string;
  @ApiProperty({
    example: 'Apples and grapes',
    required: true,
    description: 'Note description goes here',
  })
  @Column({ nullable: false })
  description: string;
  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;
}
