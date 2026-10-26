"use client";
import { useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  Search,
  SlidersHorizontal,
  LayoutGrid,
  List,
  X,
  ArrowLeft,
  ArrowRight,
} from "lucide-react";
import { filterTheses, yearLabel, workLabel, type Filters } from "@/lib/search";
import { ThesisCard, AccessBadge } from "./thesis-card";
import type { Thesis } from "@/lib/types";
export function CatalogExplorer({ theses }: { theses: Thesis[] }) {
  const params = useSearchParams();
  const filters: Filters = {
    query: params.get("q") || "",
    department: params.get("department") || "",
    degree: params.get("degree") || "",
    kind: params.get("kind") || "",
    specialization: params.get("specialization") || "",
    fileStatus: params.get("fileStatus") || "",
    status: params.get("status") || "",
    access: params.get("access") || "",
    year: params.get("year") || "",
    sort: params.get("sort") || "newest",
  };
  const [view, setView] = useState<"grid" | "table">("grid");
  const [page, setPage] = useState(1);
  const results = filterTheses(theses, filters),
    pages = Math.max(1, Math.ceil(results.length / 6)),
    current = Math.min(page, pages),
    visible = results.slice((current - 1) * 6, current * 6);
  const update = (next: Filters) => {
    setPage(1);
    const p = new URLSearchParams();
    for (const [key, value] of Object.entries(next))
      if (value && !(key === "sort" && value === "newest"))
        p.set(key === "query" ? "q" : key, value);
    window.history.replaceState(null, "", `/catalog${p.size ? "?" + p : ""}`);
  };
  const field = (key: keyof Filters, label: string, options: string[]) => (
    <label className="filter-field">
      {label}
      <select
        value={filters[key] || ""}
        onChange={(e) => update({ ...filters, [key]: e.target.value })}
      >
        <option value="">الكل</option>
        {options.map((o) => (
          <option key={o}>{o}</option>
        ))}
      </select>
    </label>
  );
  const active = Object.entries(filters).filter(([k, v]) => v && k !== "sort");
  return (
    <div className="catalog-layout">
      <aside className="filters">
        <div className="filters-title">
          <strong>
            <SlidersHorizontal size={17} /> تخصيص البحث
          </strong>
          <button
            onClick={() => update({ sort: "newest" })}
            className="text-button"
          >
            مسح الكل
          </button>
        </div>
        {field("department", "القسم العلمي", [
          ...new Set(theses.map((t) => t.department)),
        ])}
        {field("degree", "الدرجة العلمية", ["ماجستير", "دكتوراه"])}
        {field("kind", "نوع العمل الموثق", [
          "مشروع بحثي",
          "رسالة علمية",
          "بحث تكميلي",
          "غير محدد",
        ])}
        {field("specialization", "التخصص", [
          ...new Set(
            theses.flatMap((t) => (t.specialization ? [t.specialization] : [])),
          ),
        ])}
        {field("status", "حالة العمل", [
          "مكتمل",
          "قيد الإعداد",
          "مسجل",
          "غير محدد",
        ])}
        {field(
          "year",
          "السنة",
          [...new Set(theses.map(yearLabel))].sort().reverse(),
        )}
        <div className="filter-tip">
          تتاح البيانات والملخصات المعتمدة للجميع. لا يُحدد نوع العمل من الدرجة
          وحدها.
        </div>
      </aside>
      <section className="catalog-results" aria-label="نتائج البحث">
        <form onSubmit={(e) => e.preventDefault()} className="catalog-search">
          <Search size={21} />
          <input
            aria-label="البحث في الفهرس"
            placeholder="ابحث بالعنوان، الباحث، المشرف، أو الموضوع…"
            value={filters.query || ""}
            onChange={(e) => update({ ...filters, query: e.target.value })}
          />
          {filters.query && (
            <button
              type="button"
              aria-label="مسح البحث"
              onClick={() => update({ ...filters, query: "" })}
            >
              <X size={18} />
            </button>
          )}
        </form>
        <div className="results-toolbar">
          <p aria-live="polite">
            <strong>{results.length}</strong> سجلًا علميًا{" "}
            <span>متوافقًا مع بحثك</span>
          </p>
          <div className="results-options">
            <select
              aria-label="ترتيب النتائج"
              value={filters.sort || "newest"}
              onChange={(e) => update({ ...filters, sort: e.target.value })}
            >
              <option value="newest">الأحدث أولًا</option>
              <option value="oldest">الأقدم أولًا</option>
              <option value="title">حسب العنوان</option>
            </select>
            <div className="view-toggle">
              <button
                aria-label="عرض البطاقات"
                aria-pressed={view === "grid"}
                onClick={() => setView("grid")}
              >
                <LayoutGrid size={18} />
              </button>
              <button
                aria-label="عرض الجدول"
                aria-pressed={view === "table"}
                onClick={() => setView("table")}
              >
                <List size={18} />
              </button>
            </div>
          </div>
        </div>
        {active.length > 0 && (
          <div className="active-filters">
            {active.map(([k, v]) => (
              <button key={k} onClick={() => update({ ...filters, [k]: "" })}>
                {k === "access"
                  ? {
                      university: "قراءة جامعية",
                      metadata: "بيانات فقط",
                      embargo: "إتاحة مؤجلة",
                    }[v]
                  : v}
                <X size={12} />
              </button>
            ))}
          </div>
        )}
        {!results.length ? (
          <div className="empty-state">
            <Search size={36} />
            <h2>لم نعثر على نتائج مطابقة</h2>
            <p>جرّب كلمات أقصر أو وسّع خيارات التصفية.</p>
            <button
              className="button button-outline"
              onClick={() => update({ sort: "newest" })}
            >
              إعادة تعيين البحث
            </button>
          </div>
        ) : view === "grid" ? (
          <div className="thesis-grid">
            {visible.map((t) => (
              <ThesisCard thesis={t} key={t.id} />
            ))}
          </div>
        ) : (
          <div className="table-scroll">
            <table>
              <thead>
                <tr>
                  <th>العنوان والباحث</th>
                  <th>القسم</th>
                  <th>الدرجة ونوع العمل</th>
                  <th>السنة</th>
                  <th>الإتاحة</th>
                </tr>
              </thead>
              <tbody>
                {visible.map((t) => (
                  <tr key={t.id}>
                    <td>
                      <Link href={`/theses/${t.id}`}>{t.title}</Link>
                      <small>{t.author}</small>
                    </td>
                    <td>{t.department}</td>
                    <td>{workLabel(t)}</td>
                    <td>{yearLabel(t)}</td>
                    <td>
                      <AccessBadge thesis={t} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        {pages > 1 && (
          <nav className="pagination" aria-label="صفحات النتائج">
            <button
              disabled={current <= 1}
              onClick={() => setPage(current - 1)}
            >
              <ArrowRight size={16} /> السابق
            </button>
            <span aria-live="polite">
              {current} / {pages}
            </span>
            <button
              disabled={current >= pages}
              onClick={() => setPage(current + 1)}
            >
              التالي <ArrowLeft size={16} />
            </button>
          </nav>
        )}
      </section>
    </div>
  );
}
