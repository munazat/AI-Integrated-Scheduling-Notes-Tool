import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './modules/auth/auth.module';
import { CalendarModule } from './modules/calendar/calendar.module';
import { NotesModule } from './modules/notes/notes.module';
import { SummariesModule } from './modules/summaries/summaries.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    MongooseModule.forRoot(process.env.MONGODB_URI || 'mongodb://localhost:27017/ai-scheduler', {
      serverSelectionTimeoutMS: 3000,
      connectTimeoutMS: 3000,
      retryAttempts: 1,
      retryDelay: 100,
      // Allow app to start even if database connection fails
      bufferCommands: false,
    }),
    AuthModule,
    CalendarModule,
    NotesModule,
    SummariesModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
