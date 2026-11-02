# AKIBA decision log

This file records the decisions made while building AKIBA and the reasons for them, so the capstone report can refer back to them.

## 2026-11-02: Technology stack

| Layer      | Choice                                                                                                        |
| ---------- | ------------------------------------------------------------------------------------------------------------- |
| Language   | TypeScript                                                                                                    |
| Frontend   | Next.js 16 (App Router), React 19, Tailwind CSS 4                                                             |
| Backend    | Next.js Server Actions and Route Handlers on Node.js                                                          |
| Database   | Supabase PostgreSQL with Row Level Security, schema changes tracked with the Supabase CLI                     |
| Sign-in    | Supabase Auth. Tailors: phone and 5-digit PIN, verified by SMS. Admin: email and password. Buyers: no account |
| Photos     | Cloudinary, uploaded straight from the phone after being shrunk in the browser                                |
| SMS        | One `sendSms()` function. Test mode while developing; Africa's Talking or Twilio for the pilot                |
| Validation | Zod                                                                                                           |
| Testing    | Vitest, Playwright, Postman, Lighthouse                                                                       |
| Hosting    | Vercel, deploying automatically from GitHub                                                                   |

This follows the stack in section 3.9 of the research proposal and fills in the details it leaves open.

## 2026-11-02: Where the designs differ from the proposal

- **D1. Requests instead of in-app messaging.** A buyer sends a "Request this garment" form. The tailor gets the buyer's name and phone number by SMS and calls them, and can mark the request as ordered. This replaces the Messaging module (FR8, FR11, FR12). The research measure becomes the number of requests sent after reading a story, and the time between reading and requesting.
- **D2. No buyer accounts.** Saved garments and tailors are kept on the buyer's phone. Usage logs use an anonymous visitor ID.
- **D3. Saving counts as appreciation, and there are no comments in the pilot** (FR7). Comments would need accounts and moderation.
- **D4. No discounts.** The "Tailor offers" name and the "guide price" wording stay. The percentage discounts, crossed-out prices and "Minimum offer" filter from the 31 October laptop screens are not built.
- **D5. An admin area for the researcher only** (FR9, FR10), built from the existing design components. Association officials vouch for tailors offline, and the admin records the association, the official, the workshop visit and consent. Only verified tailors and approved garments are public.

## 2026-11-02: Other decisions

- **5-digit PIN.** Supabase passwords need at least 6 characters, so the server turns the PIN into a long password with a secret key that only the server knows. Repeated wrong PINs lock the account for a while.
- **Cache Components off.** Next.js 16 can start projects with Cache Components turned on. It is left off to keep the simpler page-rendering model while learning, and can be turned on later.
- **Code style.** Prettier formats every file, and code files contain no comments.
- **Git workflow.** One commit per milestone on `main`, pushed after testing.

## 2026-11-02: Design system

- **Font: Outfit.** Every exported design file uses Outfit. It is loaded with `next/font`, so it is served from the site itself.
- **Navy text on cyan buttons.** `#0B1B3F` on `#09B4D3` gives a contrast of 6.8:1. White text would give 2.5:1, below the 4.5:1 minimum, and be hard to read in sunlight on low-cost phones (NFR5).
- **Only AKIBA colours.** Tailwind's built-in colour palette is switched off, so only the named AKIBA colours can be used and the screens stay consistent.
- **16px text in form fields.** The designs use 15px, but iPhones zoom into any field with text smaller than 16px when it is tapped.
- **English only for now.** Kinyarwanda will be added later from Kenneth's translation sheet. From Milestone 3, all screen text is kept in one English file, so the translations can be added without rewriting pages.

## 2026-11-02: App layout

- **All screen text lives in `messages/en.json`**, read through the `next-intl` library. Adding Kinyarwanda later means adding `messages/rw.json` with the same keys; the file can be turned into a spreadsheet for translating and back again.
- **Where designs disagree, the 2 November journey maps win.** They are newer than the HTML files exported on 31 October and 1 November. Exact sizes still come from the HTML files where both match.
- **Categories and Kigali locations are defined in code** (`src/lib/catalogue.ts`, `src/lib/kigali.ts`). The database will store only their short codes (such as `tops` or `kimironko`), and the names shown on screen come from the text file, so they can be translated.
- **Every screen size fills the screen.** Phones use the rail and full-screen menu. From 768px (tablets), the Welcome and sign-in pages are split screen with the photo on one half. From 1024px (laptops), a top header replaces the rail (logo, Browse, search, Discover, Tailors, Saved, Tailor login) and tailors get a sidebar, following the 31 October laptop designs without their discount features (D4).
- **Placeholder screens** show which milestone builds them, with "(demo)" links so every journey can be clicked through. The sample tailor in `src/lib/demo.ts` is removed once real accounts exist (Milestones 5 and 6).
- **Logo: "Akiba"** with a capital A. Bold without a dot on the sign-in pages and headers, regular weight in the menus and the cyan block.
- **Confirmed by Kenneth:** the Welcome photo may be used, and the Kigali sector list in `src/lib/kigali.ts` is correct.

