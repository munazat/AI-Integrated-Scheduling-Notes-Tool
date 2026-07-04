import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { NotesController } from './notes.controller';
import { NotesService } from './notes.service';
import { MeetingNoteSchema } from './schemas/meeting-note.schema';

@Module({
  imports: [MongooseModule.forFeature([{ name: 'MeetingNote', schema: MeetingNoteSchema }])],
  controllers: [NotesController],
  providers: [NotesService],
  exports: [NotesService],
})
export class NotesModule {}
