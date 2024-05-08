import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  BadRequestException,
  NotFoundException,
  UsePipes,
} from '@nestjs/common';
import { AccountsService } from './accounts.service';
import { Account } from './entities/account.entity';
import { SleepRecord } from '../sleep-records/entities/sleep-record.entity';
import { SleepRecordsService } from '../sleep-records/sleep-records.service';
import {
  ApiBody,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import {
  CreateAccountDto,
  GetAllDto,
  UpdateAccountDto,
  createSchema,
} from './dto/create-account.dto';
import { getAllRecords, update } from './account.validation';
import { JoiValidationPipe } from '../../utils/Joi-validation-pipe';

@ApiTags('Accounts')
@Controller('accounts')
export class AccountsController {
  constructor(
    private readonly accountsService: AccountsService,
    private readonly sleepRecordService: SleepRecordsService,
  ) {}
  @ApiOperation({
    summary: "Create or update an account's sleep record",
    description:
      "Creates or updates an account's sleep record based on the provided data.",
  })
  @ApiBody({
    description: "Data to create or update an account's sleep record",
    schema: {
      type: 'object',
      properties: {
        name: { type: 'string' },
        gender: { type: 'string' },
        sleepRecord: {
          type: 'object',
          properties: {
            sleepHours: { type: 'number' },
            date: { type: 'string', format: 'date' },
          },
          required: ['sleepHours', 'date'],
        },
      },
      required: ['name', 'gender', 'sleepRecord'],
    },
  })
  @ApiResponse({
    status: 201,
    description: 'Record created successfully',
  })
  @ApiResponse({
    status: 200,
    description: 'Record updated successfully',
  })
  @ApiResponse({ status: 400, description: 'Validation error' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  @Post()
  @UsePipes(new JoiValidationPipe(createSchema))
  async create(@Body() createAccountDto: CreateAccountDto) {
    const {
      name,
      gender,
      sleepRecord: { date, sleepHours },
    } = createAccountDto;
    // const { account, sleepRecord } = createAccountDto;
    // converting  name to lowercase
    const lowerCaseName: string = name.toLowerCase().trim();
    // converting  gender to lowercase
    const lowerCaseGender: string = gender.toLowerCase().trim();
    // Check if record exists against name
    const exists = await this.accountsService.findByName(lowerCaseName);
    if (exists) {
      // If exists get all the record of user of date to make sure max 24 in a day
      const sleepRecords = await this.sleepRecordService.findByAccountIdAndDate(
        exists.id,
        date,
      );
      //Check if record exists
      if (sleepRecords) {
        // if exists get sum of all hours
        const sleepDataSum = sleepRecords.reduce(
          (sum: number, entry: SleepRecord) => {
            return sum + entry.sleepHours;
          },
          0,
        );
        //check if new hour and previous sum is more than 24 hours
        if (sleepDataSum + sleepHours > 24) {
          // if yes throw an error
          throw new BadRequestException(
            'Sleep Hours can not be more than 24 hours',
          );
        }

        // if record exists, update sleep record
        const slpRecord = new SleepRecord();
        slpRecord.accountId = exists.id;
        slpRecord.sleepHours = sleepHours;
        slpRecord.date = date;
        const updated_record = await this.sleepRecordService.create(slpRecord);
        return {
          message: `Record Updated For User ${name}`,
          data: updated_record,
        };
      }
    }
    // If account record does not exists then create account and add sleep record
    const acc = new Account();
    acc.name = lowerCaseName;
    acc.gender = lowerCaseGender;
    acc.sleepRecord = [createAccountDto.sleepRecord] as any;
    const new_record = await this.accountsService.create(acc);
    return { message: 'New Record Saved', data: new_record };
  }
  @ApiOperation({
    summary: 'Get all accounts with aggregated sleep records',
    description:
      'Retrieves all accounts along with aggregated sleep records for each account',
  })
  @ApiQuery({
    name: 'perPage',
    description: 'Number of records per page',
    required: false,
    type: 'string',
  })
  @ApiQuery({
    name: 'currentPage',
    description: 'Current page number',
    required: false,
    type: 'string',
  })
  @ApiOkResponse({
    description: 'Successfully retrieved accounts',
    schema: {
      type: 'object',
      properties: {
        rows: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              id: { type: 'string' },
              name: { type: 'string' },
              gender: { type: 'string' },
              noOfEntries: { type: 'number' },
            },
          },
        },
        count: { type: 'number' },
      },
    },
  })
  @ApiResponse({ status: 400, description: 'Validation error' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  @Get()
  async findAll(@Query(new JoiValidationPipe(getAllRecords)) query: GetAllDto) {
    const { perPage, currentPage } = query;
    const { accounts, totalCount } = await this.accountsService.findAll(
      +perPage,
      +currentPage,
    );
    const newRecord = accounts.reduce((acc: any, item) => {
      const newObj = {
        id: item.id,
        name: item.name
          .split(' ')
          .map((word: string) => word.charAt(0).toUpperCase() + word.slice(1))
          .join(' '),
        gender: item.gender,
        noOfEntries: item?.sleepRecord?.length,
      };
      acc.push(newObj);
      return acc;
    }, []);
    return { rows: newRecord, count: totalCount };
  }
  @ApiOperation({
    summary: 'Get single account',
    description: 'Retrieves single account.',
  })
  @ApiParam({
    name: 'id',
    description: 'ID of the account to retrieve',
    required: true,
    type: 'number',
  })
  @ApiResponse({
    status: 200,
    description: 'Successfully retrieved the account',
    schema: {
      type: 'object',
      properties: {
        row: {
          type: 'object',
          properties: {
            id: { type: 'number', example: 4 },
            name: { type: 'string', example: 'joe' },
            gender: { type: 'string', example: 'male' },
          },
        },
      },
    },
  })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  @Get(':id')
  async findOne(@Param('id') id: string) {
    const row = await this.accountsService.findOne(+id);
    return { row };
  }
  @ApiOperation({
    summary: 'Update an account by ID',
    description: 'Update an existing account record with the specified ID.',
  })
  @ApiParam({
    name: 'id',
    description: 'The ID of the account to update.',
    required: true,
    type: 'number',
  })
  @ApiBody({
    description: 'Account data to update',
    type: Account,
  })
  @ApiResponse({
    status: 200,
    description: 'Account updated successfully.',
  })
  @ApiResponse({ status: 400, description: 'Validation error' })
  @ApiResponse({
    status: 500,
    description: 'Error updating account record',
  })
  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body(new JoiValidationPipe(update)) newRecord: UpdateAccountDto,
  ) {
    const existingAccount = await this.accountsService.findOne(+id);
    if (!existingAccount) {
      throw new BadRequestException(`Record not found for id ${id}`);
    }
    Object.assign(existingAccount, newRecord);
    const updatedRecord = await this.accountsService.update(existingAccount);
    return {
      message: `Account ${id} updated successfully`,
      record: updatedRecord,
    };
  }
  @Delete(':id')
  @ApiOperation({
    summary: 'Delete an account',
    description: 'Deletes an account by ID',
  })
  @ApiParam({
    name: 'id',
    description: 'ID of the account to delete',
    required: true,
    type: 'string',
  })
  @ApiResponse({
    status: 200,
    description: 'Account deleted successfully',
  })
  @ApiResponse({
    status: 400,
    description: 'Error deleting account',
  })
  @Delete(':id')
  async remove(@Param('id') id: string) {
    const record = await this.accountsService.exists(+id);
    if (!record) throw new NotFoundException('Account record not found');
    await this.accountsService.remove(+id);
    return { message: `Account Id ${id} deleted successfully` };
  }
}
