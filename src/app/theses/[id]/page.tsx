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
import { readingEnabled } from "@/lib/config";
import { getCatalog } from "@/lib/catalog";
import { citation, yearLabel, workLabel } from "@/lib/search";
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
    .filter(
      (x) =>
        (t.program ? x.program === t.program : x.department === t.department) &&
        x.id !== t.id,
    )
    .slice(0, 3);
  return (
    <main id="main">
      <DemoNotice
        demo={catalog.source === "demo"}
        publishedAt={catalog.publishedAt}
      />
      <Breadcrumb
        items={[
          { label: "الفهرس العلمي", href: "/catalog" },
          { label: "تفاصيل السجل" },
        ]}
      />
      <div className="container detail-layout">
        <article className="detail-main">
          <div className="detail-labels">
            <span className="department-label">قسم {t.department}</span>
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
            {t.program && <span>البرنامج: {t.program}</span>}
            {t.specialization && <span>التخصص: {t.specialization}</span>}
            <span>
              <CalendarDays size={17} />
              {yearLabel(t)}
            </span>
            <span>
              <FileText size={17} />
              {workLabel(t)}
            </span>
            {t.pages && (
              <span>
                <BookOpen size={17} />
                {t.pages} صفحة
              </span>
            )}
          </div>
          {t.sourceNote && <p className="notice">{t.sourceNote}</p>}
          <section className="abstract-section">
            <h2>
              {t.abstractKind === "editorial"
                ? "ملخص تعريفي من إعداد المنصة"
                : "الملخص"}
            </h2>
            <p>{t.abstract || "لم يُعتمد ملخص لهذا السجل بعد."}</p>
            {t.abstractKind === "editorial" && (
              <small className="sample-caption">
                صياغة تعريفية أعدّتها المنصة بعد مراجعة الملف، ولا تحل محل قراءة
                العمل أو تمثل نص ملخص المؤلف.
              </small>
            )}
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
          <h2>البيانات والملخصات</h2>
          <AccessBadge thesis={t} />
          <p>
            تقتصر الإتاحة حاليًا على البيانات والملخصات المعتمدة إلى حين استكمال
            مراجعة حقوق النشر. النص الكامل غير متاح عبر المنصة.
          </p>
          {t.fileStatus === "partial" && (
            <p>النسخة المستلمة جزئية؛ يقتصر التوصيف على المحتوى المتاح منها.</p>
          )}
          {readingEnabled() && t.access === "university" && (
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
            <h2>{t.program ? "من البرنامج نفسه" : "من القسم نفسه"}</h2>
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
