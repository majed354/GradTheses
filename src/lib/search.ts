import type { Thesis } from "./types";
export function normalizeArabic(value: string) {
  return value
    .normalize("NFKC")
    .replace(/[\p{M}\p{Cf}\u0640]/gu, "")
    .replace(/[٠-٩۰-۹]/g, (digit) =>
      String(digit.charCodeAt(0) - (digit <= "٩" ? 0x660 : 0x6f0)),
    )
    .replace(/[أإآٱ]/g, "ا")
    .replace(/ؤ/g, "و")
    .replace(/[ئىيی]/g, "ي")
    .replace(/ة/g, "ه")
    .replace(/ک/g, "ك")
    .toLowerCase()
    .replace(/[^\p{L}\p{N}]+/gu, " ")
    .replace(/(\p{N})(\p{L})/gu, "$1 $2")
    .replace(/(\p{L})(\p{N})/gu, "$1 $2")
    .trim()
    .split(/\s+/)
    .map((word) => (word === "بن" ? "ابن" : word))
    .join(" ");
}
export type SearchMode = "all" | "any" | "phrase";
export type SearchScope =
  "all" | "title" | "author" | "supervisor" | "abstract" | "program";
export type Filters = {
  query?: string;
  mode?: SearchMode;
  scope?: SearchScope;
  program?: string;
  department?: string;
  degree?: string;
  kind?: string;
  specialization?: string;
  fileStatus?: string;
  status?: string;
  access?: string;
  year?: string;
  sort?: string;
};
type SearchParamsReader = { get(name: string): string | null };
const searchModes = ["all", "any", "phrase"] as const;
const searchScopes = [
  "all",
  "title",
  "author",
  "supervisor",
  "abstract",
  "program",
] as const;
const catalogueFilterKeys = [
  "query",
  "mode",
  "scope",
  "program",
  "department",
  "degree",
  "kind",
  "specialization",
  "status",
  "year",
  "sort",
] as const;
// Old access/fileStatus URLs no longer impose invisible filters in the catalogue.
export function readCatalogFilters(params: SearchParamsReader): Filters {
  return {
    query: params.get("q") || "",
    mode: searchModes.find((mode) => mode === params.get("mode")) || "all",
    scope: searchScopes.find((scope) => scope === params.get("scope")) || "all",
    program: params.get("program") || "",
    department: params.get("department") || "",
    degree: params.get("degree") || "",
    kind: params.get("kind") || "",
    specialization: params.get("specialization") || "",
    status: params.get("status") || "",
    year: params.get("year") || "",
    sort:
      ["relevance", "newest", "oldest", "title"].find(
        (sort) => sort === params.get("sort"),
      ) || "relevance",
  };
}
export function catalogSearchParams(
  filters: Filters,
  { page = 1, view = "grid" }: { page?: number; view?: "grid" | "table" } = {},
) {
  const params = new URLSearchParams();
  for (const key of catalogueFilterKeys) {
    const value = filters[key];
    if (
      value &&
      !((key === "mode" || key === "scope") && value === "all") &&
      !(key === "sort" && value === "relevance")
    )
      params.set(key === "query" ? "q" : key, value);
  }
  if (Number.isInteger(page) && page > 1) params.set("page", String(page));
  if (view === "table") params.set("view", view);
  return params;
}
// Each control supplies only its own change. Reading the latest URL here avoids
// restoring filters from an earlier render when consecutive events run together.
export function patchCatalogSearchParams(
  current: URLSearchParams,
  patch: Filters,
  options: { reset?: boolean; page?: number; view?: "grid" | "table" } = {},
) {
  const latest = readCatalogFilters(
    options.reset ? new URLSearchParams() : current,
  );
  const hasFilterChange = catalogueFilterKeys.some((key) => key in patch);
  const requestedPage = Number(current.get("page"));
  const currentPage =
    Number.isInteger(requestedPage) && requestedPage > 0 ? requestedPage : 1;
  return catalogSearchParams(
    { ...latest, ...patch },
    {
      view:
        options.view ?? (current.get("view") === "table" ? "table" : "grid"),
      page:
        options.page ?? (options.reset || hasFilterChange ? 1 : currentPage),
    },
  );
}
export function yearLabel(t: Thesis) {
  if (t.year === null) return "السنة غير موثقة";
  return `${t.year} ${t.yearCalendar === "hijri" ? "هـ" : "م"}`;
}
export function workLabel(t: Thesis) {
  if (t.kind === "غير محدد") return `${t.degree} · نوع العمل غير موثق`;
  if (t.kind === "رسالة علمية") return `رسالة ${t.degree}`;
  return `${t.kind} لل${t.degree}`;
}
// Used only for ordering mixed-calendar year records, never as a date conversion.
const yearOrder = (t: Thesis) =>
  t.year === null
    ? null
    : t.yearCalendar === "hijri"
      ? 621.5774 + (t.year * 354.367) / 365.2425
      : t.year;

