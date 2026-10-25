import "server-only";
export function appUrl() {
  const url = new URL(process.env.APP_URL || "http://localhost:3000");
  if (
    url.pathname !== "/" ||
    url.search ||
    url.hash ||
    url.username ||
    url.password ||
    (url.protocol !== "https:" &&
      !(url.protocol === "http:" && url.hostname === "localhost"))
  )
    throw new Error("Invalid APP_URL");
  return url.origin;
}
export function authConfigured() {
  return (
    /^[\da-f-]{36}$/i.test(process.env.ENTRA_TENANT_ID || "") &&
    /^[\da-f-]{36}$/i.test(process.env.ENTRA_CLIENT_ID || "") &&
    !!process.env.ENTRA_CLIENT_SECRET &&
    (process.env.SESSION_SECRET?.length || 0) >= 64 &&
    !!process.env.APP_URL
  );
}
export function readingEnabled() {
  return (
    process.env.READING_ENABLED === "true" &&
    process.env.CATALOG_SOURCE === "sharepoint" &&
    authConfigured()
  );
}
