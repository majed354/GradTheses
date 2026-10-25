import { NextRequest, NextResponse } from "next/server";
import * as oidc from "openid-client";
import { oidcConfig, sealCookie, FLOW_COOKIE, cookieOptions } from "@/lib/auth";
import { appUrl, readingEnabled, nativeSharePointAuth } from "@/lib/config";
import { safeReturnPath } from "@/lib/policy";
export async function GET(request: NextRequest) {
  const base = appUrl();
  if (nativeSharePointAuth()) {
    const next = safeReturnPath(request.nextUrl.searchParams.get("next"));
    return NextResponse.redirect(
      new URL(next === "/catalog" ? "/account" : next, base),
    );
  }
  if (!readingEnabled())
    return NextResponse.redirect(new URL("/account?notice=setup", base));
  try {
    const config = await oidcConfig(),
      verifier = oidc.randomPKCECodeVerifier(),
      state = oidc.randomState(),
      nonce = oidc.randomNonce();
    const next = safeReturnPath(request.nextUrl.searchParams.get("next"));
    const target = oidc.buildAuthorizationUrl(config, {
      redirect_uri: `${base}/auth/callback`,
      scope: "openid profile",
      response_type: "code",
      response_mode: "query",
      code_challenge: await oidc.calculatePKCECodeChallenge(verifier),
      code_challenge_method: "S256",
      state,
      nonce,
      prompt: "select_account",
    });
    const response = NextResponse.redirect(target);
    response.cookies.set(
      FLOW_COOKIE,
      await sealCookie({ verifier, state, nonce, next }, "login", 600),
      { ...cookieOptions, maxAge: 600 },
    );
    response.headers.set("Cache-Control", "no-store");
    return response;
  } catch {
    return NextResponse.redirect(new URL("/account?notice=failed", base));
  }
}
