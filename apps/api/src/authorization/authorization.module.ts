import { Module } from '@nestjs/common';
import { AuthzController } from './authz.controller';
import { OpaService } from './opa.service';

@Module({
  controllers: [AuthzController],
  providers: [OpaService],
  exports: [OpaService],
})
export class AuthorizationModule {}
