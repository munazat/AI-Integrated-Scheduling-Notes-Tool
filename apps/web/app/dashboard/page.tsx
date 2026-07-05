'use client';

import { useEffect, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';

const sampleNotes = `Kickoff recap:
- Confirmed the outreach plan for the week
- Need a final review of the dashboard before Friday
- Action item: send the schedule summary to the team
- Follow up with design on the presentation story`;

type StoredUser = {
  _id?: string;
  id?: string;
  name?: string;
  email?: string;
  isDemo?: boolean;
};

type CalendarEvent = {
  id: string;
  title: string;
  startTime: string;
  endTime: string;
  description?: string;
};

type NoteRecord = {
  _id: string;
  rawNotes: string;
  uploadedAt?: string;
  createdAt?: string;
};

type SummaryRecord = {
  _id: string;
  actionItems?: string[];
  decisions?: string[];
  keyPoints?: string[];
  followUps?: string[];
  model?: string;
  generatedAt?: string;
  rawSummary?: string;
};

export default function DashboardPage() {
  const [userId, setUserId] = useState<string | null>(null);
  const [userName, setUserName] = useState('');
  const [isDemoMode, setIsDemoMode] = useState(false);
  const [activeTab, setActiveTab] = useState<'calendar' | 'notes' | 'summaries'>('calendar');
  const [selectedEventId, setSelectedEventId] = useState('');
  const [noteText, setNoteText] = useState('');
  const [latestSummary, setLatestSummary] = useState<SummaryRecord | null>(null);
  const queryClient = useQueryClient();

  const { data: eventsData, isLoading: eventsLoading } = useQuery({
    queryKey: ['calendar-events', userId],
    queryFn: () => apiClient.getCalendarEvents(userId as string, 10),
    enabled: !!userId,
  });

  const { data: notesData, isLoading: notesLoading } = useQuery({
    queryKey: ['notes', userId],
    queryFn: () => apiClient.getNotes(userId as string, 10),
    enabled: !!userId,
  });

  const { data: summariesData, isLoading: summariesLoading } = useQuery({
    queryKey: ['summaries', userId],
    queryFn: () => apiClient.getSummaries(userId as string, 10),
    enabled: !!userId,
  });

  const syncCalendarMutation = useMutation({
    mutationFn: async () => {
      if (!userId) throw new Error('Missing user');
      return apiClient.syncCalendar(userId);
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['calendar-events', userId] });
    },
  });

  const createNoteMutation = useMutation({
    mutationFn: async () => {
      if (!userId) throw new Error('Missing user');
      if (!selectedEventId) throw new Error('Select a calendar event');
      return apiClient.createNote({
        userId,
        calendarEventId: selectedEventId,
        rawNotes: noteText,
      });
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['notes', userId] });
    },
  });

  const generateSummaryMutation = useMutation({
    mutationFn: async (payload: { noteId: string; notes: string }) => {
      if (!userId) throw new Error('Missing user');
      return apiClient.generateSummary(payload.noteId, payload.notes, userId);
    },
    onSuccess: async (summary) => {
      setLatestSummary(summary);
      await queryClient.invalidateQueries({ queryKey: ['summaries', userId] });
    },
  });

  const deleteNoteMutation = useMutation({
    mutationFn: async (noteId: string) => apiClient.deleteNote(noteId),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['notes', userId] });
    },
  });

  useEffect(() => {
    const hash = window.location.hash;
    const tokenMatch = hash.match(/token=([^&]+)/);

    if (tokenMatch) {
      const token = tokenMatch[1];
      localStorage.setItem('auth_token', token);
      window.history.replaceState(null, '', '/dashboard');
      apiClient
        .getMe()
        .then((user) => {
          setUserId(user._id || user.id);
          setUserName(user.name || user.email || 'Presenter');
          setIsDemoMode(Boolean(user.isDemo));
          localStorage.setItem('user', JSON.stringify(user));
        })
        .catch(() => {
          window.location.href = '/';
        });
      return;
    }

    const stored = localStorage.getItem('user');
    if (stored) {
      const user: StoredUser = JSON.parse(stored);
      setUserId(user._id || user.id || null);
      setUserName(user.name || user.email || 'Presenter');
      setIsDemoMode(Boolean(user.isDemo || localStorage.getItem('demo_mode') === 'true'));
    } else {
      window.location.href = '/';
    }
  }, []);

  if (!userId) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <p className="mb-4 text-slate-300">Loading workspace...</p>
          <button
            onClick={() => window.location.href = '/'}
            className="text-amber-300 underline decoration-amber-300/50 underline-offset-4 hover:text-amber-200"
          >
            Back to start
          </button>
        </div>
      </div>
    );
  }

  const events = (eventsData?.events || eventsData?.data || []) as CalendarEvent[];
  const notes = (notesData?.data || []) as NoteRecord[];
  const summaries = (summariesData?.data || []) as SummaryRecord[];
  const activeSummary = latestSummary || summaries[0] || null;

  const loadSampleNote = () => {
    setNoteText(sampleNotes);
    if (!selectedEventId && events[0]) {
      setSelectedEventId(events[0].id);
    }
  };

  const saveNote = async (shouldSummarize: boolean) => {
    const trimmedNotes = noteText.trim();
    if (!trimmedNotes) return;

    const note = await createNoteMutation.mutateAsync();
    const noteId = note?._id || note?.id;

    if (shouldSummarize && noteId) {
      const summary = await generateSummaryMutation.mutateAsync({
        noteId,
        notes: trimmedNotes,
      });
      setLatestSummary(summary);
    }

    setNoteText('');
  };

  const signOut = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('auth_token');
    localStorage.removeItem('demo_mode');
    window.location.href = '/';
  };

  return (
    <div className="surface-grid min-h-screen">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(251,191,36,0.14),_transparent_30%),radial-gradient(circle_at_85%_12%,_rgba(34,211,238,0.12),_transparent_28%)]" />

      <header className="relative border-b border-white/10 bg-slate-950/55 backdrop-blur-xl">
        <div className="container-main flex flex-col gap-6 py-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-3">
              <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs uppercase tracking-[0.22em] text-slate-300">
                {isDemoMode ? 'Demo mode' : 'Connected'}
              </span>
              <span className="rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-1 text-xs font-semibold text-emerald-200">
                {eventsLoading ? 'Syncing...' : `${events.length} events`}
              </span>
            </div>

            <div className="space-y-1">
              <h1 className="font-display text-3xl font-semibold tracking-tight text-white md:text-5xl">
                {userName || 'Dashboard'}
              </h1>
              <p className="max-w-3xl text-sm leading-6 text-slate-300 md:text-base">
                Manage your meetings, capture notes, and get AI-powered summaries.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => syncCalendarMutation.mutateAsync()}
              className="rounded-full border border-white/15 bg-white/5 px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/10"
            >
              Refresh calendar
            </button>
            <button
              onClick={signOut}
              className="rounded-full border border-white/15 px-4 py-2 text-sm font-semibold text-slate-300 transition hover:border-amber-300 hover:text-white"
            >
              Exit session
            </button>
          </div>
        </div>
      </header>

      <main className="container-main relative py-8 lg:py-10">
        <section className="grid gap-4 md:grid-cols-3">
          {[
            ['Calendar events', String(events.length || 0), 'Loaded from Google or mock data'],
            ['Saved notes', String(notes.length || 0), 'Meeting context stored for later review'],
            ['AI summaries', String(summaries.length || 0), 'Structured inference shown in the UI'],
          ].map(([label, value, text]) => (
            <div key={label} className="panel">
              <p className="text-xs uppercase tracking-[0.22em] text-slate-400">{label}</p>
              <div className="mt-3 flex items-end justify-between gap-3">
                <span className="font-display text-4xl font-semibold text-white">{value}</span>
                <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-slate-300">{isDemoMode ? 'demo' : 'live'}</span>
              </div>
              <p className="mt-3 text-sm leading-6 text-slate-300">{text}</p>
            </div>
          ))}
        </section>

        <div className="mt-6 flex flex-wrap gap-3 border-b border-white/10 pb-4">
          {(['calendar', 'notes', 'summaries'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                activeTab === tab
                  ? 'bg-white text-slate-950'
                  : 'border border-white/10 bg-white/5 text-slate-300 hover:bg-white/10 hover:text-white'
              }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>

        <section className="mt-6 grid gap-6 xl:grid-cols-[minmax(0,1.2fr)_minmax(0,0.8fr)]">
          <div className="space-y-6">
            {activeTab === 'calendar' && (
              <div className="panel space-y-4">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-xs uppercase tracking-[0.22em] text-slate-400">Upcoming meetings</p>
                    <h2 className="font-display mt-1 text-2xl font-semibold text-white">Live calendar context</h2>
                  </div>
                  <button
                    onClick={() => syncCalendarMutation.mutateAsync()}
                    className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-slate-200 transition hover:bg-white/10"
                  >
                    Sync now
                  </button>
                </div>

                {eventsLoading ? (
                  <div className="text-slate-400">Loading events...</div>
                ) : events.length ? (
                  <div className="grid gap-3">
                    {events.map((event) => (
                      <div key={event.id} className="rounded-2xl border border-white/10 bg-white/5 p-4 transition hover:border-cyan-300/30 hover:bg-white/[0.07]">
                        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                          <div>
                            <h3 className="text-lg font-semibold text-white">{event.title}</h3>
                            <p className="mt-1 text-sm text-slate-400">{new Date(event.startTime).toLocaleString()}</p>
                          </div>
                          <span className="rounded-full border border-cyan-400/20 bg-cyan-400/10 px-3 py-1 text-xs font-semibold text-cyan-100">Context ready</span>
                        </div>
                        {event.description ? <p className="mt-3 text-sm leading-6 text-slate-300">{event.description}</p> : null}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-slate-400">No upcoming events</p>
                )}
              </div>
            )}

            {activeTab === 'notes' && (
              <>
                <div className="panel space-y-6">
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                    <div className="space-y-2">
                      <p className="text-xs uppercase tracking-[0.22em] text-slate-400">Note capture</p>
                      <h2 className="font-display text-2xl font-semibold text-white">Save raw notes, then run the summary inference.</h2>
                      <p className="max-w-2xl text-sm leading-6 text-slate-300">
                        The summary button creates the note and immediately sends it through the AI pipeline so the output appears on screen.
                      </p>
                    </div>

                    <button
                      onClick={loadSampleNote}
                      className="rounded-full border border-amber-400/20 bg-amber-400/10 px-4 py-2 text-sm font-semibold text-amber-100 transition hover:bg-amber-400/15"
                    >
                      Load sample note
                    </button>
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    <label className="block">
                      <span className="mb-2 block text-sm font-medium text-slate-300">Calendar event</span>
                      <select
                        value={selectedEventId}
                        onChange={(e) => setSelectedEventId(e.target.value)}
                        className="w-full rounded-2xl border border-white/10 bg-slate-900/80 px-4 py-3 text-slate-100 outline-none transition focus:border-amber-300"
                      >
                        <option value="">Select an event</option>
                        {events.map((event) => (
                          <option key={event.id} value={event.id}>{event.title}</option>
                        ))}
                      </select>
                    </label>

                    <label className="block">
                      <span className="mb-2 block text-sm font-medium text-slate-300">Raw notes</span>
                      <textarea
                        value={noteText}
                        onChange={(e) => setNoteText(e.target.value)}
                        rows={7}
                        placeholder="Paste meeting notes, decisions, blockers, and action items here..."
                        className="w-full rounded-2xl border border-white/10 bg-slate-900/80 px-4 py-3 text-slate-100 outline-none transition placeholder:text-slate-500 focus:border-amber-300"
                      />
                    </label>
                  </div>

                  <div className="flex flex-wrap gap-3">
                    <button
                      onClick={() => saveNote(false)}
                      disabled={createNoteMutation.isPending || !selectedEventId || !noteText.trim()}
                      className="rounded-full border border-white/10 bg-white/5 px-5 py-3 font-semibold text-white transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {createNoteMutation.isPending ? 'Saving...' : 'Save note'}
                    </button>
                    <button
                      onClick={() => saveNote(true)}
                      disabled={createNoteMutation.isPending || generateSummaryMutation.isPending || !selectedEventId || !noteText.trim()}
                      className="rounded-full bg-gradient-to-r from-amber-400 to-orange-500 px-5 py-3 font-semibold text-slate-950 transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {generateSummaryMutation.isPending ? 'Running inference...' : 'Save and summarize'}
                    </button>
                  </div>

                  {createNoteMutation.isError || generateSummaryMutation.isError ? (
                    <p className="text-sm text-red-300">Could not process the note. Check the selected event and note text.</p>
                  ) : null}
                </div>

                <div className="panel space-y-4">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p className="text-xs uppercase tracking-[0.22em] text-slate-400">Recent notes</p>
                      <h3 className="font-display mt-1 text-2xl font-semibold text-white">Stored meeting context</h3>
                    </div>
                    <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-slate-300">{notes.length} items</span>
                  </div>

                  {notesLoading ? (
                    <div className="text-slate-400">Loading notes...</div>
                  ) : notes.length ? (
                    <div className="space-y-3">
                      {notes.map((note) => (
                        <div key={note._id} className="rounded-2xl border border-white/10 bg-white/5 p-4">
                          <div className="flex items-start justify-between gap-4">
                            <div>
                              <p className="text-xs uppercase tracking-[0.2em] text-slate-400">
                                {new Date(note.uploadedAt || note.createdAt || '').toLocaleString()}
                              </p>
                              <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-slate-200">{note.rawNotes}</p>
                            </div>
                            <button
                              onClick={() => deleteNoteMutation.mutate(note._id)}
                              disabled={deleteNoteMutation.isPending}
                              className="rounded-full border border-white/10 px-3 py-2 text-xs font-semibold text-slate-300 transition hover:border-red-300 hover:text-red-200 disabled:cursor-not-allowed"
                            >
                              Delete
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-slate-400">No notes yet</p>
                  )}
                </div>
              </>
            )}

            {activeTab === 'summaries' && (
              <div className="panel space-y-4">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-xs uppercase tracking-[0.22em] text-slate-400">AI summary output</p>
                    <h2 className="font-display mt-1 text-2xl font-semibold text-white">Inference result</h2>
                  </div>
                  <span className="rounded-full border border-amber-400/20 bg-amber-400/10 px-3 py-1 text-xs font-semibold text-amber-100">
                    {latestSummary?.model || 'claude / mock'}
                  </span>
                </div>

                {summariesLoading ? (
                  <div className="text-slate-400">Loading summaries...</div>
                ) : activeSummary ? (
                  <div className="space-y-4">
                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="rounded-2xl border border-cyan-400/20 bg-cyan-400/10 p-4">
                        <h4 className="text-sm font-semibold uppercase tracking-[0.2em] text-cyan-100">Action Items</h4>
                        <ul className="mt-3 space-y-2 text-sm leading-6 text-slate-200">
                          {(activeSummary.actionItems || []).map((item, index) => (
                            <li key={index}>• {item}</li>
                          ))}
                        </ul>
                      </div>

                      <div className="rounded-2xl border border-amber-400/20 bg-amber-400/10 p-4">
                        <h4 className="text-sm font-semibold uppercase tracking-[0.2em] text-amber-100">Decisions</h4>
                        <ul className="mt-3 space-y-2 text-sm leading-6 text-slate-200">
                          {(activeSummary.decisions || []).map((item, index) => (
                            <li key={index}>• {item}</li>
                          ))}
                        </ul>
                      </div>
                    </div>

                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                        <h4 className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-300">Key Points</h4>
                        <ul className="mt-3 space-y-2 text-sm leading-6 text-slate-200">
                          {(activeSummary.keyPoints || []).map((item, index) => (
                            <li key={index}>• {item}</li>
                          ))}
                        </ul>
                      </div>

                      <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                        <h4 className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-300">Follow Ups</h4>
                        <ul className="mt-3 space-y-2 text-sm leading-6 text-slate-200">
                          {(activeSummary.followUps || []).map((item, index) => (
                            <li key={index}>• {item}</li>
                          ))}
                        </ul>
                      </div>
                    </div>

                    <div className="rounded-2xl border border-white/10 bg-slate-950/80 p-4">
                      <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Raw response</p>
                      <pre className="mt-3 overflow-x-auto text-xs leading-6 text-slate-200">{activeSummary.rawSummary || JSON.stringify(activeSummary, null, 2)}</pre>
                    </div>
                  </div>
                ) : (
                  <p className="text-slate-400">No summaries yet. Save a note and run inference to populate this panel.</p>
                )}
              </div>
            )}
          </div>

          <aside className="space-y-6">
            <div className="panel space-y-4">
              <div>
                <p className="text-xs uppercase tracking-[0.22em] text-slate-400">Inference trace</p>
                <h3 className="font-display mt-1 text-2xl font-semibold text-white">What happens when you click summarize</h3>
              </div>

              <div className="space-y-3">
                {[
                  ['1', 'Select a meeting', 'Choose the calendar event that provides context for the notes.'],
                  ['2', 'Capture notes', 'Save raw notes to MongoDB with the selected event id.'],
                  ['3', 'Generate summary', 'Send the note body through Claude or the mock fallback.'],
                  ['4', 'Review output', 'Show action items, decisions, key points, and follow ups.'],
                ].map(([step, title, text]) => (
                  <div key={step} className="flex gap-4 rounded-2xl border border-white/10 bg-white/5 p-4">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-amber-400 to-orange-500 text-sm font-bold text-slate-950">{step}</div>
                    <div>
                      <p className="font-semibold text-white">{title}</p>
                      <p className="mt-1 text-sm leading-6 text-slate-300">{text}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="panel space-y-4">
              <div>
                <p className="text-xs uppercase tracking-[0.22em] text-slate-400">Summary activity</p>
                <h3 className="font-display mt-1 text-2xl font-semibold text-white">Latest inference snapshot</h3>
              </div>

              {activeSummary ? (
                <div className="space-y-3 rounded-2xl border border-white/10 bg-slate-900/75 p-4">
                  <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Generated at</p>
                  <p className="text-sm text-slate-200">
                    {activeSummary.generatedAt ? new Date(activeSummary.generatedAt).toLocaleString() : 'Just now'}
                  </p>
                  <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Model</p>
                  <p className="text-sm text-slate-200">{activeSummary.model || 'claude / mock'}</p>
                  <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Preview</p>
                  <p className="text-sm leading-6 text-slate-200">
                    {activeSummary.actionItems?.[0] || 'Save a note to generate a structured summary preview.'}
                  </p>
                </div>
              ) : (
                <p className="text-sm text-slate-400">Run one summary to populate this snapshot.</p>
              )}

              <div className="rounded-2xl border border-cyan-400/20 bg-cyan-400/10 p-4 text-sm leading-6 text-slate-200">
                Demo mode keeps the flow runnable without external credentials, while the same controls work with live Google and Claude services.
              </div>
            </div>
          </aside>
        </section>
      </main>
    </div>
  );
}