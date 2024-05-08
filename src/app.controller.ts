import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}
  @Get()
  @ApiOperation({ summary: 'Check if the app is up and running' })
  @ApiResponse({ status: 200, description: 'App is up and running' })
  @Get()
  getHello(): string {
    return this.appService.getHello();
  }
}
