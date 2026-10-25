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
  kind: "رسالة علمية" | "بحث تكميلي" | "غير محدد";
  year: number;
  yearCalendar?: "hijri" | "gregorian";
  specialization?: string;
  coSupervisor?: string;
  status: "مكتمل" | "قيد الإعداد" | "مسجل" | "غير محدد";
  abstract: string;
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
