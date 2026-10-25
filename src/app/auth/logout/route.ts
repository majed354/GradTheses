import { NextRequest, NextResponse } from "next/server";
import { SESSION_COOKIE, FLOW_COOKIE } from "@/lib/auth";
import { appUrl } from "@/lib/config";
export async function POST(request: NextRequest) {
  if (request.headers.get("origin") !== appUrl())
    return new Response("Forbidden", { status: 403 });
  const response = NextResponse.redirect(
    new URL("/account?notice=signedout", appUrl()),
    303,
  );
  response.cookies.delete(SESSION_COOKIE);
  response.cookies.delete(FLOW_COOKIE);
  response.headers.set("Cache-Control", "no-store");
  return response;
}
