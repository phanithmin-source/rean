import React from "react";
import Link from "next/link";
import {
  searchResources,
  getTopics,
  getLearningPaths,
  getNavigationItems,
  getSiteSettings,
  getPageCopy,
} from "@/lib/services/public-service";
import { PublicHeader } from "@/components/layout/PublicHeader";
import { PublicFooter } from "@/components/layout/PublicFooter";
import { ResourceCard } from "@/components/public/ResourceCard";
import { ExploreFilters } from "@/components/public/ExploreFilters";
import { ReanLogo } from "@/components/brand/ReanLogo";
import {
  Code2,
  Layout,
  Server,
  Database,
  Wrench,
  Sparkles,
  Compass,
  ArrowRight,
  BookOpen,
  CheckCircle2,
  FolderGit2,
} from "lucide-react";

export const dynamic = "force-dynamic";

interface PageProps {
  searchParams: {
    q?: string;
    topic?: string;
    type?: string;
    difficulty?: string;
  };
}

export default async function ExplorePage({ searchParams }: PageProps) {
  const [navItems, settings, topics, pageCopy, learningPaths] =
    await Promise.all([
      getNavigationItems(),
      getSiteSettings(),
      getTopics(),
      getPageCopy("explore"),
      getLearningPaths(),
    ]);

  const searchQuery = searchParams.q;
  const topicFilter = searchParams.topic;
  const typeFilter = searchParams.type;
  const difficultyFilter = searchParams.difficulty;

  // Search filtered resources
  const { resources: filteredResources, totalCount } = await searchResources({
    searchQuery,
    topic: topicFilter,
    type: typeFilter,
    difficulty: difficultyFilter,
  });

  // Curated picks (featured resources)
  const { resources: curatedPicks } = await searchResources({
    featuredOnly: true,
  });

  const getTopicIcon = (iconName: string) => {
    switch (iconName) {
      case "Code2":
        return <Code2 className="w-5 h-5 text-sage-600" />;
      case "Layout":
        return <Layout className="w-5 h-5 text-cyan-600" />;
      case "Server":
        return <Server className="w-5 h-5 text-navy-400" />;
      case "Database":
        return <Database className="w-5 h-5 text-amber-600" />;
      case "Wrench":
        return <Wrench className="w-5 h-5 text-emerald-600" />;
      default:
        return <Code2 className="w-5 h-5 text-navy" />;
    }
  };

  const hasFilterActive =
    Boolean(searchQuery) ||
    (topicFilter && topicFilter !== "all") ||
    (typeFilter && typeFilter !== "all") ||
    (difficultyFilter && difficultyFilter !== "all");

  return (
    <div className="min-h-screen flex flex-col bg-background selection:bg-cyan/40">
      <PublicHeader navItems={navItems.header} />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative border-b border-border/70 bg-gradient-to-b from-[#F2EFE6]/50 via-[#F8F7F2] to-[#F8F7F2] py-16 md:py-24 overflow-hidden">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="max-w-3xl space-y-6">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-card/90 border border-border/80 text-xs font-semibold text-navy shadow-xs">
                <span className="font-khmer text-sage-700">រៀនកូដ</span>
                <span className="text-border">•</span>
                <span>Software Engineering Resource Hub</span>
              </div>

              <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-navy leading-[1.12]">
                {pageCopy?.heroTitle || "Build Real Software with Rean (រៀន)"}
              </h1>

              <p className="text-base sm:text-lg text-muted-foreground leading-relaxed max-w-2xl">
                {pageCopy?.heroSubtitle ||
                  "A calm, distraction-free discovery hub for Cambodian students and software engineers. Curated books, guides, guided learning paths, and hands-on practice projects."}
              </p>

              <div className="pt-2 flex flex-wrap items-center gap-3">
                <Link
                  href="/#catalog"
                  className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-navy text-white font-semibold text-sm hover:bg-navy-700 shadow-xs hover:shadow-md hover:-translate-y-0.5 transition-all"
                >
                  <span>Explore Catalog</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>

                <Link
                  href="/paths"
                  className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-card border border-border/80 hover:border-navy/30 text-navy font-semibold text-sm hover:bg-cream-100/60 hover:-translate-y-0.5 transition-all shadow-xs"
                >
                  <Compass className="w-4 h-4 text-sage-600" />
                  <span>View Learning Paths</span>
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Featured Topics Carousel / Grid */}
        <section className="py-14 border-b border-border/70 bg-card/50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-xl sm:text-2xl font-extrabold text-navy tracking-tight">
                  {pageCopy?.featuredTopicsHeading || "Core Learning Domains"}
                </h2>
                <p className="text-xs sm:text-sm text-muted-foreground mt-1">
                  Browse by software discipline or follow structured curricula.
                </p>
              </div>
              <Link
                href="/paths"
                className="hidden sm:inline-flex items-center gap-1.5 text-xs font-semibold text-navy hover:text-sage-700 transition-colors"
              >
                <span>View all roadmaps</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
              {topics.map((t) => (
                <Link
                  key={t.slug}
                  href={`/topics/${t.slug}`}
                  className="group flex flex-col p-5 rounded-2xl border border-border/80 bg-card hover:border-sage-400/80 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200"
                >
                  <div className="p-2.5 w-fit rounded-xl bg-cream-100 border border-border/70 group-hover:bg-sage-50 group-hover:border-sage-200 transition-colors">
                    {getTopicIcon(t.icon)}
                  </div>
                  <h3 className="mt-3.5 font-bold text-sm text-navy group-hover:text-navy-900 transition-colors">
                    {t.name}
                  </h3>
                  <p className="mt-1 text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                    {t.description}
                  </p>
                  <span className="mt-3 text-[11px] font-semibold text-sage-700 tnum flex items-center gap-1">
                    <span>{t.resource_count || 0} resources</span>
                    <span className="group-hover:translate-x-0.5 transition-transform">&rarr;</span>
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* Curated Picks Section (Staff Picks reference from DevPages) */}
        {!hasFilterActive && curatedPicks.length > 0 && (
          <section className="py-14 border-b border-border/70 bg-[#F4F0E6]/40">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex items-center gap-2 mb-2">
                <Sparkles className="w-4 h-4 text-sage-600" />
                <span className="text-xs font-bold uppercase tracking-wider text-sage-700">
                  Editorial Highlights
                </span>
              </div>
              <h2 className="text-2xl font-extrabold text-navy mb-8 tracking-tight">
                {pageCopy?.curatedPicksHeading || "Curated Launch Resources"}
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {curatedPicks.slice(0, 3).map((resource) => (
                  <ResourceCard key={resource.id} resource={resource} />
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Main Resource Catalog Section */}
        <section className="py-14 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-navy tracking-tight">
              {pageCopy?.catalogHeading || "Software Development Catalog"}
            </h2>
            <p className="text-sm text-muted-foreground mt-1">
              Filter by topic, media format, and experience level to find exactly what you need.
            </p>
          </div>

          {/* Interactive Filters & Search */}
          <ExploreFilters topics={topics} totalResults={totalCount} />

          {/* Catalog Results Grid */}
          <div className="mt-8">
            {filteredResources.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredResources.map((resource) => (
                  <ResourceCard key={resource.id} resource={resource} />
                ))}
              </div>
            ) : (
              /* Useful Empty State */
              <div className="text-center py-16 px-4 rounded-2xl border-2 border-dashed border-border/80 bg-card max-w-xl mx-auto space-y-4">
                <div className="w-12 h-12 rounded-full bg-cream-100 border border-border/80 flex items-center justify-center mx-auto text-navy">
                  <Compass className="w-6 h-6 text-navy/60" />
                </div>
                <h3 className="text-lg font-bold text-navy">
                  No resources found
                </h3>
                <p className="text-sm text-muted-foreground max-w-sm mx-auto">
                  We couldn&apos;t find any published resources matching your search or active filters.
                </p>
                <div className="pt-2">
                  <Link
                    href="/#catalog"
                    className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-navy text-white text-xs font-semibold hover:bg-navy-700 transition-all shadow-xs"
                  >
                    <span>Clear all filters</span>
                  </Link>
                </div>
              </div>
            )}
          </div>
        </section>

        {/* Structured Learning Paths Section */}
        {learningPaths.length > 0 && (
          <section className="py-16 border-t border-border/70 bg-card/60">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
                <div>
                  <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-sage-600 mb-1.5">
                    <Compass className="w-4 h-4" />
                    <span>Guided Progression</span>
                  </div>
                  <h2 className="text-2xl sm:text-3xl font-extrabold text-navy tracking-tight">
                    {pageCopy?.pathsHeading || "Structured Learning Paths"}
                  </h2>
                  <p className="text-sm text-muted-foreground mt-1">
                    Step-by-step curricula that culminate in practical portfolio projects.
                  </p>
                </div>
                <Link
                  href="/paths"
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-navy hover:text-sage-700 transition-colors shrink-0"
                >
                  <span>Explore all learning paths</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {learningPaths.map((path) => (
                  <div
                    key={path.id}
                    className="flex flex-col justify-between rounded-2xl border border-border/80 bg-cream-50/60 p-6 sm:p-7 hover:border-sage-400/80 hover:shadow-md transition-all"
                  >
                    <div>
                      <div className="flex items-center justify-between gap-2 mb-3">
                        <span className="text-[11px] font-bold uppercase tracking-wider text-sage-700 bg-sage-100/80 border border-sage-300/60 px-2.5 py-0.5 rounded-full">
                          {path.topic_name || "Roadmap"}
                        </span>
                        <span className="text-xs font-semibold text-muted-foreground tnum">
                          {path.steps?.length || 0} Steps
                        </span>
                      </div>
                      <h3 className="text-xl font-extrabold text-navy">
                        <Link
                          href={`/paths/${path.slug}`}
                          className="hover:underline"
                        >
                          {path.title}
                        </Link>
                      </h3>
                      <p className="text-sm text-muted-foreground mt-2 leading-relaxed">
                        {path.summary}
                      </p>

                      {/* Final practice project preview */}
                      <div className="mt-4 p-3.5 rounded-xl border border-border/70 bg-card flex items-start gap-3 shadow-2xs">
                        <FolderGit2 className="w-4 h-4 text-sage-600 mt-0.5 shrink-0" />
                        <div>
                          <p className="text-xs font-bold text-navy">
                            Final Project: {path.final_task_title}
                          </p>
                          <p className="text-xs text-muted-foreground line-clamp-1 mt-0.5">
                            {path.final_task_description}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="mt-6 pt-4 border-t border-border/70 flex items-center justify-between">
                      <span className="text-xs text-navy/70 font-medium">
                        Beginner to Job-Ready
                      </span>
                      <Link
                        href={`/paths/${path.slug}`}
                        className="inline-flex items-center gap-1.5 text-xs font-bold text-navy hover:text-sage-700 transition-colors"
                      >
                        <span>Start Learning Path</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}
      </main>

      <PublicFooter navItems={navItems.footer} settings={settings} />
    </div>
  );
}
