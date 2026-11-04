# Technical requirements

[Back to the technical documentation](README.md)

## Software

| Tool               | Version used                                       | Notes                                                                          |
| ------------------ | -------------------------------------------------- | ------------------------------------------------------------------------------ |
| Node.js            | 24 or newer (CI uses 24, developed on 24.11)       | Required to install, run and test                                              |
| npm                | 11 or newer (developed on 11.6)                    | Comes with Node.js                                                             |
| Supabase CLI       | 2.122 (installed with the project, run with `npx`) | Links the database and applies the migrations                                  |
| Playwright browser | Chromium, installed with `npx playwright install`  | Only needed for the browser tests                                              |
| Git                | Any recent version                                 | To clone the repository                                                        |
| Web browser        | Any current Chrome, Firefox, Safari or Edge        | Built phone-first; works on low-cost Android phones and on tablets and laptops |

## Frameworks and SDKs

| Package               | Version | Purpose                                                     |
| --------------------- | ------- | ----------------------------------------------------------- |
| Next.js               | 16.4.3  | App Router, server rendering, server actions and API routes |
| React                 | 19.3.0  | User interface                                              |
| TypeScript            | 5.9.3   | Type-checked code                                           |
| Tailwind CSS          | 4.3.3   | Styling and the design tokens                               |
| @supabase/supabase-js | 2.118.0 | Database and sign-in client                                 |
| @supabase/ssr         | 0.12.7  | Cookie-based Supabase sessions in Next.js                   |
| next-intl             | 4.14.9  | Every piece of text on screen, kept in `messages/en.json`   |
| Zod                   | 4.6.7   | Form and input rules shared by the server and the tests     |
| lucide-react          | 1.66.0  | Icons                                                       |
| Vitest                | 5.1.0   | Unit tests                                                  |
| Playwright            | 1.64.1  | Browser tests of the buyer, tailor and admin journeys       |
| @axe-core/playwright  | 4.14.0  | Accessibility checks inside the browser tests               |
| ESLint                | 9.39.5  | Linting with the Next.js rule set                           |
| Prettier              | 3.9.10  | Formatting, including Tailwind class order                  |

## Services

| Service          | Needed for                                                         | Plan                                                                                                                                   |
| ---------------- | ------------------------------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------- |
| Supabase         | PostgreSQL database, row-level security, phone sign-in             | Free tier is enough                                                                                                                    |
| Cloudinary       | Garment, shop and profile photos, uploaded straight from the phone | Free tier is enough                                                                                                                    |
| Africa's Talking | SMS alerts to tailors, and sign-up and PIN-reset codes             | The sandbox is free; real SMS needs credit. Without it, request alerts go to the server log and only Supabase test numbers can sign up |
| Vercel           | Hosting                                                            | Optional; the free Hobby plan is enough                                                                                                |

## Hardware

Any machine that runs Node.js 24 will work. At least 4 GB of RAM and 2 GB of free disk space are recommended for the dependencies, the production build and the Playwright browser. An internet connection is needed to reach Supabase and Cloudinary.

To use AKIBA, a phone or computer with a current browser is enough. The pages are designed for low-cost smartphones on a 3G connection.
