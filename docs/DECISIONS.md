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

## Open questions

- Logo text: lowercase "akiba" (the HTML design files and menus) or "Akiba" (the 2 November journey maps)?
- Participant codes linking usage logs to the surveys. Needed in Milestone 11.
- SMS budget and provider. Needed by Milestone 9.
- Date the pilot starts.
