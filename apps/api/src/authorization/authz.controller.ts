import { Body, Controller, Post } from '@nestjs/common';
import { OpaService, type Decision } from './opa.service';

interface DecisionRequest {
  action: string;
  roles?: string[];
}

/**
 * Temporary probe endpoint for M0 — lets us prove the API↔OPA path before the
 * real session-based guard lands. Not exposed in production.
 */
@Controller('authz')
export class AuthzController {
  constructor(private readonly opa: OpaService) {}

  @Post('decision')
  decide(@Body() body: DecisionRequest): Promise<Decision> {
    return this.opa.decide({ action: body.action, subject: { roles: body.roles ?? [] } });
  }
}
