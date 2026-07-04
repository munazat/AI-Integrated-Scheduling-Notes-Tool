import { Controller, Post, Get, Body, Param, Query } from '@nestjs/common';
import { SummariesService } from './summaries.service';
import { SummarizeNotesDto } from './dto/summarize-notes.dto';

@Controller('summaries')
export class SummariesController {
  constructor(private readonly summariesService: SummariesService) {}

  /**
   * POST /summaries/generate
   * Takes raw meeting notes, sends to Claude API for summarization
   * Stores structured summary in MongoDB
   */
  @Post('generate')
  async generateSummary(@Body() summarizeDto: SummarizeNotesDto) {
    return await this.summariesService.generateSummary(
      summarizeDto.noteId,
      summarizeDto.notes,
      summarizeDto.userId,
    );
  }

  /**
   * GET /summaries/:summaryId
   * Retrieve a specific AI-generated summary
   */
  @Get(':summaryId')
  async getSummary(@Param('summaryId') summaryId: string) {
    return await this.summariesService.getSummary(summaryId);
  }

  /**
   * GET /summaries?userId=xxx&q=search
   * List summaries for user with optional full-text search
   */
  @Get()
  async searchSummaries(
    @Query('userId') userId: string,
    @Query('q') query?: string,
    @Query('limit') limit: number = 10,
    @Query('skip') skip: number = 0,
  ) {
    return await this.summariesService.searchSummaries(userId, query, limit, skip);
  }
}
