/** RFC 7807 problem payload returned by the API. */
export interface ProblemDetails {
  type: string;
  title: string;
  status: number;
  detail: string;
  code: string;
  correlationId?: string;
  reasons?: string[];
  obligations?: string[];
}

export class ApiError extends Error {
  constructor(
    readonly status: number,
    readonly code: string,
    readonly problem: ProblemDetails | null,
  ) {
    super(problem?.detail ?? `Request failed (${status})`);
    this.name = 'ApiError';
  }
}

export function isUnauthorized(error: unknown): boolean {
  return error instanceof ApiError && error.status === 401;
}

export function isForbidden(error: unknown): boolean {
  return error instanceof ApiError && error.status === 403;
}

/**
 * Thin fetch wrapper: sends cookies (HttpOnly session), expects JSON, and turns
 * non-2xx responses into a typed `ApiError` carrying the problem+json body.
 */
export async function apiFetch<T>(path: string, init: RequestInit = {}): Promise<T> {
  const headers = new Headers(init.headers);
  headers.set('accept', 'application/json');
  if (init.body && !headers.has('content-type')) headers.set('content-type', 'application/json');

  const res = await fetch(path, { credentials: 'include', ...init, headers });

  if (!res.ok) {
    let problem: ProblemDetails | null = null;
    try {
      problem = (await res.json()) as ProblemDetails;
    } catch {
      problem = null;
    }
    throw new ApiError(res.status, problem?.code ?? `http_${res.status}`, problem);
  }

  if (res.status === 204) return undefined as T;
  return (await res.json()) as T;
}
