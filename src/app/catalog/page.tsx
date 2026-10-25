import { Suspense } from "react";
import { getCatalog } from "@/lib/catalog";
import { Breadcrumb, DemoNotice } from "@/components/site";
import { CatalogExplorer } from "@/components/catalog-explorer";
export const metadata = { title: "الفهرس العلمي" };
export const dynamic = "force-dynamic";
export default async function CatalogPage() {
  const catalog = await getCatalog();
  return (
    <main id="main">
      <DemoNotice
        demo={catalog.source === "demo"}
        available={catalog.available}
      />
      <Breadcrumb items={[{ label: "الفهرس العلمي" }]} />
      <div className="container page-heading">
        <div className="section-kicker">ابحث · اكتشف · اقرأ</div>
        <h1>الفهرس العلمي</h1>
        <p>بحوث ورسائل، وموضوعات ترسم آفاق المعرفة في الشريعة والأنظمة.</p>
      </div>
      <div className="container catalog-container">
        <Suspense fallback={<p>جارٍ تجهيز الفهرس…</p>}>
          <CatalogExplorer theses={catalog.theses} />
        </Suspense>
      </div>
    </main>
  );
}
