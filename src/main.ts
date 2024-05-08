import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const options = new DocumentBuilder()
    .setTitle('Sleep Tracking API')
    .setDescription('Backend Fo Cynomi Full Stack developer Assignment')
    .setVersion('1.0')
    .addServer('http://localhost:5000/api', 'Local environment')
    // .addServer('https://staging.yourapi.com/', 'Staging')
    // .addServer('https://production.yourapi.com/', 'Production')
    // .addTag('Your API Tag')
    .build();

  const document = SwaggerModule.createDocument(app, options);
  SwaggerModule.setup('api-docs', app, document);
  app.setGlobalPrefix('api');
  app.enableCors();
  await app.listen(5000);
}
bootstrap();
