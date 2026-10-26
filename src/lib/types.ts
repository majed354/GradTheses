export const departments = [
  "الفقه",
  "أصول الفقه",
  "الدراسات القضائية",
  "الأنظمة",
  "القراءات",
  "الثقافة الإسلامية",
  "الشريعة",
] as const;
export type Access = "university" | "metadata" | "embargo";
export type Thesis = {
  id: string;
  title: string;
  author: string;
  supervisor: string;
  department: string;
  degree: "ماجستير" | "دكتوراه";
  kind: "رسالة علمية" | "بحث تكميلي" | "مشروع بحثي" | "غير محدد";
  year: number | null;
  yearCalendar?: "hijri" | "gregorian";
  specialization?: string;
  program?: string;
  sourceNote?: string;
  coSupervisor?: string;
  fileStatus?: "processing" | "partial" | "available";
  status: "مكتمل" | "قيد الإعداد" | "مسجل" | "غير محدد";
  abstract: string;
  abstractKind?: "editorial" | "author";
  keywords: string[];
  pages?: number;
  access: Access;
  embargoUntil?: string;
  sample?: boolean;
};
export type Catalog = {
  theses: Thesis[];
  source: "demo" | "sharepoint" | "published";
  available: boolean;
  publishedAt?: string;
};
