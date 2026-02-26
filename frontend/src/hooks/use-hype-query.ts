"use client";

import { useQuery } from "@tanstack/react-query";
import { fetchHype } from "@/lib/api";

export function useHypeQuery(ticker: string) {
  return useQuery({
    queryKey: ["hype", ticker],
    queryFn: () => fetchHype(ticker),
    enabled: !!ticker,
  });
}
