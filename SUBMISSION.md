# Module 3 Playbook Submission — Service Request Portal

**Name:** [YOUR NAME]
**Live URL:** [YOUR NETLIFY URL]
**Repo:** [YOUR GITHUB REPO URL]

## What I built

I finished the Morrowlane Service Request Portal, a single web page where our Workplace Coordinators log facility requests for Minneapolis, Chicago, Denver, and Austin and see every request in one shared table. Coordinators can submit a request, change its status from New to In Progress to Complete, and download everything as a spreadsheet-ready CSV file. Three tiles at the top show how many requests are open, how many open requests are urgent, and how many were completed in the most recent month. The app checks every entry before saving it and explains what to fix if something is missing or invalid. Requests are stored in an online database, so nothing is lost when the page is refreshed or the site is updated.

## Debug Log

**Symptom:** On my laptop, submitting a new request worked: it appeared at the top of the table and the tiles updated. On the live Netlify site, the table and tiles loaded the 22 starter requests, but when I submitted a new request I got the red message "[PASTE THE EXACT MESSAGE YOU SAW]", and the browser console showed `POST /api/requests` returning **[STATUS CODE, e.g. 500]**. Changing a status in the table failed the same way. Nothing I submitted on the live site was kept after a refresh.

**What I asked Claude:**

> [PASTE THE EXACT PROMPT YOU SENT. Suggested wording: "I deployed the Morrowlane portal to Netlify at [URL]. **What I did:** I submitted a valid request (Jordan Testcase, Austin, 'Test entry', High) on the live site. **What I expected:** it to appear at the top of the table, like it does on my laptop. **What happened:** the form showed '[exact message]' and the console shows POST /api/requests [status code]. The Netlify function log says: '[paste log line]'. Why does this work locally but not on Netlify? Explain the root cause before changing any code."]

**Root cause:** The app was saving new requests by writing them into a file inside the project (`data/seed-requests.csv`). That works on my laptop because the file is on my own hard drive. On Netlify, the back end runs on temporary servers that start up on demand and treat the project's files as read-only. Reading the starter file still worked, which is why the table loaded, but writing to it failed [Netlify's log said: PASTE THE LOG LINE, e.g. "EROFS: read-only file system"]. Even if a write had succeeded, it would have been lost the next time Netlify started a fresh server or I redeployed. A file inside the code is not a place to keep data on a live site.

**Fix:** I moved the data into a hosted Supabase database. I created a Supabase project and ran a SQL script (`supabase/setup.sql`) that creates a `requests` table with the same columns as the CSV plus an id, with the same allowed locations, priorities, and statuses. The script also imports the 22 starter requests. I asked Claude to change the storage code so the app uses Supabase whenever the `SUPABASE_URL` setting exists and still uses the CSV file on my laptop otherwise. I added `SUPABASE_URL` and `SUPABASE_SECRET_KEY` as environment variables in Netlify, so the secret key never appears in my code or on GitHub, and redeployed.

**Verification:** On the live site I submitted a new fictional request, saw it at the top of the table, and refreshed the page. It was still there. I opened the `requests` table in Supabase's Table Editor and found the same row with the same name, location, description, priority, and status "New". I also changed that row's status to Complete on the live site, refreshed, and confirmed the change was saved in Supabase. [ADD ANYTHING ELSE YOU CHECKED]

## Test pass results

| # | Check | What I did | Result | Fix made |
|---|---|---|---|---|
| 1 | Valid entry | Submitted "Jordan Testcase", Austin, "TEST – projector in room 3 flickers", High, then refreshed the page. | [Pass/Fail — e.g. Pass: saved, shown at the top with status New, still there after refresh and in Supabase] | [e.g. None needed (after the Supabase fix)] |
| 2 | Empty form | Clicked Submit request with every field blank. | [e.g. Pass: nothing saved; message "Requester name, Location, Description and Priority are required."] | [None needed] |
| 3 | Duplicate-ish | Submitted the exact same request twice in a row. | [e.g. Both copies were saved as separate rows with different ids.] | [e.g. None. Two coordinators may genuinely report the same issue, so I kept this and listed it as a known limitation.] |
| 4 | Absurd values | Pasted a 150-character requester name; tried a description that was only spaces. | [e.g. Pass: "Requester name must be 100 characters or fewer (it is 150)." and "Description is required." Nothing saved.] | [None needed] |
| 5 | Hand-checked tile math | Exported the CSV, opened it in a spreadsheet, and counted rows by status, priority, and month by hand. Compared with the three tiles. | [e.g. Pass: my counts of X open / Y urgent open / Z completed this month matched the tiles.] | [None needed] |

## Known limitations

- There is no login, so anyone who has the link can view, submit, and change requests.
- Duplicate requests are not blocked; the same request submitted twice is saved twice.
- Requests can't be edited or deleted from the page. Only the status can be changed.
- "Completed this month" counts the month of the newest request, not today's month. As soon as a new request comes in during a new month, the tile can drop to 0 until something from that month is completed.
- Dates are stored in UTC, so a request entered late in the evening may show the next day's date in the table.

## Assessment

[Draft: rewrite this in your own words and voice.]

AI moved fastest on the parts that followed a clear spec. Because the starter README described exactly which five endpoints the page called and what each should return, Claude built the list, summary, save, status-update, and export endpoints in one pass. They worked the first time I loaded the page, with the table filling and the tiles showing 9, 2, and 5. It also caught something I wouldn't have: some descriptions contain commas inside quotes, so a simple "split on commas" approach would have pushed those rows' values into the wrong columns.

My genuine almost-right moment came right after the first successful save. I added a test request and the "Completed this month" tile dropped from 5 to 0. It looked like the save had broken the math. When I checked the rule in the README, the tile counts completed requests in the month of the newest request, and my test entry was dated November, a month with nothing completed. So the number was technically correct but misleading, and I only understood it by recalculating by hand from the source data instead of trusting the screen.

The bigger lesson was deployment: everything worked on my laptop and failed on Netlify, because a file inside the code isn't permanent storage on a live site. Next time I'd ask up front, "Where will this data live once it's deployed, and will it survive a refresh and a redeploy?" I'd also give Claude my three-part bug report (what I did, what I expected, what happened) from the start instead of describing the problem loosely.
