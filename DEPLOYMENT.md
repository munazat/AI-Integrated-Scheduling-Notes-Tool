# Deployment Guide

This repo is designed to deploy as two services:

1. `apps/web` on Vercel.
2. `apps/api` on Render or Railway.

MongoDB should live in MongoDB Atlas for the best recruiter-facing demo experience.

## Atlas setup

1. Create a free MongoDB Atlas cluster.
2. Create a database user and whitelist your IP address or allow access from anywhere while testing.
3. Copy the Atlas connection string into `MONGODB_URI`.
4. Use the same Atlas URI in local development so you do not need Docker.

## Frontend

Use the repository root as the source, but set the project root to `apps/web` in your hosting dashboard.

Required env var:

`NEXT_PUBLIC_API_URL=https://your-backend-url`

## Backend

Set the root directory to `apps/api`.

Build command:

`npm install`

`npm run build`

Start command:

`npm run start:prod`

Required env vars:

`PORT=3001`

`MONGODB_URI=mongodb+srv://...`

`SESSION_SECRET=your-long-random-secret`

`FRONTEND_URL=https://your-frontend-url`

`GOOGLE_CLIENT_ID=...`

`GOOGLE_CLIENT_SECRET=...`

`GOOGLE_REDIRECT_URI=https://your-backend-url/auth/google/callback`

`ANTHROPIC_API_KEY=...`

## Demo mode

If the Google or Anthropic values are missing, the backend falls back to mock calendar data and mock summary output so the full flow remains visible without credentials.

## Recruiter demo path

1. Open the frontend URL.
2. Click `Launch demo`.
3. Load a sample note.
4. Run `Save and summarize`.
5. Show the summaries tab and the raw output panel.