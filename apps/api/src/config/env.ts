import { z } from 'zod';

const DEV_SESSION_SECRET = 'dev-only-insecure-session-secret-change-me';

/** Validated at boot — the process fails fast on a bad/missing value. */
const EnvSchema = z
  .object({
    NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
    PORT: z.coerce.number().int().positive().default(3100),
    LOG_LEVEL: z.enum(['error', 'warn', 'log', 'debug', 'verbose']).default('log'),

    DATABASE_URL: z.string().url().optional(),
    OPA_URL: z.string().url().default('http://localhost:8181'),

    // Comma-separated list of allowed browser origins for CORS.
    CORS_ORIGINS: z
      .string()
      .default('http://localhost:5173')
      .transform((v) =>
        v
          .split(',')
          .map((o) => o.trim())
          .filter(Boolean),
      ),
    /** Where the browser lands after a successful login / logout. */
    POST_LOGIN_REDIRECT_URI: z.string().url().default('http://localhost:5173'),

    // ── ThunderID (OIDC) ───────────────────────────────────────────────────
    THUNDER_ISSUER: z.string().url().default('https://localhost:8090'),
    THUNDER_CLIENT_ID: z.string().default('caroni-ops-console'),
    THUNDER_REDIRECT_URI: z.string().url().default('http://localhost:3100/auth/callback'),
    THUNDER_SCOPE: z.string().default('openid profile email'),
    /** Override discovery; otherwise derived from the issuer. */
    THUNDER_JWKS_URL: z.string().url().optional(),

    // ── Session / cookies ──────────────────────────────────────────────────
    /** Signs the short-lived OIDC flow cookie (HS256); min 32 chars. */
    SESSION_SECRET: z.string().min(32).default(DEV_SESSION_SECRET),
    SESSION_COOKIE_NAME: z.string().default('caroni_sid'),
    OIDC_STATE_COOKIE_NAME: z.string().default('caroni_oidc'),
    SESSION_TTL_SECONDS: z.coerce
      .number()
      .int()
      .positive()
      .default(8 * 60 * 60),
    OIDC_STATE_TTL_SECONDS: z.coerce
      .number()
      .int()
      .positive()
      .default(5 * 60),
    /** Cookies are marked Secure unless explicitly disabled (e.g. local http). */
    COOKIE_SECURE: z
      .enum(['true', 'false'])
      .optional()
      .transform((v) => (v === undefined ? undefined : v === 'true')),
  })
  .superRefine((env, ctx) => {
    if (env.NODE_ENV === 'production' && env.SESSION_SECRET === DEV_SESSION_SECRET) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['SESSION_SECRET'],
        message: 'must be set to a strong secret in production',
      });
    }
  });

export type Env = z.infer<typeof EnvSchema>;

/** Throws a readable error — used by `ConfigModule` so boot fails fast. */
export function validateEnv(raw: Record<string, unknown>): Env {
  const parsed = EnvSchema.safeParse(raw);
  if (!parsed.success) {
    throw new Error(`Invalid environment configuration:\n${formatIssues(parsed.error)}`);
  }
  return parsed.data;
}

/** Convenience loader for scripts (migrations, tests) outside the Nest container. */
export function loadEnv(source: NodeJS.ProcessEnv = process.env): Env {
  return validateEnv(source);
}

function formatIssues(error: z.ZodError): string {
  return error.issues
    .map((issue) => `  - ${issue.path.join('.') || '(root)'}: ${issue.message}`)
    .join('\n');
}
