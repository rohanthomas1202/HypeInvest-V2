export interface SocialMessage {
  text: string;
  engagement: number;
  source: string;
  sentiment: number;
}

export interface PlatformScore {
  platform: string;
  perception: number; // [-1, 1]
  popularity: number; // [0, 1]
  message_count: number;
  total_engagement: number;
}

export interface StockInfo {
  ticker: string;
  name: string;
  current_price: number;
  change: number;
  change_percent: number;
  high: number;
  low: number;
  market_cap: number | null;
  currency: string;
}

export interface HypeResult {
  ticker: string;
  stock_info: StockInfo;
  hype_index: number; // [-100, 100]
  total_perception: number; // [-1, 1]
  total_popularity: number; // [0, 1]
  platform_scores: PlatformScore[];
  sources_used: string[];
  sources_failed: string[];
}

export interface HealthResponse {
  status: string;
  version: string;
  sources: string[];
}
