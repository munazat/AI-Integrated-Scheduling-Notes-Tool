import { Controller, Post, Get, Delete, Body, Param, Query } from '@nestjs/common';
import { NotesService } from './notes.service';
import { CreateNoteDto } from './dto/create-note.dto';

@Controller('notes')
export class NotesController {
  constructor(private readonly notesService: NotesService) {}

  /**
   * POST /notes
   * Create a new meeting note for a calendar event
   */
  @Post()
  async createNote(@Body() createNoteDto: CreateNoteDto) {
    return await this.notesService.createNote(createNoteDto);
  }

  /**
   * GET /notes/:noteId
   * Fetch a specific meeting note
   */
  @Get(':noteId')
  async getNote(@Param('noteId') noteId: string) {
    return await this.notesService.getNote(noteId);
  }

  /**
   * GET /notes?userId=xxx
   * Fetch all notes for a user
   */
  @Get()
  async getUserNotes(
    @Query('userId') userId: string,
    @Query('limit') limit: number = 20,
    @Query('skip') skip: number = 0,
  ) {
    return await this.notesService.getUserNotes(userId, limit, skip);
  }

  /**
   * DELETE /notes/:noteId
   * Delete a meeting note
   */
  @Delete(':noteId')
  async deleteNote(@Param('noteId') noteId: string) {
    return await this.notesService.deleteNote(noteId);
  }
}
