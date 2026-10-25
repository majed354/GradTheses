import { test } from "node:test";
import assert from "node:assert/strict";
import { parsePublication } from "../src/lib/publication";
import { publicRecord, canRead } from "../src/lib/policy";
import { yearLabel, citation, filterTheses } from "../src/lib/search";
import { nativeSharePointAuth, readingEnabled } from "../src/lib/config";
const row = {
  ThesisId: "gt-0001",
  Title: "عنوان وارد من سجل الإشراف",
  AuthorName: "باحثة",
  SupervisorName: "",
  Department: "الشريعة",
  Degree: "ماجستير",
  WorkType: "غير محدد",
  Year: 1447,
  YearCalendar: "hijri",
  AcademicStatus: "مكتمل",
  AccessLevel: "metadata",
  PublicationStatus: "Published",
  SourceRecordId: "private-source-id",
};
const bundle = (rows = [row]) => ({
  schemaVersion: 1,
  publishedAt: "2026-10-26T00:00:00Z",
  rows,
});
test("Hijri metadata survives publication without inventing a file, type or supervisor", () => {
  const t = publicRecord(parsePublication(bundle()).rows[0])!;
  assert.equal(t.year, 1447);
  assert.equal(yearLabel(t), "1447 هـ");
  assert.equal(t.supervisor, "");
  assert.equal(t.kind, "غير محدد");
  assert.equal(canRead(t), false);
  assert.ok(!JSON.stringify(t).includes("private-source-id"));
  assert.ok(citation(t).includes("1447 هـ"));
  assert.equal(filterTheses([t], { year: "1447 هـ" }).length, 1);
  assert.equal(publicRecord({ ...row, YearCalendar: "gregorian" }), null);
  assert.equal(
    publicRecord({ ...row, AcademicStatus: "غير محدد" })?.status,
    "غير محدد",
  );
});
test("Published reading cannot be activated without a verified link on the university host", () => {
  const readable = {
    ...row,
    AccessLevel: "university",
    ReadingUrl: "https://taifedusa.sharepoint.com/:b:/s/reading/example",
    DownloadBlocked: true,
  };
  assert.doesNotThrow(() => parsePublication(bundle([readable])));
  for (const changes of [
    { DownloadBlocked: false },
    { ReadingUrl: "https://evil.example/sites/file" },
    { ReadingUrl: "https://taifedusa.sharepoint.com/sites/file?download=1" },
    { ReadingUrl: "" },
  ])
    assert.throws(() =>
      parsePublication(bundle([{ ...readable, ...changes }])),
    );
  assert.throws(() => parsePublication(bundle([row, row])));
  assert.throws(() =>
    parsePublication(bundle([{ ...row, PublicationStatus: "Draft" }])),
  );
});
test("Native university sign-in needs no Entra credentials and cannot enable the Graph mode", () => {
  const previous = { ...process.env };
  try {
    delete process.env.ENTRA_CLIENT_SECRET;
    Object.assign(process.env, {
      CATALOG_SOURCE: "published",
      READING_AUTH_MODE: "sharepoint",
      SHAREPOINT_READING_HOST: "taifedusa.sharepoint.com",
      READING_ENABLED: "true",
    });
    assert.equal(nativeSharePointAuth(), true);
    assert.equal(readingEnabled(), true);
    process.env.READING_ENABLED = "false";
    assert.equal(readingEnabled(), false);
    process.env.CATALOG_SOURCE = "demo";
    assert.equal(nativeSharePointAuth(), false);
  } finally {
    for (const key of Object.keys(process.env))
      if (!(key in previous)) delete process.env[key];
    Object.assign(process.env, previous);
  }
});
