# AppoFlex

Flexible appointment management for clients and service providers (hairdressers, barbers, clinics and more).

- **No overlaps**: every service has a duration; a PostgreSQL exclusion constraint guarantees a provider is never double booked.
- **Real-time alerts**: in-app notifications for bookings, reschedules, cancellations and delays.
- **Running late?** Providers report an overrun and every affected client is told, with the next free slot suggested.
- **Messaging** per appointment.
- **AI (Groq)**: describe a booking in plain words, draft service descriptions and polish messages.

## Stack

Next.js (App Router) · React 19 · Neon PostgreSQL · Drizzle ORM · Groq · pnpm

## Getting started

```bash
pnpm install
cp .env.example .env.local   # fill in DATABASE_URL, SESSION_SECRET, GROQ_API_KEY
pnpm db:migrate              # applies the SQL in ./drizzle to your Neon database
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000).

## Project layout

```
src/
  app/            routes: (auth) sign in/up, (app) dashboard, providers, appointments, notifications, api
  components/     layout, auth, booking, appointments, provider and ui building blocks
  db/             Drizzle schema and Neon client
  lib/            auth, scheduling engine, time zones, Groq, notifications
  styles/         tokens, base, animations and component styles (see styles/index.css)
drizzle/          SQL migrations (including the overlap guard)
```

## Styling

All styles live in `src/styles` and are imported once through `styles/index.css`. Design tokens
(`tokens.css`) drive the glass panels, flip buttons (`.btn-flip`), confirm buttons (`.btn-confirm`)
and form inputs (`.form`, `.input`) that are reused across every page.

## Scripts

| Script | Purpose |
| --- | --- |
| `pnpm dev` / `build` / `start` | Next.js |
| `pnpm lint` | ESLint |
| `pnpm db:generate` | Generate a migration after editing `src/db/schema.ts` |
| `pnpm db:migrate` | Apply migrations to the database in `DATABASE_URL` |
