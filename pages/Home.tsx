import { useState } from "react";
import type { FormEvent } from "react";
import { createLink, ShortenResponse } from "../lib/fetch";

const UI_STYLES = `
@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=Space+Grotesk:wght@500;600;700&display=swap');
.nova-page{min-height:100vh;box-sizing:border-box;padding:56px 24px 40px;color:#eaf0ff;background:radial-gradient(ellipse at 50% -15%,rgba(44,103,255,.22),transparent 48%),radial-gradient(ellipse at 100% 70%,rgba(0,220,190,.09),transparent 38%),#080d1b;font-family:'DM Sans',sans-serif;position:relative;isolation:isolate;overflow:hidden}
.nova-page:before{content:"";position:absolute;inset:0;z-index:-1;opacity:.17;background-image:linear-gradient(rgba(134,160,220,.12) 1px,transparent 1px),linear-gradient(90deg,rgba(134,160,220,.12) 1px,transparent 1px);background-size:42px 42px;mask-image:linear-gradient(to bottom,black,transparent 85%)}
.nova-shell{width:min(100%,650px);margin:0 auto}
.nova-topline{display:flex;align-items:center;justify-content:space-between;margin-bottom:54px}
.nova-brand{display:flex;align-items:center;gap:11px;color:#f5f7ff;font:700 15px 'Space Grotesk',sans-serif;letter-spacing:.12em;text-transform:uppercase}
.nova-brand-mark{display:grid;place-items:center;width:34px;height:34px;border:1px solid rgba(105,151,255,.55);border-radius:11px;background:linear-gradient(145deg,rgba(65,116,255,.28),rgba(0,224,199,.12));box-shadow:0 0 26px rgba(53,111,255,.2);color:#8db4ff;font-size:17px}
.nova-status{display:flex;align-items:center;gap:8px;color:#8c9ab8;font-size:11px;letter-spacing:.1em;text-transform:uppercase}
.nova-dot{width:7px;height:7px;border-radius:50%;background:#48e0bf;box-shadow:0 0 12px #48e0bf}
.nova-title{margin:0;color:#f5f7ff;font:700 clamp(36px,7vw,54px)/1.06 'Space Grotesk',sans-serif;letter-spacing:-.055em}
.nova-title span{background:linear-gradient(100deg,#8eb4ff 10%,#7cebd9 90%);-webkit-background-clip:text;background-clip:text;color:transparent}
.nova-panel{margin-top: 24px; padding:27px;border:1px solid rgba(135,160,220,.18);border-radius:22px;background:linear-gradient(145deg,rgba(20,30,55,.92),rgba(12,19,37,.94));box-shadow:0 24px 80px rgba(0,0,0,.35),inset 0 1px rgba(255,255,255,.04);backdrop-filter:blur(18px)}
.nova-label{display:block;margin:0 0 9px;color:#dce5ff;font-size:13px;font-weight:600}
.nova-hint{color:#7585a7;font-weight:400}
.nova-input{width:100%;box-sizing:border-box;min-height:52px;padding:0 15px;border:1px solid rgba(135,160,220,.22);border-radius:12px;outline:none;background:rgba(5,11,25,.7);color:#f3f6ff;font:14px 'DM Sans',sans-serif;transition:border-color .2s,box-shadow .2s}
.nova-input::placeholder{color:#657493}
.nova-input:focus{border-color:#6c9cff;box-shadow:0 0 0 3px rgba(87,139,255,.14)}
.nova-field{margin-bottom:21px}
.nova-alias{display:flex;align-items:center;overflow:hidden;border:1px solid rgba(135,160,220,.22);border-radius:12px;background:rgba(5,11,25,.7)}
.nova-alias:focus-within{border-color:#6c9cff;box-shadow:0 0 0 3px rgba(87,139,255,.14)}
.nova-alias-prefix{padding:0 0 0 14px;color:#7183a8;font-size:13px;white-space:nowrap}
.nova-alias .nova-input{border:0;box-shadow:none;background:transparent}
.nova-button{display:flex;align-items:center;justify-content:center;gap:10px;width:100%;min-height:52px;padding:0 18px;border:0;border-radius:12px;background:linear-gradient(100deg,#477cff,#4d9dff 52%,#39cdbb);color:white;font:700 14px 'DM Sans',sans-serif;cursor:pointer;box-shadow:0 9px 28px rgba(61,124,255,.24);transition:transform .2s,filter .2s,box-shadow .2s}
.nova-button:hover:not(:disabled){transform:translateY(-2px);filter:brightness(1.08);box-shadow:0 13px 34px rgba(61,124,255,.34)}
.nova-button:disabled{opacity:.65;cursor:wait}
.nova-error{min-height:18px;margin:0 0 13px;color:#ff8e9b;font-size:13px}
.nova-result{margin-top:20px;padding:21px;border:1px solid rgba(69,220,190,.28);border-radius:18px;background:linear-gradient(135deg,rgba(23,93,91,.18),rgba(18,31,55,.72));animation:nova-in .3s ease-out}
.nova-result-label{margin:0 0 11px;color:#73e3ca;font-size:11px;font-weight:700;letter-spacing:.15em;text-transform:uppercase}
.nova-short{display:flex;align-items:center;justify-content:space-between;gap:12px}
.nova-short a{min-width:0;overflow-wrap:anywhere;color:#f4f8ff;font:600 17px 'Space Grotesk',sans-serif;text-decoration:none}
.nova-short a:hover{color:#7cebd9}
.nova-copy{flex:none;padding:10px 13px;border:1px solid rgba(120,230,210,.3);border-radius:10px;background:rgba(42,190,166,.12);color:#8af0d9;font-size:12px;font-weight:700;cursor:pointer}
.nova-copy:hover{background:rgba(42,190,166,.2)}
.nova-destination{margin:14px 0 0;color:#8797b6;font-size:12px;line-height:1.6;overflow-wrap:anywhere}
.nova-footer{display:flex;justify-content:space-between;align-items:center;margin-top:27px;color:#647493;font-size:12px}
.nova-footer a{color:#91adE9;text-decoration:none}
.nova-footer a:hover{color:#c2d5ff}
@keyframes nova-in{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}
@media(max-width:560px){.nova-page{padding:30px 17px}.nova-topline{margin-bottom:43px}.nova-panel{padding:20px}.nova-short{align-items:flex-start;flex-direction:column}.nova-copy{width:100%}.nova-footer{gap:12px;flex-wrap:wrap}}
`;

