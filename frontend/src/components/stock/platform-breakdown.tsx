import { Card, CardContent } from "@/components/ui/card";
import type { PlatformScore } from "@/types";

interface PlatformBreakdownProps {
  scores: PlatformScore[];
  sourcesUsed: string[];
  sourcesFailed: string[];
}

const PLATFORM_CONFIG: Record<string, { color: string; gradient: string; icon: string }> = {
  reddit: { color: "text-orange-500", gradient: "from-orange-500 to-orange-400", icon: "R" },
  youtube: { color: "text-red-500", gradient: "from-red-500 to-red-400", icon: "Y" },
  news: { color: "text-blue-500", gradient: "from-blue-500 to-blue-400", icon: "N" },
  bluesky: { color: "text-sky-500", gradient: "from-sky-500 to-sky-400", icon: "B" },
  stocktwits: { color: "text-emerald-500", gradient: "from-emerald-500 to-emerald-400", icon: "S" },
};

function formatEngagement(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return n.toFixed(0);
}

export function PlatformBreakdown({ scores, sourcesUsed, sourcesFailed }: PlatformBreakdownProps) {
  const total = sourcesUsed.length + sourcesFailed.length;

  return (
    <Card className="border-border/40">
      <CardContent className="p-6 space-y-5">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h3 className="font-semibold">Source Breakdown</h3>
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
            {sourcesUsed.length}/{total} active
          </div>
        </div>

        {/* Platform rows */}
        <div className="space-y-4">
          {scores.map((score) => {
            const config = PLATFORM_CONFIG[score.platform] || {
              color: "text-gray-500",
              gradient: "from-gray-500 to-gray-400",
              icon: "?",
            };
            const perceptionPct = score.perception * 100;
            const isPositive = score.perception >= 0;

            return (
              <div key={score.platform} className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div
                      className={`w-8 h-8 rounded-lg bg-gradient-to-br ${config.gradient} flex items-center justify-center shadow-sm`}
                    >
                      <span className="text-white text-xs font-bold">{config.icon}</span>
                    </div>
                    <div>
                      <p className="font-medium text-sm capitalize">{score.platform}</p>
                      <p className="text-[11px] text-muted-foreground">
                        {score.message_count} posts &middot; {formatEngagement(score.total_engagement)} engagement
                      </p>
                    </div>
                  </div>
                  <div
                    className={`text-sm font-semibold tabular-nums ${
                      isPositive
                        ? "text-emerald-600 dark:text-emerald-400"
                        : "text-red-600 dark:text-red-400"
                    }`}
                  >
                    {isPositive ? "+" : ""}
                    {perceptionPct.toFixed(0)}%
                  </div>
                </div>

                {/* Perception bar */}
                <div className="relative h-1.5 bg-muted rounded-full overflow-hidden">
                  <div className="absolute left-1/2 top-0 h-full w-px bg-border/80 z-10" />
                  {isPositive ? (
                    <div
                      className="absolute left-1/2 top-0 h-full bg-emerald-500 rounded-r-full transition-all duration-700 ease-out"
                      style={{ width: `${Math.abs(perceptionPct) / 2}%` }}
                    />
                  ) : (
                    <div
                      className="absolute top-0 h-full bg-red-500 rounded-l-full transition-all duration-700 ease-out"
                      style={{
                        right: "50%",
                        width: `${Math.abs(perceptionPct) / 2}%`,
                      }}
                    />
                  )}
                </div>

                {/* Popularity bar */}
                <div className="flex items-center gap-3">
                  <span className="text-[10px] text-muted-foreground uppercase tracking-wider w-16 shrink-0">
                    Reach
                  </span>
                  <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full bg-gradient-to-r ${config.gradient} transition-all duration-700 ease-out`}
                      style={{ width: `${score.popularity * 100}%` }}
                    />
                  </div>
                  <span className="text-[11px] text-muted-foreground tabular-nums w-8 text-right">
                    {(score.popularity * 100).toFixed(0)}%
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Failed sources */}
        {sourcesFailed.length > 0 && (
          <div className="flex items-center gap-2 pt-3 border-t border-border/40">
            <span className="text-[11px] text-muted-foreground">Unavailable:</span>
            {sourcesFailed.map((source) => (
              <span
                key={source}
                className="text-[11px] text-muted-foreground bg-muted px-2 py-0.5 rounded-md capitalize"
              >
                {source}
              </span>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
