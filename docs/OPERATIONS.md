# Running the AKIBA pilot

A practical guide for the researcher. The live site is <https://akiba-seven.vercel.app>.

## Logins

| Who                         | Where                    | How                                                                                                                                                                                                 |
| --------------------------- | ------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Admin (the researcher)      | `/login`                 | The same page as tailors: phone number and 5-digit PIN, then straight to `/admin`. Made with `npm run make-admin -- 0780000002`; the first PIN is set with "Forgot PIN?". Only one admin is planned |
| Tailors                     | `/login`                 | Rwandan phone number and 5-digit PIN. Tailors sign up themselves at `/join`                                                                                                                         |
| Buyers                      | No login                 | Buyers use the site without an account                                                                                                                                                              |
| Supabase test phone numbers | 0780000001 to 0780000003 | Fixed SMS code `123456`, set in Supabase until **31 January 2027**. 0780000001 is Kenneth's own tailor account and 0780000002 is the admin                                                          |

## Before the pilot starts

1. **SMS for request alerts.** Create an Africa's Talking account. Test first with the sandbox: in `.env.local` and in Vercel (Production, marked Sensitive) set `AFRICASTALKING_USERNAME=sandbox` and the sandbox `AFRICASTALKING_API_KEY`. Sandbox messages appear only in the Africa's Talking simulator. For real SMS, switch to the live app's username and API key, add credit, and ask Africa's Talking to approve the sender name `AKIBA` (`AFRICASTALKING_SENDER_ID`). Redeploy Vercel after changing variables.
2. **SMS for sign-up and PIN-reset codes.** These codes are sent by Supabase. Until now they only worked for the test numbers. To send them through Africa's Talking:
   1. In Supabase: Authentication, Hooks, add a **Send SMS** hook of type **HTTPS**, with the URL `https://akiba-seven.vercel.app/api/auth/sms-hook`. Supabase shows a secret starting `v1,whsec_`.
   2. Put that secret in Vercel as `SUPABASE_SMS_HOOK_SECRET` (Production, Sensitive) and in `.env.local`, then redeploy.
   3. Enable the hook, and sign up with a phone that is not a test number to check the code arrives.
      The hook needs Africa's Talking to be set up first; without it, codes cannot be sent.
3. **Turn on SMS alerts for tailors.** They are on by default; tailors can switch them off in Profile.
4. **Read the terms page** (`/terms`) with your supervisor, and adjust it if the ethics approval asks for different wording. The text lives in `messages/en.json` under `Terms`.
5. **Participant codes.** Decide a code for each buyer in the study (for example B01 to B30) and send each buyer their personal link: `https://akiba-seven.vercel.app/?p=B01`.

## During the pilot

- **Verify tailors.** Admin, Tailors, Waiting. Open the tailor, fill in the association, the official who vouched, the workshop visit date and the tailor's consent, then **Verify tailor**. The shop becomes public straight away.
- **Review garments.** Admin, Garments to review. **Approve** publishes the garment. **Not approved** sends it back with a reason the tailor sees on the garment's edit page.
- **Suspend a shop** if needed from the tailor's admin page. Its page and garments disappear straight away.
- **Follow the data.** Admin, Research report. Download the participant and garment tables as CSV for the analysis.
- **Buyer requests are private.** The admin cannot read them, by design (ethical consideration 8).

## Checks before each change

```bash
npx tsc --noEmit
npm run lint
npm run format:check
npm test
npm run check:security
npm run test:e2e
```

After a deployment, `npm run test:live` runs the same browser tests against the live site. GitHub runs the first four after every push. The last two need the database keys, so they run on the Mac only. `npm run test:e2e` builds the app and creates and deletes its own temporary test tailors (0780000903 and 0780000904).

## When someone withdraws

- **A tailor** deletes their account in Profile, Delete account. This removes their shop, garments, photos, stories, requests and usage records.
- **A buyer or participant** asks by email or phone. In Supabase, delete their usage records by participant code (`analytics_events` where `participant_code` is their code) and any requests they sent, found by their phone number in `requests`.

## When the research ends

The ethics rules say the research data is deleted after the study. After exporting the final CSV files and storing them as the ethics approval says:

1. Delete all rows in `analytics_events`.
2. Ask tailors whether they want to keep their shop. Delete the accounts of those who do not (Supabase, Authentication, Users), which removes their shop and everything in it.
3. Delete photos left in Cloudinary under `akiba/` for deleted shops.
4. Remove the participant links from any shared documents.
