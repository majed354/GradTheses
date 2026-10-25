import Link from "next/link";
import {
  ArrowUpLeft,
  ArrowLeft,
  Search,
  BookOpen,
  GraduationCap,
  LibraryBig,
  Scale,
  Landmark,
  ScrollText,
  BookMarked,
  ShieldCheck,
  LockKeyhole,
} from "lucide-react";
import { getCatalog } from "@/lib/catalog";
import { DemoNotice } from "@/components/site";
import { ThesisCard } from "@/components/thesis-card";
export const dynamic = "force-dynamic";
export default async function Home() {
  const catalog = await getCatalog(),
    theses = catalog.theses,
    depts = [...new Set(theses.map((t) => t.department))],
    icons = [Scale, ScrollText, Landmark, BookMarked, BookOpen, GraduationCap];
  return (
    <main id="main">
      <DemoNotice
        demo={catalog.source === "demo"}
        available={catalog.available}
      />
      <section className="hero">
        <div className="container hero-layout">
          <div className="hero-copy">
            <div className="eyebrow">
              <span /> المستودع العلمي للدراسات العليا
            </div>
            <h1>
              معرفةٌ تُبنى،
              <br />
              وأثرٌ <em>يبقى.</em>
            </h1>
            <p>
              اكتشف بحوث ورسائل كلية الشريعة والأنظمة.
              <br />
              مساحة تجمع جهود الباحثين، وتفتح آفاقًا لبحثك القادم.
            </p>
            <form action="/catalog" className="hero-search">
              <Search size={23} />
              <input
                name="q"
                aria-label="ابحث في البحوث والرسائل"
                placeholder="عن أي موضوع تبحث؟"
              />
              <button type="submit">
                ابحث <ArrowLeft size={18} />
              </button>
            </form>
            <div className="popular-searches">
              <span>استكشف:</span>
              {["الفقه المقارن", "الذكاء الاصطناعي", "القراءات"].map((t) => (
                <Link key={t} href={`/catalog?q=${encodeURIComponent(t)}`}>
                  {t}
                </Link>
              ))}
            </div>
          </div>
          <div className="hero-art" aria-hidden="true">
            <div className="orbit orbit-one" />
            <div className="orbit orbit-two" />
            <div className="art-caption">
              من السؤال
              <br />
              تبدأ المعرفة.
            </div>
            <div className="book book-one">
              <span>
                الشريعة
                <br />
                والأنظمة
              </span>
              <small>الدراسات العليا</small>
            </div>
            <div className="book book-two">
              <span>
                آفاق
                <br />
                البحث
              </span>
              <small>علمٌ وأثر</small>
            </div>
            <div className="book book-three">
              <BookOpen size={40} strokeWidth={0.8} />
              <span>مداد</span>
            </div>
            <div className="art-note">
              <span>∗</span> لكل بحثٍ، امتداد.
            </div>
          </div>
        </div>
      </section>
      <section className="stats container" aria-label="إحصاءات الفهرس">
        <div>
          <LibraryBig />
          <strong>{theses.length.toLocaleString("ar-SA")}</strong>
          <span>
            سجلًا في الفهرس{catalog.source === "demo" ? " التوضيحي" : ""}
          </span>
        </div>
        <div>
          <BookOpen />
          <strong>
            {theses
              .filter((t) => t.status === "مكتمل")
              .length.toLocaleString("ar-SA")}
          </strong>
          <span>
            عملًا مكتملًا{catalog.source === "demo" ? " توضيحيًا" : ""}
          </span>
        </div>
        <div>
          <GraduationCap />
          <strong>{depts.length.toLocaleString("ar-SA")}</strong>
          <span>أقسام ممثلة في الفهرس</span>
        </div>
        <div className="stats-message">
          <ShieldCheck />
          <p>
            بيانات متاحة للجميع
            <br />
            <strong>ونصوص بقراءة جامعية</strong>
          </p>
        </div>
      </section>
      <section className="section container">
        <div className="section-heading">
          <div>
            <div className="section-kicker">مجالات تتكامل</div>
            <h2>اكتشف مسارات المعرفة</h2>
          </div>
          <Link href="/catalog" className="text-link">
            استعرض الفهرس <ArrowLeft size={17} />
          </Link>
        </div>
        <div className="department-grid">
          {depts.map((d, i) => {
            const Icon = icons[i % icons.length];
            return (
              <Link
                key={d}
                href={`/catalog?department=${encodeURIComponent(d)}`}
                className="department-card"
              >
                <Icon size={27} strokeWidth={1.4} />
                <h3>{d}</h3>
                <p>
                  {theses
                    .filter((t) => t.department === d)
                    .length.toLocaleString("ar-SA")}{" "}
                  سجل علمي
                </p>
                <ArrowUpLeft className="department-arrow" size={17} />
              </Link>
            );
          })}
        </div>
      </section>
      <section className="latest-section">
        <div className="container section">
          <div className="section-heading">
            <div>
              <div className="section-kicker">امتدادٌ للجهد العلمي</div>
              <h2>من الفهرس العلمي</h2>
            </div>
            <Link href="/catalog" className="text-link">
              جميع البحوث والرسائل <ArrowLeft size={17} />
            </Link>
          </div>
          <div className="thesis-grid home-grid">
            {[...theses]
              .sort((a, b) => b.year - a.year)
              .slice(0, 3)
              .map((t) => (
                <ThesisCard key={t.id} thesis={t} />
              ))}
          </div>
          {!theses.length && (
            <p className="empty-state">
              {catalog.available
                ? "تُضاف السجلات المعتمدة إلى الفهرس قريبًا."
                : "تعذر تحديث الفهرس. يرجى المحاولة لاحقًا."}
            </p>
          )}
        </div>
      </section>
      <section className="container access-strip">
        <div className="access-strip-icon">
          <LockKeyhole size={29} />
        </div>
        <div>
          <h2>استكشف المعرفة. واقرأ بحسابك الجامعي.</h2>
          <p>
            بيانات البحوث متاحة للجميع، وقراءة النص الكامل للمصرح لهم عبر خدمات
            الجامعة.
          </p>
        </div>
        <Link href="/access" className="button button-outline">
          تعرّف على آلية القراءة <ArrowUpLeft size={17} />
        </Link>
      </section>
    </main>
  );
}
