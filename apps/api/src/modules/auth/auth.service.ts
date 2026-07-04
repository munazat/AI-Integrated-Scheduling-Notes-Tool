import { Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.SESSION_SECRET || 'dev-secret-change-in-production';
const JWT_EXPIRY = '7d';

@Injectable()
export class AuthService {
  constructor(@InjectModel('User') private userModel: Model<any>) {}

  /**
   * Called by GoogleStrategy.validate() after Google confirms identity.
   * Upserts the user and stores their Google tokens (needed later to
   * call the Calendar API on their behalf).
   */
  async createOrUpdateUser(googleProfile: {
    id: string;
    emails: { value: string }[];
    displayName: string;
    photos?: { value: string }[];
    accessToken: string;
    refreshToken?: string;
  }) {
    const user = await this.userModel.findOneAndUpdate(
      { googleId: googleProfile.id },
      {
        email: googleProfile.emails[0].value,
        name: googleProfile.displayName,
        googleId: googleProfile.id,
        googleAccessToken: googleProfile.accessToken,
        // Google only sends a refresh token on the FIRST consent.
        // Don't overwrite a real one with `undefined` on subsequent logins.
        ...(googleProfile.refreshToken && { googleRefreshToken: googleProfile.refreshToken }),
        profilePicture: googleProfile.photos?.[0]?.value,
      },
      { upsert: true, new: true },
    );
    return user;
  }

  /**
   * Issues our own short-lived session token (JWT) once Google auth succeeds.
   * The frontend stores this and sends it as a Bearer token on every request.
   * We do NOT hand the raw Google access token to the browser.
   */
  issueSessionToken(user: { _id: string; email: string }): string {
    return jwt.sign({ sub: user._id.toString(), email: user.email }, JWT_SECRET, {
      expiresIn: JWT_EXPIRY,
    });
  }

  async validateSessionToken(token: string) {
    try {
      const payload = jwt.verify(token, JWT_SECRET) as { sub: string; email: string };
      const user = await this.userModel.findById(payload.sub).lean();
      if (!user) throw new UnauthorizedException('User no longer exists');
      return user;
    } catch (err) {
      throw new UnauthorizedException('Invalid or expired session token');
    }
  }

  async getUserById(userId: string) {
    const user = await this.userModel.findById(userId).lean();
    if (!user) throw new UnauthorizedException('User not found');
    return user;
  }
}
