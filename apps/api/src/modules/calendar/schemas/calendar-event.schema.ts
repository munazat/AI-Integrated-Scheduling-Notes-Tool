import { Schema } from 'mongoose';

export const CalendarEventSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    googleEventId: { type: String, required: true, unique: true },
    title: { type: String, required: true },
    description: String,
    startTime: { type: Date, required: true },
    endTime: { type: Date, required: true },
    attendees: [String],
    isCompleted: { type: Boolean, default: false },
    syncedAt: { type: Date, default: Date.now },
  },
  { timestamps: true },
);

// Indexes for querying
CalendarEventSchema.index({ userId: 1, startTime: -1 });
CalendarEventSchema.index({ title: 'text', description: 'text' });
