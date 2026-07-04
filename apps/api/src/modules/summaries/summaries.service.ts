import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import Anthropic from '@anthropic-ai/sdk';

const MOCK_MODE = process.env.MOCK_CLAUDE === 'true' || !process.env.ANTHROPIC_API_KEY;

@Injectable()
export class SummariesService {
  private readonly logger = new Logger(SummariesService.name);
  private anthropic: Anthropic | null = MOCK_MODE
    ? null
    : new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

  constructor(@InjectModel('AISummary') private aiSummaryModel: Model<any>) {}

  /**
   * Core function: sends raw meeting notes to Claude, gets back structured
   * action items / decisions / key points / follow-ups, and stores them.
   */
  async generateSummary(noteId: string, notes: string, userId?: string) {
    if (!notes || notes.trim().length < 10) {
      throw new BadRequestException('Notes are too short to summarize');
    }

    try {
      const responseText = MOCK_MODE
        ? this.getMockSummaryText(notes)
        : await this.callClaude(notes);

      const parsed = this.parseSummaryResponse(responseText);

      const summary = new this.aiSummaryModel({
        meetingNoteId: noteId,
        userId,
        ...parsed,
        generatedAt: new Date(),
        model: MOCK_MODE ? 'mock' : 'claude-3-5-sonnet-20241022',
      });

      await summary.save();
      this.logger.log(`Summary generated for note ${noteId} (mock=${MOCK_MODE})`);
      return summary.toObject();
    } catch (error: any) {
      this.logger.error(`Summary generation failed: ${error.message}`);
      throw new BadRequestException(`Failed to generate summary: ${error.message}`);
    }
  }

  private async callClaude(notes: string): Promise<string> {
    const message = await this.anthropic!.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 1024,
      messages: [{ role: 'user', content: this.buildSummarizationPrompt(notes) }],
    });
    const block = message.content[0];
    return block.type === 'text' ? block.text : '';
  }

  private buildSummarizationPrompt(notes: string): string {
    return [
      'You are an expert meeting summarizer. Analyze the following meeting notes and extract:',
      '',
      '1. Action Items - specific tasks that need to be done, with owners if mentioned',
      '2. Decisions - important decisions made during the meeting',
      '3. Key Points - main discussion topics and conclusions',
      '4. Follow-ups - items that need further discussion',
      '',
      'Meeting Notes:',
      notes,
      '',
      'Respond ONLY with valid JSON in this exact shape (no markdown fences, no extra text):',
      '{"actionItems": ["..."], "decisions": ["..."], "keyPoints": ["..."], "followUps": ["..."]}',
      '',
      'Keep each array to 3-5 concise items.',
    ].join('\n');
  }

  /** Lets the feature be demoed end-to-end without an Anthropic API key. */
  private getMockSummaryText(notes: string): string {
    return JSON.stringify({
      actionItems: ['Follow up with the team on open items', 'Draft next steps document'],
      decisions: ['Proceed with the plan discussed'],
      keyPoints: [`Notes were ${notes.length} characters long (mock mode — set ANTHROPIC_API_KEY for real summaries)`],
      followUps: ['Schedule a check-in next week'],
    });
  }

  private parseSummaryResponse(response: string) {
    try {
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (!jsonMatch) throw new Error('No JSON object found in Claude response');
      const parsed = JSON.parse(jsonMatch[0]);
      return {
        actionItems: parsed.actionItems ?? [],
        decisions: parsed.decisions ?? [],
        keyPoints: parsed.keyPoints ?? [],
        followUps: parsed.followUps ?? [],
        rawSummary: response,
      };
    } catch (error) {
      this.logger.warn('Failed to parse Claude response as JSON, storing raw text only');
      return { actionItems: [], decisions: [], keyPoints: [], followUps: [], rawSummary: response };
    }
  }

  async getSummary(summaryId: string) {
    const summary = await this.aiSummaryModel.findById(summaryId);
    if (!summary) throw new BadRequestException('Summary not found');
    return summary;
  }

  async searchSummaries(userId: string, query?: string, limit: number = 10, skip: number = 0) {
    const searchQuery: Record<string, any> = { userId };
    if (query) searchQuery.$text = { $search: query };

    const total = await this.aiSummaryModel.countDocuments(searchQuery);
    const summaries = await this.aiSummaryModel
      .find(searchQuery)
      .sort({ generatedAt: -1 })
      .limit(limit)
      .skip(skip)
      .lean();

    return { data: summaries, total, limit, skip };
  }
}
