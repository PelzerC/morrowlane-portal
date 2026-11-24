// The three numbers shown in the tiles at the top of the page.

export function summarize(requests) {
  const open = requests.filter((r) => r.status !== "Complete");

  // "This month" means the month of the most recent request in the data,
  // not today's month, so the tile stays meaningful whenever the app runs.
  // Months are compared in UTC because the stored timestamps are UTC ("Z").
  let latest = null;
  for (const r of requests) {
    const t = new Date(r.created_at);
    if (!isNaN(t.getTime()) && (latest === null || t > latest)) latest = t;
  }

  const completed_this_month = latest
    ? requests.filter((r) => {
        if (r.status !== "Complete") return false;
        const t = new Date(r.created_at);
        return (
          t.getUTCFullYear() === latest.getUTCFullYear() &&
          t.getUTCMonth() === latest.getUTCMonth()
        );
      }).length
    : 0;

  return {
    open_requests: open.length,
    urgent_open: open.filter((r) => r.priority === "Urgent").length,
    completed_this_month,
  };
}
