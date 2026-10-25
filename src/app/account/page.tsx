import Link from "next/link";
import { LockKeyhole, ArrowUpLeft } from "lucide-react";
import { readingEnabled } from "@/lib/config";
import { getSession } from "@/lib/auth";
export const dynamic = "force-dynamic";
export const metadata = {
  title: "الدخول الجامعي",
  robots: { index: false, follow: false },
};
const messages: Record<string, string> = {
  setup: "الربط بخدمات الجامعة قيد التجهيز.",
  failed: "تعذر إكمال الدخول. يرجى المحاولة مجددًا.",
  expired: "انتهت محاولة الدخول. يرجى البدء من جديد.",
  forbidden:
    "هذا الحساب غير مخول للقراءة. يرجى مراجعة مسؤول المستودع لمنح الدور الجامعي المطلوب.",
  signedout:
    "تم تسجيل الخروج من المنصة. قد تبقى جلسة مايكروسوفت مفتوحة في المتصفح.",
};
export default async function Account({
  searchParams,
}: {
  searchParams: Promise<{ notice?: string }>;
}) {
  const { notice } = await searchParams,
    session = await getSession(),
    enabled = readingEnabled();
  return (
    <main id="main" className="container narrow-page">
      <div className="large-icon">
        <LockKeyhole size={32} />
      </div>
      <h1>الدخول الجامعي</h1>
      <p>الفهرس متاح للجميع. تتطلب قراءة النصوص حسابًا جامعيًا مصرحًا له.</p>
      {notice && messages[notice] && (
        <div className="notice account-notice" role="status">
          {messages[notice]}
        </div>
      )}
      <div className="state-panel">
        {session ? (
          <>
            <h2>مرحبًا، {session.name}</h2>
            <p>يمكنك الانتقال إلى السجلات المتاحة للقراءة.</p>
            <Link
              href="/catalog?access=university"
              className="button button-primary"
            >
              استعراض الرسائل
            </Link>
            <form action="/auth/logout" method="post">
              <button className="text-button" type="submit">
                تسجيل الخروج من المنصة
              </button>
            </form>
          </>
        ) : enabled ? (
          <>
            <h2>أكمل باستخدام حساب الجامعة</h2>
            <p>ستنتقل إلى صفحة الدخول الآمنة الخاصة بمايكروسوفت.</p>
            <a href="/auth/login" className="button button-primary">
              الدخول بالحساب الجامعي <ArrowUpLeft size={17} />
            </a>
          </>
        ) : (
          <>
            <span className="pill">قيد التجهيز</span>
            <h2>نجهز القراءة بالحساب الجامعي</h2>
            <p>
              يمكنك الآن تجربة الفهرس وصفحات السجلات. يُفعّل الدخول بعد إعداد
              الربط الجامعي.
            </p>
            <Link href="/catalog" className="button button-primary">
              استعراض الفهرس
            </Link>
            <Link href="/setup" className="text-link">
              متطلبات تجهيز الربط <ArrowUpLeft size={15} />
            </Link>
          </>
        )}
      </div>
    </main>
  );
}
