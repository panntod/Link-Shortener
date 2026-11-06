export interface LinkItem {
  code: string;
  url: string;
  clicks: number;
  createdAt: string;
  lastClickedAt?: string;
}

export interface LinksResponse {
  items: LinkItem[];
  total: number;
  page: number;
  limit: number;
  summary: { totalLinks: number; totalClicks: number };
}

export interface ShortenResponse {
  code: string;
  url: string;
  shortUrl: string;
}

export class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(path, init);
  let data: unknown = null;
  try {
    data = await res.json();
  } catch {
    // respons bukan JSON
  }
  if (!res.ok) {
    const message =
      (data as { error?: string } | null)?.error ?? "Permintaan gagal.";
    throw new ApiError(message, res.status);
  }
  return data as T;
}

const authHeader = (token: string) => ({ Authorization: `Bearer ${token}` });

export function createLink(url: string, alias: string): Promise<ShortenResponse> {
  return request<ShortenResponse>("/api/shorten", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ url, alias }),
  });
}

export function fetchLinks(
  token: string,
  page: number,
  q: string
): Promise<LinksResponse> {
  const params = new URLSearchParams({ page: String(page), q });
  return request<LinksResponse>(`/api/links?${params}`, {
    headers: authHeader(token),
  });
}

export function deleteLink(token: string, code: string): Promise<{ ok: true }> {
  return request<{ ok: true }>(`/api/links?code=${encodeURIComponent(code)}`, {
    method: "DELETE",
    headers: authHeader(token),
  });
}
