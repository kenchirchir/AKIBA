# AKIBA

**Clothes made in Kigali, by tailors you can meet.**

AKIBA is a web platform that publishes the work of local tailors in Kigali together with the story behind each garment. Young buyers can see who made a garment and why it matters, then request it directly from the tailor. AKIBA is a showcase, not a shop: it takes no payments and no commission.

A Mission Capstone research project by Kenneth Chirchir.

## Tech stack

- [Next.js](https://nextjs.org) 16 (App Router) with React 19 and TypeScript
- [Tailwind CSS](https://tailwindcss.com) 4
- [Supabase](https://supabase.com): PostgreSQL database and sign-in (from Milestone 4)
- [Cloudinary](https://cloudinary.com): garment photos (from Milestone 6)
- [Vercel](https://vercel.com): hosting

## Getting started

You need Node.js 24 or newer, npm 11 or newer, and Git.

```bash
git clone https://github.com/kenchirchir/AKIBA.git
cd AKIBA
npm install
cp .env.example .env.local
npm run dev
```

Before running the app, fill in `.env.local` with your Supabase project URL and publishable key (in Supabase, click **Connect** and choose **Next.js**). Then open <http://localhost:3000>.

## Scripts

| Command                | What it does                                     |
| ---------------------- | ------------------------------------------------ |
| `npm run dev`          | Starts the development server on port 3000       |
| `npm run build`        | Builds the production version                    |
| `npm run start`        | Runs the production build locally                |
| `npm run lint`         | Checks the code for problems with ESLint         |
| `npm run format`       | Formats every file with Prettier                 |
| `npm run format:check` | Checks the formatting without changing any files |

## Database

AKIBA uses a hosted Supabase project. Connect your copy once with `npx supabase login` and `npx supabase link --project-ref <your-project-ref>`. The tables and security rules live in `supabase/migrations`, and the sample data in `supabase/seed.sql`.

| Command                  | What it does                                                     |
| ------------------------ | ---------------------------------------------------------------- |
| `npm run db:push`        | Applies new migrations and the sample data to the linked project |
| `npm run db:types`       | Regenerates `src/lib/supabase/database.types.ts` after a change  |
| `npm run check:security` | Checks what a visitor can and cannot do in the database          |

## Project structure

| Folder                  | What is inside                                                                                                       |
| ----------------------- | -------------------------------------------------------------------------------------------------------------------- |
| `src/app`               | Pages and layouts. Folders in brackets, such as `(site)`, group pages that share a layout without changing their URL |
| `src/components/ui`     | Reusable design-system components                                                                                    |
| `src/components/layout` | The rail, menus, headers and other page building blocks                                                              |
| `src/lib`               | Shared helpers and data: garment categories and Kigali districts and sectors                                         |
| `src/assets`            | Images that are bundled with the app                                                                                 |
| `messages/en.json`      | Every piece of text shown on screen                                                                                  |
| `docs`                  | Roadmap and decision log                                                                                             |

## Design system

While the development server is running, open <http://localhost:3000/styleguide> to see every colour, text style and component used in AKIBA. The components live in `src/components/ui` and the design tokens in `src/app/globals.css`.

## Project documents

- [Development roadmap](docs/ROADMAP.md)
- [Decision log](docs/DECISIONS.md)
