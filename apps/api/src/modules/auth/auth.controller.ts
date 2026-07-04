import { Controller, Get, Req, Res, UseGuards, Query, UnauthorizedException } from '@nestjs/common';
import { Request, Response } from 'express';
import { AuthGuard } from '@nestjs/passport';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  /**
   * Step 1: User clicks "Sign in with Google" -> hits this route.
   * The Passport GoogleStrategy intercepts and redirects to Google's consent screen.
   */
  @Get('google')
  @UseGuards(AuthGuard('google'))
  async googleAuth() {
    // Intentionally empty — AuthGuard handles the redirect to Google.
  }

  /**
   * Step 2: Google redirects back here with the user's identity already
   * resolved by Passport (see GoogleStrategy.validate()). req.user is the
   * Mongo user document created/updated in that strategy.
   */
  @Get('google/callback')
  @UseGuards(AuthGuard('google'))
  async googleAuthCallback(@Req() req: Request, @Res() res: Response) {
    const user = req.user as any;
    if (!user) {
      const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
      return res.redirect(`${frontendUrl}/auth?error=oauth_failed`);
    }

    const sessionToken = this.authService.issueSessionToken(user);
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';

    // Pass the token back via URL fragment (not query string) so it never
    // hits server logs. Frontend reads it on load and stores it.
    return res.redirect(`${frontendUrl}/dashboard#token=${sessionToken}`);
  }

  /**
   * Frontend calls this with "Authorization: Bearer <token>" to check who's logged in.
   */
  @Get('me')
  async getCurrentUser(@Req() req: Request) {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
      throw new UnauthorizedException('Missing Bearer token');
    }
    const token = authHeader.slice(7);
    return this.authService.validateSessionToken(token);
  }
}
