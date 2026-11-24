// Where request data is kept. Every API route goes through these three
// functions, so the routes don't care where the data lives.
//
// - If SUPABASE_URL is set (the live Netlify site), use the Supabase database.
// - Otherwise (your own computer with no .env.local), use data/seed-requests.csv.
//
// Why: Netlify runs the app on temporary, read-only servers, so writing to a
// file there either fails or disappears. A hosted database keeps new entries.

import * as csvStore from "./store-csv";
import * as supabaseStore from "./store-supabase";

function activeStore() {
  return process.env.SUPABASE_URL ? supabaseStore : csvStore;
}

export function listRequests() {
  return activeStore().listRequests();
}

export function createRequest(fields) {
  return activeStore().createRequest(fields);
}

export function updateRequestStatus(id, status) {
  return activeStore().updateRequestStatus(id, status);
}
