"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface SearchInputProps {
  defaultValue?: string;
  size?: "default" | "large";
}

export function SearchInput({ defaultValue = "", size = "default" }: SearchInputProps) {
  const router = useRouter();
  const [query, setQuery] = useState(defaultValue);

  const handleSearch = () => {
    const trimmed = query.trim();
    if (trimmed) {
      router.push(`/search?query=${encodeURIComponent(trimmed.toUpperCase())}`);
    }
  };

  const isLarge = size === "large";

  return (
    <div className={`flex gap-3 w-full ${isLarge ? "max-w-xl" : "max-w-sm"}`}>
      <div className="relative w-full">
        <svg
          className={`absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none ${isLarge ? "h-5 w-5" : "h-4 w-4"}`}
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={2}
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
        </svg>
        <Input
          placeholder="Enter a ticker symbol..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSearch()}
          className={`${isLarge ? "h-13 text-lg pl-11 rounded-2xl" : "pl-9 rounded-xl"} bg-card border-border/50 shadow-sm focus:shadow-md focus:border-primary/50 transition-smooth`}
        />
      </div>
      <Button
        onClick={handleSearch}
        className={`${isLarge ? "h-13 px-8 text-base rounded-2xl" : "rounded-xl"} shadow-sm hover:shadow-md transition-smooth`}
      >
        Analyze
      </Button>
    </div>
  );
}
