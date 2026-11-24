// File storage (used on your own computer when no Supabase settings exist).
//
// Current storage: the CSV file data/seed-requests.csv on disk.
// Rows have no id column, so a request's id is its position in the file
// (first data row = 1). New requests are appended to the end of the file.

import { promises as fs } from "fs";
import path from "path";
import { parseCsv, toCsv } from "./csv";

const DATA_FILE = path.join(process.cwd(), "data", "seed-requests.csv");
const FILE_COLUMNS = [
  "created_at",
  "requester_name",
  "location",
  "description",
  "priority",
  "status",
];

async function readRows() {
  const text = await fs.readFile(DATA_FILE, "utf8");
  return parseCsv(text).map((row, index) => ({ id: index + 1, ...row }));
}

async function writeRows(rows) {
  await fs.writeFile(DATA_FILE, toCsv(FILE_COLUMNS, rows), "utf8");
}

// Newest first. Ties (same timestamp) fall back to the higher id first.
function newestFirst(a, b) {
  const diff = new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
  return diff !== 0 ? diff : b.id - a.id;
}

export async function listRequests() {
  const rows = await readRows();
  return rows.sort(newestFirst);
}

export async function createRequest(fields) {
  const rows = await readRows();
  const request = {
    id: rows.length + 1,
    created_at: new Date().toISOString().replace(/\.\d{3}Z$/, "Z"),
    requester_name: fields.requester_name,
    location: fields.location,
    description: fields.description,
    priority: fields.priority,
    status: "New",
  };
  rows.push(request);
  await writeRows(rows);
  return request;
}

// Returns the updated request, or null if no request has that id.
export async function updateRequestStatus(id, status) {
  const rows = await readRows();
  const request = rows.find((row) => row.id === id);
  if (!request) return null;
  request.status = status;
  await writeRows(rows);
  return request;
}
