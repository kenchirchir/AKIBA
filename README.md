# AKIBA

**Wear the story. Meet the maker.**

Every garment on AKIBA comes with the Kigali tailor who made it and the story behind it. Browse, fall for a piece, and request it straight from the maker.

Built for the Mission Capstone project "AKIBA, A Digital Storytelling Integration in African Fashion: Promoting Tailors and Locally Tailored Clothing".

|                        |                                                                                                                            |
| ---------------------- | -------------------------------------------------------------------------------------------------------------------------- |
| Walkthrough video      | [Watch the walkthrough video (Google Drive)](https://drive.google.com/drive/u/0/folders/1oUte-XhhhXmE4lsA3n31Zz6of5Jzyi9F) |
| Technical report       | [Read the technical report (Google Drive)](https://drive.google.com/drive/u/0/folders/1oUte-XhhhXmE4lsA3n31Zz6of5Jzyi9F)   |
| Technical requirements | [Software, frameworks, services and hardware](docs/technical/technical-requirements.md)                                    |
| Repository structure   | [What each folder and file is for](docs/technical/repository-structure.md)                                                 |
| Figma design           | [AKIBA Webapp design system](https://www.figma.com/design/cjQuqZfaA0Sbdi9uoWSoxX/AKIBA-Webapp?t=dxiKMRC5Uq64kzL3-0)        |
| Project documents      | [Roadmap, decision log and pilot guide](docs)                                                                              |

## Project overview

Kigali's tailors make beautiful, made-to-measure clothes, but their work is hard to find online and buyers rarely see who made a garment or why. AKIBA gives each garment its own story page, linked to a verified tailor, so buyers can discover local makers and contact them directly. AKIBA is a showcase, not a shop: it takes no payments and no commission.

### Who uses it

| Role   | What they do                                            |
| ------ | ------------------------------------------------------- |
| Buyer  | Discovers garments and requests them from tailors.      |
| Tailor | Shares garments, their stories and their shop location. |
| Admin  | Verifies tailors and approves garments.                 |

### How a garment moves through AKIBA

1. A tailor signs up with their phone number, confirms the SMS code and chooses a 5-digit PIN.
2. The admin verifies the tailor, recording the tailor association, the official who vouched, the workshop visit and the tailor's consent. The shop then goes public.
3. The tailor uploads a garment. The photos go straight from the phone to Cloudinary, and the tailor writes the story behind the piece.
4. The admin approves the garment, or sends it back with a reason. Any later edit goes back for review.
5. A buyer reads the story, saves it, and sends a request with their name, phone number, size and date needed.
6. The tailor gets an SMS with the buyer's details and calls them. They agree a fitting and a price, and the buyer pays the tailor directly.

## Installation

Check the [technical requirements](docs/technical/technical-requirements.md) first.

Most commands are the same on every system. Where they differ, there is a block for each one:

- **macOS:** use the Terminal app.
- **Linux:** use any terminal.
- **Windows:** use PowerShell, the default terminal in Windows 10 and 11. Command Prompt (cmd) alternatives are given where they differ.

### 0. Install the tools

You need Git and Node.js 24 or newer. The Supabase CLI comes with the project, so there is nothing else to install. Skip anything you already have; check with `git --version` and `node --version`.

macOS (with [Homebrew](https://brew.sh)):

```bash
brew install git node
```

Linux (Debian or Ubuntu; nvm installs a current Node.js):

```bash
sudo apt update && sudo apt install -y git curl
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.3/install.sh | bash
source ~/.bashrc
nvm install 24
```

Windows (PowerShell):

```powershell
winget install --id Git.Git -e
winget install --id OpenJS.NodeJS.LTS -e
```

Close and reopen the terminal afterwards so the new commands are found.

### 1. Clone and install

Same on macOS, Linux and Windows:

```bash
git clone https://github.com/kenchirchir/AKIBA.git
cd AKIBA
npm install
```

### 2. Create the online services

1. **Supabase:** create a new, empty project at [supabase.com/dashboard](https://supabase.com/dashboard). Under Authentication, Sign In / Providers, turn on **Phone**. To try AKIBA without real SMS, add test phone numbers with a fixed code there, for example `250780000001` with `123456`.
2. **Cloudinary:** create an account at [cloudinary.com](https://cloudinary.com).
3. **Africa's Talking** (optional): create an account and use the sandbox while testing. [Running the pilot](docs/OPERATIONS.md) explains how to connect it to Supabase for real sign-up codes.

### 3. Add environment variables

Copy the template to `.env.local`.

macOS and Linux:

```bash
cp .env.example .env.local
```

Windows (PowerShell):

```powershell
Copy-Item .env.example .env.local
```

Windows (Command Prompt):

```bat
copy .env.example .env.local
```

Make the `AUTH_PIN_PEPPER` secret with this command, the same on every system:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

Open `.env.local` in any text editor (for example `open -e .env.local` on macOS, `nano .env.local` on Linux, `notepad .env.local` on Windows) and fill it in:

| Variable                               | Where it comes from                                                                                                                      |
| -------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------- |
| `NEXT_PUBLIC_SUPABASE_URL`             | Supabase: **Connect**, then **Next.js**                                                                                                  |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Supabase: **Connect**, then **Next.js**                                                                                                  |
| `SUPABASE_SECRET_KEY`                  | Supabase: **Project Settings**, **API Keys**, **Secret keys**. Server only: never share it or put it in code                             |
| `AUTH_PIN_PEPPER`                      | A long random secret, made with `openssl rand -base64 32`. Use the same value everywhere and never change it once tailors have signed up |
| `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME`    | Cloudinary: **Settings**, **API Keys**, the cloud name at the top                                                                        |
| `CLOUDINARY_API_KEY`                   | Cloudinary: **Settings**, **API Keys**                                                                                                   |
| `CLOUDINARY_API_SECRET`                | Cloudinary: **Settings**, **API Keys**, next to the API key. Server only: never share it or put it in code                               |
| `AFRICASTALKING_USERNAME`              | Africa's Talking: `sandbox` while testing, then your app's username for real SMS. Leave empty to keep SMS in test mode                   |
| `AFRICASTALKING_API_KEY`               | Africa's Talking: **Settings**, **API Key** (sandbox and live keys differ). Server only: never share it or put it in code                |
| `AFRICASTALKING_SENDER_ID`             | Optional. An approved sender name such as `AKIBA`. Leave empty in the sandbox                                                            |
| `SUPABASE_SMS_HOOK_SECRET`             | Supabase: **Authentication**, **Hooks**, the secret of the Send SMS hook. Only needed for real sign-up codes                             |

Never commit `.env.local`, and never change `AUTH_PIN_PEPPER` once tailors have signed up: their PINs would stop working.

### 4. Create the database

Same on macOS, Linux and Windows:

```bash
npx supabase login
npx supabase link --project-ref <your-project-ref>
npm run db:push
```

This applies the tables and security rules in `supabase/migrations`.

### 5. Try it with a test phone number

There is no sample data: the pilot starts with real tailors only. To try the tailor side, run the app (step 6), open `/join` and sign up with one of the test numbers from step 2, for example `0780000001`, and its fixed code.

### 6. Run

Same on macOS, Linux and Windows:

```bash
npm run dev
```

Open <http://localhost:3000>.

### Making yourself the admin

Same on macOS, Linux and Windows:

```bash
npm run make-admin -- 0780000002
```

Use your own number. Then open `/login`, tap **Forgot PIN?**, enter the number and the SMS code, and choose a PIN. You will land on the admin pages. Only one admin is planned, so the script takes the role away from any other account.

## Running the tests

Same on macOS, Linux and Windows:

```bash
npm test                  # unit tests (Vitest)
npx tsc --noEmit          # TypeScript
npm run lint              # ESLint
npm run format:check      # Prettier
npm run check:security    # 57 database security checks
npx playwright install chromium
npm run test:e2e          # builds the app and runs the browser and accessibility tests
```

To run the browser tests against the live site:

macOS and Linux:

```bash
npm run test:live
```

Windows (PowerShell):

```powershell
$env:E2E_BASE_URL = "https://akiba-seven.vercel.app"; npx playwright test
```

The first four checks run on every push and pull request through GitHub Actions (`.github/workflows/checks.yml`). The security checks and browser tests need the database keys, so they run on a developer's machine. The browser tests create their own temporary tailors and admin and delete them afterwards. Test results against the evaluation metrics are in the technical report.

## Requirements traceability

The requirements come from the research proposal. Where the build differs, the decision is recorded in [DECISIONS.md](docs/DECISIONS.md) (D1 to D5).

| Req.                                              | Where it is implemented                                                                                                                                      |
| ------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| FR1 Tailor account and sign-in                    | `/join`, `/login`, `src/lib/auth/actions.ts`. Phone number, SMS code and 5-digit PIN; the admin uses the same login                                          |
| FR2 Tailor profile                                | `/shop/profile`, `src/lib/profile/actions.ts`: shop name, district and sector in Kigali, years of experience and type of tailoring                           |
| FR3 Upload garments with phone photos             | `/shop/upload`, `src/components/shop/photo-picker.tsx`, `src/lib/cloudinary.ts`. One to five photos, shrunk on the phone                                     |
| FR4 Write and publish the garment's story         | `src/components/shop/garment-form.tsx`, `src/lib/shop/actions.ts`. Published after the admin approves it                                                     |
| FR5 Browse and search by place, technique, fabric | `/garments`, `/tailors`, the header search, `src/lib/discover/search.ts`. Filters for district, sector, type of tailoring, experience and material           |
| FR6 Story with the tailor's profile               | `/garments/[id]` with its maker card, linked to `/tailors/[id]`                                                                                              |
| FR7 Appreciate, save and comment                  | Save hearts on garments and tailors, kept on the phone (`src/lib/discover/saved.ts`). Saving counts as appreciation; no comments in the pilot (D3)           |
| FR8 Contact the tailor from a garment             | The request sheet on `/garments/[id]` and `src/lib/requests/actions.ts`. Requests replace message threads (D1)                                               |
| FR9 Verify tailors and review content             | `/admin/tailors/[id]`, `/admin/garments`, `src/lib/admin/actions.ts`                                                                                         |
| FR10 Record views, reading time and contacts      | `/api/events`, `src/lib/discover/track.ts`. Shown in `/admin/report` with CSV downloads, and garment views on the tailor's My shop page                      |
| FR11 Tailor reads and answers contacts            | `/shop/requests`: call the buyer and mark the request as ordered (D1)                                                                                        |
| FR12 Newest first, unread marked                  | `/shop/requests`: newest first, All and Unread tabs and an unread count                                                                                      |
| NFR1 Usability                                    | Phone and PIN instead of passwords, one task per screen, plain words, and forms that say what is missing                                                     |
| NFR2 Performance                                  | Photos shrunk to 1600 pixels before upload and served at the right size by Cloudinary. Story pages measured on 3G in [DECISIONS.md](docs/DECISIONS.md)       |
| NFR3 Availability                                 | Managed hosting on Vercel and Supabase. `npm run test:live` checks the live site                                                                             |
| NFR4 Security                                     | Row-level security and column grants on every table, server-only secrets, signed uploads into the tailor's own folder, PIN lockout. `npm run check:security` |
| NFR5 Works on low-cost phones                     | Phone-first layouts, strong colour contrast, axe accessibility tests, and no sideways scrolling from 375 to 1440 pixels                                      |
| NFR6 Tailors own their stories                    | Tailors edit or delete garments at any time; deleting the account removes the shop and everything in it (`/shop/profile/delete`)                             |
| NFR7 Privacy of contacts                          | Only the tailor who receives a request can read it; not even the admin can                                                                                   |
| NFR8 Fast delivery of contacts                    | The tailor's SMS alert is sent as soon as a request is saved (`src/lib/sms.ts`), instead of message threads (D1)                                             |

## Deployment

1. Import the repository into [Vercel](https://vercel.com).
2. Add the variables from `.env.example` in the Vercel project settings, for Production. Mark the secret ones as Sensitive.
3. In Supabase, add a **Send SMS** hook pointing to `https://<your-domain>/api/auth/sms-hook` so sign-up and PIN-reset codes go through Africa's Talking.
4. Redeploy after changing any variable, then run the browser tests against the live site.

[Running the pilot](docs/OPERATIONS.md) covers the full checklist, including SMS and participant links.

Kenneth Chirchir · Supervisor: Simeon Nsabiyumva
