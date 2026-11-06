import type { VercelRequest, VercelResponse } from "@vercel/node";
import { ALIAS_REGEX } from "../lib/utils";
import { getLinks } from "../lib/mongodb";

// GET /api/stats?code=abc123
export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return res.status(405).json({ error: "Method tidak diizinkan" });
  }

  const raw = req.query.code;
  const code = Array.isArray(raw) ? raw[0] : raw;
  if (!code || !ALIAS_REGEX.test(code)) {
    return res.status(400).json({ error: "Parameter code tidak valid." });
  }

  try {
    const links = await getLinks();
    const link = await links.findOne(
      { code },
      { projection: { _id: 0, code: 1, url: 1, clicks: 1, createdAt: 1, lastClickedAt: 1 } }
    );
    if (!link) return res.status(404).json({ error: "Link tidak ditemukan." });
    return res.status(200).json(link);
  } catch (err) {
    console.error("stats error:", err);
    return res.status(500).json({ error: "Terjadi kesalahan di server." });
  }
}
