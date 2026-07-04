import { Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import axios from 'axios';

const GOOGLE_CALENDAR_API = 'https://www.googleapis.com/calendar/v3/calendars/primary/events';
const GOOGLE_TOKEN_URL = 'https://oauth2.googleapis.com/token';

// Demo mode: if MOCK_CALENDAR=true (or no Google creds configured), return
// realistic fake data instead of failing. Lets reviewers see the product
// work without needing their own Google Cloud project.
const MOCK_MODE = process.env.MOCK_CALENDAR === 'true' || !process.env.GOOGLE_CLIENT_ID;

@Injectable()
export class CalendarService {
  private readonly logger = new Logger(CalendarService.name);

  constructor(
    @InjectModel('CalendarEvent') private calendarEventModel: Model<any>,
    @InjectModel('User') private userModel: Model<any>,
  ) {}

  async fetchAndSyncCalendarEvents(userId: string, limit: number = 10) {
    if (MOCK_MODE) {
      return this.getMockEvents(userId, limit);
    }

    const user = await this.userModel.findById(userId);
    if (!user?.googleAccessToken) {
      throw new UnauthorizedException('User has no Google access token — sign in again');
    }

    let accessToken = user.googleAccessToken;

    try {
      const events = await this.callGoogleCalendarApi(accessToken, limit);
      return this.persistEvents(userId, events);
    } catch (error: any) {
      // Access token expired -> refresh and retry once.
      if (error.response?.status === 401 && user.googleRefreshToken) {
        this.logger.log(`Access token expired for user ${userId}, refreshing...`);
        accessToken = await this.refreshAccessToken(user);
        const events = await this.callGoogleCalendarApi(accessToken, limit);
        return this.persistEvents(userId, events);
      }
      this.logger.error(`Calendar fetch failed: ${error.message}`);
      throw error;
    }
  }

  private async callGoogleCalendarApi(accessToken: string, limit: number) {
    const { data } = await axios.get(GOOGLE_CALENDAR_API, {
      headers: { Authorization: `Bearer ${accessToken}` },
      params: {
        maxResults: limit,
        orderBy: 'startTime',
        singleEvents: true,
        timeMin: new Date().toISOString(),
      },
    });
    return data.items || [];
  }

  private async refreshAccessToken(user: any): Promise<string> {
    const { data } = await axios.post(GOOGLE_TOKEN_URL, {
      client_id: process.env.GOOGLE_CLIENT_ID,
      client_secret: process.env.GOOGLE_CLIENT_SECRET,
      refresh_token: user.googleRefreshToken,
      grant_type: 'refresh_token',
    });

    user.googleAccessToken = data.access_token;
    await user.save();
    return data.access_token;
  }

  private async persistEvents(userId: string, googleEvents: any[]) {
    const saved = [];
    for (const event of googleEvents) {
      if (!event.start?.dateTime || !event.end?.dateTime) continue; // skip all-day events for now

      const doc = await this.calendarEventModel.findOneAndUpdate(
        { googleEventId: event.id },
        {
          userId,
          googleEventId: event.id,
          title: event.summary || '(No title)',
          description: event.description,
          startTime: new Date(event.start.dateTime),
          endTime: new Date(event.end.dateTime),
          attendees: (event.attendees || []).map((a: any) => a.email),
          syncedAt: new Date(),
        },
        { upsert: true, new: true },
      );
      saved.push(doc);
    }
    return { success: true, synced: saved.length, events: saved };
  }

  /** Deterministic-ish mock data so the UI has something real to render in demo mode. */
  private getMockEvents(userId: string, limit: number) {
    const now = Date.now();
    const titles = [
      'Weekly Engineering Sync',
      '1:1 with Manager',
      'Sprint Planning',
      'Client Onboarding Call',
      'Design Review',
    ];
    const events = titles.slice(0, limit).map((title, i) => ({
      id: `mock-${i}`,
      googleEventId: `mock-${i}`,
      userId,
      title,
      description: 'Mock event — set GOOGLE_CLIENT_ID to sync real calendar data.',
      startTime: new Date(now + i * 86400000),
      endTime: new Date(now + i * 86400000 + 3600000),
      attendees: ['teammate@example.com'],
      isCompleted: false,
    }));
    return { success: true, synced: events.length, events, mock: true };
  }

  async syncCalendarEvents(userId: string) {
    return this.fetchAndSyncCalendarEvents(userId, 100);
  }

  async getEventsByUser(userId: string) {
    if (MOCK_MODE) return this.getMockEvents(userId, 10).events;
    return this.calendarEventModel.find({ userId }).sort({ startTime: -1 }).lean();
  }
}
