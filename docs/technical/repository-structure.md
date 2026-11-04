# Repository structure

[Back to the technical documentation](README.md)

```text
AKIBA/
├── .github/workflows/checks.yml     CI: types, lint, formatting and unit tests on every push
├── docs/
│   ├── technical/                   Technical requirements and this repository map
│   ├── ROADMAP.md                   Development roadmap, milestone by milestone
│   ├── DECISIONS.md                 Decision log, including where the build differs from the proposal
│   └── OPERATIONS.md                The researcher's guide to running the pilot
├── messages/en.json                 Every piece of text shown on screen
├── scripts/
│   ├── check-security.mjs           57 checks of what visitors, tailors and the admin can and cannot do
│   └── make-admin.mjs               Makes a phone number the AKIBA admin
├── supabase/
│   ├── config.toml                  Supabase CLI settings
│   └── migrations/                  Tables, row-level security, triggers and SQL functions
├── src/
│   ├── app/
│   │   ├── (site)/(discover)/       Welcome page, Tailor offers, Tailors and Saved
│   │   ├── (site)/garments/[id]/    Garment story page and the Request sent page (FR6, FR8)
│   │   ├── (site)/tailors/[id]/     Tailor profile page (FR6)
│   │   ├── (site)/terms/            Terms of use and privacy
│   │   ├── (auth)/                  Join, phone code, log in and PIN reset, for tailors and the admin
│   │   ├── shop/                    The tailor's side: My shop, upload, edit, requests, profile
│   │   ├── admin/                   Overview, tailor verification, garment review, research report
│   │   └── api/                     Usage events, participant codes and the Supabase SMS hook
│   ├── components/
│   │   ├── ui/                      Design-system components: buttons, fields, chips, sheets
│   │   ├── layout/                  Headers, tab bar, phone menu, footer and page headers
│   │   ├── garments/, story/        Garment cards, feed, filters and the story page
│   │   ├── tailors/, saved/         Tailor cards, filters, profile and the Saved lists
│   │   ├── shop/, profile/          Upload form, photo picker, My shop cards and profile settings
│   │   ├── requests/                Request sheet, call button and inbox actions
│   │   ├── auth/, admin/            Sign-in forms and the admin forms
│   │   └── forms/                   The shared hook behind every form
│   ├── lib/
│   │   ├── supabase/                Server, public and admin clients, and the database types
│   │   ├── auth/                    Phone numbers, PIN rules, lockout and the sign-in actions
│   │   ├── shop/, profile/          A tailor's garments and profile, and the actions that save them
│   │   ├── requests/                Buyer requests and the tailor's inbox
│   │   ├── discover/                Search words, saved items and usage events
│   │   ├── admin/                   Admin data, verification and review actions, CSV export
│   │   ├── sms.ts                   SMS through Africa's Talking
│   │   ├── cloudinary.ts            Signed photo uploads and deletes
│   │   └── catalogue.ts, kigali.ts  Garment categories, and Kigali districts and sectors
│   ├── assets/                      Images bundled with the app
│   ├── i18n/                        Loads the on-screen text for next-intl
│   └── proxy.ts                     Session refresh and sign-in redirects
├── tests/
│   ├── unit/                        Unit tests, run with Vitest
│   └── e2e/                         Browser and accessibility tests, run with Playwright
├── .env.example                     Environment variable template
├── next.config.ts                   Next.js settings and security headers
├── playwright.config.ts             Browser test settings
├── vitest.config.mts                Unit test settings
└── package.json                     Scripts and dependencies
```
