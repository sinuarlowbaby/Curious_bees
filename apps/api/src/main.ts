import * as dotenv from 'dotenv';
import * as path from 'path';
import * as fs from 'fs';

// Dynamically locate root .env in monorepo parent folders
let envPath = path.join(process.cwd(), '.env');
if (!fs.existsSync(envPath)) {
  envPath = path.join(process.cwd(), '..', '.env');
}
if (!fs.existsSync(envPath)) {
  envPath = path.join(process.cwd(), '../..', '.env');
}

dotenv.config({ path: envPath });

import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Set global API prefix
  app.setGlobalPrefix('api');

  // Enable validation pipes globally
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true
    })
  );

  // Enable CORS for frontend application access
  app.enableCors({
    origin: [
      'http://localhost:3000',
      'http://127.0.0.1:3000',
      'http://localhost:4000', // for internal checking
    ],
    credentials: true,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    allowedHeaders: 'Content-Type, Accept, Authorization',
  });

  const port = process.env.PORT || 4000;
  await app.listen(port);
  console.log(`🚀 SRM_Recollab Backend running on: http://localhost:${port}/api`);
}
bootstrap();
