import type { Thesis } from "./types";
export function safeReturnPath(value: string | null | undefined) {
  return value && /^\/read\/[a-zA-Z0-9_-]+$/.test(value) ? value : "/catalog";
}
export function isReader(
  claims: Record<string, unknown>,
  tenant: string,
  role: string,
) {
  return (
    claims.tid === tenant &&
    typeof claims.oid === "string" &&
    Array.isArray(claims.roles) &&
    claims.roles.includes(role)
  );
}
export function safeReadingUrl(value: unknown, host: string | undefined) {
  if (
    typeof value !== "string" ||
    !host ||
    !/^[a-z0-9-]+\.sharepoint\.com$/i.test(host)
  )
    return null;
  try {
    const url = new URL(value);
    if (
      url.protocol !== "https:" ||
      url.hostname !== host.toLowerCase() ||
      url.username ||
      url.password ||
      url.port ||
      url.searchParams.has("download")
    )
      return null;
    if (
      !url.pathname.startsWith("/sites/") &&
      !url.pathname.startsWith("/:b:/")
    )
      return null;
    return url.href;
  } catch {
    return null;
  }
}
export function canRead(t: Thesis) {
  return (
    !t.sample &&
    t.access === "university" &&
    t.status === "مكتمل" &&
    t.fileStatus !== "partial" &&
    t.fileStatus !== "processing"
  );
}
const text = (v: unknown) => (typeof v === "string" ? v.trim() : "");
// Explicit allowlist: no spread of Graph fields into public data.
export function publicRecord(f: Record<string, unknown>): Thesis | null {
  if (f.PublicationStatus !== "Published") return null;
  const id = text(f.ThesisId),
    title = text(f.Title),
    author = text(f.AuthorName),
    supervisor = text(f.SupervisorName),
    department = text(f.Department);
  const year = Number(f.Year),
    calendar = text(f.YearCalendar) || "gregorian",
    degree = text(f.Degree),
    kind = text(f.WorkType),
    status = text(f.AcademicStatus),
    access = text(f.AccessLevel);
  if (
    !/^[a-zA-Z0-9_-]{1,100}$/.test(id) ||
    !title ||
    !author ||
    !department ||
    !Number.isInteger(year) ||
    !["hijri", "gregorian"].includes(calendar) ||
    (calendar === "hijri"
      ? year < 1300 || year > 1600
      : year < 1900 || year > 2200)
  )
    return null;
  if (
    !["ماجستير", "دكتوراه"].includes(degree) ||
    !["رسالة علمية", "بحث تكميلي", "مشروع بحثي", "غير محدد"].includes(kind) ||
    !["مكتمل", "قيد الإعداد", "مسجل", "غير محدد"].includes(status) ||
    !["university", "metadata", "embargo"].includes(access)
  )
    return null;
  const pages = Number(f.PageCount);
  return {
    id,
    title,
    author,
    supervisor,
    department,
    year,
    yearCalendar: calendar as Thesis["yearCalendar"],
    ...(["processing", "partial", "available"].includes(text(f.FileStatus))
      ? { fileStatus: text(f.FileStatus) as Thesis["fileStatus"] }
      : {}),
    ...(text(f.Specialization)
      ? { specialization: text(f.Specialization) }
      : {}),
    ...(text(f.CoSupervisorName)
      ? { coSupervisor: text(f.CoSupervisorName) }
      : {}),
    degree: degree as Thesis["degree"],
    kind: kind as Thesis["kind"],
    status: status as Thesis["status"],
    access: access as Thesis["access"],
    abstract: text(f.AbstractText),
    ...(["editorial", "author"].includes(text(f.AbstractKind))
      ? { abstractKind: text(f.AbstractKind) as Thesis["abstractKind"] }
      : {}),
    keywords: text(f.KeywordsText)
      .split(/[;؛]/)
      .map((t) => t.trim())
      .filter(Boolean),
    ...(pages > 0 ? { pages } : {}),
    ...(text(f.EmbargoUntil)
      ? { embargoUntil: text(f.EmbargoUntil).slice(0, 10) }
      : {}),
  };
}
