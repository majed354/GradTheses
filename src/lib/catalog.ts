import "server-only";
import { demoTheses } from "./demo";
import { publicRecord, safeReadingUrl, canRead } from "./policy";
import type { Catalog } from "./types";
import { getStore } from "@netlify/blobs";
import {
  parsePublication,
  PUBLICATION_STORE,
  PUBLICATION_KEY,
} from "./publication";
async function publishedRows() {
  // Production is never read by preview deployments, which explicitly use demo.
  const store = getStore({ name: PUBLICATION_STORE, consistency: "strong" });
  return parsePublication(await store.get(PUBLICATION_KEY, { type: "json" }));
}
let tokenCache: { token: string; until: number } | undefined;
async function graphToken() {
  if (tokenCache && tokenCache.until > Date.now()) return tokenCache.token;
  const { ENTRA_TENANT_ID, ENTRA_CLIENT_ID, ENTRA_CLIENT_SECRET } = process.env;
  if (
    !/^[\da-f-]{36}$/i.test(ENTRA_TENANT_ID || "") ||
    !ENTRA_CLIENT_ID ||
    !ENTRA_CLIENT_SECRET
  )
    throw new Error("Graph configuration missing");
  const response = await fetch(
    `https://login.microsoftonline.com/${ENTRA_TENANT_ID}/oauth2/v2.0/token`,
    {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        grant_type: "client_credentials",
        client_id: ENTRA_CLIENT_ID,
        client_secret: ENTRA_CLIENT_SECRET,
        scope: "https://graph.microsoft.com/.default",
      }),
      cache: "no-store",
      signal: AbortSignal.timeout(10000),
    },
  );
  if (!response.ok) throw new Error("Graph authentication failed");
  const data = await response.json();
  if (typeof data.access_token !== "string")
    throw new Error("Invalid token response");
  tokenCache = {
    token: data.access_token,
    until:
      Date.now() +
      Math.max(0, Math.min(Number(data.expires_in) || 300, 3600) - 60) * 1000,
  };
  return tokenCache.token;
}
async function graphRows(): Promise<Record<string, unknown>[]> {
  const { SHAREPOINT_SITE_ID, SHAREPOINT_CATALOG_LIST_ID } = process.env;
  if (!SHAREPOINT_SITE_ID || !SHAREPOINT_CATALOG_LIST_ID)
    throw new Error("Catalog configuration missing");
  const fields =
    "ThesisId,Title,AuthorName,SupervisorName,CoSupervisorName,Department,Specialization,Degree,WorkType,Year,YearCalendar,AcademicStatus,AbstractText,KeywordsText,PageCount,AccessLevel,EmbargoUntil,PublicationStatus,ReadingUrl";
  const initial = new URL(
    `https://graph.microsoft.com/v1.0/sites/${encodeURIComponent(SHAREPOINT_SITE_ID)}/lists/${encodeURIComponent(SHAREPOINT_CATALOG_LIST_ID)}/items`,
  );
  initial.searchParams.set("$expand", `fields($select=${fields})`);
  initial.searchParams.set("$top", "200");
  const prefix = initial.pathname;
  let next: string | undefined = initial.href;
  const rows: Record<string, unknown>[] = [];
  const visited = new Set<string>();
  const token = await graphToken();
  while (next) {
    const target = new URL(next);
    if (
      target.origin !== "https://graph.microsoft.com" ||
      decodeURIComponent(target.pathname) !== decodeURIComponent(prefix) ||
      target.username ||
      target.password ||
      visited.has(next) ||
      visited.size >= 50
    )
      throw new Error("Unsafe or excessive Graph pagination");
    visited.add(next);
    const response: Response = await fetch(next, {
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
      signal: AbortSignal.timeout(10000),
    });
    if (!response.ok)
      throw new Error(`Catalog request failed (${response.status})`);
    const data: {
      value: { fields?: Record<string, unknown> }[];
      "@odata.nextLink"?: string;
    } = await response.json();
    if (!Array.isArray(data.value)) throw new Error("Invalid Graph response");
    for (const item of data.value)
      if (item.fields && typeof item.fields === "object")
        rows.push(item.fields);
    next = data["@odata.nextLink"];
  }
  return rows;
}
export async function getCatalog(): Promise<Catalog> {
  const source = process.env.CATALOG_SOURCE || "demo";
  if (source === "demo")
    return { theses: demoTheses, source: "demo", available: true };
  if (source === "published") {
    try {
      const publication = await publishedRows();
      return {
        theses: publication.rows.map(publicRecord).filter((t) => t !== null),
        source: "published",
        available: true,
        publishedAt: publication.publishedAt,
      };
    } catch {
      console.error("Published catalog unavailable.");
      return { theses: [], source: "published", available: false };
    }
  }
  if (source !== "sharepoint")
    return { theses: [], source: "sharepoint", available: false };
  try {
    const rows = await graphRows();
    const theses = rows.map(publicRecord).filter((t) => t !== null);
    if (new Set(theses.map((t) => t.id)).size !== theses.length)
      throw new Error("Duplicate public IDs");
    return { theses, source: "sharepoint", available: true };
  } catch {
    console.error(
      "University catalog unavailable; no fallback to sample data.",
    );
    return { theses: [], source: "sharepoint", available: false };
  }
}
export async function getReadingLink(id: string) {
  if (process.env.CATALOG_SOURCE === "published") {
    const row = (await publishedRows()).rows.find((r) => r.ThesisId === id);
    const t = row && publicRecord(row);
    return row && t && canRead(t) && row.DownloadBlocked === true
      ? safeReadingUrl(row.ReadingUrl, process.env.SHAREPOINT_READING_HOST)
      : null;
  }
  if (process.env.CATALOG_SOURCE !== "sharepoint") return null;
  const matches = (await graphRows()).filter((f) => f.ThesisId === id);
  if (matches.length !== 1) return null;
  const thesis = publicRecord(matches[0]);
  if (!thesis || !canRead(thesis)) return null;
  const raw = matches[0].ReadingUrl;
  return safeReadingUrl(
    typeof raw === "object" && raw !== null && "Url" in raw ? raw.Url : raw,
    process.env.SHAREPOINT_READING_HOST,
  );
}
