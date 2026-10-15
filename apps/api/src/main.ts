import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { loadEnv } from './config/env';

async function bootstrap() {
  const env = loadEnv();
  const app = await NestFactory.create(AppModule);
  await app.listen(env.PORT);
  // eslint-disable-next-line no-console
  console.log(`caroni-api listening on :${env.PORT}`);
}

void bootstrap();
