import Link from "next/link";
import {
  ArrowUpLeft,
  CalendarDays,
  LockKeyhole,
  UserRound,
  FileText,
} from "lucide-react";
import type { Thesis } from "@/lib/types";
import { yearLabel, workLabel } from "@/lib/search";
export function AccessBadge({ thesis }: { thesis: Thesis }) {
  return (
    <span className={`access-badge access-${thesis.access}`}>
      {thesis.access === "university" ? (
        <>
          <LockKeyhole size={12} /> قراءة جامعية
        </>
      ) : thesis.access === "embargo" ? (
        "إتاحة مؤجلة"
      ) : (
        "بيانات الموضوع"
      )}
    </span>
  );
}
export function ThesisCard({ thesis: t }: { thesis: Thesis }) {
  return (
    <article className="thesis-card">
      <div className="card-top">
        <span className="department-label">{t.department}</span>
        <span className="degree-label">{t.degree}</span>
      </div>
      <h3>
        <Link href={`/theses/${t.id}`}>{t.title}</Link>
      </h3>
      <p className="card-author">
        <UserRound size={15} />
        {t.author}
      </p>
      <div className="card-keywords">
        {t.keywords.slice(0, 2).map((k) => (
          <Link key={k} href={`/catalog?q=${encodeURIComponent(k)}`}>
            {k}
          </Link>
        ))}
      </div>
      <div className="card-meta">
        <span>
          <CalendarDays size={14} />
          {yearLabel(t)}
        </span>
        <span>
          <FileText size={14} />
          {workLabel(t)}
        </span>
      </div>
      <div className="card-bottom">
        <AccessBadge thesis={t} />
        <Link
          href={`/theses/${t.id}`}
          aria-label={`تفاصيل ${t.title}`}
          className="card-arrow"
        >
          <ArrowUpLeft size={20} />
        </Link>
      </div>
    </article>
  );
}
