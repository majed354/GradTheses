import type { Thesis } from "./types";
export function normalizeArabic(value: string) {
  return value
    .normalize("NFKC")
    .replace(/[\u064B-\u065F\u0670\u0640]/g, "")
    .replace(/[أإآٱ]/g, "ا")
    .replace(/ى/g, "ي")
    .toLowerCase()
    .trim();
}
export type Filters = {
  query?: string;
  department?: string;
  degree?: string;
  status?: string;
  access?: string;
  year?: string;
  sort?: string;
};
export function yearLabel(t: Thesis) {
  return `${t.year} ${t.yearCalendar === "hijri" ? "هـ" : "م"}`;
}
export function workLabel(t: Thesis) {
  return t.kind === "غير محدد" ? "عمل بحثي" : t.kind;
}
// Used only for ordering mixed-calendar year records, never as a date conversion.
const yearOrder = (t: Thesis) =>
  t.yearCalendar === "hijri"
    ? 621.5774 + (t.year * 354.367) / 365.2425
    : t.year;
export function filterTheses(theses: Thesis[], filters: Filters) {
  const terms = normalizeArabic(filters.query || "")
    .split(/\s+/)
    .filter(Boolean);
  return theses
    .filter((t) => {
      const haystack = normalizeArabic(
        [
          t.title,
          t.author,
          t.supervisor,
          t.department,
          t.specialization,
          t.coSupervisor,
          t.abstract,
          ...t.keywords,
        ].join(" "),
      );
      return (
        terms.every((term) => haystack.includes(term)) &&
        (!filters.department || t.department === filters.department) &&
        (!filters.degree || t.degree === filters.degree) &&
        (!filters.status || t.status === filters.status) &&
        (!filters.access || t.access === filters.access) &&
        (!filters.year ||
          String(t.year) === filters.year ||
          yearLabel(t) === filters.year)
      );
    })
    .sort((a, b) =>
      filters.sort === "oldest"
        ? yearOrder(a) - yearOrder(b)
        : filters.sort === "title"
          ? a.title.localeCompare(b.title, "ar")
          : yearOrder(b) - yearOrder(a),
    );
}
export function citation(t: Thesis) {
  return `${t.author}. (${yearLabel(t)}). ${t.title} [${workLabel(t)}، ${t.degree}]. كلية الشريعة والأنظمة، جامعة الطائف.`;
}
