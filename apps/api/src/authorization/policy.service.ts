import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { correlationId } from '../common/correlation';
import { DependencyError, DomainError } from '../common/errors';
import type { Env } from '../config/env';

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

/** Thin, typed client over OPA's data API. Transport failures become 503s. */
@Injectable()
export class PolicyService {
  private readonly logger = new Logger(PolicyService.name);
  private readonly url: string;

  constructor(config: ConfigService<Env, true>) {
    this.url = `${config.get('OPA_URL', { infer: true })}/v1/data/caroni/decision`;
  }

  async decide(input: DecisionInput): Promise<Decision> {
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
