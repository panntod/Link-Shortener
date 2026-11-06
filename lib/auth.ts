import { createHash, timingSafeEqual } from "crypto";
import type { VercelRequest } from "@vercel/node";

/** Cek header "Authorization: Bearer <ADMIN_TOKEN>". */
export function isAuthorized(req: VercelRequest): boolean {
  const secret = process.env.ADMIN_TOKEN;
  if (!secret) return false;

  const header = String(req.headers.authorization ?? "");
  const provided = header.startsWith("Bearer ") ? header.slice(7) : "";

  // Di-hash dulu supaya panjangnya sama dan perbandingannya constant-time
  const a = createHash("sha256").update(provided).digest();
  const b = createHash("sha256").update(secret).digest();
  return timingSafeEqual(a, b);
}
