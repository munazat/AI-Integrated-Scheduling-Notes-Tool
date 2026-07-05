'use client';

import { useRouter } from 'next/navigation';

const demoUser = {
  _id: 'demo-user',
  id: 'demo-user',
  email: 'demo@presentation.local',
  name: 'Presentation Demo',
  isDemo: true,
};

export default function LoginPage() {
  const router = useRouter();

  const handleGoogleLogin = () => {
    window.location.href = `${process.env.NEXT_PUBLIC_API_URL}/auth/google`;
  };

  const startDemo = () => {
    localStorage.setItem('demo_mode', 'true');
    localStorage.setItem('user', JSON.stringify(demoUser));
    router.push('/dashboard');
  };

  return (
    <div className="surface-grid min-h-screen">
      <main className="container-main flex min-h-screen items-center py-10">
        <div className="grid w-full gap-8 lg:grid-cols-[0.95fr_1.05fr]">
          <section className="space-y-6">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs uppercase tracking-[0.22em] text-amber-200">
              Get started
            </div>

            <div className="space-y-4">
              <h1 className="font-display text-4xl font-semibold tracking-tight text-white md:text-6xl">
                Sign in to get started.
              </h1>
              <p className="max-w-2xl text-base leading-7 text-slate-300 md:text-lg">
                Connect your Google Calendar to sync your meetings and start capturing smart summaries.
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              {[
                ['Full Experience', 'Sign in with Google to sync your calendar and get AI summaries of your meetings.'],
                ['Try It First', 'Explore with demo data to see how the app works before connecting your calendar.'],
              ].map(([title, text]) => (
                <div key={title} className="rounded-3xl border border-white/10 bg-white/5 p-5">
                  <p className="font-display text-lg font-semibold text-white">{title}</p>
                  <p className="mt-2 text-sm leading-6 text-slate-300">{text}</p>
                </div>
              ))}
            </div>
          </section>

          <section className="panel mx-auto w-full max-w-xl">
            <div className="space-y-2 text-center">
              <p className="text-xs uppercase tracking-[0.24em] text-slate-400">Welcome</p>
              <h2 className="font-display text-3xl font-semibold text-white">Smart Meeting Notes</h2>
              <p className="text-sm leading-6 text-slate-300">
                Turn your meetings into actionable summaries powered by AI.
              </p>
            </div>

            <div className="mt-8 space-y-4">
              <button
                onClick={handleGoogleLogin}
                className="flex w-full items-center justify-center gap-3 rounded-2xl border border-white/10 bg-white px-4 py-3 font-semibold text-slate-950 transition hover:bg-slate-100"
              >
                <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                </svg>
                Sign in with Google
              </button>

              <button
                onClick={startDemo}
                className="flex w-full items-center justify-center rounded-2xl border border-amber-400/20 bg-amber-400/10 px-4 py-3 font-semibold text-amber-100 transition hover:bg-amber-400/15"
              >
                Try with Demo Data
              </button>
            </div>

            <div className="mt-6 rounded-2xl border border-cyan-400/20 bg-cyan-400/10 p-4 text-sm leading-6 text-slate-200">
              Try the demo to explore the app with sample meeting data and see how AI summaries work.
            </div>

            <p className="mt-6 text-center text-xs text-slate-400">
              We only use your Google credentials to sync your calendar. Your data is never shared.
            </p>
          </section>
        </div>
      </main>
    </div>
  );
}
