import { readFile, writeFile } from "node:fs/promises";
import { parsePublication } from "../src/lib/publication";

const [input, output] = process.argv.slice(2);
if (!input || !output)
  throw new Error(
    "Usage: tsx scripts/prepare-publication.ts input.json output.json",
  );
const source = JSON.parse(await readFile(input, "utf8"));
if (!Array.isArray(source))
  throw new Error("Expected list of approved catalogue rows");
if (new Set(source.map((r) => r.ThesisId)).size !== source.length)
  throw new Error("Duplicate source IDs");
const allowed = [
  "ThesisId",
  "Title",
  "AuthorName",
  "SupervisorName",
  "CoSupervisorName",
  "Department",
  "Specialization",
  "ProgramName",
  "PublicSourceNote",
  "Degree",
  "WorkType",
  "Year",
  "YearCalendar",
  "AcademicStatus",
  "AbstractText",
  "AbstractKind",
  "KeywordsText",
  "PageCount",
  "AccessLevel",
  "EmbargoUntil",
  "PublicationStatus",
  "ReadingUrl",
  "DownloadBlocked",
  "FileStatus",
];
const publication = parsePublication({
  schemaVersion: 1,
  publishedAt: new Date().toISOString(),
  aliases: Object.fromEntries(
    source
      .filter((r) => r.MergedIntoThesisId)
      .map((r) => {
        if (r.PublicationStatus !== "Draft")
          throw new Error("Merged records must be archived as Draft");
        return [r.ThesisId, r.MergedIntoThesisId];
      }),
  ),
  rows: source
    .filter((r) => r.PublicationStatus === "Published")
    .map((r) =>
      Object.fromEntries(allowed.filter((k) => k in r).map((k) => [k, r[k]])),
    ),
});
await writeFile(output, JSON.stringify(publication) + "\n", { mode: 0o600 });
console.log(
  JSON.stringify({
    records: publication.rows.length,
    readable: publication.rows.filter((r) => r.AccessLevel === "university")
      .length,
    publishedAt: publication.publishedAt,
  }),
);
