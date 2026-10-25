import { test } from "node:test";
import assert from "node:assert/strict";
import { getCatalog, getReadingLink } from "../src/lib/catalog";

test("Graph adapter paginates, publishes only approved fields and fails closed", async () => {
  const previous = { ...process.env };
  const originalFetch = globalThis.fetch;
  Object.assign(process.env, {
    CATALOG_SOURCE: "sharepoint",
    ENTRA_TENANT_ID: "11111111-1111-4111-8111-111111111111",
    ENTRA_CLIENT_ID: "22222222-2222-4222-8222-222222222222",
    ENTRA_CLIENT_SECRET: "test-only",
    SHAREPOINT_SITE_ID: "university.sharepoint.com,site,web",
    SHAREPOINT_CATALOG_LIST_ID: "catalog",
    SHAREPOINT_READING_HOST: "university.sharepoint.com",
  });
  const row = {
    ThesisId: "approved-001",
    Title: "رسالة معتمدة",
    AuthorName: "باحث",
    Department: "الفقه",
    Degree: "ماجستير",
    WorkType: "رسالة علمية",
    Year: 2026,
    AcademicStatus: "مكتمل",
    AccessLevel: "university",
    PublicationStatus: "Published",
    ReadingUrl: "https://university.sharepoint.com/sites/reading/view.aspx",
    InternalNotes: "PRIVATE",
  };
  let mode = "normal",
    requests = 0;
  globalThis.fetch = async (input) => {
    const url = String(input);
    if (url.includes("login.microsoftonline.com"))
      return Response.json({
        access_token: "test-only-token",
        expires_in: 3600,
      });
    requests++;
    if (mode === "failure") return new Response("Unavailable", { status: 503 });
    if (mode === "withdrawn")
      return Response.json({
        value: [{ fields: { ...row, PublicationStatus: "Draft" } }],
      });
    if (mode === "duplicate")
      return Response.json({ value: [{ fields: row }, { fields: row }] });
    if (mode === "foreign")
      return Response.json({
        value: [],
        "@odata.nextLink": "https://evil.example/steal-token",
      });
    if (mode === "normal" && !url.includes("skiptoken"))
      return Response.json({
        value: [{ fields: row }],
        "@odata.nextLink": url + "&skiptoken=2",
      });
    return Response.json({
      value: [
        {
          fields: { ...row, ThesisId: "draft-001", PublicationStatus: "Draft" },
        },
      ],
    });
  };
  try {
    const result = await getCatalog();
    assert.equal(result.available, true);
    assert.equal(result.theses.length, 1);
    assert.equal(requests, 2);
    assert.ok(!JSON.stringify(result).includes("ReadingUrl"));
    assert.ok(!JSON.stringify(result).includes("PRIVATE"));
    assert.equal(await getReadingLink("approved-001"), row.ReadingUrl);
    mode = "withdrawn";
    assert.equal(await getReadingLink("approved-001"), null);
    assert.deepEqual((await getCatalog()).theses, []);
    for (const state of ["failure", "duplicate", "foreign"]) {
      mode = state;
      const closed = await getCatalog();
      assert.equal(closed.available, false);
      assert.deepEqual(closed.theses, []);
      assert.equal(closed.source, "sharepoint");
    }
    process.env.CATALOG_SOURCE = "demo";
    assert.equal(await getReadingLink("demo-001"), null);
  } finally {
    globalThis.fetch = originalFetch;
    for (const key of Object.keys(process.env))
      if (!(key in previous)) delete process.env[key];
    Object.assign(process.env, previous);
  }
});
