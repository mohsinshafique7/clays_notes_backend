import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { DeleteResult, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Note } from './entities/notes.entity';

@Injectable()
export class NotesService {
  constructor(
    @InjectRepository(Note)
    private noteRepository: Repository<Note>,
  ) {}
  async create(note: Note): Promise<Note> {
    try {
      return await this.noteRepository.save(note);
    } catch {
      throw new InternalServerErrorException('Cannot create note');
    }
  }
  async findAll(): Promise<Note[]> {
    try {
      const data = await this.noteRepository.find();
      return data;
    } catch {
      throw new InternalServerErrorException('Error retrieving note');
    }
  }

  async findOne(id: number): Promise<Note> {
    try {
      return await this.noteRepository.findOne({ where: { id } });
    } catch {
      throw new InternalServerErrorException('Error retrieving single note');
    }
  }

  async update(note: Note): Promise<Note> {
    try {
      return await this.noteRepository.save(note);
    } catch {
      throw new InternalServerErrorException('Error updating note');
    }
  }

  async remove(id: number): Promise<DeleteResult> {
    try {
      return await this.noteRepository.delete({ id });
    } catch {
      throw new InternalServerErrorException('Error deleting note');
    }
  }
}
