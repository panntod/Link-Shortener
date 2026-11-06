import { useCallback, useEffect, useState } from "react";
import type { FormEvent } from "react";
import { ApiError, deleteLink, fetchLinks, LinksResponse } from "../lib/fetch";

const TOKEN_KEY = "admin_token";

const UI_STYLES = `
@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=Space+Grotesk:wght@500;600;700&display=swap');
.nova-page{min-height:100vh;box-sizing:border-box;padding:38px 28px 48px;color:#eaf0ff;background:radial-gradient(ellipse at 50% -20%,rgba(44,103,255,.2),transparent 48%),radial-gradient(ellipse at 100% 75%,rgba(0,220,190,.07),transparent 38%),#080d1b;font-family:'DM Sans',sans-serif;position:relative;isolation:isolate;overflow:hidden}
.nova-page:before{content:"";position:absolute;inset:0;z-index:-1;opacity:.13;background-image:linear-gradient(rgba(134,160,220,.12) 1px,transparent 1px),linear-gradient(90deg,rgba(134,160,220,.12) 1px,transparent 1px);background-size:42px 42px;mask-image:linear-gradient(to bottom,black,transparent 85%)}
.nova-shell{width:min(100%,1250px);margin:0 auto}
.nova-topbar{display:flex;align-items:center;justify-content:space-between;gap:20px;margin-bottom:42px}
.nova-brand{display:flex;align-items:center;gap:11px;color:#f5f7ff;font:700 15px 'Space Grotesk',sans-serif;letter-spacing:.12em}
.nova-brand-mark{display:grid;place-items:center;width:35px;height:35px;border:1px solid rgba(105,151,255,.55);border-radius:11px;background:linear-gradient(145deg,rgba(65,116,255,.28),rgba(0,224,199,.12));box-shadow:0 0 26px rgba(53,111,255,.2);color:#8db4ff;font-size:17px}
.nova-top-actions{display:flex;align-items:center;gap:10px}
.nova-button{display:inline-flex;align-items:center;justify-content:center;gap:8px;min-height:42px;padding:0 15px;border:1px solid rgba(135,160,220,.2);border-radius:11px;background:rgba(18,29,52,.72);color:#cbd8f4;font:600 12px 'DM Sans',sans-serif;text-decoration:none;cursor:pointer;transition:.2s}
.nova-button:hover:not(:disabled){border-color:rgba(119,158,255,.55);background:rgba(48,75,130,.3);color:white;transform:translateY(-1px)}
.nova-button.primary{border:0;background:linear-gradient(100deg,#477cff,#4d9dff 55%,#39cdbb);color:white;box-shadow:0 8px 24px rgba(61,124,255,.2)}
.nova-button.danger{color:#ff9ca8;border-color:rgba(255,120,140,.18);background:rgba(110,37,56,.16)}
.nova-button.danger:hover{border-color:rgba(255,120,140,.5);background:rgba(140,40,62,.28)}
.nova-button:disabled{opacity:.4;cursor:not-allowed;transform:none}
.nova-eyebrow{margin:0 0 9px;color:#7da7ff;font-size:10px;font-weight:700;letter-spacing:.2em;text-transform:uppercase}
.nova-heading{margin:0;color:#f5f7ff;font:700 clamp(30px,5vw,42px)/1.1 'Space Grotesk',sans-serif;letter-spacing:-.05em}
.nova-subtitle{margin:10px 0 26px;color:#8f9fbd;font-size:13px}
.nova-stats{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:16px;margin-bottom:22px}
.nova-stat{position:relative;overflow:hidden;padding:22px 24px;border:1px solid rgba(135,160,220,.17);border-radius:17px;background:linear-gradient(140deg,rgba(21,34,62,.9),rgba(12,20,39,.9));box-shadow:inset 0 1px rgba(255,255,255,.035)}
.nova-stat:after{content:"";position:absolute;width:130px;height:130px;right:-45px;top:-60px;border-radius:50%;background:rgba(81,132,255,.12);filter:blur(2px)}
.nova-stat-label{margin:0 0 10px;color:#8c9dbd;font-size:11px;font-weight:600;letter-spacing:.1em;text-transform:uppercase}
.nova-stat-value{margin:0;color:#f2f6ff;font:700 34px 'Space Grotesk',sans-serif;letter-spacing:-.04em}
.nova-toolbar{display:flex;justify-content:space-between;align-items:center;gap:14px;margin:24px 0 14px}
.nova-search{display:flex;gap:9px;width:min(100%,530px)}
.nova-input{width:100%;min-width:0;box-sizing:border-box;min-height:44px;padding:0 14px;border:1px solid rgba(135,160,220,.2);border-radius:11px;outline:none;background:rgba(5,11,25,.72);color:#f3f6ff;font:13px 'DM Sans',sans-serif;transition:border-color .2s,box-shadow .2s}
.nova-input::placeholder{color:#657493}
.nova-input:focus{border-color:#6c9cff;box-shadow:0 0 0 3px rgba(87,139,255,.13)}
.nova-error{margin:12px 0;padding:12px 15px;border:1px solid rgba(255,120,140,.22);border-radius:11px;background:rgba(125,36,57,.17);color:#ff9eaa;font-size:12px}
.nova-table-wrap{overflow:auto;border:1px solid rgba(135,160,220,.17);border-radius:17px;background:rgba(12,20,39,.82);box-shadow:0 20px 60px rgba(0,0,0,.2)}
.nova-table{width:100%;border-collapse:collapse;min-width:850px;text-align:left}
.nova-table th{padding:15px 17px;border-bottom:1px solid rgba(135,160,220,.16);background:rgba(22,34,60,.65);color:#8192b2;font-size:10px;font-weight:700;letter-spacing:.1em;text-transform:uppercase;white-space:nowrap}
.nova-table td{padding:15px 17px;border-bottom:1px solid rgba(135,160,220,.09);color:#aab7d1;font-size:12px;vertical-align:middle}
.nova-table tbody tr:last-child td{border-bottom:0}
.nova-table tbody tr:hover{background:rgba(70,107,178,.08)}
.nova-table a{color:#8eb4ff;text-decoration:none;font-weight:600}
.nova-table a:hover{color:#b8d0ff}
.nova-code{display:inline-flex;align-items:center;padding:6px 9px;border:1px solid rgba(110,157,255,.2);border-radius:8px;background:rgba(59,103,190,.12);font:600 12px 'Space Grotesk',sans-serif}
.nova-dest{max-width:340px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.nova-num{text-align:right;font-variant-numeric:tabular-nums;color:#e6edff!important;font-weight:700}
.nova-actions{display:flex;justify-content:flex-end;gap:7px;white-space:nowrap}
.nova-small{min-height:31px;padding:0 10px;border-radius:8px;font-size:11px}
.nova-empty{padding:48px 20px!important;text-align:center!important;color:#8090af!important}
.nova-pager{display:flex;align-items:center;justify-content:center;gap:17px;margin-top:18px}
.nova-muted{color:#7788a8;font-size:12px}
.nova-login{width:min(100%,450px);margin:9vh auto 0}
.nova-login .nova-panel{margin-top:25px}
.nova-panel{padding:25px;border:1px solid rgba(135,160,220,.18);border-radius:19px;background:linear-gradient(145deg,rgba(20,30,55,.92),rgba(12,19,37,.94));box-shadow:0 24px 80px rgba(0,0,0,.35),inset 0 1px rgba(255,255,255,.04);backdrop-filter:blur(18px)}
.nova-label{display:block;margin:0 0 9px;color:#dce5ff;font-size:12px;font-weight:600}
.nova-login .nova-input{margin-bottom:15px;min-height:49px}
.nova-login-footer{margin-top:19px;text-align:center;color:#7585a7;font-size:12px}
.nova-login-footer a{color:#91ade9;text-decoration:none}
@media(max-width:700px){.nova-page{padding:25px 16px 35px}.nova-topbar{align-items:flex-start;flex-direction:column;margin-bottom:34px}.nova-top-actions{width:100%}.nova-top-actions>*{flex:1}.nova-stats{gap:10px}.nova-stat{padding:17px}.nova-stat-value{font-size:28px}.nova-toolbar{align-items:stretch;flex-direction:column}.nova-search{width:100%}}
@media(max-width:420px){.nova-search{flex-direction:column}.nova-search .nova-button{width:100%}.nova-stats{grid-template-columns:1fr}}
`;

