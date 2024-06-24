import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const options = new DocumentBuilder()
    .setTitle('Note Taking App API')
    .setDescription('Backend For Clays Full Stack developer Assignment')
    .setVersion('1.0')
    .addServer('http://localhost:5000/api', 'Local ')
    .build();

  const document = SwaggerModule.createDocument(app, options);
  SwaggerModule.setup('api-docs', app, document);
  app.setGlobalPrefix('api');
  app.enableCors();
  await app.listen(Number(process.env.PORT));
}
bootstrap();
