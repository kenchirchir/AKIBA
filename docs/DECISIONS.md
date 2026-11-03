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

## 2026-11-02: Tailor shop

- **Photos go straight from the phone to Cloudinary.** The browser shrinks each photo to at most 1600 pixels on its longest side, usually a few hundred KB instead of several MB, so it uploads quickly on mobile data (NFR2). Cloudinary also limits stored photos to 2000 pixels in case a phone cannot shrink one. Photos never pass through the AKIBA server.
- **Every upload is signed by the server.** The server gives each photo a random name inside the tailor's own folder, `akiba/garments/<tailor id>/`, and signs it with `CLOUDINARY_API_SECRET`. Nobody can upload without an account, and a tailor cannot attach a photo from another tailor's folder.
- **Photos upload while the tailor writes the story**, with a progress bar on each photo. If one fails, the tailor can try again or remove it. Publishing waits until every photo has uploaded.
- **Between 1 and 5 photos**, and the first one is the cover. Buyers need to see the garment, so at least one photo is required.
- **Small changes from the design.** The design shows one Category list and no audience. The Category list is grouped (Tops: Shirts, Blouses and so on), because the buyer menus filter by these sub-categories. A "Made for" choice (Women, Men, Everyone, Kids) was added, because the Men and Women collections need it. Material and description are optional; name, category, made for, story and price are required. On most phones Category and Material sit one above the other instead of side by side, because names such as "Bridal & occasion" were cut off; they sit side by side wherever they fit.
- **Price** is a whole number of Rwandan francs between 500 and 10,000,000. Tailors may type `45,000` or `45000`.
- **Every change goes back for review.** Editing a live garment hides it until the admin approves it again. This now also covers adding, removing or reordering its photos, through a database trigger added in this milestone. Before, a tailor could have swapped the photos of an approved garment without review. Tailors are warned before they save a live garment.
- **Tailors can edit or delete their garments at any time** (NFR6). Deleting a garment also deletes its photos from Cloudinary. Buyer requests about a deleted garment stay in the tailor's inbox.
- **Story views on My shop** come from a database function that only counts views of the signed-in tailor's own garments. Views are recorded from Milestone 7, so they show 0 until then.
- **Photo clean-up.** A photo removed before publishing is deleted from Cloudinary straight away, and photos taken out of a saved or deleted garment are deleted once the change is saved. The server does this after the page has moved on, so the tailor never waits for Cloudinary. Photos from a form that is left without publishing stay on Cloudinary for now. Photo links are public but have random names, and a garment only appears on AKIBA once it is approved.
- **`npm run check:security`** now has 38 checks, including photos, the review trigger and story views. It removes its test data, including its test views, when it finishes.

## 2026-11-02: Discover and garment stories

