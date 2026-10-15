import { z } from 'zod';

/** Validated at boot — the process fails fast on a bad/missing value. */
const EnvSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().int().positive().default(3000),
  DATABASE_URL: z.string().url().optional(),
  OPA_URL: z.string().url().default('http://localhost:8181'),

  // ThunderID (OIDC)
  THUNDER_ISSUER: z.string().url().default('https://localhost:8090'),
  THUNDER_CLIENT_ID: z.string().default('caroni-ops-console'),
  THUNDER_REDIRECT_URI: z.string().url().default('http://localhost:3100/auth/callback'),
  THUNDER_SCOPE: z.string().default('openid profile email'),
});

export type Env = z.infer<typeof EnvSchema>;

export function loadEnv(source: NodeJS.ProcessEnv = process.env): Env {
  const parsed = EnvSchema.safeParse(source);
  if (!parsed.success) {
    console.error('Invalid environment:', parsed.error.flatten().fieldErrors);
    throw new Error('Invalid environment configuration');
  }
  return parsed.data;
}
