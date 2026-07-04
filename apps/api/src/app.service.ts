import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHealth() {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV,
    };
  }

  getInfo() {
    return {
      name: 'AI Standup Bot API',
      version: '0.1.0',
      description: 'AI-powered meeting notes and summarization tool',
      endpoints: {
        auth: '/auth/google/callback',
        calendar: '/calendar/events',
        notes: '/notes',
        summaries: '/summaries',
      },
    };
  }
}
