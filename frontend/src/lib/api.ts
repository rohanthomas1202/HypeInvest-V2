import type { HypeResult, StockInfo, HealthResponse } from "@/types";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

async function fetchAPI<T>(endpoint: string, params?: Record<string, string>): Promise<T> {
  const url = new URL(`${API_URL}${endpoint}`);
  if (params) {
    Object.entries(params).forEach(([key, value]) => url.searchParams.set(key, value));
  }

  const res = await fetch(url.toString());

  if (!res.ok) {
    const error = await res.json().catch(() => ({ detail: res.statusText }));
    throw new Error(error.detail || `API error: ${res.status}`);
  }

  return res.json();
}

export function fetchHype(ticker: string): Promise<HypeResult> {
  return fetchAPI<HypeResult>("/api/hype", { ticker });
}

export function fetchStock(ticker: string): Promise<StockInfo> {
  return fetchAPI<StockInfo>("/api/stock", { ticker });
}

export function fetchHealth(): Promise<HealthResponse> {
  return fetchAPI<HealthResponse>("/api/health");
}
