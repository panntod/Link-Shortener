import type { VercelRequest, VercelResponse } from "@vercel/node";
import { ALIAS_REGEX } from "../lib/utils";
import { getLinks } from "../lib/mongodb";

const NOT_FOUND_HTML = `<!doctype html>
<html lang="id">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Link tidak ditemukan</title>
  <style>
    body { font-family: system-ui, sans-serif; display: grid; place-items: center; min-height: 100vh; margin: 0; }
    main { text-align: center; padding: 1rem; }
    a { color: inherit; }
  </style>
</head>
<body>
  <main>
    <h1>Link tidak ditemukan</h1>
    <p>Link ini tidak ada atau sudah dihapus.</p>
    <p><a href="/">Buat link pendek baru</a></p>
  </main>
</body>
</html>`;

function notFound(res: VercelResponse) {
  res.setHeader("Content-Type", "text/html; charset=utf-8");
  return res.status(404).send(NOT_FOUND_HTML);
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const raw = req.query.code;
  const code = Array.isArray(raw) ? raw[0] : raw;

  if (!code || !ALIAS_REGEX.test(code)) {
    return notFound(res);
  }

  try {
    const links = await getLinks();
    const link = await links.findOneAndUpdate(
      { code },
      { $inc: { clicks: 1 }, $set: { lastClickedAt: new Date() } }
    );

    if (!link) {
      return notFound(res);
    }

    // 302 (bukan 301) supaya browser tidak men-cache redirect dan klik tetap terhitung
    res.setHeader("Cache-Control", "no-store");
    return res.redirect(302, link.url);
  } catch (err) {
    console.error("redirect error:", err);
    return res.status(500).send("Terjadi kesalahan di server.");
  }
}
