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
npm run dev
```

Then open <http://localhost:3000>.

## Scripts

| Command                | What it does                                     |
| ---------------------- | ------------------------------------------------ |
| `npm run dev`          | Starts the development server on port 3000       |
| `npm run build`        | Builds the production version                    |
| `npm run start`        | Runs the production build locally                |
| `npm run lint`         | Checks the code for problems with ESLint         |
| `npm run format`       | Formats every file with Prettier                 |
| `npm run format:check` | Checks the formatting without changing any files |

## Design system

While the development server is running, open <http://localhost:3000/styleguide> to see every colour, text style and component used in AKIBA. The components live in `src/components/ui` and the design tokens in `src/app/globals.css`.

## Project documents

- [Development roadmap](docs/ROADMAP.md)
- [Decision log](docs/DECISIONS.md)
