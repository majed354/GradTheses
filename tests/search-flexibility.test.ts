import { test } from "node:test";
import assert from "node:assert/strict";
import type { Thesis } from "../src/lib/types";
import {
  catalogSearchParams,
  citation,
  filterTheses,
  normalizeArabic,
  readCatalogFilters,
  yearLabel,
} from "../src/lib/search";

const quranMasters = "ماجستير الدراسات القرآنية المعاصرة";
const quranDoctorate = "دكتوراه الدراسات القرآنية";
const readingsMasters = "ماجستير القراءات";
const readingsDoctorate = "دكتوراه القراءات";
const record = (id: string, overrides: Partial<Thesis> = {}): Thesis => ({
  id,
  title: "تصنيف الاختلافات التفسيرية في زاد المسير لابن الجوزي",
  author: "أحمد بن علي الزهراني",
  supervisor: "د. ماجد إبراهيم الجهني",
  department: "القراءات",
  program: quranMasters,
  degree: "ماجستير",
  kind: "مشروع بحثي",
  year: 1445,
  yearCalendar: "hijri",
  abstract: "يعالج المشروع وجوه اختلاف التنوع في التفسير المقارن.",
  keywords: ["أصول التفسير"],
  status: "مكتمل",
  access: "metadata",
  ...overrides,
});
const ids = (rows: Thesis[]) => rows.map((row) => row.id);

test("Arabic search tolerates orthography, punctuation and both Arabic digit sets without altering records", () => {
  const title = "قِراءةٌ في أَثَرِ التَّفسِير: الآية (١٠٦)، ١٤٤٥هـ";
  const row = record("orthography", { title });
  assert.equal(
    normalizeArabic("  أُصُولُ الـفِقْه، ١٤٤٥هـ / ۱۴۴۵ هـ  "),
    "اصول الفقه 1445 ه 1445 ه",
  );
  assert.equal(normalizeArabic("ابن الجوزي"), normalizeArabic("بِن الجَوْزي"));
  assert.deepEqual(
    ids(filterTheses([row], { query: "قراءه اثر التفسير ۱۰۶ 1445" })),
    ["orthography"],
  );
  assert.equal(row.title, title);
  assert.equal(row.author, "أحمد بن علي الزهراني");
});

test("All-word matching is order-independent and can find words in different public fields", () => {
  const row = record("distributed");
  for (const query of ["المسير أحمد الجهني", "الجهني، المسير أَحْمَد"]) {
    assert.deepEqual(ids(filterTheses([row], { query, mode: "all" })), [
      "distributed",
    ]);
  }
  assert.deepEqual(
    filterTheses([row], { query: "المسير حديث", mode: "all" }),
    [],
  );
});

test("Any-word mode broadens only to the requested literal words", () => {
  const rows = [
    record("tafseer"),
    record("readings", {
      title: "تحرير القراءات المتواترة",
      author: "باحث آخر",
      supervisor: "مشرف آخر",
      abstract: "دراسة أسانيد القراءات",
      keywords: [],
      program: readingsMasters,
    }),
  ];
  assert.deepEqual(
    ids(filterTheses(rows, { query: "المسير حديث", mode: "any" })),
    ["tafseer"],
  );
  assert.deepEqual(
    filterTheses(rows, { query: "المسير حديث", mode: "all" }),
    [],
  );
  assert.deepEqual(
    filterTheses([rows[1]], { query: "الدراسات", scope: "title" }),
    [],
  );
});

test("Phrase mode preserves word order and never manufactures a phrase across fields", () => {
  const row = record("phrase", {
    title: "مناهج التفسير",
    author: "أحمد الزهراني",
  });
  assert.equal(
    filterTheses([row], {
      query: "مناهج، التفسير",
      mode: "phrase",
      scope: "title",
    }).length,
    1,
  );
  assert.equal(
    filterTheses([row], { query: "التفسير مناهج", mode: "phrase" }).length,
    0,
  );
  assert.equal(
    filterTheses([row], { query: "التفسير أحمد", mode: "all" }).length,
    1,
  );
  assert.equal(
    filterTheses([row], { query: "التفسير أحمد", mode: "phrase" }).length,
    0,
  );
  assert.equal(
    filterTheses([record("ibn")], {
      query: "بن الجوزي",
      mode: "phrase",
      scope: "title",
    }).length,
    1,
  );
});

