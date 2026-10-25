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
          <Link href="/" className="brand" aria-label="الرئيسية — مداد">
            <span className="brand-mark">
              <BookOpen size={28} strokeWidth={1.5} />
            </span>
            <span>
              <strong>
                مِداد<span className="brand-dot">.</span>
              </strong>
              <small>بوابة بحوث ورسائل الدراسات العليا</small>
            </span>
          </Link>
          <nav aria-label="التنقل الرئيسي">
            <Link href="/catalog">الفهرس العلمي</Link>
            <Link href="/catalog?status=مسجل">الموضوعات المسجلة</Link>
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
            <BookOpen size={22} /> مِداد
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
        <span>نسخة أولية للعرض والمراجعة · اسم «مداد» مقترح للمنصة</span>
        <span>المعرفة متاحة. والحقوق محفوظة.</span>
      </div>
    </footer>
  );
}
export function DemoNotice({
  demo,
  available = true,
}: {
  demo: boolean;
  available?: boolean;
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
