import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import { AuthorizationGuard, type AuthedRequest } from '../authorization/authorization.guard';
import { RequirePermission } from '../authorization/require-permission.decorator';

/**
 * Example ops resource: the guard denies the whole route unless the session
 * holds `ops_kyc.kyc_case.view` per policy.
 */
@Controller('api/ops/kyc')
@UseGuards(AuthorizationGuard)
export class OpsKycController {
  @Get('cases')
  @RequirePermission('ops_kyc.kyc_case.view')
  list(@Req() req: AuthedRequest) {
    return { cases: [], viewer: req.session?.userId ?? null };
  }
}