test("Search scopes distinguish authors, supervisors, co-supervisors and summaries", () => {
  const row = record("scoped", {
    coSupervisor: "محمد حسن",
    abstract: "يعالج البحث دلالة النسخ.",
  });
  assert.equal(
    filterTheses([row], { query: "أحمد ابن علي", scope: "author" }).length,
    1,
  );
  assert.equal(
    filterTheses([row], { query: "أحمد", scope: "supervisor" }).length,
    0,
  );
  assert.equal(
    filterTheses([row], {
      query: "محمد حسن",
      mode: "phrase",
      scope: "supervisor",
    }).length,
    1,
  );
  assert.equal(
    filterTheses([row], {
      query: "الجهني محمد",
      mode: "phrase",
      scope: "supervisor",
    }).length,
    0,
  );
  assert.equal(
    filterTheses([row], { query: "النسخ", scope: "abstract" }).length,
    1,
  );
  assert.equal(
    filterTheses([row], { query: "النسخ", scope: "title" }).length,
    0,
  );
});

test("Relevance prioritizes titles then researcher/supervisor names then descriptions, while explicit date sort remains available", () => {
  const base = {
    title: "دراسة تطبيقية",
    author: "باحث",
    supervisor: "مشرف",
    abstract: "وصف العمل",
  };
  const rows = [
    record("abstract", { ...base, abstract: "دراسة ابن الجوزي", year: 1447 }),
    record("author", { ...base, author: "ابن الجوزي", year: 1446 }),
    record("title", { ...base, title: "منهج ابن الجوزي", year: 1444 }),
  ];
  assert.deepEqual(ids(filterTheses(rows, { query: "بن الجوزي" })), [
    "title",
    "author",
    "abstract",
  ]);
  assert.deepEqual(
    ids(filterTheses(rows, { query: "ابن الجوزي", sort: "newest" })),
    ["abstract", "author", "title"],
  );
});

test("Program filters isolate Qur'anic studies and readings independently of their shared department and degree", () => {
  const rows = [
    record("quran-masters"),
    record("quran-doctorate", {
      program: quranDoctorate,
      degree: "دكتوراه",
      kind: "رسالة علمية",
    }),
    record("readings-masters", { program: readingsMasters }),
    record("readings-doctorate", {
      program: readingsDoctorate,
      degree: "دكتوراه",
      kind: "رسالة علمية",
    }),
    record("undocumented", { program: undefined }),
  ];
  for (const [program, id] of [
    [quranMasters, "quran-masters"],
    [quranDoctorate, "quran-doctorate"],
    [readingsMasters, "readings-masters"],
    [readingsDoctorate, "readings-doctorate"],
  ]) {
    assert.deepEqual(
      ids(filterTheses(rows, { program, department: "القراءات" })),
      [id],
    );
  }
  assert.deepEqual(ids(filterTheses(rows, { program: "unknown" })), [
    "undocumented",
  ]);
  assert.deepEqual(
    filterTheses(rows, { program: quranMasters, degree: "دكتوراه" }),
    [],
  );
  assert.ok(citation(rows[0]).includes(quranMasters));
});

test("Unknown years remain explicit and sort after documented years in both chronological directions", () => {
  const rows = [
    record("unknown", { year: null }),
    record("newer", { year: 1447 }),
    record("older", { year: 1444 }),
  ];
  assert.equal(yearLabel(rows[0]), "السنة غير موثقة");
  assert.deepEqual(ids(filterTheses(rows, { sort: "newest" })), [
    "newer",
    "older",
    "unknown",
  ]);
  assert.deepEqual(ids(filterTheses(rows, { sort: "oldest" })), [
    "older",
    "newer",
    "unknown",
  ]);
  assert.deepEqual(ids(filterTheses(rows, { year: "unknown" })), ["unknown"]);
  assert.deepEqual(ids(filterTheses(rows, { year: "١٤٤٧هـ" })), ["newer"]);
  assert.deepEqual(filterTheses(rows, { year: "0" }), []);
});

test("Shared search URLs preserve visible options, table view and page, and discard obsolete invisible filters", () => {
  const old = new URLSearchParams(
    "q=المسير&access=university&fileStatus=processing",
  );
  const filters = readCatalogFilters(old);
  assert.equal(filterTheses([record("available")], filters).length, 1);
  const params = catalogSearchParams(
    { ...filters, program: quranMasters, scope: "title", mode: "phrase" },
    { view: "table", page: 3 },
  );
  assert.equal(params.has("access"), false);
  assert.equal(params.has("fileStatus"), false);
  assert.equal(params.get("view"), "table");
  assert.equal(params.get("page"), "3");
  assert.equal(readCatalogFilters(params).program, quranMasters);
  assert.equal(readCatalogFilters(params).scope, "title");
  assert.equal(readCatalogFilters(params).mode, "phrase");
  assert.equal(
    readCatalogFilters(new URLSearchParams("mode=bogus&scope=secret")).scope,
    "all",
  );
  assert.equal(catalogSearchParams({ sort: "relevance" }).size, 0);
});
