import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule, TypeOrmModuleOptions } from '@nestjs/typeorm';
import { NotesModule } from './resources/notes/notes.module';
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
  imports: [TypeOrmModule.forRoot(selectedDatabase), NotesModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
