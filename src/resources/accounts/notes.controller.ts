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
import {
  ApiBody,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { createNoteSchema } from './notes.validation';
import { JoiValidationPipe } from '../../utils/Joi-validation-pipe';
import { CreateNoteDto } from './dto/notes.dto';
import { NotesService } from './notes.service';
import { Note } from './entities/notes.entity';

@ApiTags('Notes')
@Controller('notes')
export class NotesController {
  constructor(private readonly notesService: NotesService) {}
  @ApiOperation({
    summary: 'Create Note',
    description: 'Creates note with title and description',
  })
  @ApiBody({
    description: 'Data to create new note',
    schema: {
      type: 'object',
      properties: {
        title: { type: 'string' },
        description: { type: 'string' },
      },
      required: ['title', 'description'],
    },
  })
  @ApiResponse({
    status: 201,
    description: 'Record created successfully',
  })
  @ApiResponse({ status: 400, description: 'Validation error' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  @Post()
  @UsePipes(new JoiValidationPipe(createNoteSchema))
  async create(@Body() createNoteDto: CreateNoteDto) {
    const { title, description } = createNoteDto;
    // export from Dto file
    // const note = plainToInstance(Note, createNoteDto);
    const note = new Note();
    note.title = title;
    note.description = description;
    const new_record = await this.notesService.create(note);
    return { message: 'New Record Saved', data: new_record };
  }
  @ApiOperation({
    summary: 'Get all notes',
    description: 'Retrieves all notes',
  })
  @ApiOkResponse({
    description: 'Successfully retrieved notes',
    schema: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          id: { type: 'number' },
          title: { type: 'string' },
          description: { type: 'string' },
          createdAt: {
            type: 'string',
            format: 'date-time',
          },
        },
      },
    },
  })
  @ApiResponse({ status: 400, description: 'Validation error' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  @Get()
  async findAll() {
    return await this.notesService.findAll();
  }
  @ApiOperation({
    summary: 'Get single note',
    description: 'Retrieves single note.',
  })
  @ApiParam({
    name: 'id',
    description: 'ID of the note to retrieve',
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
            id: { type: 'number' },
            title: { type: 'string' },
            description: { type: 'string' },
          },
        },
      },
    },
  })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  @Get(':id')
  async findOne(@Param('id') id: string) {
    const row = await this.notesService.findOne(+id);
    return { row };
  }
  @ApiOperation({
    summary: 'Update a note by ID',
    description: 'Update an existing note record with the specified id.',
  })
  @ApiParam({
    name: 'id',
    description: 'The ID of the note to update.',
    required: true,
    type: 'number',
  })
  @ApiBody({
    description: 'Note data to update',
    type: Note,
  })
  @ApiResponse({
    status: 200,
    description: 'Note updated successfully.',
  })
  @ApiResponse({ status: 400, description: 'Validation error' })
  @ApiResponse({
    status: 500,
    description: 'Error updating note',
  })
  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body(new JoiValidationPipe(createNoteSchema)) newRecord: CreateNoteDto,
  ) {
    const existingAccount = await this.notesService.findOne(+id);
    if (!existingAccount) {
      throw new BadRequestException(`Record not found for id ${id}`);
    }
    Object.assign(existingAccount, newRecord);
    const updatedRecord = await this.notesService.update(existingAccount);
    return {
      message: `Note ${id} updated successfully`,
      record: updatedRecord,
    };
  }
  @Delete(':id')
  @ApiOperation({
    summary: 'Delete a note',
    description: 'Deletes a note by ID',
  })
  @ApiParam({
    name: 'id',
    description: 'ID of the note to delete',
    required: true,
    type: 'string',
  })
  @ApiResponse({
    status: 200,
    description: 'Note deleted successfully',
  })
  @ApiResponse({
    status: 400,
    description: 'Error deleting note',
  })
  @Delete(':id')
  async remove(@Param('id') id: string) {
    const existingAccount = await this.notesService.findOne(+id);
    if (!existingAccount) {
      throw new BadRequestException(`Record not found for id ${id}`);
    }

    await this.notesService.remove(+id);
    return { message: `Note Id ${id} deleted successfully` };
  }
}
