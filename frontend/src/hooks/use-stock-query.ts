"use client";

import { useQuery } from "@tanstack/react-query";
import { fetchStock } from "@/lib/api";

export function useStockQuery(ticker: string) {
  return useQuery({
    queryKey: ["stock", ticker],
    queryFn: () => fetchStock(ticker),
    enabled: !!ticker,
  });
}
