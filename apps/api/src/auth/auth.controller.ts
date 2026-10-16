import { Controller, Get, Post, Query, Req, Res } from '@nestjs/common';
import type { Request, Response } from 'express';
import { z } from 'zod';
import { parseCookie } from '../common/cookies';
import { ZodValidationPipe } from '../common/zod-validation.pipe';
import { AuthService } from './auth.service';

const CallbackQuerySchema = z.object({
  code: z.string().min(1).optional(),
  state: z.string().min(1).optional(),
  error: z.string().optional(),
  error_description: z.string().optional(),
});
type CallbackQuery = z.infer<typeof CallbackQuerySchema>;

@Controller('auth')
export class AuthController {
  constructor(private readonly auth: AuthService) {}

  @Get('login')
  async login(@Res() res: Response): Promise<void> {
    const { url, flowCookie, cookie } = await this.auth.startLogin();
    res.cookie(this.auth.stateCookieName(), flowCookie, cookie);
    res.redirect(url);
  }

  @Get('callback')
  async callback(
    @Query(new ZodValidationPipe(CallbackQuerySchema)) query: CallbackQuery,
    @Req() req: Request,
    @Res() res: Response,
  ): Promise<void> {
    const redirectTo = this.auth.postLoginRedirect();

    if (query.error) {
      res.redirect(withParams(redirectTo, { error: query.error, reason: query.error_description }));
      return;
    }
    if (!query.code || !query.state) {
      res.redirect(withParams(redirectTo, { error: 'invalid_callback' }));
      return;
    }

    const flowCookie = parseCookie(req.headers.cookie, this.auth.stateCookieName());
    try {
      const session = await this.auth.completeLogin(query.code, query.state, flowCookie);
      const { name, options } = this.auth.sessionCookie();
      res.clearCookie(this.auth.stateCookieName(), { path: '/' });
      res.cookie(name, session.id, options);
      res.redirect(redirectTo);
    } catch (err) {
      res.redirect(
        withParams(redirectTo, {
          error: 'sign_in_failed',
          reason: err instanceof Error ? err.message : undefined,
        }),
      );
    }
  }

  @Post('logout')
  async logout(@Req() req: Request, @Res() res: Response): Promise<void> {
    await this.auth.logout(req.headers.cookie);
    res.clearCookie(this.auth.sessionCookie().name, { path: '/' });
    res.redirect(this.auth.postLoginRedirect());
  }
}

function withParams(base: string, params: Record<string, string | undefined>): string {
  const url = new URL(base);
  for (const [key, value] of Object.entries(params)) {
    if (value) url.searchParams.set(key, value);
  }
  return url.toString();
}
