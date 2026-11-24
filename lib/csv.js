// Small CSV helpers. Some descriptions contain commas inside quotes
// (e.g. "Water leak under the breakroom sink, floor 6"), so a plain
// split(",") would shift those rows' columns. This parser handles quotes.

export function parseCsv(text) {
  const rows = [];
  let row = [];
  let field = "";
  let inQuotes = false;

  for (let i = 0; i < text.length; i++) {
    const char = text[i];

    if (inQuotes) {
      if (char === '"') {
        if (text[i + 1] === '"') {
          field += '"';
          i++;
        } else {
          inQuotes = false;
        }
      } else {
        field += char;
      }
    } else if (char === '"') {
      inQuotes = true;
    } else if (char === ",") {
      row.push(field);
      field = "";
    } else if (char === "\n" || char === "\r") {
      if (char === "\r" && text[i + 1] === "\n") i++;
      row.push(field);
      rows.push(row);
      row = [];
      field = "";
    } else {
      field += char;
    }
  }

  if (field !== "" || row.length > 0) {
    row.push(field);
    rows.push(row);
  }

  // Drop completely empty lines.
  const nonEmpty = rows.filter((r) => !(r.length === 1 && r[0] === ""));
  if (nonEmpty.length === 0) return [];

  const [header, ...dataRows] = nonEmpty;
  return dataRows.map((values) => {
    const record = {};
    header.forEach((column, index) => {
      record[column.trim()] = values[index] ?? "";
    });
    return record;
  });
}

function escapeField(value, forSpreadsheet) {
  let text = value === null || value === undefined ? "" : String(value);
  // In exports, stop spreadsheet apps from treating text like "=SUM(...)"
  // as a formula. (Not applied to the app's own data file.)
  if (forSpreadsheet && /^[=+\-@]/.test(text)) {
    text = "'" + text;
  }
  if (/[",\r\n]/.test(text)) {
    return '"' + text.replace(/"/g, '""') + '"';
  }
  return text;
}

export function toCsv(columns, records, { forSpreadsheet = false } = {}) {
  const lines = [columns.join(",")];
  for (const record of records) {
    lines.push(columns.map((column) => escapeField(record[column], forSpreadsheet)).join(","));
  }
  return lines.join("\n") + "\n";
}
