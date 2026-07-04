import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { CalendarService } from './calendar.service';

@Controller('calendar')
export class CalendarController {
  constructor(private readonly calendarService: CalendarService) {}

  /**
   * GET /calendar/events
   * Fetches upcoming calendar events for authenticated user
   */
  @Get('events')
  async getCalendarEvents(
    @Query('userId') userId: string,
    @Query('limit') limit: number = 10,
  ) {
    return await this.calendarService.fetchAndSyncCalendarEvents(userId, limit);
  }

  /**
   * GET /calendar/sync
   * Force sync with Google Calendar API
   */
  @Get('sync')
  async syncCalendar(@Query('userId') userId: string) {
    return await this.calendarService.syncCalendarEvents(userId);
  }
}
