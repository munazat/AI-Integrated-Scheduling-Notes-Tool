'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

const demoUser = {
  _id: 'demo-user',
  id: 'demo-user',
  email: 'demo@presentation.local',
  name: 'Presentation Demo',
  isDemo: true,
};

export default function HomePage() {
  const router = useRouter();
  const [hasSession, setHasSession] = useState(false);

  useEffect(() => {
    setHasSession(Boolean(localStorage.getItem('user')));
  }, []);

  const startDemo = () => {
    localStorage.setItem('demo_mode', 'true');
    localStorage.setItem('user', JSON.stringify(demoUser));
    router.push('/dashboard');
  };

  return (
    <div className="surface-grid min-h-screen">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(251,191,36,0.2),_transparent_35%),radial-gradient(circle_at_85%_15%,_rgba(34,211,238,0.15),_transparent_28%)]" />

      <main className="container-main relative py-8 lg:py-12">
        <header className="mb-8 flex flex-col gap-4 border-b border-white/10 pb-8 md:flex-row md:items-center md:justify-between">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs uppercase tracking-[0.24em] text-amber-200">
              Demo-ready scheduling intelligence
            </div>
            <div className="max-w-3xl space-y-4">
              <h1 className="font-display text-4xl font-semibold tracking-tight text-white md:text-6xl">
                AI Integrated Scheduling Notes Tool
              </h1>
              <p className="max-w-2xl text-base leading-7 text-slate-300 md:text-lg">
                Calendar context, raw meeting notes, and structured AI summaries presented in one clean flow so recruiters can see the exact inference path end to end.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            {hasSession ? (
              <button
                onClick={() => router.push('/dashboard')}
                className="rounded-full border border-white/15 bg-white/10 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/15"
              >
                Open dashboard
              </button>
            ) : null}
            <button
              onClick={() => router.push('/auth')}
              className="rounded-full border border-white/15 px-5 py-3 text-sm font-semibold text-slate-200 transition hover:border-amber-300 hover:text-white"
            >
              Connect Google
            </button>
            <button
              onClick={startDemo}
              className="rounded-full bg-gradient-to-r from-amber-400 to-orange-500 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:brightness-110"
            >
              Launch demo
            </button>
          </div>
        </header>

        <section className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
          <div className="space-y-6">
            <div className="panel">
              <div className="relative grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
                <div className="space-y-5">
                  <div className="flex flex-wrap gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-slate-300">
                    <span className="rounded-full border border-emerald-400/30 bg-emerald-400/10 px-3 py-1 text-emerald-200">Mock demo ready</span>
                    <span className="rounded-full border border-cyan-400/30 bg-cyan-400/10 px-3 py-1 text-cyan-200">Google Calendar sync</span>
                    <span className="rounded-full border border-amber-400/30 bg-amber-400/10 px-3 py-1 text-amber-100">Claude summaries</span>
                  </div>

                  <div className="space-y-4">
                    <h2 className="font-display text-3xl font-semibold text-white md:text-4xl">
                      A presentation-first demo that shows the full pipeline.
                    </h2>
                    <p className="max-w-2xl text-sm leading-7 text-slate-300 md:text-base">
                      The backend falls back to realistic mock calendar events and mock AI output when API keys are absent, so anyone can clone the repo and watch the workflow without secrets.
                    </p>
                  </div>

                  <div className="grid gap-3 sm:grid-cols-3">
                    {[
                      ['1. Context', 'Calendar events load first, giving the note-taking flow real meeting context.'],
                      ['2. Capture', 'Raw notes are attached to the selected event and saved in MongoDB.'],
                      ['3. Infer', 'Claude or mock inference converts notes into structured action items.'],
                    ].map(([title, text]) => (
                      <div key={title} className="rounded-2xl border border-white/10 bg-white/5 p-4">
                        <p className="text-sm font-semibold text-white">{title}</p>
                        <p className="mt-2 text-sm leading-6 text-slate-300">{text}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="rounded-3xl border border-white/10 bg-slate-900/80 p-5 shadow-inner shadow-black/20">
                  <div className="flex items-center justify-between border-b border-white/10 pb-3 text-xs uppercase tracking-[0.24em] text-slate-400">
                    <span>Presentation preview</span>
                    <span>Exact flow</span>
                  </div>

                  <div className="mt-4 space-y-4">
                    <div className="rounded-2xl border border-cyan-400/20 bg-cyan-400/10 p-4">
                      <p className="text-xs uppercase tracking-[0.2em] text-cyan-200">Calendar event</p>
                      <p className="mt-2 font-semibold text-white">Sprint Planning</p>
                      <p className="mt-1 text-sm text-slate-300">Thu 10:00 AM - 11:00 AM</p>
                    </div>

                    <div className="rounded-2xl border border-amber-400/20 bg-amber-400/10 p-4">
                      <p className="text-xs uppercase tracking-[0.2em] text-amber-100">Raw notes</p>
                      <p className="mt-2 text-sm leading-6 text-slate-200">
                        Ship the onboarding checklist, confirm API keys for the demo, and follow up on the design review before Friday.
                      </p>
                    </div>

                    <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                      <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Structured output</p>
                      <pre className="mt-3 overflow-x-auto text-xs leading-6 text-slate-200">{`{
  "actionItems": ["Ship the onboarding checklist", "Confirm API keys for the demo"],
  "decisions": ["Proceed with the presentation flow"],
  "followUps": ["Review the design before Friday"]
}`}</pre>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              {[
                ['Zero-setup demo', 'Run the app with no Google or Anthropic keys and still see the whole experience.'],
                ['Visible inference', 'Every step stays on screen, from event context to saved summary.'],
                ['Recruiter friendly', 'The interface reads like a product walkthrough instead of an internal tool.'],
              ].map(([title, text]) => (
                <div key={title} className="rounded-3xl border border-white/10 bg-white/5 p-5">
                  <p className="font-display text-lg font-semibold text-white">{title}</p>
                  <p className="mt-3 text-sm leading-6 text-slate-300">{text}</p>
                </div>
              ))}
            </div>
          </div>

          <aside className="panel space-y-5">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-xs uppercase tracking-[0.22em] text-slate-400">Quick start</p>
                <h2 className="font-display mt-1 text-2xl font-semibold text-white">Open the product in one click.</h2>
              </div>
              <div className="rounded-full border border-emerald-400/30 bg-emerald-400/10 px-3 py-1 text-xs font-semibold text-emerald-200">
                Ready now
              </div>
            </div>

            <div className="space-y-3 rounded-2xl border border-white/10 bg-slate-900/70 p-4">
              <p className="text-sm font-semibold text-white">What recruiters can verify immediately</p>
              <ul className="space-y-3 text-sm leading-6 text-slate-300">
                <li>• Mock calendar data appears without credentials.</li>
                <li>• Raw notes can be saved against an event.</li>
                <li>• Structured summary output is generated on demand.</li>
                <li>• The repo README explains the setup and demo mode.</li>
              </ul>
            </div>

            <button
              onClick={startDemo}
              className="w-full rounded-2xl bg-gradient-to-r from-amber-400 via-orange-500 to-rose-500 px-5 py-4 text-left transition hover:brightness-110"
            >
              <span className="block text-lg font-semibold text-slate-950">Start presentation demo</span>
              <span className="mt-1 block text-sm text-slate-950/80">Seeds a demo user and opens the dashboard with mock data.</span>
            </button>

            <button
              onClick={() => router.push('/auth')}
              className="w-full rounded-2xl border border-white/15 bg-white/5 px-5 py-4 text-left transition hover:border-white/25 hover:bg-white/10"
            >
              <span className="block text-lg font-semibold text-white">Go to Google sign-in</span>
              <span className="mt-1 block text-sm text-slate-300">Use real OAuth and live APIs when credentials are configured.</span>
            </button>
          </aside>
        </section>
      </main>
    </div>
  );
}
