import { listRequests } from "../../../lib/store";
import { toCsv } from "../../../lib/csv";

export const dynamic = "force-dynamic";

const EXPORT_COLUMNS = [
  "id",
  "created_at",
  "requester_name",
  "location",
  "description",
  "priority",
  "status",
];

// GET /api/export — all requests, newest first, as a downloadable CSV.
export async function GET() {
  try {
    const requests = await listRequests();
    const csv = toCsv(EXPORT_COLUMNS, requests, { forSpreadsheet: true });
    return new Response(csv, {
      status: 200,
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": 'attachment; filename="morrowlane-requests.csv"',
        "Cache-Control": "no-store",
      },
    });
  } catch (error) {
    console.error("GET /api/export failed:", error);
    return Response.json(
      { error: "Could not export requests. Please try again." },
      { status: 500 }
    );
  }
}
