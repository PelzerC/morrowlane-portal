import { listRequests } from "../../../lib/store";
import { summarize } from "../../../lib/summary";

export const dynamic = "force-dynamic";

// GET /api/summary — numbers for the three tiles.
export async function GET() {
  try {
    const requests = await listRequests();
    return Response.json(summarize(requests), { status: 200 });
  } catch (error) {
    console.error("GET /api/summary failed:", error);
    return Response.json(
      { error: "Could not load the summary. Please try again." },
      { status: 500 }
    );
  }
}
