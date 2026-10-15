import { Module } from '@nestjs/common';
import { AuthorizationModule } from './authorization/authorization.module';
import { HealthController } from './health/health.controller';

@Module({
  imports: [AuthorizationModule],
  controllers: [HealthController],
})
export class AppModule {}
