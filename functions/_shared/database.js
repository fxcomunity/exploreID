import { neon } from "@neondatabase/serverless";

export function getDatabase(env) {
  if (!env.DATABASE_URL) {
    throw new Error("Missing Cloudflare Pages secret: DATABASE_URL");
  }
  return neon(env.DATABASE_URL);
}
