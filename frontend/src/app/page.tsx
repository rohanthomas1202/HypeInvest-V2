import { SearchInput } from "@/components/search/search-input";

export default function HomePage() {
  return (
    <div className="relative flex flex-col items-center justify-center min-h-[70vh] space-y-10">
      {/* Background grid */}
      <div className="absolute inset-0 grid-bg opacity-50 -z-10" />
      {/* Radial glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] bg-primary/5 rounded-full blur-3xl -z-10" />

      <div className="text-center space-y-5">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-border/60 bg-secondary/50 text-xs text-muted-foreground mb-4">
          <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
          Live sentiment analysis
        </div>

        <h1 className="text-6xl sm:text-7xl font-bold tracking-tighter">
          <span className="gradient-text">Hype</span>Invest
        </h1>

        <p className="text-lg text-muted-foreground max-w-md mx-auto leading-relaxed">
          AI-powered stock sentiment analysis across Reddit, YouTube, and News.
          See what the internet really thinks.
        </p>
      </div>

      <SearchInput size="large" />

      <div className="grid grid-cols-3 gap-12 text-center pt-8">
        <div className="space-y-1">
          <p className="text-3xl font-bold tracking-tight gradient-text">5</p>
          <p className="text-xs text-muted-foreground uppercase tracking-wider">Sources</p>
        </div>
        <div className="space-y-1">
          <p className="text-3xl font-bold tracking-tight gradient-text">AI</p>
          <p className="text-xs text-muted-foreground uppercase tracking-wider">Powered</p>
        </div>
        <div className="space-y-1">
          <p className="text-3xl font-bold tracking-tight gradient-text">Live</p>
          <p className="text-xs text-muted-foreground uppercase tracking-wider">Data</p>
        </div>
      </div>
    </div>
  );
}
