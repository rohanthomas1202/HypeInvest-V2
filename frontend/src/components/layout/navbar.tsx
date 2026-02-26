"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export function Navbar() {
  const router = useRouter();
  const [query, setQuery] = useState("");

  const handleSearch = () => {
    const trimmed = query.trim();
    if (trimmed) {
      router.push(`/search?query=${encodeURIComponent(trimmed.toUpperCase())}`);
      setQuery("");
    }
  };

  return (
    <header className="glass border-b border-border/40 sticky top-0 z-50">
      <div className="container mx-auto flex h-14 items-center justify-between px-4 gap-4">
        <Link href="/" className="flex items-center gap-2 shrink-0 group">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center shadow-sm group-hover:shadow-md transition-smooth">
            <span className="text-primary-foreground font-bold text-sm">H</span>
          </div>
          <span className="font-semibold text-lg tracking-tight hidden sm:block">
            Hype<span className="gradient-text">Invest</span>
          </span>
        </Link>

        <div className="flex items-center gap-2 max-w-md w-full">
          <div className="relative w-full">
            <svg
              className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2}
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
            </svg>
            <Input
              placeholder="Search any ticker..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              className="pl-9 h-9 bg-secondary/50 border-border/40 focus:border-primary/50 focus:bg-background transition-smooth rounded-xl"
            />
          </div>
          <Button size="sm" onClick={handleSearch} className="shrink-0 rounded-xl shadow-sm">
            Go
          </Button>
        </div>

        <nav className="flex items-center gap-1 shrink-0">
          <Link
            href="/"
            className="px-3 py-1.5 text-sm text-muted-foreground hover:text-foreground rounded-lg hover:bg-accent transition-smooth"
          >
            Home
          </Link>
        </nav>
      </div>
    </header>
  );
}
