import type { VercelRequest, VercelResponse } from "@vercel/node";
import type { Filter } from "mongodb";
import { isAuthorized } from "../lib/auth";
import { getLinks, LinkDoc } from "../lib/mongodb";
import { ALIAS_REGEX } from "../lib/utils";

const PAGE_SIZE = 20;

function escapeRegex(input: string): string {
  return input.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function firstQuery(value: string | string[] | undefined): string {
  return (Array.isArray(value) ? value[0] : value) ?? "";
}

// GET    /api/links?page=1&q=kata   -> daftar link + ringkasan
// DELETE /api/links?code=abc123     -> hapus link
export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (!process.env.ADMIN_TOKEN) {
    return res
      .status(503)
      .json({ error: "ADMIN_TOKEN belum diset di server." });
  }
  if (!isAuthorized(req)) {
    return res.status(401).json({ error: "Tidak diizinkan." });
  }

  try {
    const links = await getLinks();

    if (req.method === "GET") {
      const page = Math.max(1, parseInt(firstQuery(req.query.page), 10) || 1);
      const q = firstQuery(req.query.q).trim().slice(0, 100);

      const filter: Filter<LinkDoc> = q
        ? {
            $or: [
              { code: { $regex: escapeRegex(q), $options: "i" } },
              { url: { $regex: escapeRegex(q), $options: "i" } },
            ],
          }
        : {};

      const [items, total, totals] = await Promise.all([
        links
          .find(filter, { projection: { _id: 0 } })
          .sort({ createdAt: -1 })
          .skip((page - 1) * PAGE_SIZE)
          .limit(PAGE_SIZE)
          .toArray(),
        links.countDocuments(filter),
        links
          .aggregate<{ totalLinks: number; totalClicks: number }>([
            {
              $group: {
                _id: null,
                totalLinks: { $sum: 1 },
                totalClicks: { $sum: "$clicks" },
              },
            },
          ])
          .toArray(),
      ]);

      return res.status(200).json({
        items,
        total,
        page,
        limit: PAGE_SIZE,
        summary: {
          totalLinks: totals[0]?.totalLinks ?? 0,
          totalClicks: totals[0]?.totalClicks ?? 0,
        },
      });
    }

    if (req.method === "DELETE") {
      const code = firstQuery(req.query.code);
      if (!ALIAS_REGEX.test(code)) {
        return res.status(400).json({ error: "Parameter code tidak valid." });
      }
      const result = await links.deleteOne({ code });
      if (result.deletedCount === 0) {
        return res.status(404).json({ error: "Link tidak ditemukan." });
      }
      return res.status(200).json({ ok: true });
    }

    res.setHeader("Allow", "GET, DELETE");
    return res.status(405).json({ error: "Method tidak diizinkan" });
  } catch (err) {
    console.error("links error:", err);
    return res.status(500).json({ error: "Terjadi kesalahan di server." });
  }
}
