import type { CookieOptions } from 'express';

/** Reads a single cookie value from a raw `Cookie` header (no middleware needed). */
export function parseCookie(header: string | undefined, name: string): string | null {
  if (!header) return null;
  for (const part of header.split(';')) {
    const index = part.indexOf('=');
    if (index === -1) continue;
    const key = part.slice(0, index).trim();
    if (key === name) return decodeURIComponent(part.slice(index + 1).trim());
  }
  return null;
}

export function sessionCookieOptions(ttlSeconds: number, secure: boolean): CookieOptions {
  return {
    httpOnly: true,
    sameSite: 'lax',
    secure,
    path: '/',
    maxAge: ttlSeconds * 1000,
  };
}

export function flowCookieOptions(ttlSeconds: number, secure: boolean): CookieOptions {
  return {
    httpOnly: true,
    sameSite: 'lax',
    secure,
    path: '/',
    maxAge: ttlSeconds * 1000,
  };
}
