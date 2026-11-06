import type { VercelRequest, VercelResponse } from "@vercel/node";
import { getLinks } from "../lib/mongodb";
import {
  normalizeUrl,
  getBaseUrl,
  ALIAS_REGEX,
  RESERVED_CODES,
  isDuplicateKeyError,
  generateCode,
} from "../lib/utils";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method tidak diizinkan" });
  }

  const { url, alias } = (req.body ?? {}) as { url?: unknown; alias?: unknown };

  const target = normalizeUrl(url);
  if (!target) {
    return res
      .status(400)
      .json({ error: "URL tidak valid. Gunakan alamat http atau https." });
  }

  const baseUrl = getBaseUrl(req);
  if (new URL(target).host === new URL(baseUrl).host) {
    return res
      .status(400)
      .json({ error: "Link dari domain ini tidak bisa dipersingkat lagi." });
  }

  try {
    const links = await getLinks();
    const doc = (code: string) => ({
      code,
      url: target,
      clicks: 0,
      createdAt: new Date(),
    });

    // Alias kustom
    if (typeof alias === "string" && alias.trim() !== "") {
      const code = alias.trim();
      if (!ALIAS_REGEX.test(code) || RESERVED_CODES.has(code.toLowerCase())) {
        return res.status(400).json({
          error:
            "Alias harus 3-32 karakter: huruf, angka, minus, atau underscore.",
        });
      }
      try {
        await links.insertOne(doc(code));
      } catch (err) {
        if (isDuplicateKeyError(err)) {
          return res.status(409).json({ error: "Alias sudah dipakai." });
        }
        throw err;
      }
      return res
        .status(201)
        .json({ code, url: target, shortUrl: `${baseUrl}/${code}` });
    }

    // Kode acak (ulangi kalau bentrok)
    for (let attempt = 0; attempt < 5; attempt++) {
      const code = generateCode();
      try {
        await links.insertOne(doc(code));
        return res
          .status(201)
          .json({ code, url: target, shortUrl: `${baseUrl}/${code}` });
      } catch (err) {
        if (!isDuplicateKeyError(err)) throw err;
      }
    }
    return res
      .status(500)
      .json({ error: "Gagal membuat kode unik, coba lagi." });
  } catch (err) {
    console.error("shorten error:", err);
    return res.status(500).json({ error: "Terjadi kesalahan di server." });
  }
}
