"use client";

import { useHypeQuery } from "@/hooks/use-hype-query";
import { StockInfoCard } from "@/components/stock/stock-info-card";
import { HypeGauge } from "@/components/stock/hype-gauge";
import { PlatformBreakdown } from "@/components/stock/platform-breakdown";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface SearchResultsProps {
  ticker: string;
}

export function SearchResults({ ticker }: SearchResultsProps) {
  const { data, isLoading, isError, error, refetch } = useHypeQuery(ticker);

  if (isLoading) {
    return <SearchResultsSkeleton ticker={ticker} />;
  }

  if (isError) {
    return (
      <Card className="border-destructive/30 bg-destructive/5">
        <CardContent className="py-12 text-center space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-destructive/10 flex items-center justify-center mx-auto">
            <svg className="w-6 h-6 text-destructive" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" />
            </svg>
          </div>
          <p className="font-medium text-destructive">
            {error?.message || "Failed to load data"}
          </p>
          <p className="text-sm text-muted-foreground">
            Check that the ticker is valid and try again.
          </p>
          <Button variant="outline" size="sm" onClick={() => refetch()} className="mt-2">
            Retry
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (!data) return null;

  return (
    <div className="space-y-6">
      {/* Ticker header */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center shadow-sm">
          <span className="text-primary-foreground font-bold text-sm">{data.ticker.charAt(0)}</span>
        </div>
        <div>
          <h1 className="text-xl font-bold leading-tight">{data.stock_info.name}</h1>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span className="font-mono">{data.ticker}</span>
            <span className="w-1 h-1 rounded-full bg-muted-foreground/50" />
            <span className="flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
              {data.sources_used.length}/{data.sources_used.length + data.sources_failed.length} sources
            </span>
          </div>
        </div>
      </div>

      {/* Main grid */}
      <div className="grid gap-5 md:grid-cols-2">
        <StockInfoCard stock={data.stock_info} />
        <HypeGauge value={data.hype_index} />
      </div>

      {/* Platform breakdown */}
      <PlatformBreakdown
        scores={data.platform_scores}
        sourcesUsed={data.sources_used}
        sourcesFailed={data.sources_failed}
      />
    </div>
  );
}

function SearchResultsSkeleton({ ticker }: { ticker: string }) {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Skeleton className="w-10 h-10 rounded-xl" />
        <div className="space-y-2">
          <Skeleton className="h-5 w-40" />
          <Skeleton className="h-4 w-24" />
        </div>
      </div>
      <div className="text-center py-4">
        <p className="text-sm text-muted-foreground animate-pulse">
          Analyzing sentiment for <span className="font-mono font-medium text-foreground">{ticker}</span>...
        </p>
      </div>
      <div className="grid gap-5 md:grid-cols-2">
        <Skeleton className="h-56 rounded-xl" />
        <Skeleton className="h-56 rounded-xl" />
      </div>
      <Skeleton className="h-72 rounded-xl" />
    </div>
  );
}
