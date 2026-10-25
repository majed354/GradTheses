import { readFile, writeFile, mkdir } from "node:fs/promises";
import { join } from "node:path";

// Input is a read-only export of the supplied supervision sheet. Output stays
// outside Git: it contains migration provenance and is imported into SharePoint.
const inputDir = process.argv[2] || "artifacts/import-source";
const { values }: { values: unknown[][] } = JSON.parse(
  await readFile(join(inputDir, "theses.json"), "utf8"),
);
const faculty: Record<string, { name: string }> = JSON.parse(
  await readFile(join(inputDir, "faculty-resolved.json"), "utf8"),
);
const headers = values[0].map(String);
const clean = (v: unknown) =>
  String(v ?? "")
    .trim()
    .replace(/\s+/g, " ");
const supervisorName = (value: unknown) => {
  const key = clean(value);
  return faculty[key]?.name || (/^\d+$/.test(key) ? "" : key);
};
const audit: { sourceId: string; issue: string; original?: string }[] = [];
const used = new Set<string>();
const titles = new Map<string, string>();
const rows = values
  .slice(1)
  .filter((r: unknown[]) => r.some(Boolean))
  .map((r: unknown[], i: number) => {
    const source = Object.fromEntries(headers.map((h, j) => [h, clean(r[j])]));
    if (!/^\d+$/.test(source.id) || used.has(source.id))
      throw new Error("Invalid or duplicate source ID");
    used.add(source.id);
    const year = Number(source.year);
    if (!Number.isInteger(year) || year < 1300 || year > 1600)
      throw new Error("Unexpected Hijri year");
    if (
      !["ماجستير", "دكتوراه"].includes(source.type) ||
      !source.title ||
      !source.student_name ||
      !source.department
    )
      throw new Error(`Incomplete source record ${source.id}`);
    const statuses: Record<string, string> = {
      منجزة: "مكتمل",
      جارية: "قيد الإعداد",
      "غير محدد": "غير محدد",
    };
    if (!statuses[source.status])
      throw new Error(`Unknown status ${source.id}`);
    const author = source.student_name.replace(/^قسم شريعة\s+/, "");
    if (author !== source.student_name)
      audit.push({
        sourceId: source.id,
        issue: "Removed department prefix from student name",
        original: source.student_name,
      });
    const supervisor = supervisorName(source.supervisor_id);
    if (!supervisor)
      audit.push({ sourceId: source.id, issue: "Supervisor name unavailable" });
    if (titles.has(source.title))
      audit.push({
        sourceId: source.id,
        issue: `Same title as ${titles.get(source.title)}; distinct source records retained`,
      });
    titles.set(source.title, source.id);
    if (
      source.department === "الشريعة" &&
      ["قراءات", "دراسات قرآنية"].includes(source.specialization)
    )
      audit.push({
        sourceId: source.id,
        issue: "Review department/specialization combination; source retained",
      });
    return {
      Title: source.title,
      ThesisId: `gt-${source.id.padStart(4, "0")}`,
      AuthorName: author,
      SupervisorName: supervisor,
      CoSupervisorName: supervisorName(source.co_supervisor_id),
      Department: source.department,
      Specialization: source.specialization,
      Degree: source.type,
      WorkType: "غير محدد",
      Year: year,
      YearCalendar: "hijri",
      AcademicStatus: statuses[source.status],
      AbstractText: "",
      KeywordsText: "",
      PageCount: "",
      AccessLevel: "metadata",
      EmbargoUntil: "",
      PublicationStatus: "Published",
      ReadingUrl: "",
      SourceRecordId: source.id,
      SourceRow: i + 2,
      DefenseDateHijri: source.defense_date,
    };
  });
if (rows.length !== 509)
  throw new Error(`Unexpected source count: ${rows.length}`);
await mkdir(inputDir, { recursive: true });
await writeFile(
  join(inputDir, "catalog-rows.json"),
  JSON.stringify(rows, null, 2) + "\n",
);
await writeFile(
  join(inputDir, "migration-audit.json"),
  JSON.stringify(
    {
      source:
        "https://docs.google.com/spreadsheets/d/1UUfbmn5LkDSLpUxDCZS6D33HVuPjkRfnwi67CEKWGS0/edit",
      sheet: "theses",
      records: rows.length,
      calendar: "hijri",
      filesAvailable: 0,
      supervisorsAvailable: rows.filter((r) => r.SupervisorName).length,
      issues: audit,
    },
    null,
    2,
  ) + "\n",
);
console.log(
  JSON.stringify({
    records: rows.length,
    supervisorsAvailable: rows.filter((r) => r.SupervisorName).length,
    auditIssues: audit.length,
    readingLinks: 0,
  }),
);