function readToken(): string {
  try {
    return sessionStorage.getItem(TOKEN_KEY) ?? "";
  } catch {
    return "";
  }
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleString("id-ID", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

export default function Dashboard() {
  const [token, setToken] = useState(readToken);
  const [tokenInput, setTokenInput] = useState("");
  const [data, setData] = useState<LinksResponse | null>(null);
  const [page, setPage] = useState(1);
  const [searchInput, setSearchInput] = useState("");
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState("");

  const logout = useCallback((message = "") => {
    try {
      sessionStorage.removeItem(TOKEN_KEY);
    } catch {
      // abaikan
    }
    setToken("");
    setData(null);
    setError(message);
  }, []);

  const load = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    setError("");
    try {
      setData(await fetchLinks(token, page, query));
    } catch (err) {
      if (err instanceof ApiError && err.status === 401) {
        logout("Token salah atau tidak berlaku.");
      } else {
        setError(err instanceof Error ? err.message : "Gagal memuat data.");
      }
    } finally {
      setLoading(false);
    }
  }, [token, page, query, logout]);

  useEffect(() => {
    void load();
  }, [load]);

  function onLogin(e: FormEvent) {
    e.preventDefault();
    const value = tokenInput.trim();
    if (!value) return;
    try {
      sessionStorage.setItem(TOKEN_KEY, value);
    } catch {
      // abaikan
    }
    setError("");
    setTokenInput("");
    setToken(value);
  }

  function onSearch(e: FormEvent) {
    e.preventDefault();
    setPage(1);
    setQuery(searchInput.trim());
  }

  async function onCopy(code: string) {
    try {
      await navigator.clipboard.writeText(`${window.location.origin}/${code}`);
      setCopied(code);
      window.setTimeout(() => setCopied(""), 1500);
    } catch {
      setError("Gagal menyalin ke clipboard.");
    }
  }

  async function onDelete(code: string) {
    if (
      !window.confirm(
        `Hapus link /${code}? Tindakan ini tidak bisa dibatalkan.`,
      )
    )
      return;
    try {
      await deleteLink(token, code);
      if (data && data.items.length === 1 && page > 1) {
        setPage(page - 1);
      } else {
        await load();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal menghapus link.");
    }
  }

  if (!token) {
    return (
      <main className="nova-page">
        <style>{UI_STYLES}</style>
        <section className="nova-login">
          <div className="nova-brand">
            <span className="nova-brand-mark">↗</span> Panntod
          </div>
          <p className="nova-eyebrow" style={{ marginTop: 48 }}>
            Restricted access / Admin
          </p>
          <h1 className="nova-heading">
            Selamat datang
            <br />
            kembali.
          </h1>
          <p className="nova-subtitle">
            Masukkan token administrator untuk mengakses panel kontrol.
          </p>
          <form className="nova-panel" onSubmit={onLogin}>
            <label className="nova-label" htmlFor="admin-token">
              Token admin
            </label>
            <input
              id="admin-token"
              className="nova-input"
              type="password"
              autoComplete="current-password"
              placeholder="Masukkan token akses"
              value={tokenInput}
              onChange={(e) => setTokenInput(e.target.value)}
              required
            />
            {error && (
              <p className="nova-error" role="alert">
                {error}
              </p>
            )}
            <button
              className="nova-button primary"
              type="submit"
              style={{ width: "100%" }}
            >
              Masuk ke dashboard ↗
            </button>
          </form>
          <p className="nova-login-footer">
            <a href="/">← Kembali ke halaman utama</a>
          </p>
        </section>
      </main>
    );
  }

  const totalPages = data ? Math.max(1, Math.ceil(data.total / data.limit)) : 1;

  return (
    <main className="nova-page">
      <style>{UI_STYLES}</style>
      <div className="nova-shell">
        <header className="nova-topbar">
          <div>
            <div className="nova-brand">
              <span className="nova-brand-mark">↗</span> Panntod{" "}
              <span
                style={{
                  color: "#7184a8",
                  fontSize: 10,
                  letterSpacing: ".16em",
                }}
              >
                CONTROL CENTER
              </span>
            </div>
            <p className="nova-eyebrow" style={{ marginTop: 35 }}>
              Overview / Link management
            </p>
            <h1 className="nova-heading">Dashboard</h1>
            <p className="nova-subtitle">
              Pantau performa dan kelola seluruh tautan pendek Anda.
            </p>
          </div>
          <div className="nova-top-actions">
            <a className="nova-button primary" href="/">
              ＋ Buat link baru
            </a>
            <button
              type="button"
              className="nova-button"
              onClick={() => logout()}
            >
              Keluar ↗
            </button>
          </div>
        </header>

        <section className="nova-stats" aria-label="Ringkasan statistik">
          <div className="nova-stat">
            <p className="nova-stat-label">Total link aktif</p>
            <p className="nova-stat-value">
              {(data?.summary.totalLinks ?? 0).toLocaleString("id-ID")}
            </p>
          </div>
          <div className="nova-stat">
            <p className="nova-stat-label">Total klik terkumpul</p>
            <p className="nova-stat-value">
              {(data?.summary.totalClicks ?? 0).toLocaleString("id-ID")}
            </p>
          </div>
        </section>

        <div className="nova-toolbar">
          <div>
            <p className="nova-eyebrow" style={{ margin: 0 }}>
              Database / Records
            </p>
          </div>
          <form className="nova-search" onSubmit={onSearch}>
            <input
              className="nova-input"
              type="search"
              placeholder="Cari kode atau URL tujuan..."
              aria-label="Cari link"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
            />
            <button className="nova-button primary" type="submit">
              Cari
            </button>
          </form>
        </div>

        {error && (
          <p className="nova-error" role="alert">
            {error}
          </p>
        )}

        <div className="nova-table-wrap" aria-busy={loading}>
          <table className="nova-table">
            <thead>
              <tr>
                <th>Link pendek</th>
                <th>URL tujuan</th>
                <th style={{ textAlign: "right" }}>Klik</th>
                <th>Dibuat</th>
                <th>Klik terakhir</th>
                <th style={{ textAlign: "right" }}>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {data?.items.map((item) => (
                <tr key={item.code}>
                  <td>
                    <a
                      className="nova-code"
                      href={`/${item.code}`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      /{item.code}
                    </a>
                  </td>
                  <td className="nova-dest">
                    <a
                      href={item.url}
                      title={item.url}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {item.url}
                    </a>
                  </td>
                  <td className="nova-num">
                    {item.clicks.toLocaleString("id-ID")}
                  </td>
                  <td>{formatDate(item.createdAt)}</td>
                  <td>
                    {item.lastClickedAt
                      ? formatDate(item.lastClickedAt)
                      : "Belum ada"}
                  </td>
                  <td>
                    <div className="nova-actions">
                      <button
                        type="button"
                        className="nova-button nova-small"
                        onClick={() => onCopy(item.code)}
                      >
                        {copied === item.code ? "✓ Tersalin" : "Salin"}
                      </button>
                      <button
                        type="button"
                        className="nova-button nova-small danger"
                        onClick={() => onDelete(item.code)}
                      >
                        Hapus
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {data && data.items.length === 0 && (
            <p className="nova-empty">
              {query
                ? "Tidak ada link yang cocok dengan pencarian ini."
                : "Belum ada link. Buat link pertama dari halaman utama."}
            </p>
          )}
          {!data && loading && <p className="nova-empty">Memuat data...</p>}
        </div>

        {data && data.total > data.limit && (
          <nav className="nova-pager" aria-label="Halaman">
            <button
              type="button"
              className="nova-button"
              disabled={page <= 1 || loading}
              onClick={() => setPage(page - 1)}
            >
              ← Sebelumnya
            </button>
            <span className="nova-muted">
              Halaman {page} dari {totalPages}
            </span>
            <button
              type="button"
              className="nova-button"
              disabled={page >= totalPages || loading}
              onClick={() => setPage(page + 1)}
            >
              Berikutnya →
            </button>
          </nav>
        )}
      </div>
    </main>
  );
}
