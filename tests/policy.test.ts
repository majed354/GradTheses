import { test } from "node:test";
import assert from "node:assert/strict";
import {
  canRead,
  isReader,
  publicRecord,
  safeReadingUrl,
  safeReturnPath,
} from "../src/lib/policy";
import { filterTheses, normalizeArabic } from "../src/lib/search";
import { demoTheses } from "../src/lib/demo";
import { seal, unseal } from "../src/lib/session-crypto";
const fields = {
  ThesisId: "thesis-001",
  Title: "بحث معتمد",
  AuthorName: "باحث",
  SupervisorName: "مشرف",
  Department: "الفقه",
  Degree: "ماجستير",
  WorkType: "رسالة علمية",
  Year: 2026,
  AcademicStatus: "مكتمل",
  AccessLevel: "university",
  PublicationStatus: "Published",
  ReadingUrl: "https://uni.sharepoint.com/sites/reading",
  StudentId: "secret-student-id",
  InternalNotes: "secret-review",
};
test("Arabic search matches diacritics and alef variants, retaining the original record", () => {
  assert.equal(normalizeArabic("أُصُول الـفِقْه"), "اصول الفقه");
  assert.equal(filterTheses(demoTheses, { query: "إلذكاء إصطناعي" }).length, 1);
  assert.equal(filterTheses(demoTheses, { department: "الفقه" }).length, 2);
  assert.equal(filterTheses(demoTheses, { status: "مسجل" }).length, 1);
});
test("Only published records and explicitly public fields leave the catalog", () => {
  assert.equal(publicRecord({ ...fields, PublicationStatus: "Draft" }), null);
  assert.equal(publicRecord({ ...fields, AccessLevel: "unexpected" }), null);
  assert.equal(publicRecord({ ...fields, ThesisId: "../../private" }), null);
  const result = publicRecord(fields)!;
  assert.equal(result.id, "thesis-001");
  const data = JSON.stringify(result);
  assert.ok(!data.includes("ReadingUrl"));
  assert.ok(!data.includes("sharepoint.com"));
  assert.ok(!data.includes("secret"));
});
test("Reading requires the exact tenant and an assigned reader role", () => {
  const claims = { tid: "university", oid: "member", roles: ["Theses.Reader"] };
  assert.equal(isReader(claims, "university", "Theses.Reader"), true);
  assert.equal(
    isReader({ ...claims, tid: "another" }, "university", "Theses.Reader"),
    false,
  );
  assert.equal(
    isReader({ ...claims, roles: [] }, "university", "Theses.Reader"),
    false,
  );
  assert.equal(
    isReader({ email: "reader@tu.edu.sa" }, "university", "Theses.Reader"),
    false,
  );
});
test("Reading redirects stay on the approved SharePoint host", () => {
  const host = "university.sharepoint.com";
  assert.ok(
    safeReadingUrl(`https://${host}/sites/reading/document.aspx`, host),
  );
  for (const url of [
    "https://evil.com/sites/reading",
    "https://university.sharepoint.com.evil.com/sites/reading",
    "http://university.sharepoint.com/sites/reading",
    "https://user@university.sharepoint.com/sites/reading",
    "https://university.sharepoint.com/sites/reading?download=1",
    "javascript:alert(1)",
    "https://university.sharepoint.com/other",
  ])
    assert.equal(safeReadingUrl(url, host), null);
});
test("Samples, in-progress and embargoed records are never readable", () => {
  assert.equal(canRead(demoTheses[0]), false);
  assert.equal(canRead({ ...demoTheses[0], sample: false }), true);
  assert.equal(
    canRead({ ...demoTheses[0], sample: false, access: "embargo" }),
    false,
  );
  assert.equal(
    canRead({ ...demoTheses[0], sample: false, status: "قيد الإعداد" }),
    false,
  );
});
test("Login return paths cannot redirect to a third party", () => {
  assert.equal(safeReturnPath("/read/thesis-001"), "/read/thesis-001");
  for (const path of [
    "https://evil.com",
    "//evil.com",
    "/read/../auth",
    "/read/id?next=//evil.com",
    "/\\evil.com",
  ])
    assert.equal(safeReturnPath(path), "/catalog");
});
test("Encrypted sessions reject tampering, wrong purpose, wrong key, and expiry", async () => {
  const key = "a".repeat(64),
    token = await seal({ oid: "member" }, key, "session", 60);
  assert.equal((await unseal(token, key, "session")).oid, "member");
  assert.ok(!token.includes("member"));
  await assert.rejects(() => unseal(token + "x", key, "session"));
  await assert.rejects(() => unseal(token, key, "login"));
  await assert.rejects(() => unseal(token, "b".repeat(64), "session"));
  const expired = await seal({}, key, "session", -1);
  await assert.rejects(() => unseal(expired, key, "session"));
});
