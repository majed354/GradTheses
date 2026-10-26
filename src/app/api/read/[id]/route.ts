import { NextRequest, NextResponse } from "next/server";
import { readingEnabled, appUrl, nativeSharePointAuth } from "@/lib/config";
import { getSession } from "@/lib/auth";
import { getReadingLink } from "@/lib/catalog";
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const headers = {
    "Cache-Control": "private, no-store",
    "Referrer-Policy": "no-referrer",
  };
  if (!readingEnabled())
    return Response.json(
      { error: "النصوص الكاملة غير متاحة حاليًا." },
      { status: 503, headers },
    );
  // Native mode delegates authentication and ACL enforcement to SharePoint.
  // No PDF bytes or Microsoft tokens pass through this application.
  if (!nativeSharePointAuth() && !(await getSession()))
    return Response.json(
      { error: "يلزم تسجيل الدخول بالحساب الجامعي المصرح له." },
      { status: 401, headers },
    );
  const { id } = await params;
  if (!/^[a-zA-Z0-9_-]{1,100}$/.test(id))
    return Response.json({ error: "معرف غير صالح." }, { status: 400, headers });
  try {
    const target = await getReadingLink(id);
    if (!target)
      return NextResponse.redirect(
        new URL(`/read/${id}?notice=unavailable`, appUrl()),
        { status: 303, headers },
      );
    return NextResponse.redirect(target, { status: 303, headers });
  } catch {
    return Response.json(
      { error: "تعذر الوصول إلى خدمة القراءة. حاول لاحقًا." },
      { status: 503, headers },
    );
  }
}
