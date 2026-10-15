import { Controller, Get, Post, Query, Req, Res } from '@nestjs/common';
import type { Request, Response } from 'express';
import { OpaService, type Decision } from '../authorization/opa.service';
import { AuthService, type Session } from './auth.service';

@Controller()
export class AuthController {
  constructor(
    private readonly auth: AuthService,
    private readonly opa: OpaService,
  ) {}

  @Get('auth/login')
  login(@Res() res: Response) {
    res.redirect(this.auth.startLogin());
  }

  @Get('auth/callback')
  async callback(
    @Query('code') code: string,
    @Query('state') state: string,
    @Res() res: Response,
  ) {
    try {
      const session = await this.auth.completeLogin(code, state);
      res.setHeader(
        'Set-Cookie',
        `${this.auth.cookieName()}=${session.id}; HttpOnly; Path=/; SameSite=Lax`,
      );
      res.redirect('/demo');
    } catch (err) {
      res.status(400).type('html').send(errorHtml(err instanceof Error ? err.message : 'error'));
    }
  }

  @Get('auth/session')
  session(@Req() req: Request) {
    const s = this.auth.sessionFromCookie(req.headers.cookie);
    return s ? { authenticated: true, ...s } : { authenticated: false };
  }

  @Post('auth/logout')
  logout(@Req() req: Request, @Res() res: Response) {
    this.auth.destroy(req.headers.cookie);
    res.setHeader('Set-Cookie', `${this.auth.cookieName()}=; HttpOnly; Path=/; Max-Age=0`);
    res.json({ ok: true });
  }

  /**
   * M0-6 proof page. Server-rendered (no cross-origin cookie juggling yet):
   * signed-out → sign-in link; signed-in → the OPA decisions for that session.
   */
  @Get('demo')
  async demo(@Req() req: Request, @Res() res: Response) {
    const s = this.auth.sessionFromCookie(req.headers.cookie);
    if (!s) {
      res.type('html').send(pageHtml('<a class="btn" href="/auth/login">Sign in with ThunderID</a>'));
      return;
    }
    const [view, reverse] = await Promise.all([
      this.opa.decide({ action: 'ops_kyc.kyc_case.view', subject: { id: s.sub, roles: s.roles } }),
      this.opa.decide({
        action: 'ops_transfers.transfer.reverse',
        subject: { id: s.sub, roles: s.roles },
      }),
    ]);
    res.type('html').send(pageHtml(sessionBlock(s, view, reverse)));
  }
}

function sessionBlock(s: Session, view: Decision, reverse: Decision): string {
  const row = (label: string, d: Decision) =>
    `<div class="row"><span>${label}</span><span class="pill ${d.allow ? 'allow' : 'deny'}">${
      d.allow ? 'ALLOWED' : 'DENIED'
    }</span></div>`;
  return `
    <p class="muted">Signed in as <b class="strong">${s.name ?? s.sub}</b> · roles: ${s.roles.join(', ')}</p>
    ${row('ops_kyc.kyc_case.view', view)}
    ${row('ops_transfers.transfer.reverse', reverse)}
    <form method="post" action="/auth/logout"><button class="btn ghost">Sign out</button></form>`;
}

function pageHtml(inner: string): string {
  return `<!doctype html><html><head><meta charset="utf-8"><title>Caroni · M0 spike</title>
<style>
  body{margin:0;min-height:100vh;display:grid;place-items:center;background:#0b0b0f;color:#f4f4f7;
       font-family:Inter,'Helvetica Neue',system-ui,sans-serif}
  .card{width:min(420px,92vw);background:#121218;border:1px solid #24242e;border-radius:14px;padding:22px}
  h1{font-size:15px;font-weight:600;margin:0 0 14px;letter-spacing:-.01em}
  .muted{color:#a8a8b4;font-size:13px;margin:0 0 14px}.strong{color:#f4f4f7}
  .row{display:flex;justify-content:space-between;align-items:center;padding:10px 0;border-bottom:1px solid #24242e;font-size:13px}
  .pill{font-size:11px;font-weight:600;padding:3px 9px;border-radius:6px}
  .pill.allow{background:color-mix(in srgb,#16a34a 16%,transparent);color:#4ade80}
  .pill.deny{background:color-mix(in srgb,#dc2626 16%,transparent);color:#f87171}
  .btn{display:inline-block;margin-top:14px;background:#8b84f5;color:#0b0b0f;font-weight:600;font-size:13px;
       padding:8px 14px;border:0;border-radius:6px;text-decoration:none;cursor:pointer}
  .btn.ghost{background:transparent;color:#f4f4f7;border:1px solid #30303c}
</style></head><body><div class="card"><h1>Caroni · M0 spike</h1>${inner}</div></body></html>`;
}

function errorHtml(message: string): string {
  return pageHtml(`<p class="muted">Sign-in failed: ${message}</p><a class="btn ghost" href="/demo">Back</a>`);
}
