import { test } from "node:test";
import assert from "node:assert/strict";
import { canRead, publicRecord } from "../src/lib/policy";
import { citation, filterTheses, workLabel } from "../src/lib/search";
import type { Thesis } from "../src/lib/types";

const fields = {
  ThesisId: "editorial-001",
  Title: "دراسة الاختلاف التفسيري",
  AuthorName: "باحث",
  SupervisorName: "مشرف",
  Department: "القراءات",
  Degree: "ماجستير",
  WorkType: "مشروع بحثي",
  Year: 1445,
  YearCalendar: "hijri",
  AcademicStatus: "مكتمل",
  FileStatus: "available",
  AccessLevel: "metadata",
  PublicationStatus: "Published",
  AbstractText: "توصيف تحريري مستند إلى محتوى البحث.",
  AbstractKind: "editorial",
  KeywordsText: "التفسير؛ الاختلاف",
};

function record(overrides: Record<string, unknown> = {}): Thesis {
  const result = publicRecord({ ...fields, ...overrides });
  assert.ok(result, "the published fixture must pass catalog validation");
  return result;
}

test("Degree and work-type filters distinguish projects from master's and doctoral theses", () => {
  const records = [
    record({ ThesisId: "masters-project" }),
    record({ ThesisId: "masters-thesis", WorkType: "رسالة علمية" }),
    record({
      ThesisId: "doctoral-thesis",
      Degree: "دكتوراه",
      WorkType: "رسالة علمية",
    }),
    record({ ThesisId: "masters-complementary", WorkType: "بحث تكميلي" }),
    record({ ThesisId: "masters-unclassified", WorkType: "غير محدد" }),
  ];
  const cases = [
    ["ماجستير", "مشروع بحثي", "masters-project"],
    ["ماجستير", "رسالة علمية", "masters-thesis"],
    ["دكتوراه", "رسالة علمية", "doctoral-thesis"],
    ["ماجستير", "بحث تكميلي", "masters-complementary"],
    ["ماجستير", "غير محدد", "masters-unclassified"],
  ];
  for (const [degree, kind, id] of cases) {
    assert.deepEqual(
      filterTheses(records, { degree, kind }).map((item) => item.id),
      [id],
      `${degree} / ${kind} must retain only its own category`,
    );
  }
  assert.deepEqual(
    filterTheses(records, { degree: "دكتوراه", kind: "مشروع بحثي" }),
    [],
  );
});

test("An undocumented work type stays undocumented in labels, citations and filters", () => {
  const unknown = record({ WorkType: "غير محدد" });
  assert.equal(unknown.kind, "غير محدد");
  assert.equal(workLabel(unknown), "ماجستير · نوع العمل غير موثق");
  assert.ok(!workLabel(unknown).includes("رسالة"));
  assert.ok(!citation(unknown).includes("رسالة ماجستير"));
  assert.deepEqual(filterTheses([unknown], { kind: "رسالة علمية" }), []);
  assert.equal(workLabel(record({ WorkType: "رسالة علمية" })), "رسالة ماجستير");
  assert.equal(
    workLabel(record({ Degree: "دكتوراه", WorkType: "رسالة علمية" })),
    "رسالة دكتوراه",
  );
});

test("Editorial attribution is public while source evidence and reading URLs stay private", () => {
  const editorial = record({
    ReadingUrl: "https://university.sharepoint.com/sites/private/reading.pdf",
    Evidence: [{ page: 1, shortQuote: "PRIVATE-COVER-EVIDENCE" }],
    ClassificationEvidence: { page: 1, quote: "PRIVATE-CLASSIFICATION" },
    ReviewNotes: "PRIVATE-REVIEW-NOTES",
    SourceFile: "/private/originals/work.pdf",
    SourceRecordId: "PRIVATE-REGISTRY-ID",
    SourceRow: 42,
    DownloadBlocked: true,
  });
  assert.equal(editorial.abstract, fields.AbstractText);
  assert.equal(editorial.abstractKind, "editorial");
  assert.equal(record({ AbstractKind: "author" }).abstractKind, "author");
  assert.ok(!("abstractKind" in record({ AbstractKind: "unverified" })));
  assert.deepEqual(editorial.keywords, ["التفسير", "الاختلاف"]);

  const serialized = JSON.stringify(editorial);
  for (const privateValue of [
    "ReadingUrl",
    "sharepoint.com",
    "Evidence",
    "ClassificationEvidence",
    "ReviewNotes",
    "SourceFile",
    "SourceRecordId",
    "SourceRow",
    "DownloadBlocked",
    "PRIVATE-",
    "/private/",
  ]) {
    assert.ok(!serialized.includes(privateValue), `${privateValue} must not leak`);
  }
});

test("A complete available file cannot make a metadata-only record readable", () => {
  const metadata = record({
    ReadingUrl: "https://university.sharepoint.com/sites/private/reading.pdf",
    DownloadBlocked: true,
  });
  assert.equal(metadata.status, "مكتمل");
  assert.equal(metadata.fileStatus, "available");
  assert.equal(metadata.sample, undefined);
  assert.equal(canRead(metadata), false);
  assert.equal(canRead({ ...metadata, access: "university" }), true);
});
