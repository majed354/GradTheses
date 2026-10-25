import { EncryptJWT, jwtDecrypt, type JWTPayload } from "jose";
import { createHash } from "node:crypto";
function key(secret: string) {
  if (secret.length < 64) throw new Error("Session secret too short");
  return createHash("sha256").update(secret).digest();
}
export async function seal(
  payload: JWTPayload,
  secret: string,
  purpose: string,
  seconds: number,
) {
  return new EncryptJWT(payload)
    .setProtectedHeader({ alg: "dir", enc: "A256GCM" })
    .setIssuedAt()
    .setIssuer("gradtheses")
    .setAudience(purpose)
    .setExpirationTime(`${seconds}s`)
    .encrypt(key(secret));
}
export async function unseal(value: string, secret: string, purpose: string) {
  const { payload } = await jwtDecrypt(value, key(secret), {
    issuer: "gradtheses",
    audience: purpose,
    keyManagementAlgorithms: ["dir"],
    contentEncryptionAlgorithms: ["A256GCM"],
  });
  return payload;
}
