# AI Integrated Scheduling Notes Tool

This repository is a recruiter-friendly demo that turns calendar context and raw meeting notes into structured AI summaries. It can run in live mode with Google OAuth and Anthropic, or in mock/demo mode with no external keys so the full flow is always visible.

## What you can show

1. Calendar events load first, so the note capture flow has real meeting context.
2. Notes are saved against the selected meeting.
3. The summary button runs inference and returns action items, decisions, key points, and follow-ups.
4. Everything is stored in MongoDB and surfaced in a polished dashboard.

## Demo mode

If `GOOGLE_CLIENT_ID` or `ANTHROPIC_API_KEY` are not configured, the backend falls back to deterministic mock data. That means a reviewer can clone the repo, launch the demo from the landing page, and immediately see the pipeline without provisioning credentials.

## Local setup

1. Install dependencies with `npm install` at the repo root.
2. Start MongoDB with `docker-compose up -d`.
3. Copy the root `.env.example` into `apps/api/.env` and `apps/web/.env.local`, then fill in your API keys if you want live Google and Claude integration.
4. For demo mode, you can leave the Google and Anthropic values empty and the backend will use mock data automatically.
5. Run the apps with the workspace scripts in the root `package.json`.

## Presentation flow

1. Open the landing page and click `Launch demo`.
2. Use the sample note button on the dashboard.
3. Click `Save and summarize` to generate the visible inference output.
4. Share the summaries tab or the raw response panel during review.

## See The Inference Yourself

If you want to inspect the output locally, use the demo flow and watch the dashboard update in real time:

1. Start the frontend and backend.
2. Open the landing page and click `Launch demo`.
3. Go to the `Notes` tab.
4. Click `Load sample note` or paste your own notes.
5. Click `Save and summarize`.
6. Open the `Summaries` tab to see the generated action items, decisions, key points, and follow-ups.
7. Check the `Raw response` panel to see the exact inference payload that was returned.

If you are using live mode with Google and Anthropic keys, the same flow works, but the summary will come from the real API instead of the mock fallback.

## Screenshots For README

The best screenshots to add are:

1. Landing page with the `Launch demo` button visible.
2. Dashboard `Notes` tab with a sample note loaded.
3. Dashboard `Summaries` tab showing the structured inference output.
4. Dashboard `Raw response` panel showing the exact returned JSON or text.

Recommended file names if you add them under `docs/screenshots/`:

1. `landing-page.png`
2. `notes-demo.png`
3. `summary-output.png`
4. `raw-response.png`

Example README image block:

```md
![Landing page](docs/screenshots/landing-page.png)
![Notes demo](docs/screenshots/notes-demo.png)
![Summary output](docs/screenshots/summary-output.png)
![Raw response](docs/screenshots/raw-response.png)
```

## Recruiter walkthrough

1. Start at the landing page and point out that the product can run in demo mode without API keys.
2. Open the dashboard and show the calendar, note capture, and summaries sections as a single flow.
3. Paste or load a sample note, then run `Save and summarize` so the inference step is visible.
4. Switch to the summaries tab and call out the raw response panel so the recruiter can see exactly what the model returned.

## Live deployment

The cleanest live setup for this repo is:

1. Frontend on Vercel.
2. Backend on Render or Railway.
3. MongoDB Atlas for the database.

### Frontend on Vercel

1. Create a new Vercel project from this GitHub repo.
2. Set the root directory to `apps/web`.
3. Add `NEXT_PUBLIC_API_URL` for your backend URL.
4. Deploy the project and use the generated URL as the recruiter-facing demo link.

### Backend on Render

1. Create a new Web Service from the same GitHub repo.
2. Set the root directory to `apps/api`.
3. Use `npm install` as the build command.
4. Use `npm run build` as the build step.
5. Use `npm run start:prod` as the start command.
6. Set `MONGODB_URI`, `SESSION_SECRET`, `FRONTEND_URL`, and any Google/Anthropic keys you want for live mode.

### Recommended production env vars

Frontend:

`NEXT_PUBLIC_API_URL=https://your-backend-url`

Backend:

`PORT=3001`

`MONGODB_URI=mongodb+srv://...`

`SESSION_SECRET=your-long-random-secret`

`FRONTEND_URL=https://your-frontend-url`

`GOOGLE_CLIENT_ID=...`

`GOOGLE_CLIENT_SECRET=...`

`GOOGLE_REDIRECT_URI=https://your-backend-url/auth/google/callback`

`ANTHROPIC_API_KEY=...`

If you want the demo to stay keyless, leave the Google and Anthropic values empty and the mock path will continue to work.

## Project structure

`apps/api` contains the NestJS backend with Google auth, calendar sync, note persistence, and summary generation.

`apps/web` contains the Next.js frontend with a presentation landing page, a demo entry point, and a dashboard that shows the note-to-summary pipeline.

`packages/shared` contains shared TypeScript types.

## API surface

`GET /auth/google`

`GET /auth/google/callback`

`GET /auth/me`

`GET /calendar/events`

`GET /calendar/sync`

`POST /notes`

`GET /notes`

`DELETE /notes/:noteId`

`POST /summaries/generate`

`GET /summaries`

## Notes

The repo is intentionally organized so only source, configuration, and documentation are included. Build outputs and local environment files are ignored.
