// Prebuild script that converts top-level `feeds.csv` into JSON object whose
// keys are source names and values are icon URLs, saved to `src/app/feeds.json`
// for use in Next.js app.

import fs from "node:fs";
import path from "node:path";

/**
 * Parses CSV string and returns single Object whose keys are row fields under
 * `keyColHeader` and values are row fields under `valColHeader`.
 *
 * Each row in the CSV contributes a single key-value pair in the returned
 * Object (assuming no duplicate key fields).
 *
 * @param csv string representation of CSV file to parse
 * @param keyColHeader header of column used as keys in returned Object;
 *   defaults to "name"
 * @param valColHeader header of column used as values in returned Object;
 *   defaults to "icon"
 * @returns Object where each row in CSV represents one key-value pair
 */
function parseCSVAsObject(
  csv: string,
  keyColHeader: string = "name",
  valColHeader: string = "icon",
): Record<string, string> {
  const rows = csv.trim().split(/\r?\n/);

  const headers = rows[0].split(",");
  const keyColInd = headers.findIndex((header) => header === keyColHeader);
  const valColInd = headers.findIndex((header) => header === valColHeader);

  if (keyColInd === -1 || valColInd === -1) {
    throw Error(
      `keyColHeader "${keyColHeader}" or valColHeader "${valColHeader}" does not exist in feeds.csv`,
    );
  }

  const data = Object.fromEntries(
    rows.slice(1).map((row) => {
      const rowFields = row.split(",");
      return [rowFields[keyColInd], rowFields[valColInd]];
    }),
  );

  return data;
}

function main() {
  const csvPath = path.join(process.cwd(), "..", "feeds.csv");
  const outputPath = path.join(process.cwd(), "src", "app", "feeds.json");

  const file = fs.readFileSync(csvPath, "utf-8");
  const data = parseCSVAsObject(file);

  fs.writeFileSync(outputPath, JSON.stringify(data, null, 2));
}

main();
