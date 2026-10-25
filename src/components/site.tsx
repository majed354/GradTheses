import Link from "next/link";
import {
  ArrowUpLeft,
  BookOpen,
  GraduationCap,
  LockKeyhole,
  ShieldCheck,
} from "lucide-react";
export function Header() {
  return (
    <>
      <div className="utility">
        <div className="container">
          <span>
            جامعة الطائف <span className="utility-separator">/</span> كلية
            الشريعة والأنظمة
          </span>
          <span className="utility-left">
            <ShieldCheck size={14} /> فهرس عام · قراءة جامعية
          </span>
        </div>
      </div>
      <header className="header">
        <div className="container header-inner">
          <Link
            href="/"
            className="brand"
            aria-label="الرئيسية — مداد كلية الشريعة والأنظمة"
          >
            <span className="brand-mark">
              <BookOpen size={28} strokeWidth={1.5} />
            </span>
            <span>
              <strong>
                مداد<span className="brand-dot">.</span>
              </strong>
              <span className="brand-college">كلية الشريعة والأنظمة</span>
              <small>بوابة بحوث ورسائل الدراسات العليا</small>
            </span>
          </Link>
          <nav aria-label="التنقل الرئيسي">
            <Link href="/catalog">الفهرس العلمي</Link>
            <Link href="/catalog?status=قيد الإعداد">أعمال قيد الإعداد</Link>
            <Link href="/about">عن المنصة</Link>
          </nav>
          <Link href="/account" className="button button-outline header-login">
            <LockKeyhole size={16} />
            <span>الدخول الجامعي</span>
          </Link>
        </div>
      </header>
    </>
  );
}
export function Footer() {
  return (
    <footer className="footer">
      <div className="container footer-top">
        <div>
          <Link href="/" className="footer-brand">
            <BookOpen size={22} /> مداد كلية الشريعة والأنظمة
          </Link>
          <p>
            نافذة على المعرفة، وامتداد لأثر البحث العلمي.
            <br />
            كلية الشريعة والأنظمة — جامعة الطائف.
          </p>
        </div>
        <div className="footer-links">
          <Link href="/catalog">الفهرس العلمي</Link>
          <Link href="/access">سياسة القراءة والإتاحة</Link>
          <Link href="/setup">
            تجهيز الربط الجامعي <ArrowUpLeft size={14} />
          </Link>
        </div>
        <GraduationCap className="footer-seal" size={78} strokeWidth={0.7} />
      </div>
      <div className="container footer-bottom">
        <span>مداد كلية الشريعة والأنظمة · جامعة الطائف</span>
        <span>المعرفة متاحة. والحقوق محفوظة.</span>
      </div>
    </footer>
  );
}
export function DemoNotice({
  demo,
  available = true,
  publishedAt,
}: {
  demo: boolean;
  available?: boolean;
  publishedAt?: string;
}) {
  return demo ? (
    <div className="notice demo-notice">
      <span className="notice-dot" />
      نسخة تجريبية — جميع العناوين والأسماء والأقسام المعروضة بيانات توضيحية،
      وليست سجلات جامعية معتمدة.
    </div>
  ) : !available ? (
    <div className="notice" role="alert">
      خدمة الفهرس الجامعي غير متاحة حاليًا. يرجى المحاولة لاحقًا.
    </div>
  ) : publishedAt ? (
    <div className="notice">
      آخر تحديث للفهرس:{" "}
      {new Intl.DateTimeFormat("ar-SA", {
        dateStyle: "medium",
        calendar: "gregory",
        timeZone: "Asia/Riyadh",
      }).format(new Date(publishedAt))}
      . تُضاف النصوص الكاملة تدريجيًا بعد اعتمادها.
    </div>
  ) : null;
}
export function Breadcrumb({
  items,
}: {
  items: { label: string; href?: string }[];
}) {
  return (
    <nav className="breadcrumb container" aria-label="مسار الصفحة">
      <Link href="/">الرئيسية</Link>
      {items.map((item, i) => (
        <span key={i}>
          <span className="crumb-separator">/</span>
          {item.href ? (
            <Link href={item.href}>{item.label}</Link>
          ) : (
            <span aria-current="page">{item.label}</span>
          )}
        </span>
      ))}
    </nav>
  );
}
