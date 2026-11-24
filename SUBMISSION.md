# Module 3 Playbook Submission — Service Request Portal

**Name:** Cole Pelzer
**Live URL:** https://morrowlane-portal-pelzerc.netlify.app/
**Repo:** https://github.com/PelzerC/morrowlane-portal/tree/main

## What I built

I finished the Morrowlane Service Request Portal, a single web page where our Workplace Coordinators log facility requests for Minneapolis, Chicago, Denver, and Austin and see every request in one shared table. Coordinators can submit a request, change its status from New to In Progress to Complete, and download everything as a spreadsheet-ready CSV file. Three tiles at the top show how many requests are open, how many open requests are urgent, and how many were completed in the most recent month. The app checks every entry before saving it and explains what to fix if something is missing or invalid. Requests are stored in an online database, so nothing is lost when the page is refreshed or the site is updated.

## Debug Log

**Symptom:** On my laptop, submitting a new request worked: it appeared at the top of the table and the tiles updated. On the live Netlify site (https://morrowlane-portal-pelzerc.netlify.app/), the table and tiles still loaded the 22 starter requests, but when I submitted a valid request the form showed "Could not save the request. Please try again." The browser console showed `POST https://morrowlane-portal-pelzerc.netlify.app/api/requests 500 (Internal Server Error)`. Reading data worked; only saving failed.

**What I asked Claude:**

> I deployed the Morrowlane portal to Netlify at https://morrowlane-portal-pelzerc.netlify.app/. What I did: I submitted a valid request (Jordan Testcase, Austin, High) on the live site. What I expected: it to appear at the top of the table, like it does locally. What happened: the form showed "Could not save the request. Please try again." and the console shows POST https://morrowlane-portal-pelzerc.netlify.app/api/requests 500 (Internal Server Error). The Netlify function log says: I was not able to find the logs on Netlify as I have the free version. Why does this work locally but not on Netlify? Explain the root cause before changing any code.

**Root cause:** The app saved new requests by writing them into a file inside the project (`data/seed-requests.csv`). That works on my laptop because the file is on my own hard drive. On Netlify, the back end runs on temporary servers that start up on demand and treat the project's files as read-only. Reading the file still worked, which is why the table and tiles loaded, but writing to it was refused, so the server returned a 500 error. I couldn't open Netlify's function logs on the free plan, but the pattern of reads working and only saves failing pointed to the server being unable to write the file. Even if a write had worked, it would have been lost whenever Netlify started a fresh server or I redeployed. A file inside the code is not permanent storage on a live site.

**Fix:** I moved the data into a hosted Supabase database. I created a Supabase project and ran a SQL script (`supabase/setup.sql`) in the SQL Editor. It created a `requests` table with the same columns as the CSV plus an id, enforced the same allowed locations, priorities, and statuses, turned on Row Level Security, and imported the 22 starter requests. I asked Claude to change the storage code so the app uses Supabase whenever the `SUPABASE_URL` setting exists, and still uses the CSV file locally otherwise. In Netlify, I added `SUPABASE_URL` and `SUPABASE_SECRET_KEY` as environment variables (the key marked as a secret value), so the secret key never appears in my code or on GitHub. Then I uploaded the updated code to GitHub, which redeployed the site.

**Verification:** On the live site, the table and tiles loaded from Supabase (22 requests; 9 open / 2 urgent open / 5 completed). I submitted a new fictional request (Jordan Testcase, Austin, High). It appeared at the top with status "New" and was still there after I refreshed the page. In Supabase's Table Editor, the same row appeared as id 23. I then changed its status to Complete on the live site, refreshed, and confirmed that both the site and Supabase showed "Complete." New entries now stay saved online.

## Test pass results

| # | Check | What I did | Result | Fix made |
|---|---|---|---|---|
| 1 | Valid entry | Submitted a complete fictional request on the live site, refreshed the page, then checked the `requests` table in Supabase. | Pass. It saved and appeared at the top with status "New", was still there after refresh, and the same row was in Supabase. | None needed (after the Supabase fix in the debug log). |
| 2 | Empty form | Clicked "Submit request" with every field blank. | Pass. Nothing saved; the form showed "Requester name, Location, Description and Priority are required." | None needed. |
| 3 | Duplicate-ish | Submitted the exact same request twice in a row. | Both entries saved as separate rows with different ids. | None. Two coordinators may genuinely report the same issue, so I kept this behavior and listed it under Known limitations. |
| 4 | Absurd values | Pasted a 241-character requester name; separately, entered a description made only of spaces. | Pass. "Requester name must be 100 characters or fewer (it is 241)." and "Description is required." Nothing saved. | None needed. |
| 5 | Hand-checked tile math | Exported the CSV, opened it in a spreadsheet, and counted by hand: requests not Complete, urgent requests among those, and Complete requests in the same month as the newest request. Compared with the three tiles. | Pass. My hand counts matched all three tiles. | None needed. |

## Known limitations

- There is no login, so anyone who has the link can view, submit, and change requests.
- Duplicate requests are not blocked; the same request submitted twice is saved twice.
- Requests can't be edited or deleted from the page. Only the status can be changed.
- "Completed this month" counts the month of the newest request, not today's month. As soon as a new request comes in during a new month, the tile can drop to 0 until something from that month is completed.
- Dates are stored in UTC, so a request entered late in the evening may show the next day's date in the table.

## Assessment

AI was fastest when the instructions were clear. The starter project explained exactly what the page needed from the back end. Claude built all five parts in one try, and they worked right away. The table filled with requests, and the three tiles showed 9, 2, and 5. I counted the data myself and got the same numbers. Claude also noticed a problem I would have missed: some descriptions had commas in them, which could have mixed up the columns.

One result looked wrong but wasn’t. After I added a test request, the “Completed this month” tile changed from 5 to 1. At first I thought the app was broken. Then I read the rule: the tile counts completed requests in the month of the newest request. My test request was from November, so the tile started counting November instead of August. The number was correct, but it could confuse someone who doesn’t know the rule. I only trusted it after counting it myself from the exported file.

My biggest lesson came after I put the app online. It could show requests, but it couldn’t save new ones. The problem was that the app saved data in a file, and the live server doesn’t let you change files. Moving the data to a Supabase database fixed it.

Next time, I would ask early: “Where will the data be saved once the app is live?” I would also describe problems the same way every time: what I did, what I expected, and what happened. That got me a clear answer right away.
