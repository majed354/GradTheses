import { getCatalog } from "@/lib/catalog";
export async function GET() {
  const catalog = await getCatalog();
  return Response.json(catalog, {
    status: catalog.available ? 200 : 503,
    headers: { "Cache-Control": "no-store" },
  });
}