- **The feed follows the 2 November journey map.** On phones and tablets it starts as a grid of photos, and a "Show price & tailor" switch adds the name, price, tailor and area under each photo. Laptops always show these details, as in the 31 October laptop design. The switch needs no JavaScript and is not remembered between pages.
- **Filters (FR5).** Laptops get the filter column from the 31 October laptop design: district, sector, type of tailoring, tailor experience and material, without the "Minimum offer" filter (D4). Phones keep the menu from the journey map: search, district, sector and the category lists.
- **Search.** Every word typed must match the garment's name, description, story, material or category, or the shop or owner name. A tailor's specialities are not searched, because that returned every garment of a tailor who lists, say, Bridal, even a linen suit. The type-of-tailoring filter covers them on laptops.
- **The feed shows 24 garments at a time**, with "Show more garments" up to 240. The Welcome page links to the full feed.
- **The story page (FR6)** follows the journey map: photos (swiped on phones, one under another on tablets and laptops), the guide price, material, category and "made for", the maker card that opens the tailor's profile (Milestone 8), the story with "Read full story", the description, and "Request this garment" (built in Milestone 9). There is no discount badge (D4). The design's "Made in 5 days" was left out in this milestone: the `making_days` column existed, but the upload form did not ask for it. It was added in Milestone 8. From 768px the page has two columns, so the story is not pushed below a full-screen photo.
- **Sharing.** A story link shared on WhatsApp or social media shows the garment's name, the start of its story and its cover photo.
- **Story pages are cached** and rebuilt at most once a minute, so they open quickly on slow connections. Editing or deleting a garment clears its page straight away.
- **Saving (FR7, D2, D3).** The heart on a story page saves the garment in the browser on that phone, with no account. The Saved page shows the saved garments that are still on AKIBA. Saving tailors comes with their profile pages in Milestone 8.
- **Usage logs (FR10).** The server records a story view when a story opens (the same visitor opening it again within 30 minutes is not counted again), the seconds the story was on screen when the buyer leaves or switches app (the total reading time is the sum of these), and every save and unsave. Visitors are identified only by a random number kept in a cookie for a year, with no name or phone number. Tailors opening their own garments, search engines and test tools are not counted. The terms and privacy notice must mention this cookie before the pilot.
- **Speed (NFR2)**, measured with Lighthouse on a production build of a story page with two photos:

  | Connection                                  | Text and story appear | Main photo | Page ready |
  | ------------------------------------------- | --------------------- | ---------- | ---------- |
  | Chrome's 3G preset (1.5 Mbps, slow phone)   | 1.7 s                 | 2.6 s      | 2.5 s      |
  | Lighthouse's stricter "Regular 3G" estimate | 1.6 s                 | 6.5 s      | 6.6 s      |

  The stricter estimate adds the test computer's own slow link to Cloudinary (0.8 s before the first byte) and a local server that, unlike Vercel, does not share one connection for all files, so it overstates the live site. It will be measured again on the live site with real garments in Milestone 13. Photos after the first only start loading once the first is on screen, so they do not slow it down.

## 2026-11-03: Meet the tailors

- **Only verified tailors appear (FR5, FR6).** The Tailors list and the profile pages read the database without signing in, so the security rules only return verified shops, and the pages also ask for verified shops only. A shop that is waiting for verification or suspended is not in the list, and its profile address shows "Page not found".
- **The Tailors list follows the 2 November journey map:** search by name or shop, filters, "Showing N tailors · most experienced first", and cards with the level, years, specialities, the covers of the three newest garments and a "+N" tile for the rest. Most experienced first means the earliest tailoring start date first. Every word typed in the search must match the shop name or the owner's name.
- **Filters, a small change from the design.** Phones show two rows of two filters (district, sector, type of tailoring, experience) instead of three in one row, because three side by side would need text smaller than 16px on 375px phones, and iPhones zoom into small form fields. Sector was added to match the Discover filters. Tablets show the four in one row, and laptops show them in a column like the Discover feed.
- **The profile page follows the 2 November journey map:** the cyan band, the tailor's photo or initials, the "Verified tailor" badge, the experience card with its four-step scale, specialities, the shop location with "Get directions" (a Google Maps search that opens in a new tab), and the tailor's approved garments, which open their story pages. The design's "Request for a Garmet" button reads "Request a garment from Aline". Until Milestone 9 it scrolls to the garments, because a request is made for one garment. The "About me" text and a save heart on the profile are not in the design, so they are not added.
- **Profile pages are cached** like story pages and rebuilt at most once a minute. Saving or deleting a garment clears its tailor's page straight away.
- **A preview for shops waiting for verification** (decided with Kenneth). Until a shop is verified, "My public page" in the tailor menu and sidebar opens `/shop/preview`: the tailor sees their own page with a "Waiting for verification" badge and a note that only they can see it, and their garments link to the edit page. Everyone else gets "Page not found". Once the shop is verified, the link opens the real page.
- **Saving tailors (D2).** The heart on a tailor card saves the tailor on the phone, like garments, and the Saved page lists them under Tailors. Saving a tailor is not logged, because the research measures appreciation of garments.
- **Usage logs (FR10).** Opening a tailor's profile records a `tailor_view` (the same visitor again within 30 minutes is not counted again), and tapping "Get directions" records a `directions_click`. Tailors opening their own page, previews, search engines and test tools are not counted. A Milestone 7 bug was fixed on the way: views and saves of the sample garments were never recorded, because sample tailors have no account and the "is this the owner?" test compared two empty values.
- **"Made in (days)"** (decided with Kenneth). The upload and edit form has an optional "Made in (days)" field from 1 to 180, next to the price, and the story page shows "Made in: 5 days" when it is filled in. The `making_days` column already existed, so no database change was needed.
- **"Trending" is hidden** (decided with Kenneth). It showed every garment, because nothing ranks garments yet. The menu's "Shop all" now lists Men and Women, and an old Trending link shows all garments. A ranking, for example story views and saves in the last 14 days, can be added once the pilot has usage data.
- **Photos and avatars.** Avatars show the tailor's photo when one is set (the upload comes in Milestone 10) and their initials until then. The profile band shows the cover photo when one is set.
- **`npm run check:security`** now has 41 checks, including that a tailor can see their own shop while it waits, and that visitors see a verified tailor but not a suspended one or their garments.

