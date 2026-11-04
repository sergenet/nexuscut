import { FileBlob, SpreadsheetFile } from "@oai/artifact-tool";
import fs from "node:fs/promises";

const input = await FileBlob.load("C:/NexusCut/Testers/report 1.xlsx");
const workbook = await SpreadsheetFile.importXlsx(input);

for (const request of [
  { kind: "workbook,sheet,table", maxChars: 12000, tableMaxRows: 20, tableMaxCols: 12, tableMaxCellChars: 300 },
  { kind: "drawing", maxChars: 12000, options: { maxResults: 100 } },
  { kind: "match", searchTerm: "https?://", options: { useRegex: true, maxResults: 100 }, maxChars: 12000 },
]) {
  const result = await workbook.inspect(request);
  console.log(result.ndjson);
}

const preview = await workbook.render({ sheetName: "Sheet1", range: "A1:D39", scale: 1.5, format: "png" });
await fs.writeFile("C:/NexusCut/tmp/spreadsheets/report-1-review/sheet1.png", new Uint8Array(await preview.arrayBuffer()));
