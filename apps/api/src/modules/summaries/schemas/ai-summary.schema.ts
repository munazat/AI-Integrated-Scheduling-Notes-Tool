import { Schema } from 'mongoose';

export const AISummarySchema = new Schema(
  {
    meetingNoteId: { type: Schema.Types.ObjectId, ref: 'MeetingNote', required: true },
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    actionItems: [String],
    decisions: [String],
    keyPoints: [String],
    followUps: [String],
    rawSummary: String,
    generatedAt: { type: Date, default: Date.now },
    model: { type: String, default: 'claude-3-5-sonnet-20241022' },
  },
  { timestamps: true },
);

// Text index for searching summaries
AISummarySchema.index({ actionItems: 'text', decisions: 'text', keyPoints: 'text' });
AISummarySchema.index({ userId: 1, generatedAt: -1 });
