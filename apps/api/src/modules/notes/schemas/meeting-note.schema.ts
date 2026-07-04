import { Schema } from 'mongoose';

export const MeetingNoteSchema = new Schema(
  {
    calendarEventId: { type: Schema.Types.ObjectId, ref: 'CalendarEvent', required: true },
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    rawNotes: { type: String, required: true },
    uploadedAt: { type: Date, default: Date.now },
  },
  { timestamps: true },
);

// Text index for searching notes
MeetingNoteSchema.index({ rawNotes: 'text' });
MeetingNoteSchema.index({ userId: 1, uploadedAt: -1 });
