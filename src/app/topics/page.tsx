import Link from "next/link";
import {
  Code2,
  Layout,
  Server,
  Database,
  Wrench,
  ArrowRight,
  Layers,
} from "lucide-react";
import {
  getNavigationItems,
  getSiteSettings,
  getTopics,
} from "@/lib/services/public-service";
import { PublicHeader } from "@/components/layout/PublicHeader";
import { PublicFooter } from "@/components/layout/PublicFooter";

export const dynamic = "force-dynamic";
export const metadata = {
  title: "Categories — Rean",
  description:
    "Browse curated developer resources by topic. Programming, frontend, backend, databases, and developer tools.",
};
const icons: Record<string, typeof Code2> = {
  Code2,
  Layout,
  Server,
  Database,
  Wrench,
};
const tones = [
  "bg-sage-100 text-sage-600",
  "bg-sky-50 text-sky-600",
  "bg-violet-50 text-violet-500",
  "bg-amber-50 text-amber-600",
  "bg-rose-50 text-rose-500",
];

export default async function CategoriesPage() {
  const [nav, settings, topics] = await Promise.all([
    getNavigationItems(),
    getSiteSettings(),
    getTopics(),
  ]);
  return (
    <div className="flex min-h-screen flex-col">
      <PublicHeader navItems={nav.header} />
      <main className="flex-1">
        <section className="page-banner">
          <div className="mx-auto max-w-7xl px-5 sm:px-8">
            <p className="eyebrow">
              <Layers size={14} /> A little less searching
            </p>
            <h1 className="text-4xl font-semibold tracking-tight text-navy sm:text-5xl">
              Find your corner of the directory.
            </h1>
            <p className="mt-5 max-w-xl text-base leading-7 text-muted-foreground">
              Explore developer tools, books, documentation, and practical
              guides, organized by what you want to build.
            </p>
            <p className="mt-6 text-xs font-medium text-sage-700">
              {topics.length} categories ·{" "}
              {topics.reduce(
                (sum, topic) => sum + (topic.resource_count || 0),
                0,
              )}{" "}
              curated resources
            </p>
          </div>
        </section>
        <section className="mx-auto grid max-w-7xl gap-5 px-5 py-14 sm:grid-cols-2 sm:px-8 lg:grid-cols-3 lg:py-20">
          {topics.map((topic, index) => {
            const Icon = icons[topic.icon] || Code2;
            return (
              <Link
                key={topic.id}
                href={`/topics/${topic.slug}`}
                className="topic-card group !p-7"
              >
                <span
                  className={`mb-6 flex h-14 w-14 items-center justify-center rounded-2xl ${tones[index % tones.length]}`}
                >
                  <Icon size={27} strokeWidth={1.5} />
                </span>
                <h2 className="text-xl font-semibold tracking-tight text-navy">
                  {topic.name}
                </h2>
                <p className="mt-3 min-h-12 text-sm leading-6 text-muted-foreground">
                  {topic.description}
                </p>
                <span className="mt-7 flex items-center justify-between border-t border-border pt-5 text-xs font-medium text-sage-700">
                  Explore {topic.resource_count || 0} resources{" "}
                  <ArrowRight
                    size={16}
                    className="transition-transform group-hover:translate-x-1"
                  />
                </span>
              </Link>
            );
          })}
        </section>
      </main>
      <PublicFooter navItems={nav.footer} settings={settings} />
    </div>
  );
}
