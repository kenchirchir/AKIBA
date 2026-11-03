# AKIBA

**Clothes made in Kigali, by tailors you can meet.**

AKIBA is a web platform that publishes the work of local tailors in Kigali together with the story behind each garment. Young buyers can see who made a garment and why it matters, then request it directly from the tailor. AKIBA is a showcase, not a shop it takes no payments and no commission.

A Mission Capstone research project by Kenneth Chirchir.

## Tech stack

- [Next.js](https://nextjs.org) 16 (App Router) with React 19 and TypeScript
- [Tailwind CSS](https://tailwindcss.com) 4
- [Supabase](https://supabase.com): PostgreSQL database and sign-in
- [Cloudinary](https://cloudinary.com): garment photos
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

Before running the app, fill in `.env.local`, then open <http://localhost:3000>.

| Variable                               | Where it comes from                                                                                                                      |
| -------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------- |
| `NEXT_PUBLIC_SUPABASE_URL`             | Supabase: **Connect**, then **Next.js**                                                                                                  |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Supabase: **Connect**, then **Next.js**                                                                                                  |
| `SUPABASE_SECRET_KEY`                  | Supabase: **Project Settings**, **API Keys**, **Secret keys**. Server only: never share it or put it in code                             |
| `AUTH_PIN_PEPPER`                      | A long random secret, made with `openssl rand -base64 32`. Use the same value everywhere and never change it once tailors have signed up |
| `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME`    | Cloudinary: **Settings**, **API Keys**, the cloud name at the top                                                                        |
| `CLOUDINARY_API_KEY`                   | Cloudinary: **Settings**, **API Keys**                                                                                                   |
| `CLOUDINARY_API_SECRET`                | Cloudinary: **Settings**, **API Keys**, next to the API key. Server only: never share it or put it in code                               |

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
| `npm run check:security` | Checks what visitors and signed-in tailors can and cannot do     |

## Project structure

| Folder                    | What is inside                                                                                                       |
| ------------------------- | -------------------------------------------------------------------------------------------------------------------- |
| `src/app`                 | Pages and layouts. Folders in brackets, such as `(site)`, group pages that share a layout without changing their URL |
| `src/components/ui`       | Reusable design-system components                                                                                    |
| `src/components/layout`   | The rail, menus, headers and other page building blocks                                                              |
| `src/components/auth`     | The sign-up, SMS code, log-in and PIN reset forms                                                                    |
| `src/components/shop`     | The garment form, the photo picker that uploads to Cloudinary, and the My shop cards                                 |
| `src/components/garments` | The garment cards, the feed grid with its "Show price & tailor" switch, and the laptop filters                       |
| `src/components/story`    | The garment story page: photos, the save heart, the maker card and the reading-time tracker                          |
| `src/components/saved`    | The Saved page lists, which read the garments and tailors saved on the phone                                         |
| `src/components/requests` | The request sheet on story pages, the call button on the Request sent page and the inbox buttons                     |
| `src/components/tailors`  | The tailor cards and filters, the save heart for tailors, and the tailor profile with its experience card            |
| `src/lib`                 | Shared helpers and data: garment categories and Kigali districts and sectors                                         |
| `src/lib/auth`            | Tailor accounts: phone numbers, PIN rules, lockout and the server actions behind each form                           |
| `src/lib/tailors.ts`      | Reads verified tailors for the Tailors list, the Saved page and the profile pages                                    |
| `src/lib/shop`            | A tailor's own garments: reading them, and the server actions that save, edit and delete them                        |
| `src/lib/requests`        | Buyer requests: the form rules, the server actions that save and update them, and the tailor's inbox                 |
| `src/lib/sms.ts`          | Sends SMS alerts to tailors. Test mode until an SMS provider is set up                                               |
| `src/lib/cloudinary.ts`   | Signs photo uploads and deletes photos on Cloudinary. Runs on the server only                                        |
| `src/lib/discover`        | The buyer side: search words, garments saved on the phone, and usage events                                          |
| `src/app/api/events`      | Records story views, reading time, saves, tailor profile views and directions taps. Runs on the server only          |
| `src/proxy.ts`            | Keeps tailors signed in and sends visitors away from the `/shop` pages                                               |
| `src/assets`              | Images that are bundled with the app                                                                                 |
| `messages/en.json`        | Every piece of text shown on screen                                                                                  |
| `docs`                    | Roadmap and decision log                                                                                             |

## Figma Design system

The design system used to design this is on Figma here <https://www.figma.com/design/cjQuqZfaA0Sbdi9uoWSoxX/AKIBA-Webapp?t=dxiKMRC5Uq64kzL3-0>

## Project documents

- [Development roadmap](docs/ROADMAP.md)
- [Decision log](docs/DECISIONS.md)