## 2026-11-03: Requests and SMS alerts

- **Requests replace in-app messaging (D1, FR8, FR11, FR12).** "Request this garment" on a story page opens the 2 November request sheet: name, phone number, size, quantity, the date it is needed by and the best time to call. There is no note field, following the 2 November design (decided with Kenneth). Requests can only be made for an approved garment of a verified tailor.
- **Sizes** (decided with Kenneth): XS, S, M, L, XL, XXL and "Measure me at the fitting". Quantity is 1 to 20 pieces, the date runs from today to one year ahead (Kigali time), and the best time to call is anytime, morning, afternoon or evening.
- **Requests are saved by the server.** Visitors cannot write to the `requests` table, so the server checks the form and saves it. To stop spam, one browser can send at most 5 requests an hour and one phone number at most 5 a day.
- **The SMS to the tailor is in test mode** (decided with Kenneth). The text is ready: "AKIBA: Keza Mutoni requested 2 x Kitenge wrap dress (size M), needed by 15 Nov. Call 0788 000 001, best in the afternoon." It fits in one SMS and uses plain letters only. One function, `sendSms()` in `src/lib/sms.ts`, sends it, and an SMS provider plugs in there before the pilot. Until then nothing is sent or paid for. On a local development server the message is printed in the terminal; on the live site only its length is logged, so buyers' names and numbers never land in the hosting logs. `sms_sent_at` is only filled in when an SMS really goes out. The SMS is sent just after the buyer's page has moved on, so the buyer never waits for it. Tailors who turn off SMS alerts (Milestone 10) get no SMS. The next-day "Reply 1 or 2" follow-up is not built, because it needs an SMS number that can receive replies.
- **"Request sent" page.** It follows the 2 November design: the summary, "What happens next" and "Keep discovering". The request is remembered in an encrypted cookie for 30 minutes, so only the buyer who sent it can see the page; anyone else is sent back to the story. The design's "she" and "her" are replaced by the tailor's name, and "by SMS" is left out, because a tailor may have SMS alerts turned off.
- **"Call Aline now"** (decided with Kenneth). The tailor's phone number is shown only to the buyer who has just sent a request, on the "Request sent" page, as the terms already say. Taps are logged as `call_click`.
- **Requests inbox (FR11, FR12).** `/shop/requests` lists the newest requests first, with All and Unread tabs, the unread count, "Mark all as read", a call button with the buyer's number, and "Mark as ordered", which turns into a green "Ordered" with "Undo". Tapping the call button marks a request as read. A request whose garment was deleted stays in the inbox. On phones the call button shows the phone icon and the number, as in the 1 November button states, so both buttons fit on one row.
- **Usage logs (FR10).** Every request records a `request_sent` event with the visitor's anonymous ID, so the research can measure requests after reading a story and the time between reading and requesting.
- **Privacy (NFR7).** Only the tailor who receives a request can read it. Tailors can change only its status; they cannot change the buyer's details or delete it. `npm run check:security` now has 45 checks.
- **Dates** are shown as "15 Nov" and "Sun, 15 Nov", and the app's time zone is set to Kigali.

## Open questions

- Participant codes linking usage logs to the surveys. Needed in Milestone 11.
- SMS provider and budget, and whether to add the two-way "Reply 1 or 2" follow-up. Needed before the pilot (Milestone 14).
- Date the pilot starts.
