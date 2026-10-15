import { Injectable } from '@nestjs/common';
import { loadEnv } from '../config/env';

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

@Injectable()
export class OpaService {
  private readonly url = `${loadEnv().OPA_URL}/v1/data/caroni/decision`;

  async decide(input: DecisionInput): Promise<Decision> {
    const res = await fetch(this.url, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ input }),
    });
    if (!res.ok) {
      throw new Error(`OPA decision request failed: ${res.status} ${res.statusText}`);
    }
    const body = (await res.json()) as { result?: Decision };
    return (
      body.result ?? {
        allow: false,
        reasons: ['opa.no_result'],
        obligations: [],
        matchedPolicy: '',
      }
    );
  }
}
