import Link from "next/link";
import { notFound } from "next/navigation";
import { BookOpen, LockKeyhole, ArrowUpLeft, ShieldCheck } from "lucide-react";
import { getCatalog } from "@/lib/catalog";
import { readingEnabled, nativeSharePointAuth } from "@/lib/config";
import { getSession } from "@/lib/auth";
import { Breadcrumb } from "@/components/site";
export const dynamic = "force-dynamic";
export const metadata = {
  title: "القراءة الجامعية",
  robots: { index: false, follow: false },
};
export default async function ReadPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ notice?: string }>;
}) {
  const { id } = await params,
    { notice } = await searchParams,
    catalog = await getCatalog(),
    t = catalog.theses.find((t) => t.id === id);
  if (!catalog.available)
    return (
      <main id="main" className="container prose-page">
        <h1>خدمة القراءة غير متاحة حاليًا</h1>
        <Link href="/catalog">العودة إلى الفهرس</Link>
      </main>
    );
  if (!t) notFound();
  const enabled = readingEnabled(),
    session = await getSession(),
    eligible = !t.sample && t.access === "university" && t.status === "مكتمل";
  return (
    <main id="main">
      <Breadcrumb
        items={[
          { label: "الفهرس العلمي", href: "/catalog" },
          { label: "تفاصيل الرسالة", href: `/theses/${id}` },
          { label: "القراءة الجامعية" },
        ]}
      />
      <section className="container narrow-page">
        <div className="large-icon">
          <LockKeyhole size={32} />
        </div>
        <div className="section-kicker">النص الكامل</div>
        <h1>مساحة للقراءة الجامعية</h1>
        <p className="read-title">{t.title}</p>
        <div className="state-panel">
          {!enabled ? (
            <>
              <h2>النص الكامل غير متاح حاليًا</h2>
              <p>
                تقتصر الإتاحة على البيانات والملخصات المعتمدة إلى حين استكمال
                مراجعة حقوق النشر والأساس النظامي للإتاحة.
              </p>
            </>
          ) : t.sample ? (
            <>
              <span className="pill">سجل توضيحي</span>
              <h2>تجربة مسار القراءة</h2>
              <p>
                لا يرتبط هذا السجل بملف رسالة. ستتاح قراءة النصوص الحقيقية بعد
                تجهيز مكتبة SharePoint والربط بالحساب الجامعي.
              </p>
            </>
          ) : !eligible ? (
            <>
              <h2>النص غير متاح للقراءة حاليًا</h2>
              <p>يمكنك استعراض بيانات هذا العمل من صفحة السجل.</p>
            </>
          ) : notice === "unavailable" ? (
            <>
              <h2>نسخة القراءة غير متاحة حاليًا</h2>
              <p>
                قد يكون رابط القراءة لم يُعتمد بعد. يرجى مراجعة مسؤول المستودع.
              </p>
            </>
          ) : nativeSharePointAuth() ? (
            <>
              <h2>اقرأ باستخدام حساب الجامعة</h2>
              <p>
                يفتح قارئ SharePoint في تبويب مستقل، ويتحقق من دخولك وصلاحيتك.
                يُتاح الرابط بعد اعتماد نسخة القراءة ومنع تنزيلها.
              </p>
              <a
                href={`/api/read/${id}`}
                target="_blank"
                rel="noopener noreferrer"
                className="button button-primary"
              >
                <BookOpen size={17} /> فتح القارئ الجامعي{" "}
                <ArrowUpLeft size={17} />
              </a>
            </>
          ) : !session ? (
            <>
              <h2>أكمل الدخول بحسابك الجامعي</h2>
              <p>يقتصر النص الكامل على الحسابات الجامعية المصرح لها.</p>
              <Link
                href={`/auth/login?next=/read/${id}`}
                className="button button-primary"
              >
                <LockKeyhole size={17} /> الدخول وقراءة الرسالة{" "}
                <ArrowUpLeft size={17} />
              </Link>
            </>
          ) : (
            <>
              <h2>مرحبًا، {session.name}</h2>
              <p>
                تفتح الرسالة في تبويب مستقل داخل قارئ الجامعة. يطبق SharePoint
                صلاحيات القراءة وسياسة منع التنزيل.
              </p>
              <a
                href={`/api/read/${id}`}
                target="_blank"
                rel="noopener noreferrer"
                className="button button-primary"
              >
                <BookOpen size={17} /> فتح القارئ الجامعي{" "}
                <ArrowUpLeft size={17} />
              </a>
            </>
          )}
        </div>
        <div className="reader-assurance">
          <ShieldCheck size={19} />
          <p>
            تُحفظ الرسائل في خدمات الجامعة، وتخضع القراءة لصلاحيات SharePoint.
          </p>
        </div>
        <Link href={`/theses/${id}`} className="text-link">
          العودة إلى بيانات الرسالة
        </Link>
      </section>
    </main>
  );
}
