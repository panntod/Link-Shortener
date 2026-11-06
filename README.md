# Link Shortener

TypeScript + React (Vite) + Vercel Functions + MongoDB.

## Struktur

```
api/shorten.ts      POST   /api/shorten        buat link pendek (publik)
api/redirect.ts     GET    /:code              redirect + hitung klik
api/stats.ts        GET    /api/stats?code=x   statistik satu link (publik)
api/links.ts        GET/DELETE /api/links      daftar & hapus link (butuh ADMIN_TOKEN)
lib/mongodb.ts      koneksi MongoDB (di-cache)
lib/auth.ts         cek ADMIN_TOKEN
lib/utils.ts        validasi URL, generator kode
src/                frontend React + TypeScript
  main.tsx          memilih halaman: / atau /dashboard
  api.ts            fungsi fetch yang bertipe
  pages/Home.tsx    form memperpendek link
  pages/Dashboard.tsx  dashboard admin
index.html          entry Vite
vercel.json         rewrite /dashboard dan /:code
```

## Menjalankan lokal

```bash
npm install
cp .env.example .env.local   # isi MONGODB_URI dan ADMIN_TOKEN
npx vercel dev
```

Jangan pakai `npm run dev` untuk menguji penuh: itu hanya menjalankan Vite, tanpa API.

## Deploy ke Vercel

1. MongoDB Atlas: buat cluster dan database user, lalu di Network Access tambahkan `0.0.0.0/0`.
2. Push ke GitHub dan import di Vercel. Framework Preset akan terdeteksi sebagai **Vite**.
3. Environment Variables: `MONGODB_URI`, `ADMIN_TOKEN`, dan (opsional) `MONGODB_DB`.
4. Deploy, lalu buka `https://domain-kamu.vercel.app/dashboard` dan masuk dengan `ADMIN_TOKEN`.

Buat token acak dengan: `openssl rand -hex 24`

## Pemeriksaan tipe

```bash
npm run typecheck
```
