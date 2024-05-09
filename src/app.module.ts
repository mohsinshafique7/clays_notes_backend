import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AccountsModule } from './resources/accounts/accounts.module';
import { SleepRecordsModule } from './resources/sleep-records/sleep-records.module';
import { TypeOrmModule, TypeOrmModuleOptions } from '@nestjs/typeorm';
const dev: TypeOrmModuleOptions = {
  type: 'postgres',
  host: 'db',
  port: 5432,
  username: 'postgres',
  password: 'postgres',
  database: 'postgres',
  entities: [__dirname + '/**/*.entity{.ts,.js}'],
  synchronize: true,
};
const test: TypeOrmModuleOptions = {
  type: 'postgres',
  host: 'db',
  port: 5432,
  username: 'postgres',
  password: 'postgres',
  database: 'postgres',
  entities: [__dirname + '/**/*.entity{.ts,.js}'],
  synchronize: true,
};
const selectedDatabase: TypeOrmModuleOptions =
  process.env.NODE_ENV === 'test' ? test : dev;
@Module({
  imports: [
    TypeOrmModule.forRoot(selectedDatabase),
    AccountsModule,
    SleepRecordsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
