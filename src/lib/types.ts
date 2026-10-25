export const departments = [
  "الفقه",
  "أصول الفقه",
  "الدراسات القضائية",
  "الأنظمة",
  "القراءات",
  "الثقافة الإسلامية",
] as const;
export type Access = "university" | "metadata" | "embargo";
export type Thesis = {
  id: string;
  title: string;
  author: string;
  supervisor: string;
  department: string;
  degree: "ماجستير" | "دكتوراه";
  kind: "رسالة علمية" | "بحث تكميلي";
  year: number;
  status: "مكتمل" | "قيد الإعداد" | "مسجل";
  abstract: string;
  keywords: string[];
  pages?: number;
  access: Access;
  embargoUntil?: string;
  sample?: boolean;
};
export type Catalog = {
  theses: Thesis[];
  source: "demo" | "sharepoint";
  available: boolean;
};
