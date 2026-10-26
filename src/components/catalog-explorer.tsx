"use client";
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
import {
  catalogSearchParams,
  filterTheses,
  readCatalogFilters,
  yearLabel,
  workLabel,
  type Filters,
  type SearchMode,
  type SearchScope,
} from "@/lib/search";
import { ThesisCard, AccessBadge } from "./thesis-card";
import type { Thesis } from "@/lib/types";
export function CatalogExplorer({ theses }: { theses: Thesis[] }) {
  const params = useSearchParams();
  const filters = readCatalogFilters(params);
  const view = params.get("view") === "table" ? "table" : "grid";
  const requestedPage = Number(params.get("page"));
  const page =
    Number.isInteger(requestedPage) && requestedPage > 0 ? requestedPage : 1;
  const results = filterTheses(theses, filters),
    pages = Math.max(1, Math.ceil(results.length / 6)),
    current = Math.min(page, pages),
    visible = results.slice((current - 1) * 6, current * 6);
  const update = (
    next: Filters,
    display: { page?: number; view?: "grid" | "table" } = {},
  ) => {
    const p = catalogSearchParams(next, { view, ...display });
    window.history.replaceState(null, "", `/catalog${p.size ? "?" + p : ""}`);
  };
  const field = (
    key: keyof Filters,
    label: string,
    options: (string | { value: string; label: string })[],
  ) => {
    const values = options.map((option) =>
      typeof option === "string" ? { value: option, label: option } : option,
    );
    if (filters[key] && !values.some((option) => option.value === filters[key]))
      values.push({
        value: filters[key]!,
        label: `${filters[key]} (غير متاح حاليًا)`,
      });
    return (
      <label className={`filter-field filter-field-${key}`}>
        {label}
        <select
          value={filters[key] || ""}
          onChange={(e) => update({ ...filters, [key]: e.target.value })}
        >
          <option value="">الكل</option>
          {values.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </label>
    );
  };
  const modeLabels: Record<SearchMode, string> = {
    all: "كل الكلمات",
    any: "أي من الكلمات",
    phrase: "عبارة مطابقة",
  };
  const scopeLabels: Record<SearchScope, string> = {
    all: "جميع الحقول",
    title: "العنوان",
    author: "الباحث",
    supervisor: "المشرف",
    abstract: "الملخص",
    program: "البرنامج",
  };
  const filterLabels: Record<string, string> = {
    query: "البحث",
    mode: "المطابقة",
    scope: "مجال البحث",
    program: "البرنامج",
    department: "القسم",
    degree: "الدرجة",
    kind: "نوع العمل",
    specialization: "التخصص",
    status: "حالة العمل",
    year: "السنة",
  };
  const active = Object.entries(filters).filter(
    ([key, value]) =>
      value &&
      key !== "sort" &&
      !((key === "mode" || key === "scope") && value === "all"),
  );
  const programs = [
    ...new Set(theses.flatMap((t) => (t.program ? [t.program] : []))),
  ].sort((a, b) => a.localeCompare(b, "ar"));
  const years = [
    ...new Set(theses.filter((t) => t.year !== null).map(yearLabel)),
  ]
    .sort()
    .reverse();
  return (
    <div className="catalog-layout">
      <aside className="filters">
        <div className="filters-title">
          <strong>
            <SlidersHorizontal size={17} /> تخصيص البحث
          </strong>
          <button
            onClick={() => update({ sort: "relevance" })}
            className="text-button"
          >
            مسح الكل
          </button>
        </div>
        {field("program", "البرنامج", [
          ...programs,
          ...(theses.some((t) => !t.program)
            ? [{ value: "unknown", label: "غير موثق" }]
            : []),
        ])}
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
        {field("year", "السنة", [
          ...years,
          ...(theses.some((t) => t.year === null)
            ? [{ value: "unknown", label: "غير موثقة" }]
            : []),
        ])}
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
        <div className="catalog-search-options">
          <label className="filter-field">
            طريقة المطابقة
            <select
              value={filters.mode}
              onChange={(e) =>
                update({ ...filters, mode: e.target.value as SearchMode })
              }
            >
              {Object.entries(modeLabels).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </label>
          <label className="filter-field">
            مجال البحث
            <select
              value={filters.scope}
              onChange={(e) =>
                update({ ...filters, scope: e.target.value as SearchScope })
              }
            >
              {Object.entries(scopeLabels).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </label>
        </div>
        <p className="catalog-search-hint">
          {filters.mode === "phrase"
            ? "تُبحث العبارة بترتيب كلماتها داخل حقل واحد، مع تقريب الكتابة العربية."
            : filters.mode === "any"
              ? "تظهر الأعمال التي تتضمن كلمة واحدة على الأقل من كلمات البحث."
              : "يمكن كتابة الكلمات بأي ترتيب؛ تُبحث جميعها في الحقول المختارة."}
        </p>
        <div className="results-toolbar">
          <p aria-live="polite">
            <strong>{results.length}</strong> سجلًا علميًا{" "}
            <span>متوافقًا مع بحثك</span>
          </p>
          <div className="results-options">
            <select
              aria-label="ترتيب النتائج"
              value={filters.sort || "relevance"}
              onChange={(e) => update({ ...filters, sort: e.target.value })}
            >
              <option value="relevance">الأكثر صلة</option>
              <option value="newest">الأحدث أولًا</option>
              <option value="oldest">الأقدم أولًا</option>
              <option value="title">حسب العنوان</option>
            </select>
            <div className="view-toggle">
              <button
                aria-label="عرض البطاقات"
                aria-pressed={view === "grid"}
                onClick={() => update(filters, { view: "grid", page: current })}
              >
                <LayoutGrid size={18} />
              </button>
              <button
                aria-label="عرض الجدول"
                aria-pressed={view === "table"}
                onClick={() =>
                  update(filters, { view: "table", page: current })
                }
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
                {filterLabels[k]}:{" "}
                {k === "mode"
                  ? modeLabels[v as SearchMode]
                  : k === "scope"
                    ? scopeLabels[v as SearchScope]
                    : v === "unknown"
                      ? k === "year"
                        ? "غير موثقة"
                        : "غير موثق"
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
              onClick={() => update({ sort: "relevance" })}
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
                  <th>البرنامج ونوع العمل</th>
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
                    <td>
                      {t.program && <small>{t.program}</small>}
                      {workLabel(t)}
                    </td>
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
              onClick={() => update(filters, { page: current - 1 })}
            >
              <ArrowRight size={16} /> السابق
            </button>
            <span aria-live="polite">
              {current} / {pages}
            </span>
            <button
              disabled={current >= pages}
              onClick={() => update(filters, { page: current + 1 })}
            >
              التالي <ArrowLeft size={16} />
            </button>
          </nav>
        )}
      </section>
    </div>
  );
}
