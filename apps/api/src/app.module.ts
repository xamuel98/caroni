import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { AuthorizationModule } from './authorization/authorization.module';
import { HealthController } from './health/health.controller';

@Module({
  imports: [AuthorizationModule, AuthModule],
  controllers: [HealthController],
})
export class AppModule {}
