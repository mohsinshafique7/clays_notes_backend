import { Test, TestingModule } from '@nestjs/testing';
import { AccountsService } from './accounts.service';
import { Repository } from 'typeorm';
import { Account } from './entities/account.entity';
import { getRepositoryToken } from '@nestjs/typeorm';
import { InternalServerErrorException } from '@nestjs/common';

describe('AccountsService', () => {
  let service: AccountsService;
  let accountRepository: Repository<Account>;
  afterEach(() => {
    jest.clearAllMocks();
  });
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AccountsService,
        {
          provide: getRepositoryToken(Account),
          useValue: {
            save: jest.fn(),
            findAndCount: jest.fn(),
            findOne: jest.fn(),
            exists: jest.fn(),
            delete: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<AccountsService>(AccountsService);
    accountRepository = module.get<Repository<Account>>(
      getRepositoryToken(Account),
    );
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
  describe('create', () => {
    it('Should create a new account.', async () => {
      const mockAccount: Account = new Account();
      jest.spyOn(accountRepository, 'save').mockResolvedValue(mockAccount);
      const result = await service.create(mockAccount);
      expect(result).toEqual(mockAccount);
    });
    it('Should raise an error if database operation fails.', async () => {
      const mockValue = new Account();
      jest
        .spyOn(accountRepository, 'save')
        .mockRejectedValue(new Error('Database Error'));
      try {
        await service.create(mockValue);
      } catch (err) {
        expect(err).toBeInstanceOf(InternalServerErrorException);
        expect(err.message).toBe('Cannot create account');
      }
    });
  });
  describe('Find All', () => {
    it('Should return all accounts with pagination.', async () => {
      const mockValue: [Account[], number] = [
        [{ id: 1, name: 'joe', gender: 'male' } as Account],
        1,
      ];

      jest
        .spyOn(accountRepository, 'findAndCount')
        .mockResolvedValue(mockValue);
      const result = await service.findAll(10, 1);
      expect(result).toEqual({
        accounts: [{ gender: 'male', id: 1, name: 'joe' }],
        totalCount: 1,
      });
    });
    it('Should raise an error if database operation fails.', async () => {
      jest.spyOn(accountRepository, 'findAndCount').mockImplementation(() => {
        throw new Error('Database Error');
      });
      try {
        await service.findAll(10, 1);
      } catch (error) {
        expect(error).toBeInstanceOf(InternalServerErrorException);
        expect(error.message).toBe('Error retrieving account records');
      }
    });
  });
  describe('FindOne', () => {
    it('Should return a single account by ID.', async () => {
      const mockValue = new Account();
      jest.spyOn(accountRepository, 'findOne').mockResolvedValue(mockValue);
      const result = await service.findOne(1);
      expect(result).toEqual(mockValue);
    });
    it('Should raise an error if database operation fails.', async () => {
      jest.spyOn(accountRepository, 'findOne').mockImplementation(() => {
        throw new Error('Database Error');
      });
      try {
        await service.findOne(1);
      } catch (error) {
        expect(error).toBeInstanceOf(InternalServerErrorException);
        expect(error.message).toBe('Error retrieving single account record');
      }
    });
  });
  describe('Exists', () => {
    it('Should return true if the account exists.', async () => {
      jest.spyOn(accountRepository, 'exists').mockResolvedValue(true);
      const result = await service.exists(1);
      expect(result).toEqual(true);
    });
    it('Should raise an error if database operation fails.', async () => {
      jest.spyOn(accountRepository, 'exists').mockImplementation(() => {
        throw new Error('Database Error');
      });
      try {
        await service.exists(1);
      } catch (error) {
        expect(error).toBeInstanceOf(InternalServerErrorException);
        expect(error.message).toBe('Error retrieving single account record');
      }
    });
  });
  describe('Find By Name', () => {
    it('Should return an account by name.', async () => {
      jest.spyOn(accountRepository, 'findOne').mockResolvedValue(new Account());
      const result = await service.findByName('joe');
      expect(result).toEqual(new Account());
    });
    it('Should raise an error if database operation fails.', async () => {
      jest.spyOn(accountRepository, 'findOne').mockImplementation(() => {
        throw new Error('Database Error');
      });
      try {
        await service.findByName('joe');
      } catch (error) {
        expect(error).toBeInstanceOf(InternalServerErrorException);
        expect(error.message).toBe('Error retrieving account by name');
      }
    });
  });
  describe('update', () => {
    it('Should update an account.', async () => {
      const mockAccount: Account = new Account();
      jest.spyOn(accountRepository, 'save').mockResolvedValue(mockAccount);
      const result = await service.update(mockAccount);
      expect(result).toEqual(mockAccount);
    });
    it('Should raise an error if database operation fails.', async () => {
      const mockAccount = new Account(); // Define your mock account data

      jest.spyOn(accountRepository, 'save').mockImplementation(() => {
        throw new Error('Database Error');
      });
      try {
        await service.update(mockAccount);
      } catch (error) {
        expect(error).toBeInstanceOf(InternalServerErrorException);
        expect(error.message).toBe('Error updating account record');
      }
    });
  });
  describe('Delete', () => {
    it('Should delete account', async () => {
      jest
        .spyOn(accountRepository, 'delete')
        .mockResolvedValue({ raw: null, affected: 1 });
      const result = await service.remove(1);
      expect(result).toEqual({ raw: null, affected: 1 });
    });
    it('Should raise an error if database operation fails.', async () => {
      accountRepository.delete = jest
        .fn()
        .mockRejectedValue(new Error('Database Error'));
      try {
        await service.remove(1);
      } catch (error) {
        expect(error).toBeInstanceOf(InternalServerErrorException);
        expect(error.message).toBe('Error deleting account record');
      }
    });
  });
});
