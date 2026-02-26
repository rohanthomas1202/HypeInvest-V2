import { Card, CardContent } from "@/components/ui/card";
import type { StockInfo } from "@/types";

interface StockInfoCardProps {
  stock: StockInfo;
}

export function StockInfoCard({ stock }: StockInfoCardProps) {
  const isPositive = stock.change >= 0;

  const formatPrice = (price: number) =>
    new Intl.NumberFormat("en-US", { style: "currency", currency: stock.currency }).format(price);

  const formatMarketCap = (cap: number | null) => {
    if (!cap) return "N/A";
    if (cap >= 1e12) return `$${(cap / 1e12).toFixed(2)}T`;
    if (cap >= 1e9) return `$${(cap / 1e9).toFixed(2)}B`;
    if (cap >= 1e6) return `$${(cap / 1e6).toFixed(2)}M`;
    return `$${cap.toLocaleString()}`;
  };

  return (
    <Card className="overflow-hidden border-border/40">
      <CardContent className="p-6 space-y-5">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
              {stock.ticker}
            </h2>
            <p className="text-lg font-semibold mt-0.5 leading-tight">{stock.name}</p>
          </div>
          <div
            className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-sm font-medium ${
              isPositive
                ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                : "bg-red-500/10 text-red-600 dark:text-red-400"
            }`}
          >
            <svg
              className={`w-3.5 h-3.5 ${isPositive ? "" : "rotate-180"}`}
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2.5}
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 10.5 12 3m0 0 7.5 7.5M12 3v18" />
            </svg>
            {Math.abs(stock.change_percent).toFixed(2)}%
          </div>
        </div>

        {/* Price */}
        <div>
          <span className="text-4xl font-bold tracking-tight">{formatPrice(stock.current_price)}</span>
          <span className={`ml-3 text-sm font-medium ${isPositive ? "text-emerald-600 dark:text-emerald-400" : "text-red-600 dark:text-red-400"}`}>
            {isPositive ? "+" : ""}{stock.change.toFixed(2)}
          </span>
        </div>

        {/* Stats grid */}
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: "High", value: formatPrice(stock.high) },
            { label: "Low", value: formatPrice(stock.low) },
            { label: "Mkt Cap", value: formatMarketCap(stock.market_cap) },
          ].map((stat) => (
            <div key={stat.label} className="bg-secondary/50 rounded-xl p-3 text-center">
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-medium">{stat.label}</p>
              <p className="font-semibold text-sm mt-1">{stat.value}</p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
