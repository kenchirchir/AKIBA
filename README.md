# AKIBA

**Clothes made in Kigali, by tailors you can meet.**

AKIBA is a web platform that publishes the work of local tailors in Kigali together with the story behind each garment. Young buyers can see who made a garment and why it matters, then request it directly from the tailor. AKIBA is a showcase, not a shop it takes no payments and no commission.

A Mission Capstone research project by Kenneth Chirchir.

## Tech stack

- [Next.js](https://nextjs.org) 16 (App Router) with React 19 and TypeScript
- [Tailwind CSS](https://tailwindcss.com) 4
- [Supabase](https://supabase.com): PostgreSQL database and sign-in
- [Cloudinary](https://cloudinary.com): garment photos
- [Africa's Talking](https://africastalking.com): SMS alerts to tailors
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


## Database

AKIBA uses a hosted Supabase project. Connect your copy once with `npx supabase login` and `npx supabase link --project-ref <your-project-ref>`. The tables and security rules live in `supabase/migrations`. There is no sample data; the pilot starts with real tailors only.

| Command                                 | What it does                                                    |
| --------------------------------------- | --------------------------------------------------------------- |
| `npm run db:push`                       | Applies new migrations to the linked project                    |
| `npm run db:types`                      | Regenerates `src/lib/supabase/database.types.ts` after a change |
| `npm run check:security`                | Checks what visitors, tailors and the admin can and cannot do   |
| `npm run make-admin -- you@example.com` | Makes an existing email account the AKIBA admin                 |


## Figma Design system

The design system used to design this is on Figma here <https://www.figma.com/design/cjQuqZfaA0Sbdi9uoWSoxX/AKIBA-Webapp?t=dxiKMRC5Uq64kzL3-0>

## Project documents

- [Development roadmap](docs/ROADMAP.md)
- [Decision log](docs/DECISIONS.md)
- [Running the pilot](docs/OPERATIONS.md): the researcher's guide
