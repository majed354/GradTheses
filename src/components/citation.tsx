"use client";
import { useState } from "react";
import { Copy, Check } from "lucide-react";
export function CopyCitation({ text }: { text: string }) {
  const [copied, setCopied] = useState(false),
    [error, setError] = useState(false);
  return (
    <>
      <button
        className="button button-outline"
        onClick={async () => {
          try {
            await navigator.clipboard.writeText(text);
            setCopied(true);
            setError(false);
            setTimeout(() => setCopied(false), 2500);
          } catch {
            setError(true);
          }
        }}
      >
        {copied ? <Check size={16} /> : <Copy size={16} />}{" "}
        {copied ? "تم نسخ المرجع" : "نسخ الاستشهاد المرجعي"}
      </button>
      <span className="sr-only" role="status">
        {copied
          ? "تم النسخ"
          : error
            ? "تعذر النسخ. يمكنك تحديد النص ونسخه يدويًا."
            : ""}
      </span>
      {error && <small>يمكنك تحديد نص المرجع ونسخه يدويًا.</small>}
    </>
  );
}
