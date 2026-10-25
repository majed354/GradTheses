import Link from "next/link";
export default function NotFound() {
  return (
    <main id="main" className="container narrow-page">
      <span className="section-kicker">404</span>
      <h1>لم نعثر على هذه الصفحة</h1>
      <p>قد يكون السجل غير منشور أو تغير عنوانه.</p>
      <Link className="button button-primary" href="/catalog">
        العودة إلى الفهرس
      </Link>
    </main>
  );
}
