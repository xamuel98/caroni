/**
 * Domain errors carry a stable `code`, an HTTP `status`, and optional machine
 * readable extensions (e.g. authorization `reasons`/`obligations`). The
 * `ProblemDetailsFilter` renders them as RFC 7807 problem+json.
 */
export class DomainError extends Error {
  readonly status: number;
  readonly code: string;
  readonly extensions: Record<string, unknown>;

  constructor(opts: {
    status: number;
    code: string;
    message: string;
    extensions?: Record<string, unknown>;
    cause?: unknown;
  }) {
    super(opts.message, { cause: opts.cause });
    this.name = new.target.name;
    this.status = opts.status;
    this.code = opts.code;
    this.extensions = opts.extensions ?? {};
  }
}

export class BadRequestError extends DomainError {
  constructor(message = 'Invalid request', extensions?: Record<string, unknown>) {
    super({ status: 400, code: 'bad_request', message, extensions });
  }
}

export class UnauthorizedError extends DomainError {
  constructor(message = 'Authentication required') {
    super({ status: 401, code: 'unauthorized', message });
  }
}

export class ForbiddenError extends DomainError {
  constructor(message = 'Forbidden', reason?: string, obligations: string[] = []) {
    super({
      status: 403,
      code: 'forbidden',
      message,
      extensions: { reasons: reason ? [reason] : [], obligations },
    });
  }
}

export class NotFoundError extends DomainError {
  constructor(message = 'Not found') {
    super({ status: 404, code: 'not_found', message });
  }
}

/** Upstream dependency (OPA, ThunderID, DB) failed — not the caller's fault. */
export class DependencyError extends DomainError {
  constructor(message = 'Upstream dependency unavailable', cause?: unknown) {
    super({ status: 503, code: 'dependency_unavailable', message, cause });
  }
}
