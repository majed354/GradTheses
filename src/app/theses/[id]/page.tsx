import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  BookOpen,
  CalendarDays,
  FileText,
  LockKeyhole,
  UserRound,
} from "lucide-react";
import { getCatalog } from "@/lib/catalog";
import { citation } from "@/lib/search";
import { Breadcrumb, DemoNotice } from "@/components/site";
import { AccessBadge, ThesisCard } from "@/components/thesis-card";
import { CopyCitation } from "@/components/citation";
export const dynamic = "force-dynamic";
export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const catalog = await getCatalog(),
    t = catalog.theses.find((t) => t.id === id);
  return {
    title: t?.title || "تفاصيل السجل",
    ...(t?.sample ? { robots: { index: false, follow: false } } : {}),
  };
}
export default async function ThesisPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params,
    catalog = await getCatalog(),
    t = catalog.theses.find((t) => t.id === id);
  if (!catalog.available)
    return (
      <main id="main" className="container prose-page">
        <h1>الفهرس غير متاح حاليًا</h1>
        <p>تعذر الوصول إلى بيانات الرسالة. يرجى المحاولة لاحقًا.</p>
        <Link href="/catalog">العودة للفهرس</Link>
      </main>
    );
  if (!t) notFound();
  const related = catalog.theses
    .filter((x) => x.department === t.department && x.id !== t.id)
    .slice(0, 3);
  return (
    <main id="main">
      <DemoNotice demo={catalog.source === "demo"} />
      <Breadcrumb
        items={[
          { label: "الفهرس العلمي", href: "/catalog" },
          { label: "تفاصيل السجل" },
        ]}
      />
      <div className="container detail-layout">
        <article className="detail-main">
          <div className="detail-labels">
            <span className="department-label">{t.department}</span>
            <span className="degree-label">{t.degree}</span>
            <span className="status-label">{t.status}</span>
          </div>
          <h1>{t.title}</h1>
          <div className="detail-author">
            <UserRound size={19} />
            <span>{t.author}</span>
            <span className="detail-author-divider">|</span>
            <span>بإشراف: {t.supervisor || "غير محدد"}</span>
          </div>
          <div className="detail-facts">
            <span>
              <CalendarDays size={17} />
              {t.year} م
            </span>
            <span>
              <FileText size={17} />
              {t.kind}
            </span>
            {t.pages && (
              <span>
                <BookOpen size={17} />
                {t.pages} صفحة
              </span>
            )}
          </div>
          <section className="abstract-section">
            <h2>المستخلص</h2>
            <p>{t.abstract || "لم يُضف مستخلص لهذا السجل بعد."}</p>
          </section>
          <section className="keywords-section">
            <h2>الكلمات المفتاحية</h2>
            <div className="keyword-tags">
              {t.keywords.map((k) => (
                <Link key={k} href={`/catalog?q=${encodeURIComponent(k)}`}>
                  {k}
                </Link>
              ))}
            </div>
          </section>
          <section className="citation-section">
            <h2>الاستشهاد المرجعي</h2>
            {t.sample && (
              <p className="sample-caption">
                مرجع توضيحي — لا يُستخدم في الاستشهاد العلمي.
              </p>
            )}
            <p>{citation(t)}</p>
            <CopyCitation text={citation(t)} />
          </section>
        </article>
        <aside className="reading-card">
          <div className="reading-icon">
            <BookOpen size={33} strokeWidth={1.4} />
          </div>
          <h2>
            {t.access === "metadata"
              ? "بيانات الموضوع متاحة"
              : "قراءة النص الكامل"}
          </h2>
          <AccessBadge thesis={t} />
          <p>
            {t.access === "metadata"
              ? "هذا الموضوع متاح ببياناته فقط. يضاف النص الكامل بعد اكتماله واعتماد إتاحته."
              : t.access === "embargo"
                ? `النص الكامل مؤجل الإتاحة${t.embargoUntil ? " حتى " + t.embargoUntil : ""}. لا يفتح تلقائيًا قبل اعتماد النشر.`
                : "تتاح قراءة الرسالة للمصرح لهم بالحساب الجامعي، من خلال القارئ المحمي في خدمات الجامعة."}
          </p>
          {t.access === "university" && (
            <Link href={`/read/${t.id}`} className="button button-primary">
              <LockKeyhole size={16} />{" "}
              {t.sample ? "استعراض مسار القراءة" : "قراءة الرسالة"}
              <ArrowLeft size={16} />
            </Link>
          )}
          {t.sample && (
            <small className="sample-caption">
              سجل توضيحي · لا يوجد ملف رسالة مرفق.
            </small>
          )}
          <div className="reading-card-note">
            تخضع إتاحة النصوص لصلاحيات الجامعة وسياسة النشر.
          </div>
        </aside>
      </div>
      {related.length > 0 && (
        <section className="container section">
          <div className="section-heading">
            <h2>من القسم نفسه</h2>
          </div>
          <div className="thesis-grid home-grid">
            {related.map((x) => (
              <ThesisCard key={x.id} thesis={x} />
            ))}
          </div>
        </section>
      )}
    </main>
  );
}
