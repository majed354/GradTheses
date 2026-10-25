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
        (!filters.year || String(t.year) === filters.year)
      );
    })
    .sort((a, b) =>
      filters.sort === "oldest"
        ? a.year - b.year
        : filters.sort === "title"
          ? a.title.localeCompare(b.title, "ar")
          : b.year - a.year,
    );
}
export function citation(t: Thesis) {
  return `${t.author}. (${t.year}). ${t.title} [${t.kind}، ${t.degree}]. كلية الشريعة والأنظمة، جامعة الطائف.`;
}