export default function Home() {
  const [url, setUrl] = useState("");
  const [alias, setAlias] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<ShortenResponse | null>(null);
  const [copied, setCopied] = useState<"idle" | "ok" | "fail">("idle");

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    setResult(null);
    setCopied("idle");
    setLoading(true);
    try {
      setResult(await createLink(url, alias));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal membuat link.");
    } finally {
      setLoading(false);
    }
  }

  async function onCopy() {
    if (!result) return;
    try {
      await navigator.clipboard.writeText(result.shortUrl);
      setCopied("ok");
    } catch {
      setCopied("fail");
    }
  }

  return (
    <main className="nova-page">
      <style>{UI_STYLES}</style>
      <div className="nova-shell">
        <header className="nova-topline">
          <div className="nova-brand"><span className="nova-brand-mark">↗</span> Panntod</div>
          <div className="nova-status"><span className="nova-dot" /> Link engine online</div>
        </header>

        <section>
          <h1 className="nova-title">Lebih ringkas.<br /><span>Lebih terkoneksi.</span></h1>
        </section>

        <form className="nova-panel" onSubmit={onSubmit} noValidate>
          <div className="nova-field">
            <label className="nova-label" htmlFor="nova-url">Link tujuan</label>
            <input
              id="nova-url"
              className="nova-input"
              type="text"
              inputMode="url"
              autoComplete="off"
              placeholder="https://website.com/halaman/tujuan"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              required
            />
          </div>

          <div className="nova-field">
            <label className="nova-label" htmlFor="nova-alias">
              Alias khusus <span className="nova-hint">— opsional</span>
            </label>
            <div className="nova-alias">
              <span className="nova-alias-prefix">{window.location.host}/</span>
              <input
                id="nova-alias"
                className="nova-input"
                type="text"
                autoComplete="off"
                placeholder="nama-link"
                maxLength={32}
                value={alias}
                onChange={(e) => setAlias(e.target.value)}
              />
            </div>
          </div>

          <p className="nova-error" role="alert">{error}</p>
          <button className="nova-button" type="submit" disabled={loading}>
            {loading ? "Sedang memproses..." : <>Persingkat tautan <span aria-hidden="true">↗</span></>}
          </button>
        </form>

        {result && (
          <section className="nova-result" aria-live="polite">
            <p className="nova-result-label">✓ Tautan berhasil dibuat</p>
            <div className="nova-short">
              <a href={result.shortUrl} target="_blank" rel="noopener noreferrer">{result.shortUrl}</a>
              <button className="nova-copy" type="button" onClick={onCopy}>
                {copied === "ok" ? "✓ Tersalin" : copied === "fail" ? "Gagal menyalin" : "Salin tautan"}
              </button>
            </div>
            <p className="nova-destination">Tujuan: {result.url}</p>
          </section>
        )}

        <footer className="nova-footer">
          <span>© {new Date().getFullYear()} Panntod · Simplify your web</span>
          <a href="/dashboard">Akses dashboard ↗</a>
        </footer>
      </div>
    </main>
  );
}
