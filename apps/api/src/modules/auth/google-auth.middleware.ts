import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { AuthService } from './auth.service';

@Injectable()
export class GoogleAuthMiddleware implements NestMiddleware {
  constructor(private authService: AuthService) {}

  use(req: Request, res: Response, next: NextFunction) {
    // If Google credentials are not configured, create a demo session
    if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
      const demoUser = { _id: 'demo-user', email: 'demo@app.local' };
      const sessionToken = this.authService.issueSessionToken(demoUser);
      const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
      return res.redirect(`${frontendUrl}/dashboard#token=${sessionToken}`);
    }
    // Otherwise, continue to the Google OAuth guard
    next();
  }
}
