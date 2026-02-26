"use client";

import { useSearchParams } from "next/navigation";
import { SearchResults } from "@/components/search/search-results";
import { SearchInput } from "@/components/search/search-input";
import { Suspense } from "react";

function SearchContent() {
  const searchParams = useSearchParams();
  const query = searchParams.get("query") || "";

  if (!query) {
    return (
      <div className="text-center py-20">
        <h2 className="text-2xl font-bold mb-4">Search for a Stock</h2>
        <p className="text-muted-foreground mb-6">
          Enter a ticker symbol to see its hype analysis.
        </p>
        <div className="flex justify-center">
          <SearchInput size="large" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <SearchResults ticker={query} />
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense>
      <SearchContent />
    </Suspense>
  );
}
