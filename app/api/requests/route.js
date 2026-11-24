import { listRequests, createRequest } from "../../../lib/store";
import { validateNewRequest } from "../../../lib/validation";

export const dynamic = "force-dynamic";

// GET /api/requests — every request, newest first.
export async function GET() {
  try {
    const requests = await listRequests();
    return Response.json({ requests }, { status: 200 });
  } catch (error) {
    console.error("GET /api/requests failed:", error);
    return Response.json(
      { error: "Could not load requests. Please try again." },
      { status: 500 }
    );
  }
}

// POST /api/requests — validate and save a new request.
export async function POST(request) {
  let body;
  try {
    body = await request.json();
  } catch {
    return Response.json(
      { error: "The request body must be valid JSON." },
      { status: 400 }
    );
  }

  const result = validateNewRequest(body);
  if (result.error) {
    return Response.json({ error: result.error }, { status: 400 });
  }

  try {
    const saved = await createRequest(result.value);
    return Response.json({ request: saved }, { status: 201 });
  } catch (error) {
    console.error("POST /api/requests failed:", error);
    return Response.json(
      { error: "Could not save the request. Please try again." },
      { status: 500 }
    );
  }
}
