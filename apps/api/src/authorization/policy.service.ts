import { Inject, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { correlationId } from '../common/correlation';
import { DependencyError, DomainError } from '../common/errors';
import type { Env } from '../config/env';
import { DECISION_LOG_STORE, type DecisionLogStore } from './decision-log.store';

export interface DecisionInput {
  action: string;
  subject: { id?: string; roles: string[]; attributes?: Record<string, unknown> };
  resource?: Record<string, unknown>;
  context?: Record<string, unknown>;
}

export interface Decision {
  allow: boolean;
  reasons: string[];
  obligations: string[];
  matchedPolicy: string;
}

const DENY: Decision = {
  allow: false,
  reasons: ['opa.no_result'],
  obligations: [],
  matchedPolicy: '',
};

/**
 * Thin, typed client over OPA's data API. Every decision — including transport
 * failures — is written to the audit log. Transport failures become 503s.
 */
@Injectable()
export class PolicyService {
  private readonly logger = new Logger(PolicyService.name);
  private readonly url: string;

  constructor(
    config: ConfigService<Env, true>,
    @Inject(DECISION_LOG_STORE) private readonly log: DecisionLogStore,
  ) {
    this.url = `${config.get('OPA_URL', { infer: true })}/v1/data/caroni/decision`;
  }

  async decide(input: DecisionInput): Promise<Decision> {
    const startedAt = Date.now();
    try {
      const decision = await this.evaluate(input);
      await this.audit(input, decision, Date.now() - startedAt);
      return decision;
    } catch (err) {
      await this.audit(
        input,
        { allow: false, reasons: ['opa.unavailable'], obligations: [], matchedPolicy: '' },
        Date.now() - startedAt,
      );
      throw err;
    }
  }

  private async evaluate(input: DecisionInput): Promise<Decision> {
    let res: Response;
    try {
      res = await fetch(this.url, {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
          ...(correlationId() ? { 'x-correlation-id': correlationId()! } : {}),
        },
        body: JSON.stringify({ input }),
      });
    } catch (err) {
      throw new DependencyError('Policy decision point unreachable', err);
    }

    if (!res.ok) throw new DependencyError(`Policy decision failed (${res.status})`);

    const body = (await res.json()) as { result?: Partial<Decision> };
    return normalize(body.result);
  }

  private async audit(input: DecisionInput, decision: Decision, latencyMs: number): Promise<void> {
    try {
      await this.log.record({
        correlationId: correlationId(),
        subjectId: input.subject.id,
        roles: input.subject.roles,
        action: input.action,
        resource: input.resource,
        context: input.context,
        allow: decision.allow,
        reasons: decision.reasons,
        obligations: decision.obligations,
        matchedPolicy: decision.matchedPolicy,
        latencyMs,
        createdAt: new Date(),
      });
    } catch (err) {
      // Audit logging must never break authorization.
      this.logger.warn(
        `Failed to write decision_log: ${err instanceof Error ? err.message : String(err)}`,
      );
    }
  }
}

function normalize(result: Partial<Decision> | undefined): Decision {
  if (!result) return DENY;
  return {
    allow: result.allow === true,
    reasons: Array.isArray(result.reasons) ? result.reasons : [],
    obligations: Array.isArray(result.obligations) ? result.obligations : [],
    matchedPolicy: typeof result.matchedPolicy === 'string' ? result.matchedPolicy : '',
  };
}

export function isDependencyError(err: unknown): err is DomainError {
  return err instanceof DependencyError;
}
