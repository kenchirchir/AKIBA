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
- **The profile page follows the 2 November journey map:** the cyan band, the tailor's photo or initials, the "Verified tailor" badge, the experience card with its four-step scale, specialities, the shop location with "Get directions" (a Google Maps search that opens in a new tab), and the tailor's approved garments, which open their story pages. The design's "Request for a Garmet" button reads "Request a garment from Aline". Until Milestone 9 it scrolls to the garments, because a request is made for one garment. A save heart on the profile is not in the design, so it is not added. The "About me" text is shown from Milestone 10, when tailors can write it.
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

## 2026-11-03: Tailor profile and settings

- **The Profile page follows the 1 and 2 November designs:** the tailor's photo, shop name and "Verified", "Edit profile", how complete the profile is with a link to the next thing to add, "View my shop as a buyer", the SMS alerts switch, "Change PIN", Language, "Help & terms" (a sheet with three questions and a link to the terms) and "Log out". "Delete account" is added because the right to withdraw (NFR6) needs it.
- **Edit profile and Change PIN are pages instead of sheets.** They hold long forms and photo uploads, which are easier to fill in and to go back from on a full page. The fields are the design's: photo, cover photo, shop name, full name, experience, phone (read-only, with a verified tick), district, sector, shop address, types of tailoring and About me. Changes show on the public page, the tailors list and the story pages straight away. Changing the experience keeps the original start date when the years and months stay the same.
- **Photos.** The tailor's photo and cover photo are shrunk in the browser and uploaded to `akiba/tailors/<tailor id>/` on Cloudinary, the same way as garment photos. A replaced or removed photo is deleted from Cloudinary when the profile is saved. The photo shows on the public page, the tailors list, the sidebar and the menu.
- **About me** now shows on the public tailor page under the name.
- **The phone number cannot be changed yet** (decided with Kenneth), because a new number would need its own SMS check.
- **Language** shows English, with Kinyarwanda listed as "coming soon" (decided with Kenneth) until the translation sheet arrives.
- **Change PIN** asks for the current PIN, a new one and the new one again, with the same rules as sign-up. Wrong current PINs count towards the same 5-try lockout as logging in. "Forgot your PIN? Reset it by SMS" opens the reset page.
- **Delete account (NFR6, right to withdraw).** The tailor types their PIN to confirm (decided with Kenneth). The server then deletes the usage records about the shop (decided with Kenneth), the sign-in account, the shop, every garment and story, all photos on Cloudinary and all buyer requests, then signs the tailor out and shows a goodbye page. It can't be undone; the same number can sign up again.
- **Sign-up details** that were kept as a copy in the sign-in account are cleared the first time a tailor saves their profile.
- **`npm run check:security`** now has 47 checks, including that a tailor can turn their SMS alerts off and that deleting an account removes the shop, its garments and its requests.

## 2026-11-03: Admin, verification and research data