function compareYears(a: Thesis, b: Thesis, oldest: boolean) {
  const first = yearOrder(a),
    second = yearOrder(b);
  if (first === null) return second === null ? 0 : 1;
  if (second === null) return -1;
  return oldest ? first - second : second - first;
}

function searchableFields(t: Thesis) {
  return {
    title: normalizeArabic(t.title),
    author: normalizeArabic(t.author),
    supervisor: normalizeArabic(t.supervisor),
    coSupervisor: normalizeArabic(t.coSupervisor || ""),
    abstract: normalizeArabic(t.abstract),
    program: normalizeArabic(t.program || ""),
    other: [
      t.program,
      t.department,
      t.specialization,
      t.degree,
      t.kind,
      yearLabel(t),
      ...t.keywords,
    ]
      .filter(Boolean)
      .map((value) => normalizeArabic(value!)),
  };
}

export function filterTheses(theses: Thesis[], filters: Filters) {
  const phrase = normalizeArabic(filters.query || "");
  const terms = [...new Set(phrase.split(" ").filter(Boolean))];
  const mode = filters.mode || "all",
    scope = filters.scope || "all";
  const scores = new Map<Thesis, number[]>();
  return theses
    .filter((t) => {
      const fields = searchableFields(t);
      const values =
        scope === "all"
          ? [
              fields.title,
              fields.author,
              fields.supervisor,
              fields.coSupervisor,
              fields.abstract,
              fields.program,
              ...fields.other,
            ]
          : scope === "supervisor"
            ? [fields.supervisor, fields.coSupervisor]
            : [fields[scope]];
      const hasTerm = (term: string) =>
        values.some((value) => value.includes(term));
      const matches =
        !terms.length ||
        (mode === "phrase"
          ? values.some((value) => value.includes(phrase))
          : mode === "any"
            ? terms.some(hasTerm)
            : terms.every(hasTerm));
      scores.set(
        t,
        scope !== "all"
          ? [terms.filter(hasTerm).length]
          : [
              phrase && fields.program === phrase ? 1 : 0,
              terms.filter((term) => fields.title.includes(term)).length,
              terms.filter(
                (term) =>
                  fields.author.includes(term) ||
                  fields.supervisor.includes(term) ||
                  fields.coSupervisor.includes(term),
              ).length,
              terms.filter((term) => fields.abstract.includes(term)).length,
              terms.filter((term) =>
                fields.other.some((value) => value.includes(term)),
              ).length,
            ],
      );
      return (
        matches &&
        (!filters.program ||
          (filters.program === "unknown"
            ? !t.program
            : t.program === filters.program)) &&
        (!filters.department || t.department === filters.department) &&
        (!filters.degree || t.degree === filters.degree) &&
        (!filters.kind || t.kind === filters.kind) &&
        (!filters.specialization ||
          t.specialization === filters.specialization) &&
        (!filters.fileStatus || t.fileStatus === filters.fileStatus) &&
        (!filters.status || t.status === filters.status) &&
        (!filters.access || t.access === filters.access) &&
        (!filters.year ||
          (filters.year === "unknown"
            ? t.year === null
            : t.year !== null &&
              [String(t.year), yearLabel(t)].some(
                (value) =>
                  normalizeArabic(value) === normalizeArabic(filters.year!),
              )))
      );
    })
    .sort((a, b) => {
      if (filters.sort === "title") return a.title.localeCompare(b.title, "ar");
      if (terms.length && (!filters.sort || filters.sort === "relevance")) {
        const aScores = scores.get(a)!,
          bScores = scores.get(b)!;
        for (let i = 0; i < aScores.length; i++)
          if (aScores[i] !== bScores[i]) return bScores[i] - aScores[i];
      }
      return (
        compareYears(a, b, filters.sort === "oldest") ||
        a.title.localeCompare(b.title, "ar")
      );
    });
}
export function citation(t: Thesis) {
  return `${t.author}. (${yearLabel(t)}). ${t.title} [${workLabel(t)}]. ${t.program ? `${t.program}. ` : ""}كلية الشريعة والأنظمة، جامعة الطائف.`;
}
