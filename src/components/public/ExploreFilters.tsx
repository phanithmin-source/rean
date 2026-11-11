"use client";

import React, { useState, useEffect, useTransition } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { Topic } from "@/lib/services/public-service";
import { Search, X, SlidersHorizontal, RotateCcw } from "lucide-react";
import { Button } from "../ui/button";

interface ExploreFiltersProps {
  topics: Topic[];
  totalResults: number;
}

export function ExploreFilters({ topics, totalResults }: ExploreFiltersProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const currentSearch = searchParams.get("q") || "";
  const currentTopic = searchParams.get("topic") || "all";
  const currentType = searchParams.get("type") || "all";
  const currentDifficulty = searchParams.get("difficulty") || "all";

  const [searchInput, setSearchInput] = useState(currentSearch);

  useEffect(() => {
    setSearchInput(currentSearch);
  }, [currentSearch]);

  const updateFilters = (updates: {
    q?: string;
    topic?: string;
    type?: string;
    difficulty?: string;
  }) => {
    const params = new URLSearchParams(searchParams.toString());

    if (updates.q !== undefined) {
      if (updates.q.trim()) {
        params.set("q", updates.q.trim());
      } else {
        params.delete("q");
      }
    }

    if (updates.topic !== undefined) {
      if (updates.topic && updates.topic !== "all") {
        params.set("topic", updates.topic);
      } else {
        params.delete("topic");
      }
    }

    if (updates.type !== undefined) {
      if (updates.type && updates.type !== "all") {
        params.set("type", updates.type);
      } else {
        params.delete("type");
      }
    }

    if (updates.difficulty !== undefined) {
      if (updates.difficulty && updates.difficulty !== "all") {
        params.set("difficulty", updates.difficulty);
      } else {
        params.delete("difficulty");
      }
    }

    startTransition(() => {
      const qs = params.toString();
      const target = qs ? `${pathname}?${qs}#catalog` : `${pathname}#catalog`;
      router.push(target, { scroll: false });
    });
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateFilters({ q: searchInput });
  };

  const clearAllFilters = () => {
    setSearchInput("");
    startTransition(() => {
      router.push(pathname + "#catalog", { scroll: false });
    });
  };

  const hasActiveFilters =
    Boolean(currentSearch) ||
    currentTopic !== "all" ||
    currentType !== "all" ||
    currentDifficulty !== "all";

  const resourceTypes = [
    { value: "all", label: "All Types" },
    { value: "book", label: "Books & Handbooks" },
    { value: "guide", label: "Guides" },
    { value: "documentation", label: "Documentation" },
    { value: "course", label: "Courses" },
    { value: "tool", label: "Tools" },
    { value: "project", label: "Projects" },
  ];

  const difficulties = [
    { value: "all", label: "All Difficulties" },
    { value: "beginner", label: "Beginner" },
    { value: "intermediate", label: "Intermediate" },
    { value: "advanced", label: "Advanced" },
  ];

  return (
    <div id="catalog" className="space-y-6 pt-4">
      {/* Prominent Search Bar (DevPages / ReanCode101 reference) */}
      <form onSubmit={handleSearchSubmit} className="relative w-full">
        <div className="relative flex items-center">
          <Search className="absolute left-4 w-5 h-5 text-navy/50 pointer-events-none" />
          <input
            type="search"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Search software catalog (e.g. 'REST API', 'Java', 'SQL', 'Git', 'Docker')..."
            className="w-full h-14 pl-12 pr-28 rounded-xl border-2 border-border bg-card text-navy text-base placeholder:text-muted-foreground focus:outline-none focus:border-navy focus:ring-4 focus:ring-cyan/30 shadow-xs transition-all"
            aria-label="Search software catalog"
          />
          <div className="absolute right-3 flex items-center gap-1.5">
            {searchInput && (
              <button
                type="button"
                onClick={() => {
                  setSearchInput("");
                  updateFilters({ q: "" });
                }}
                className="p-1.5 text-navy/50 hover:text-navy rounded-md"
                aria-label="Clear search text"
              >
                <X className="w-4 h-4" />
              </button>
            )}
            <Button
              type="submit"
              size="sm"
              variant="default"
              className="h-9 px-4 font-semibold"
            >
              Search
            </Button>
          </div>
        </div>
      </form>

      {/* Topic Filter Tabs / Pills */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-navy/70">
            Browse By Topic
          </span>
          {hasActiveFilters && (
            <button
              onClick={clearAllFilters}
              className="inline-flex items-center gap-1 text-xs font-semibold text-destructive hover:underline"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Reset all filters</span>
            </button>
          )}
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          <button
            onClick={() => updateFilters({ topic: "all" })}
            className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all border ${
              currentTopic === "all"
                ? "bg-navy text-white border-navy shadow-xs"
                : "bg-card text-navy border-border hover:bg-cream-200"
            }`}
          >
            All Topics
          </button>
          {topics.map((t) => (
            <button
              key={t.slug}
              onClick={() => updateFilters({ topic: t.slug })}
              className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all border ${
                currentTopic === t.slug
                  ? "bg-navy text-white border-navy shadow-xs"
                  : "bg-card text-navy border-border hover:bg-cream-200"
              }`}
            >
              {t.name}
              {t.resource_count !== undefined && (
                <span className="ml-1.5 opacity-60 text-[10px]">
                  ({t.resource_count})
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Secondary Filters Bar: Type and Difficulty */}
      <div className="flex flex-wrap items-center justify-between gap-4 py-3 px-4 rounded-xl border border-border bg-card/70">
        <div className="flex flex-wrap items-center gap-4">
          {/* Type Filter */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-navy/70">Type:</span>
            <select
              value={currentType}
              onChange={(e) => updateFilters({ type: e.target.value })}
              className="text-xs font-semibold bg-background border border-border rounded-md px-2.5 py-1 text-navy focus:outline-none focus:ring-1 focus:ring-navy cursor-pointer"
              aria-label="Filter by resource type"
            >
              {resourceTypes.map((rt) => (
                <option key={rt.value} value={rt.value}>
                  {rt.label}
                </option>
              ))}
            </select>
          </div>

          {/* Difficulty Filter */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-navy/70">Level:</span>
            <select
              value={currentDifficulty}
              onChange={(e) => updateFilters({ difficulty: e.target.value })}
              className="text-xs font-semibold bg-background border border-border rounded-md px-2.5 py-1 text-navy focus:outline-none focus:ring-1 focus:ring-navy cursor-pointer"
              aria-label="Filter by difficulty level"
            >
              {difficulties.map((df) => (
                <option key={df.value} value={df.value}>
                  {df.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Result Count */}
        <div className="text-xs font-medium text-navy/70 flex items-center gap-2">
          {isPending ? (
            <span className="text-navy/50 animate-pulse">Updating...</span>
          ) : (
            <span>
              Showing <strong className="text-navy">{totalResults}</strong>{" "}
              {totalResults === 1 ? "resource" : "resources"}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
