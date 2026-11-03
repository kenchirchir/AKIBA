export function toCsv(rows: Record<string, unknown>[]) {
  if (rows.length === 0) return "";

  const columns = Object.keys(rows[0]);
  const cell = (value: unknown) => {
    const text = value === null || value === undefined ? "" : String(value);
    return /[",\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
  };

  return [
    columns.join(","),
    ...rows.map((row) => columns.map((column) => cell(row[column])).join(",")),
  ].join("\n");
}
