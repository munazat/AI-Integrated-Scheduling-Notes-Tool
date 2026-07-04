import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { SummariesController } from './summaries.controller';
import { SummariesService } from './summaries.service';
import { AISummarySchema } from './schemas/ai-summary.schema';
import { NotesModule } from '../notes/notes.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: 'AISummary', schema: AISummarySchema }]),
    NotesModule,
  ],
  controllers: [SummariesController],
  providers: [SummariesService],
  exports: [SummariesService],
})
export class SummariesModule {}
