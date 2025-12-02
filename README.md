# AI Resume–Job Matcher

A web app that analyzes a job description and multiple candidate resumes, then ranks candidates by match score and highlights overlapping skills and skill gaps.

Built with:

- Next.js 16 (App Router)
- TypeScript
- Tailwind CSS
- Custom TF-IDF + cosine similarity NLP engine (no external ML APIs)

## Features

- Paste a job description and candidate resumes.
- Run the matching engine to compute similarity scores.
- View:
  - Ranked candidates
  - Match score (0–100%)
  - Overlapping skills vs missing skills
- "Load sample data" button for quick demo.

## Tech Overview

- `lib/types.ts` — shared TypeScript interfaces for Job, Candidate, MatchResult.
- `lib/nlp.ts` — custom text preprocessing + TF-IDF + cosine similarity implementation.
- `app/api/match/route.ts` — API endpoint that computes matches on the server.
- `app/page.tsx` — main dashboard UI.

## Running Locally

```bash
npm install
npm run dev
