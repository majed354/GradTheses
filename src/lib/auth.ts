import "server-only";
import * as oidc from "openid-client";
import { cookies } from "next/headers";
import { seal, unseal } from "./session-crypto";
import { authConfigured } from "./config";
import { isReader } from "./policy";
export const SESSION_COOKIE = "gradtheses_session";
export const FLOW_COOKIE = "gradtheses_login";
export const cookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  path: "/",
};
let discovery: Promise<oidc.Configuration> | undefined;
export function oidcConfig() {
  if (!authConfigured()) throw new Error("Authentication not configured");
  if (!discovery)
    discovery = oidc
      .discovery(
        new URL(
          `https://login.microsoftonline.com/${process.env.ENTRA_TENANT_ID}/v2.0`,
        ),
        process.env.ENTRA_CLIENT_ID!,
        process.env.ENTRA_CLIENT_SECRET!,
        undefined,
        { execute: [oidc.enableNonRepudiationChecks] },
      )
      .catch((error) => {
        discovery = undefined;
        throw error;
      });
  return discovery;
}
export async function sealCookie(
  payload: Record<string, unknown>,
  purpose: string,
  seconds: number,
) {
  return seal(payload, process.env.SESSION_SECRET!, purpose, seconds);
}
export async function openCookie(value: string, purpose: string) {
  return unseal(value, process.env.SESSION_SECRET!, purpose);
}
export async function getSession() {
  if (!authConfigured()) return null;
  const value = (await cookies()).get(SESSION_COOKIE)?.value;
  if (!value) return null;
  try {
    const session = await openCookie(value, "session");
    if (
      !isReader(
        session,
        process.env.ENTRA_TENANT_ID!,
        process.env.ENTRA_READER_ROLE || "Theses.Reader",
      )
    )
      return null;
    return {
      name: typeof session.name === "string" ? session.name : "قارئ جامعي",
      oid: session.oid as string,
    };
  } catch {
    return null;
  }
}
