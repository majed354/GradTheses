import { publicRecord, safeReadingUrl, canRead } from "./policy";
export const PUBLICATION_STORE = "gradtheses-catalogue-production";
export const PUBLICATION_KEY = "current";
export type Publication = {
  schemaVersion: 1;
  publishedAt: string;
  rows: Record<string, unknown>[];
  aliases?: Record<string, string>;
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
      t.access === "university" &&
      t.fileStatus &&
      t.fileStatus !== "available"
    )
      throw new Error("An incomplete file cannot be released for reading");
    if (
      canRead(t) &&
      (row.DownloadBlocked !== true ||
        !safeReadingUrl(row.ReadingUrl, "taifedusa.sharepoint.com"))
    )
      throw new Error("Reading requires a verified blocked-download link");
  }
  if (p.aliases !== undefined) {
    if (!p.aliases || typeof p.aliases !== "object" || Array.isArray(p.aliases))
      throw new Error("Invalid publication aliases");
    const entries = Object.entries(p.aliases);
    if (entries.length > 10000) throw new Error("Too many publication aliases");
    for (const [alias, target] of entries) {
      if (
        !/^[a-zA-Z0-9_-]{1,100}$/.test(alias) ||
        typeof target !== "string" ||
        !/^[a-zA-Z0-9_-]{1,100}$/.test(target) ||
        ids.has(alias) ||
        !ids.has(target)
      )
        throw new Error(
          "Aliases must point directly to a published canonical ID",
        );
    }
  }
  return p as Publication;
}