## 2026-11-02: Database

- **Seven tables:** `profiles`, `tailors`, `tailor_verifications`, `garments`, `garment_photos`, `requests` and `analytics_events`. Each garment holds its own story, so there is no separate stories table. Following D1 to D3, there are no comment, appreciation, conversation or message tables.
- **Every table has Row Level Security.** Visitors can only read verified tailors and their approved garments. Tailors can only change their own shop and garments, and column permissions stop them from changing their own status or approving their own garments. Editing an approved garment sends it back for review.
- **Buyer requests are private.** Only the tailor a request was sent to can read it. The admin account cannot read requests, as promised in ethical consideration 8. Usage logs and verification records are only written and read by the server.
- **The database checks categories, sub-categories, audiences and districts.** Materials and tailoring types are checked by the app.
- **Sample data** in `supabase/seed.sql` is marked `is_sample` and must be deleted before the pilot.
- **Public pages read the database with the publishable key**, without signing in. The Welcome page refreshes at most once a minute, so it loads quickly on slow connections.
- **`npm run check:security`** repeats 12 checks of what a visitor can and cannot do. Checks for signed-in tailors are added in Milestone 5.

## 2026-11-02: Tailor accounts

- **The sign-up journey follows the 2 November journey map:** Sign up, SMS code, Log in, My shop. After the code is checked the tailor is signed out and logs in once with the new PIN, to practise it. The phone number is filled in for them.
- **How the PIN is stored.** The server turns the phone number and PIN into a long password with `AUTH_PIN_PEPPER`, a secret that only the server knows. Without it, nobody can guess PINs straight against Supabase. **The pepper must never change once tailors have signed up**, or every PIN stops working.
- **PIN rules.** Exactly 5 digits, and easy PINs such as 12345 or 11111 are refused. Five wrong PINs in a row lock that phone number for 15 minutes; resetting the PIN by SMS unlocks it. The count lives in the `pin_attempts` table, which only the server can read.
- **Sign-up details wait in an encrypted cookie** on the tailor's own phone for up to 30 minutes, and are saved to the account only once the SMS code is right. Whoever proves they own the number chooses the PIN, so a person who signs up first with someone else's number cannot take over that account later, and a tailor who fills in the form twice keeps the PIN from the second try.
- **The shop name starts as the tailor's full name**, because the sign-up design has no shop-name field. Tailors can change it in their profile (Milestone 10).
- **Experience is stored as a start date** (`tailoring_since`) worked out from the years and months chosen, so it grows by itself. Buyers see a level: New (under 1 year), Skilled (1 to 4 years), Experienced (5 to 9 years) or Master tailor (10 years or more).
- **"Remember me"** keeps a tailor signed in on that phone until they log out. The sign-in renews itself whenever they use AKIBA and only runs out after about 13 months without a visit, the longest a browser allows. Unticked, closing the browser signs them out.
- **Pages under `/shop`** send anyone who is not signed in to the log-in page, and signed-in tailors who open the log-in or sign-up page go straight to their shop. New shops show a "Waiting for verification" note until the admin verifies them (Milestone 11).
- **A refused code or PIN is emptied** so the tailor can type it again straight away. A full box ignores new digits, and tailors may not think to delete the old ones first. When the two new PINs do not match, both boxes are emptied, because the tailor cannot see which one has the mistake.
- **Small changes from the design:** the terms checkbox sits above the Sign up button so it is ticked before pressing it, and "Resend code" unlocks after 60 seconds instead of 45, because Supabase allows one SMS a minute per number.
- **SMS while developing:** Supabase test numbers with a fixed code, so no SMS is sent or paid for. The SMS provider for the pilot is still an open question.
- **The terms page is a short placeholder** until the full terms and privacy notice are written before the pilot.
- **The demo tailor is gone.** The tailor menu and sidebar now show the signed-in tailor.
- **`npm run check:security`** now also creates two temporary test tailors and checks 18 things a signed-in tailor can and cannot do, then deletes them. It needs `SUPABASE_SECRET_KEY` in `.env.local`.

## Open questions

- Participant codes linking usage logs to the surveys. Needed in Milestone 11.
- SMS budget and provider. Needed by Milestone 9.
- Date the pilot starts.
