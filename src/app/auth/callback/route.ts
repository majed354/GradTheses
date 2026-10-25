import { NextRequest, NextResponse } from "next/server";
import * as oidc from "openid-client";
import {
  FLOW_COOKIE,
  SESSION_COOKIE,
  cookieOptions,
  oidcConfig,
  openCookie,
  sealCookie,
} from "@/lib/auth";
import { appUrl, readingEnabled } from "@/lib/config";
import { isReader, safeReturnPath } from "@/lib/policy";
export async function GET(request: NextRequest) {
  const base = appUrl();
  const fail = (notice: string) => {
    const r = NextResponse.redirect(new URL(`/account?notice=${notice}`, base));
    r.cookies.delete(FLOW_COOKIE);
    r.headers.set("Cache-Control", "no-store");
    return r;
  };
  if (!readingEnabled()) return fail("setup");
  try {
    const value = request.cookies.get(FLOW_COOKIE)?.value;
    if (!value) return fail("expired");
    const flow = await openCookie(value, "login");
    if (
      typeof flow.verifier !== "string" ||
      typeof flow.state !== "string" ||
      typeof flow.nonce !== "string"
    )
      return fail("failed");
    // Use canonical origin, never forwarded Host, for the redirect URI.
    const callback = new URL(`/auth/callback${request.nextUrl.search}`, base);
    const tokens = await oidc.authorizationCodeGrant(
      await oidcConfig(),
      callback,
      {
        pkceCodeVerifier: flow.verifier,
        expectedState: flow.state,
        expectedNonce: flow.nonce,
        idTokenExpected: true,
      },
    );
    const claims = tokens.claims();
    const role = process.env.ENTRA_READER_ROLE || "Theses.Reader";
    if (!claims || !isReader(claims, process.env.ENTRA_TENANT_ID!, role))
      return fail("forbidden");
    const seconds = Math.min(
      3600,
      Math.max(0, (claims.exp || 0) - Math.floor(Date.now() / 1000)),
    );
    if (seconds < 1) return fail("expired");
    const response = NextResponse.redirect(
      new URL(
        safeReturnPath(typeof flow.next === "string" ? flow.next : null),
        base,
      ),
    );
    response.cookies.set(
      SESSION_COOKIE,
      await sealCookie(
        {
          tid: claims.tid,
          oid: claims.oid,
          roles: [role],
          name:
            typeof claims.name === "string"
              ? claims.name.slice(0, 150)
              : "قارئ جامعي",
        },
        "session",
        seconds,
      ),
      { ...cookieOptions, maxAge: seconds },
    );
    response.cookies.delete(FLOW_COOKIE);
    response.headers.set("Cache-Control", "no-store");
    return response;
  } catch {
    return fail("failed");
  }
}
