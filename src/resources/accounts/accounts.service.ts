import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { Account } from './entities/account.entity';
import { DeleteResult, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class AccountsService {
  constructor(
    @InjectRepository(Account)
    private accountRepository: Repository<Account>,
  ) {}
  async create(account: Account): Promise<Account> {
    try {
      return await this.accountRepository.save(account);
    } catch {
      throw new InternalServerErrorException('Cannot create account');
    }
  }

  async findAll(
    perPage: number,
    currentPage: number,
  ): Promise<{ accounts: Account[]; totalCount: number }> {
    try {
      const skip = (currentPage - 1) * perPage;

      const [records, count] = await this.accountRepository.findAndCount({
        relations: {
          sleepRecord: true,
        },
        skip,
        take: perPage,
      });
      return { accounts: records, totalCount: count };
    } catch {
      throw new InternalServerErrorException(
        'Error retrieving account records',
      );
    }
  }

  async findOne(id: number): Promise<Account> {
    try {
      return await this.accountRepository.findOne({ where: { id } });
    } catch {
      throw new InternalServerErrorException(
        'Error retrieving single account record',
      );
    }
  }
  async exists(id: number): Promise<boolean> {
    try {
      return await this.accountRepository.exists({ where: { id } });
    } catch {
      throw new InternalServerErrorException(
        'Error retrieving single account record',
      );
    }
  }
  async findByName(name: string): Promise<Account> {
    try {
      return await this.accountRepository.findOne({ where: { name } });
    } catch {
      throw new InternalServerErrorException(
        'Error retrieving account by name',
      );
    }
  }
  async update(account: Account): Promise<Account> {
    try {
      return await this.accountRepository.save(account);
    } catch {
      throw new InternalServerErrorException('Error updating account record');
    }
  }

  async remove(id: number): Promise<DeleteResult> {
    try {
      return await this.accountRepository.delete({ id });
    } catch {
      throw new InternalServerErrorException('Error deleting account record');
    }
  }
}
