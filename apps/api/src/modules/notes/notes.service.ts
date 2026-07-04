import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreateNoteDto } from './dto/create-note.dto';

@Injectable()
export class NotesService {
  constructor(
    @InjectModel('MeetingNote') private meetingNoteModel: Model<any>,
  ) {}

  async createNote(createNoteDto: CreateNoteDto) {
    if (!createNoteDto.rawNotes || createNoteDto.rawNotes.trim().length === 0) {
      throw new BadRequestException('Notes cannot be empty');
    }

    const note = new this.meetingNoteModel({
      ...createNoteDto,
      uploadedAt: new Date(),
    });

    return await note.save();
  }

  async getNote(noteId: string) {
    const note = await this.meetingNoteModel.findById(noteId);
    if (!note) {
      throw new BadRequestException('Note not found');
    }
    return note;
  }

  async getUserNotes(userId: string, limit: number, skip: number) {
    const total = await this.meetingNoteModel.countDocuments({ userId });
    const notes = await this.meetingNoteModel
      .find({ userId })
      .sort({ uploadedAt: -1 })
      .limit(limit)
      .skip(skip)
      .lean();

    return {
      data: notes,
      total,
      limit,
      skip,
    };
  }

  async deleteNote(noteId: string) {
    const result = await this.meetingNoteModel.deleteOne({ _id: noteId });
    if (result.deletedCount === 0) {
      throw new BadRequestException('Note not found');
    }
    return { success: true, message: 'Note deleted' };
  }
}
