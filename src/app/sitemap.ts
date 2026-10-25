import type { MetadataRoute } from "next";
import { appUrl } from "@/lib/config";
import { getCatalog } from "@/lib/catalog";
export const dynamic = "force-dynamic";
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = appUrl(),
    catalog = await getCatalog();
  return [
    "",
    "/catalog",
    "/about",
    "/access",
    ...catalog.theses.filter((t) => !t.sample).map((t) => `/theses/${t.id}`),
  ].map((path) => ({ url: base + path }));
}
