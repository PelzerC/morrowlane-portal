// Supabase storage (used on the live site). Talks to the "requests" table
// through Supabase's REST API. The URL and secret key come from environment
// variables set in Netlify — they are never written in the code or committed.

function settings() {
  const url = process.env.SUPABASE_URL;
  const key =
    process.env.SUPABASE_SECRET_KEY ||
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.SUPABASE_ANON_KEY;
  if (!url || !key) {
    throw new Error("SUPABASE_URL and SUPABASE_SECRET_KEY must both be set.");
  }
  return { url: url.replace(/\/+$/, ""), key };
}

async function supabase(pathAndQuery, { method = "GET", body } = {}) {
  const { url, key } = settings();
  const headers = {
    apikey: key,
    "Content-Type": "application/json",
    Prefer: "return=representation",
  };
  // Older (legacy) keys are JWTs and also go in the Authorization header.
  // The newer sb_secret_... keys only go in the apikey header.
  if (key.startsWith("eyJ")) {
    headers.Authorization = `Bearer ${key}`;
  }

  const response = await fetch(`${url}/rest/v1/${pathAndQuery}`, {
    method,
    headers,
    body: body === undefined ? undefined : JSON.stringify(body),
    cache: "no-store",
  });

  const text = await response.text();
  if (!response.ok) {
    throw new Error(`Supabase ${method} ${pathAndQuery} failed (${response.status}): ${text}`);
  }
  return text ? JSON.parse(text) : null;
}

// Keep timestamps in the same "2026-08-28T17:45:00Z" style as the seed data.
function clean(row) {
  const date = new Date(row.created_at);
  return {
    id: Number(row.id),
    created_at: isNaN(date.getTime())
      ? row.created_at
      : date.toISOString().replace(/\.\d{3}Z$/, "Z"),
    requester_name: row.requester_name,
    location: row.location,
    description: row.description,
    priority: row.priority,
    status: row.status,
  };
}

export async function listRequests() {
  const rows = await supabase("requests?select=*&order=created_at.desc,id.desc");
  return rows.map(clean);
}

export async function createRequest(fields) {
  const rows = await supabase("requests", {
    method: "POST",
    body: {
      requester_name: fields.requester_name,
      location: fields.location,
      description: fields.description,
      priority: fields.priority,
      status: "New",
    },
  });
  return clean(rows[0]);
}

export async function updateRequestStatus(id, status) {
  const rows = await supabase(`requests?id=eq.${encodeURIComponent(id)}`, {
    method: "PATCH",
    body: { status },
  });
  return rows.length > 0 ? clean(rows[0]) : null;
}
