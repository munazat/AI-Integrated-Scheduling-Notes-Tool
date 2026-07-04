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
