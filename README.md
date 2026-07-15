# sorrel

Sorrel is the commitment layer for work & life. It reads your email and
quietly extracts two kinds of open loops — things you owe other people, and
things other people owe you — then tracks when each one gets delivered, and
nudges before anything slips. No manual task entry.

## Stack

- Next.js 16 (App Router) + TypeScript + Tailwind CSS v4
- NextAuth v5 with Google OAuth (`gmail.readonly` scope)
- Prisma + SQLite
- Claude API (tool-use) for commitment extraction

## Setup

1. `npm install`
2. Copy `.env.local.example` to `.env.local` and fill in the values — the
   comments in that file walk through the Google Cloud OAuth setup.
3. `npx prisma migrate dev`
4. `npm run dev`, open [http://localhost:3000](http://localhost:3000)

Sign in with Google, click **sync inbox**, and Sorrel scans your recent mail
for commitments and sorts them into the owed-to-you / owed-by-you ledger.