- **One admin, the researcher (D5).** The admin logs in with email and password at `/admin/login`. The account is made by Kenneth in the Supabase dashboard (Authentication, Users, Add user, "Auto Confirm User" ticked), then turned into the admin with `npm run make-admin -- email` (decided with Kenneth), so no password ever passes through the code or the chat. Signed-out visitors are sent from any `/admin` page to the admin login.
- **The admin uses their own session, never the secret key.** Admin pages read the database as the signed-in admin, so the security rules still apply: the admin can see every shop, garment and verification record, but **cannot read buyer requests** (ethical consideration 8). Changes the admin may make go through database functions that first check the caller is the admin: verify a tailor, suspend a shop or move it back to waiting, approve or reject a garment. These live in the migration `20261103120000_admin_and_research.sql`.
- **Verification (FR9).** The tailor page records the tailor association, the official who vouched, the workshop visit date, notes and the tailor's consent. A tailor cannot be verified without consent; the database refuses it too. Verifying makes the shop and its approved garments public straight away; suspending hides them straight away.
- **Garment review.** The queue shows each garment waiting for review with its photos, details, story and description, oldest first. "Approve" publishes it. "Not approved" asks for a reason, picked from a short list or typed (decided with Kenneth), plus an optional note. The tailor sees it on the garment's edit page. A warning shows when the shop itself is not verified yet.
- **Participant codes (decided with Kenneth).** The researcher gives each buyer in the study a personal link ending in `?p=B07`. The code is kept in a cookie on the buyer's phone for a year, removed from the address bar, and added to that buyer's views, reading time, saves, tailor views, calls and requests. Codes use 2 to 20 letters, numbers or dashes. No names are stored.
- **Research report (FR10).** `/admin/report` shows totals and two tables, by participant and by garment, which also download as CSV files for the analysis. The measures are story views, visitors, reading time, saves, unsaves, tailor profile views, directions taps, calls, requests, **requests after reading** (a request from a visitor who had opened that garment's story first) and the **median time from first story view to request**. The report is counted from the usage records only, so it never touches the requests table or any buyer's details.
- **`npm run check:security`** now has 57 checks, including what the admin can and cannot do and that tailors and visitors cannot use the admin functions or read the report.

## 2026-11-03: Automated tests, security and accessibility

- **Three development-only test tools** (agreed with Kenneth): Vitest for unit tests, Playwright for browser tests of the journeys, and axe for accessibility checks. They never ship to users. `@types/node` moved from version 20 to 24 to match Node 24, which the project already runs on.
- **`npm test`** runs 39 unit tests of the rules behind the forms and data: experience levels and start dates, Rwandan phone numbers, PIN rules, the garment, request, verification and rejection forms, Kigali dates, search words, the items saved on the phone, Kigali places and categories, and the CSV export.
- **`npm run test:e2e`** builds the app, starts it on port 3100 and runs 11 browser tests, each at phone size (Pixel 7) and laptop size (1280px), 22 runs in all. They cover a buyer reading, saving and requesting a garment, the tailors list showing verified tailors only, a pending shop having no public page, the Request sent page being private, signed-out visitors being sent to the right login, a wrong PIN, a tailor marking a request as ordered, the upload form's errors and the SMS switch. Before the tests, temporary test tailors (+250780000903 and 904), a garment and a request are created with the secret key; they are deleted afterwards. The test browser is recognised as a test tool, so it adds nothing to the usage logs.
- **Accessibility (WCAG 2.1 A and AA).** axe checks 11 public pages and 7 tailor pages at both sizes. It found one problem: grey placeholder text such as "Choose" was too faint (2.5:1 against white). The placeholder colour is now `#67738A`, which reaches the 4.5:1 minimum and is still lighter than normal text. The admin pages are not checked automatically, because the tests cannot create an admin account.
- **Security review.**
  - The 57 database checks in `npm run check:security` pass.
  - `npm audit` finds no known vulnerabilities in anything that ships to users. The 17 moderate warnings are inside the ESLint development tools only.
  - Every page now sends standard security headers: no MIME-type guessing, no embedding in other sites' frames, a careful referrer policy, and no access to the camera, microphone, location or payments from scripts. The "X-Powered-By" header is switched off. Photo uploads use the phone's own picker, so they still work.
  - A full Content Security Policy is left out for now, because Next.js needs inline scripts and a wrong policy would break pages; it can be added with nonces later.
- **GitHub checks.** Every push to `main` runs the type check, lint, formatting check and unit tests on GitHub (`.github/workflows/checks.yml`). They need no secret keys. The browser tests and database security checks stay on Kenneth's Mac, because they use the database keys.

## 2026-11-03: Final design check and live speed

- **Every screen checked at 390, 820, 1280 and 1440 pixels**, with screenshots of 24 screens, the request sheet and both phone menus (92 pictures). Phones keep the rail and full-screen menus; tablets use split screens for Welcome and sign-in; laptops use the top header, the tailor sidebar and full-width grids, as agreed. No layout problems were found, and no page scrolls sideways. A browser test now checks that no public or tailor page becomes wider than the screen at 375, 390, 820, 1280 and 1440 pixels.
- **Live speed on 3G (NFR2).** Measured with Lighthouse on the live site (Vercel) on a story page with a 1600-pixel cover photo, the size a phone upload becomes. A test shop was put on the live site for the measurement and then deleted, with Kenneth's agreement. Three runs each:

  | Connection                                              | Text appears | Main photo    | Page ready |
  | ------------------------------------------------------- | ------------ | ------------- | ---------- |
  | Chrome's 3G preset (1.5 Mbps, 560 ms delay, slow phone) | 2.2–2.5 s    | **2.9–3.0 s** | 3.2–3.7 s  |
  | Lighthouse's stricter "Regular 3G" estimate (0.7 Mbps)  | 2.1–2.3 s    | 6.5–6.7 s     | 6.5–6.7 s  |

  The story page meets the 5-second goal on Chrome's 3G preset, which slows a real browser down. Lighthouse's stricter estimate does not reach it: at 0.7 Mbps the 34 KB cover photo shares the line with about 270 KB of other files, mostly the page's JavaScript and font. Going further would need a smaller JavaScript bundle; that is noted for after the pilot.

- **Links no longer download pages in the background.** Next.js normally prefetches every page linked on screen. On the live feed this downloaded 17 pages, 177 KB of the 537 KB the feed used, which buyers on mobile data pay for. Garment cards, tailor cards, the maker card and the garments on a tailor's page now load their page only when tapped. Those pages are cached by Vercel, so they still open quickly. The few menu links (Home, Saved) still prefetch.

## 2026-11-03: Production readiness

- **Sample data deleted** (decided with Kenneth). The 5 sample shops, their 10 garments and the 3 usage records on them were removed from the live database. `supabase/seed.sql` is deleted and seeding is switched off, so they cannot come back; `npm run db:push` now only applies migrations. `npm run check:security` creates and removes its own test shops and garments instead of relying on the sample rows.
- **`/styleguide` deleted** (decided with Kenneth). The Figma design system is the reference for the components.
- **SMS through Africa's Talking** (decided with Kenneth). `sendSms()` sends through Africa's Talking when `AFRICASTALKING_USERNAME` and `AFRICASTALKING_API_KEY` are set; the username `sandbox` uses their free sandbox. Without the keys it stays in test mode. `sms_sent_at` is filled in only when Africa's Talking accepts the message.
- **Sign-up and PIN-reset codes.** Supabase sends these, and so far only the test numbers worked. A Supabase **Send SMS hook** at `/api/auth/sms-hook` now lets Supabase send them through Africa's Talking too. The endpoint checks Supabase's signature (Standard Webhooks, with `SUPABASE_SMS_HOOK_SECRET`) and accepts only Rwandan mobile numbers. It does nothing until the hook is switched on in Supabase; the steps are in `docs/OPERATIONS.md`.
- **Full terms and privacy page** at `/terms`, in plain English: what AKIBA is, buyers, tailors, requests and phone numbers, the research and participant codes, the cookies used, where data is kept, people's rights, and the contact (Kenneth Chirchir, kenchirchir2004@gmail.com, +250 794 096 359). It should be read with the supervisor against the ethics approval before the pilot.
- **`docs/OPERATIONS.md`** is the researcher's guide: logins, what to set up before the pilot, verifying tailors and reviewing garments, checks to run, handling withdrawals, and deleting the data when the study ends.

## 2026-11-04: Laptop navigation tabs

- **The laptop header now uses tabs, modelled on Dribbble** (Kenneth's request and screen recording). The "Browse" button used to open the full-height side menu, which covered the page.
- **The header fills the screen width**: the logo at the far left with a small margin, then the search bar, then the tabs **Browse**, **Discover**, **Tailors** and **Saved**, evenly spaced, then Tailor login.
- **Only Browse and Discover open a card under them**: on hover with a mouse, and on click or tap and with the keyboard. Escape, clicking elsewhere or choosing a link closes it. The open tab's text turns grey and its arrow flips, as on Dribbble.
  - **Browse:** garment categories in three columns (Tops, Bottoms, More garments), with a "Browse by area" strip for the three districts.
  - **Discover:** Tailor offers, Made for women and Made for men, each with a one-line description.
- **Tailors and Saved are plain links** with no card. Saved shows how many items are saved on the phone.
- **A card that would run off the right edge moves left** to stay 16 pixels inside the screen, so it fits at 1024 pixels too.
- **Phones and tablets keep the rail and the full-screen menu** from the 2 November journey map.

## Open questions

- SMS budget, the approved sender name, and whether to add the two-way "Reply 1 or 2" follow-up.
- Date the pilot starts.
