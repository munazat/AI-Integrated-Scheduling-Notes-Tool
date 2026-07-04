// ============================================
// User & Auth Types
// ============================================
export interface User {
  id: string;
  email: string;
  name: string;
  googleId: string;
  googleAccessToken: string;
  googleRefreshToken?: string;
  createdAt: Date;
  updatedAt: Date;
}

// ============================================
// Google Calendar Event
// ============================================
export interface CalendarEvent {
  id: string;
  googleEventId: string;
  userId: string;
  title: string;
  description?: string;
  startTime: Date;
  endTime: Date;
  attendees?: string[];
  isCompleted: boolean;
  syncedAt: Date;
}

// ============================================
// Meeting Notes & Summarization
// ============================================
export interface MeetingNote {
  id: string;
  calendarEventId: string;
  userId: string;
  rawNotes: string; // User's pasted/uploaded notes
  uploadedAt: Date;
  updatedAt: Date;
}

export interface AISummary {
  id: string;
  meetingNoteId: string;
  userId: string;
  actionItems: string[];
  decisions: string[];
  keyPoints: string[];
  followUps: string[];
  generatedAt: Date;
  model: "claude-3.5-sonnet"; // The model used
}

// ============================================
// API Request/Response Types
// ============================================
export interface SummarizeNotesRequest {
  notes: string;
}

export interface SummarizeNotesResponse {
  actionItems: string[];
  decisions: string[];
  keyPoints: string[];
  followUps: string[];
  rawSummary: string;
}

export interface CalendarEventsResponse {
  events: CalendarEvent[];
  nextSyncToken?: string;
}

export interface SearchSummariesQuery {
  q?: string; // Full-text search
  startDate?: Date;
  endDate?: Date;
  limit?: number;
  skip?: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  limit: number;
  skip: number;
}

// ============================================
// Error Handling
// ============================================
export class AppError extends Error {
  constructor(
    public code: string,
    public statusCode: number,
    message: string
  ) {
    super(message);
  }
}
