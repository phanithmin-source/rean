import Link from "next/link";
import {
  searchResources,
  getTopics,
  getNavigationItems,
  getSiteSettings,
  getPageCopy,
} from "@/lib/services/public-service";
import { PublicHeader } from "@/components/layout/PublicHeader";
import { PublicFooter } from "@/components/layout/PublicFooter";
import { ResourceCard } from "@/components/public/ResourceCard";
import { ExploreFilters } from "@/components/public/ExploreFilters";
import { LearningIllustration } from "@/components/public/LearningIllustration";
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
  Check,
  Search,
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
const topicIcons: Record<string, typeof Code2> = {
  Code2,
  Layout,
  Server,
  Database,
  Wrench,
};
const topicTones = [
  "bg-sage-100 text-sage-600",
  "bg-sky-50 text-sky-600",
  "bg-violet-50 text-violet-500",
  "bg-amber-50 text-amber-600",
  "bg-rose-50 text-rose-500",
];

export default async function ExplorePage({ searchParams }: PageProps) {
  const [navItems, settings, topics, pageCopy, catalog, featured] =
    await Promise.all([
      getNavigationItems(),
      getSiteSettings(),
      getTopics(),
      getPageCopy("explore"),
      searchResources({
        searchQuery: searchParams.q,
        topic: searchParams.topic,
        type: searchParams.type,
        difficulty: searchParams.difficulty,
      }),
      searchResources({ featuredOnly: true }),
    ]);
  const hasFilterActive = Object.values(searchParams).some(
    (value) => value && value !== "all",
  );
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <PublicHeader navItems={navItems.header} />
      <main id="main-content" className="flex-1">
        <section className="home-hero relative overflow-hidden">
          <div className="mx-auto grid max-w-7xl items-center gap-6 px-5 py-14 sm:px-8 sm:py-20 lg:grid-cols-[1.08fr_1fr] lg:gap-10 lg:py-24">
            <div className="relative z-10 max-w-xl">
              <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-sage-200 bg-white/80 px-3.5 py-2 text-[11px] font-semibold tracking-wide text-sage-700">
                <span className="h-1.5 w-1.5 rounded-full bg-sage-500" /> For
                curious minds & future builders
              </div>
              <h1 className="text-[2.6rem] font-bold leading-[1.12] tracking-[-0.045em] text-navy sm:text-5xl lg:text-[3.65rem]">
                {pageCopy?.heroTitle ||
                  "Build real skills. Create something great."}
              </h1>
              <p className="mt-6 max-w-lg text-base leading-[1.8] text-muted-foreground sm:text-lg">
                {pageCopy?.heroSubtitle ||
                  "Your space to learn software development. Discover thoughtful resources, find useful tools, and bring your next idea to life."}
              </p>
              <form
                action="/#catalog"
                method="get"
                role="search"
                className="relative mt-7 flex items-center rounded-2xl border border-sage-200 bg-white p-2 shadow-sm"
              >
                <Search
                  size={18}
                  className="ml-3 shrink-0 text-sage-500"
                  aria-hidden="true"
                />
                <input
                  name="q"
                  aria-label="Search the resource directory"
                  placeholder="Find a tool, book, or guide..."
                  defaultValue={searchParams.q}
                  className="min-w-0 flex-1 bg-transparent px-3 py-3 text-sm text-navy outline-none placeholder:text-muted-foreground/70"
                />
                <button
                  type="submit"
                  aria-label="Search resources"
                  className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary text-white transition-colors hover:bg-sage-700"
                >
                  <ArrowRight size={18} />
                </button>
              </form>
              <div className="mt-8 flex flex-wrap items-center gap-3">
                <Link href="/#catalog" className="primary-link">
                  Explore resources <ArrowRight size={16} />
                </Link>
                <Link href="/topics" className="secondary-link">
                  <Compass size={16} className="text-sage-600" /> Browse
                  categories
                </Link>
              </div>
              <div className="mt-7 flex flex-wrap gap-x-5 gap-y-2 text-xs text-muted-foreground">
                <span className="inline-flex items-center gap-1.5">
                  <Check size={14} className="text-sage-600" /> Free to explore
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <Check size={14} className="text-sage-600" /> Learn at your
                  pace
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <Check size={14} className="text-sage-600" /> Build as you go
                </span>
              </div>
            </div>
            <LearningIllustration />
          </div>
          <div className="border-t border-sage-200/60 bg-white/60">
            <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-5 px-5 py-5 sm:px-8">
              <p className="text-sm font-medium text-navy">
                Your next chapter starts here.
              </p>
              <div className="flex items-center gap-6 text-xs text-muted-foreground sm:gap-8">
                <span>
                  <strong className="mr-1 text-base font-semibold text-navy">
                    {topics.length}
                  </strong>{" "}
                  categories
                </span>
                <span>
                  <strong className="mr-1 text-base font-semibold text-navy">
                    {topics.reduce(
                      (sum, topic) => sum + (topic.resource_count || 0),
                      0,
                    )}
                  </strong>{" "}
                  resources
                </span>
                <span className="flex items-center gap-2">
                  <BookOpen size={15} className="text-sage-600" /> Open learning
                </span>
              </div>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-5 py-14 sm:px-8 lg:py-20">
          <div className="section-heading">
            <div>
              <p className="eyebrow">Follow your curiosity</p>
              <h2>
                {pageCopy?.featuredTopicsHeading ||
                  "What would you like to learn?"}
              </h2>
              <p>Find a starting point that feels right for you.</p>
            </div>
            <Link href="/topics" className="text-link">
              View all categories <ArrowRight size={15} />
            </Link>
          </div>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-5">
            {topics.map((topic, index) => {
              const Icon = topicIcons[topic.icon] || Code2;
              return (
                <Link
                  key={topic.id}
                  href={`/topics/${topic.slug}`}
                  className="topic-card group"
                >
                  <span
                    className={`mb-5 flex h-11 w-11 items-center justify-center rounded-2xl ${topicTones[index % topicTones.length]}`}
                  >
                    <Icon size={22} strokeWidth={1.7} />
                  </span>
                  <h3 className="text-sm font-semibold text-navy">
                    {topic.name}
                  </h3>
                  <p className="mt-2 line-clamp-2 text-xs leading-relaxed text-muted-foreground">
                    {topic.description}
                  </p>
                  <div className="mt-5 flex items-center justify-between text-[11px] font-medium text-muted-foreground">
                    <span>{topic.resource_count || 0} resources</span>
                    <ArrowRight
                      size={15}
                      className="text-sage-600 transition-transform group-hover:translate-x-1"
                    />
                  </div>
                </Link>
              );
            })}
          </div>
        </section>

        {!hasFilterActive && featured.resources.length > 0 && (
          <section className="border-y border-border/70 bg-[#F0F7F3] py-14 lg:py-16">
            <div className="mx-auto max-w-7xl px-5 sm:px-8">
              <div className="section-heading">
                <div>
                  <p className="eyebrow">
                    <Sparkles size={13} /> A good place to start
                  </p>
                  <h2>
                    {pageCopy?.curatedPicksHeading || "A few thoughtful picks"}
                  </h2>
                  <p>
                    Useful reads and practical projects, selected with care.
                  </p>
                </div>
                <Link href="/#catalog" className="text-link">
                  Browse the library <ArrowRight size={15} />
                </Link>
              </div>
              <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
                {featured.resources.slice(0, 3).map((resource) => (
                  <ResourceCard key={resource.id} resource={resource} />
                ))}
              </div>
            </div>
          </section>
        )}

        <section
          id="catalog"
          className="mx-auto max-w-7xl scroll-mt-24 px-5 py-14 sm:px-8 lg:py-20"
        >
          <div className="section-heading">
            <div>
              <p className="eyebrow">Your learning library</p>
              <h2>
                {pageCopy?.catalogHeading || "Something for your next step"}
              </h2>
              <p>
                Books, guides, tools, and projects. Find what you need, at your
                pace.
              </p>
            </div>
            <span className="hidden rounded-full border border-border bg-white px-3 py-1.5 text-xs text-muted-foreground sm:block">
              Curated for curious developers
            </span>
          </div>
          <ExploreFilters topics={topics} totalResults={catalog.totalCount} />
          <div className="mt-7">
            {catalog.resources.length > 0 ? (
              <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
                {catalog.resources.map((resource) => (
                  <ResourceCard key={resource.id} resource={resource} />
                ))}
              </div>
            ) : (
              <div className="mx-auto max-w-xl rounded-3xl border border-dashed border-sage-300 bg-white px-6 py-16 text-center">
                <Compass size={30} className="mx-auto mb-4 text-sage-500" />
                <h3 className="text-lg font-semibold text-navy">
                  A different direction, perhaps?
                </h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  No resources match these filters. Try another topic or a
                  broader search.
                </p>
                <Link href="/#catalog" className="primary-link mt-6">
                  Clear all filters <ArrowRight size={15} />
                </Link>
              </div>
            )}
          </div>
        </section>
      </main>
      <PublicFooter navItems={navItems.footer} settings={settings} />
    </div>
  );
}
