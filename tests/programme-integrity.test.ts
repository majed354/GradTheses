import { test } from "node:test";
import assert from "node:assert/strict";
import { canRead, publicRecord } from "../src/lib/policy";
import { parsePublication } from "../src/lib/publication";
import { citation, filterTheses, yearLabel } from "../src/lib/search";

const sourceNote =
  "ورد في حصر الرسائل المسجلة حتى 1445هـ؛ سنة العمل وحالته الحالية غير موثقتين في هذا المصدر.";
const base: Record<string, unknown> = {
  ThesisId: "source-record-001",
  Title: "عنوان عمل وارد في الحصر",
  AuthorName: "باحث",
  SupervisorName: "مشرف",
  Department: "القراءات",
  Degree: "ماجستير",
  ProgramName: "ماجستير الدراسات القرآنية المعاصرة",
  WorkType: "غير محدد",
  Year: null,
  YearCalendar: "hijri",
  AcademicStatus: "غير محدد",
  AccessLevel: "metadata",
  PublicationStatus: "Published",
};
const bundle = (rows: Record<string, unknown>[]) => ({
  schemaVersion: 1,
  publishedAt: "2026-10-26T00:00:00Z",
  rows,
});

test("The four programmes retain their separate degree and cannot cross master's and doctorate records", () => {
  for (const [degree, program] of [
    ["ماجستير", "ماجستير الدراسات القرآنية المعاصرة"],
    ["دكتوراه", "دكتوراه الدراسات القرآنية"],
    ["ماجستير", "ماجستير القراءات"],
    ["دكتوراه", "دكتوراه القراءات"],
  ]) {
    const fields = { ...base, Degree: degree, ProgramName: program };
    const record = publicRecord(fields);
    assert.ok(record);
    assert.equal(record.program, program);
    assert.equal(record.department, "القراءات");
    assert.equal(record.degree, degree);
    assert.equal(record.kind, "غير محدد");
    assert.doesNotThrow(() => parsePublication(bundle([fields])));
    const oppositeDegree = degree === "ماجستير" ? "دكتوراه" : "ماجستير";
    const mismatch = { ...fields, Degree: oppositeDegree };
    assert.equal(publicRecord(mismatch), null);
    assert.throws(() => parsePublication(bundle([mismatch])));
  }
});

test("Missing programme evidence is never replaced by the department, specialisation or degree", () => {
  const record = publicRecord({
    ...base,
    ProgramName: undefined,
    Specialization: "دراسات قرآنية",
  });
  assert.ok(record);
  assert.equal(record.program, undefined);
  assert.equal(record.kind, "غير محدد");
  assert.deepEqual(
    filterTheses([record], { program: "ماجستير الدراسات القرآنية المعاصرة" }),
    [],
  );
  assert.equal(filterTheses([record], { program: "unknown" }).length, 1);
  assert.equal(publicRecord({ ...base, ProgramName: "ماجستير" }), null);
  assert.equal(
    publicRecord({ ...base, ProgramName: `ماجستير ${"س".repeat(161)}` }),
    null,
  );
});

test("A source cutoff of 1445 does not invent an individual year or current completion status", () => {
  for (const Year of [null, undefined, ""]) {
    const fields = {
      ...base,
      Year,
      PublicSourceNote: sourceNote,
      SourceCutoffYear: 1445,
      SourceDocuments: [{ cutoffYear: 1445, note: "PRIVATE-SOURCE-REGISTER" }],
    };
    const publication = parsePublication(bundle([fields]));
    const record = publicRecord(publication.rows[0]);
    assert.ok(record);
    assert.equal(record.year, null);
    assert.equal(record.status, "غير محدد");
    assert.equal(record.kind, "غير محدد");
    assert.equal(record.sourceNote, sourceNote);
    assert.equal(yearLabel(record), "السنة غير موثقة");
    assert.ok(!citation(record).includes("1445"));
    assert.equal(filterTheses([record], { year: "1445" }).length, 0);
    assert.equal(filterTheses([record], { year: "unknown" }).length, 1);
    assert.equal(canRead(record), false);
  }
});

test("An explicitly invalid year fails publication instead of becoming null, zero or a guessed year", () => {
  for (const Year of [
    0,
    -1,
    1445.5,
    1299,
    1601,
    2026,
    NaN,
    Infinity,
    " ",
    "غير موثق",
    "1445/1446",
    "null",
    false,
    true,
    [1445],
    { year: 1445 },
  ]) {
    const fields = { ...base, Year };
    assert.equal(
      publicRecord(fields),
      null,
      `invalid year ${JSON.stringify(Year)} must fail`,
    );
    assert.throws(() => parsePublication(bundle([fields])));
  }
  assert.equal(publicRecord({ ...base, Year: "1445" })?.year, 1445);
  assert.equal(publicRecord({ ...base, Year: 1445 })?.year, 1445);
  assert.equal(
    publicRecord({ ...base, Year: 2026, YearCalendar: "gregorian" })?.year,
    2026,
  );
  assert.equal(
    publicRecord({ ...base, Year: 1445, YearCalendar: "gregorian" }),
    null,
  );
});

test("Only the reviewed public source note is released, while source documents and reconciliation evidence stay private", () => {
  const record = publicRecord({
    ...base,
    PublicSourceNote: `  ${sourceNote}  `,
    SourceDocuments: [
      { filename: "PRIVATE-SOURCE-PDF.pdf", page: 13, sourceOrdinal: 68 },
    ],
    SourceDocument: "/private/source.pdf",
    SourceRecordId: "PRIVATE-REGISTRY-ID",
    MatchCandidates: ["PRIVATE-CANDIDATE"],
    MatchConfidence: "PRIVATE-PROBABLE",
    ReconciliationNotes: "PRIVATE-MATCH-NOTES",
    ReviewNotes: "PRIVATE-REVIEW-NOTES",
    InternalNotes: "PRIVATE-INTERNAL-NOTES",
    Evidence: { quote: "PRIVATE-COVER-EVIDENCE" },
    ReadingUrl: "https://university.sharepoint.com/sites/private/document.pdf",
    DownloadBlocked: true,
  });
  assert.ok(record);
  assert.equal(record.sourceNote, sourceNote);
  assert.equal(record.program, base.ProgramName);
  const serialized = JSON.stringify(record);
  for (const forbidden of [
    "SourceDocuments",
    "SourceDocument",
    "SourceRecordId",
    "sourceOrdinal",
    "MatchCandidates",
    "MatchConfidence",
    "ReconciliationNotes",
    "ReviewNotes",
    "InternalNotes",
    "Evidence",
    "ReadingUrl",
    "DownloadBlocked",
    "PRIVATE-",
    "/private/",
    "sharepoint.com",
  ])
    assert.ok(
      !serialized.includes(forbidden),
      `${forbidden} must stay private`,
    );
});

test("Programme-scoped search separates programmes sharing the readings department", () => {
  const qiraat = publicRecord({
    ...base,
    ThesisId: "qiraat",
    ProgramName: "ماجستير القراءات",
  })!;
  const studies = publicRecord({ ...base, ThesisId: "studies" })!;
  assert.deepEqual(
    filterTheses([studies, qiraat], {
      query: "ماجستير القراءات",
      scope: "program",
    }).map((t) => t.id),
    ["qiraat"],
  );
  assert.equal(
    filterTheses([studies, qiraat], { query: "ماجستير القراءات" })[0].id,
    "qiraat",
  );
});
