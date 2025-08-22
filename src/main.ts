/* eslint-disable no-undef */
import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import cookieParser from 'cookie-parser';
import { AppModule } from './app.module';
import { GlobalExceptionFilter } from './common/filters/global-exception.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Enable CORS
  app.enableCors();

  // Cookie parser middleware
  app.use(cookieParser());

  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // Global exception filter for standardized error responses
  app.useGlobalFilters(new GlobalExceptionFilter());

  // Swagger documentation
  const config = new DocumentBuilder()
    .setTitle('Beauty Place API')
    .setDescription('The Beauty Place marketplace API documentation')
    .setVersion('1.0')
    .addTag('Authentication', 'Login, logout, and profile endpoints')
    .addTag('Users', 'User management endpoints')
    .addTag('Professionals', 'Professional profile management endpoints')
    .addTag('Services', 'Service management endpoints')
    .addTag('Availability', 'Professional availability and scheduling endpoints')
    .addTag('Bookings', 'Booking management and scheduling endpoints')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  const port = process.env.PORT || 3000;
  await app.listen(port);
  
  // Note: Using console.log for bootstrap messages as logger service not yet available
  console.log(`🚀 Application is running on: http://localhost:${port}`);
  console.log(`📚 Swagger documentation: http://localhost:${port}/api`);
}

bootstrap();
