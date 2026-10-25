import { publicRecord, safeReadingUrl, canRead } from "./policy";
export const PUBLICATION_STORE = "gradtheses-catalogue-production";
export const PUBLICATION_KEY = "current";
export type Publication = {
  schemaVersion: 1;
  publishedAt: string;
  rows: Record<string, unknown>[];
};
export function parsePublication(value: unknown): Publication {
  if (!value || typeof value !== "object")
    throw new Error("Missing publication");
  const p = value as Partial<Publication>;
  if (
    p.schemaVersion !== 1 ||
    !Array.isArray(p.rows) ||
    p.rows.length > 10000 ||
    typeof p.publishedAt !== "string" ||
    !Number.isFinite(Date.parse(p.publishedAt))
  )
    throw new Error("Invalid publication");
  const ids = new Set<string>();
  for (const row of p.rows) {
    if (!row || typeof row !== "object")
      throw new Error("Invalid publication row");
    const t = publicRecord(row);
    if (!t) throw new Error("Only valid, published records may be released");
    if (ids.has(t.id)) throw new Error("Duplicate publication ID");
    ids.add(t.id);
    if (
      canRead(t) &&
      (row.DownloadBlocked !== true ||
        !safeReadingUrl(row.ReadingUrl, "taifedusa.sharepoint.com"))
    )
      throw new Error("Reading requires a verified blocked-download link");
  }
  return p as Publication;
}
