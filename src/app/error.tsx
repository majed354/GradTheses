"use client";
export default function ErrorPage({ reset }: { reset: () => void }) {
  return (
    <main id="main" className="container narrow-page">
      <h1>تعذر إكمال الطلب</h1>
      <p>يرجى المحاولة مجددًا بعد قليل.</p>
      <button className="button button-primary" onClick={reset}>
        إعادة المحاولة
      </button>
    </main>
  );
}
