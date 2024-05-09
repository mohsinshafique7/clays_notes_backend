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
  HttpStatus,
  NotFoundException,
  UsePipes,
} from '@nestjs/common';
import { SleepRecordsService } from './sleep-records.service';
import {
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { JoiValidationPipe } from '../../utils/Joi-validation-pipe';
import {
  CreateSleepRecordDto,
  GetAllDto,
  UpdateSleepRecordDto,
  createSchema,
  getAllRecords,
  update,
} from './dto/create-sleep-record.dto';
import * as moment from 'moment';
import { SleepRecord } from './entities/sleep-record.entity';

@ApiTags('Sleep Records')
@Controller('sleep-records')
export class SleepRecordsController {
  constructor(private readonly sleepRecordsService: SleepRecordsService) {}
  @Post()
  @ApiOperation({
    summary: 'Create a new sleep record',
    description: 'Creates a new sleep record with the provided data',
  })
  @ApiBody({
    required: true,

    schema: {
      type: 'object',
      properties: {
        date: { type: 'string', example: '2024-05-05' },
        sleepHours: { type: 'number', example: 3 },
        accountId: { type: 'number', example: 1 },
      },
    },
  })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'New sleep record created successfully',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Validation Error',
  })
  @ApiResponse({
    status: HttpStatus.INTERNAL_SERVER_ERROR,
    description: 'Cannot create sleep record',
  })
  @Post()
  @UsePipes(new JoiValidationPipe(createSchema))
  async create(@Body() sleepRecord: CreateSleepRecordDto) {
    const savedData = await this.sleepRecordsService.findByAccountIdAndDate(
      sleepRecord.accountId,
      sleepRecord.date,
    );

    const totalSavedHours = savedData.reduce((total, item) => {
      total += item.sleepHours;
      return total;
    }, 0);

    const availableHours = 24 - totalSavedHours;

    if (sleepRecord.sleepHours > availableHours) {
      throw new BadRequestException(
        `Total Available Hours left for date ${sleepRecord.date} are ${availableHours}`,
      );
    }
    const newRecord = await this.sleepRecordsService.create(sleepRecord);
    return {
      message: 'New Record Saved',
      new_record: newRecord,
    };
  }
  @ApiOperation({
    summary: 'Retrieve all sleep records',
    description: 'Retrieves all sleep records with pagination support.',
  })
  @ApiQuery({
    name: 'perPage',
    description: 'Number of records per page.',
    required: true,
    type: 'string',
  })
  @ApiQuery({
    name: 'currentPage',
    description: 'Current page number.',
    required: true,
    type: 'string',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Successfully retrieved sleep records',
    schema: {
      type: 'object',
      properties: {
        rows: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              id: { type: 'integer' },
              sleepHours: { type: 'integer' },
              date: { type: 'string' },
              accountId: { type: 'number' },
            },
          },
        },
      },
    },
  })
  @ApiResponse({
    status: HttpStatus.INTERNAL_SERVER_ERROR,
    description: 'Error retrieving sleep records',
  })
  @Get()
  async findAll(@Query(new JoiValidationPipe(getAllRecords)) query: GetAllDto) {
    const { perPage, currentPage } = query;
    const [rows, count] = await this.sleepRecordsService.findAll(
      +perPage,
      +currentPage,
    );
    return { rows, count };
  }
  @ApiOperation({
    summary: 'Retrieve aggregated record of last seven days',
    description: 'Retrieves aggregated record of last seven days by account Id',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Successfully retrieved sleep records',
    schema: {
      type: 'object',
      properties: {
        rows: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              date: {
                type: 'string',
              },
              sleepHours: {
                type: 'integer',
                example: 5,
              },
            },
          },
        },
      },
    },
  })
  @ApiResponse({
    status: HttpStatus.INTERNAL_SERVER_ERROR,
    description: 'Error Retrieving last seven days record',
  })
  @Get('/last-seven/:id')
  async getLastSevenDaysRecord(@Param('id') id: string) {
    const sevenDaysAgo = moment().subtract(7, 'days').format('YYYY-MM-DD');
    const records = await this.sleepRecordsService.getByDate(sevenDaysAgo, +id);
    const formated = records.reduce((acc, item) => {
      const found = acc.find((i) => i.date === item.date);
      if (found) {
        found.sleepHours += item.sleepHours;
      } else {
        acc.push({ date: item.date, sleepHours: item.sleepHours });
      }
      return acc;
    }, []);
    return { rows: formated };
  }
  @ApiOperation({
    summary: 'Retrieve a single sleep record',
    description: 'Retrieves a single sleep record by its ID.',
  })
  @ApiParam({
    name: 'id',
    description: 'ID of the sleep record to retrieve',
    required: true,
    type: 'number',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Successfully retrieved the sleep record',
    schema: {
      type: 'object',
      properties: {
        row: {
          type: 'object',
          properties: {
            id: { type: 'number' },
            sleepHours: { type: 'number' },
            date: { type: 'string', format: 'date' },
            accountId: { type: 'number' },
          },
        },
      },
    },
  })
  @ApiResponse({
    status: HttpStatus.INTERNAL_SERVER_ERROR,
    description: 'Internal server error',
  })
  @Get(':id')
  async findOne(@Param('id') id: string) {
    const row = await this.sleepRecordsService.findOne(+id);
    return { row };
  }

  @ApiOperation({
    summary: 'Update a sleep record by ID',
    description: 'Updates an existing sleep record with the specified ID.',
  })
  @ApiBody({
    required: true,
    type: SleepRecord,
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Sleep record updated successfully',
  })
  @ApiResponse({
    status: HttpStatus.INTERNAL_SERVER_ERROR,
    description: 'Cannot update sleep record',
  })
  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body(new JoiValidationPipe(update)) sleepRecord: UpdateSleepRecordDto,
  ) {
    const existingAccount = await this.sleepRecordsService.findOne(+id);

    if (existingAccount === null) {
      throw new BadRequestException(`Record not found for id ${id}`);
    }
    if (existingAccount !== null) {
      Object.assign(existingAccount, sleepRecord);

      const savedData = await this.sleepRecordsService.findByAccountIdAndDate(
        existingAccount.accountId,
        existingAccount.date,
      );

      const totalSavedHours = savedData.reduce((total, item) => {
        total += item.sleepHours;
        return total;
      }, 0);
      const availableHours = 24 - totalSavedHours;
      if (existingAccount.sleepHours > availableHours) {
        throw new BadRequestException(
          `Total Available Hours left for date ${existingAccount.date} are ${availableHours}`,
        );
      }

      const updatedRows =
        await this.sleepRecordsService.update(existingAccount);
      return {
        message: `Sleep Record for ${id} updated successfully`,
        updatedRows,
      };
    }
  }
  @Delete(':id')
  @ApiOperation({
    summary: 'Delete a sleep record by ID',
    description: 'Deletes a sleep record by its ID.',
  })
  @ApiParam({
    name: 'id',
    description: 'ID of the sleep record to delete',
    required: true,
    type: 'string',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Sleep record deleted successfully',
  })
  @ApiResponse({
    status: HttpStatus.INTERNAL_SERVER_ERROR,
    description: 'Cannot delete sleep record',
  })
  @Delete(':id')
  async remove(@Param('id') id: number) {
    const record = await this.sleepRecordsService.findOne(+id);
    if (!record) {
      throw new NotFoundException('Sleep record not found');
    }
    await this.sleepRecordsService.remove(+id);
    return { message: `Sleep Record ${id} deleted successfully` };
  }
}
