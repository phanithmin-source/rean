import React from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  getTopicBySlug,
  getNavigationItems,
  getSiteSettings,
} from "@/lib/services/public-service";
import { PublicHeader } from "@/components/layout/PublicHeader";
import { PublicFooter } from "@/components/layout/PublicFooter";
import { ResourceCard } from "@/components/public/ResourceCard";
import {
  Code2,
  Layout,
  Server,
  Database,
  Wrench,
  Compass,
  ArrowRight,
  BookOpen,
  FolderGit2,
} from "lucide-react";

export const dynamic = "force-dynamic";

interface TopicPageProps {
  params: {
    slug: string;
  };
}

export default async function TopicPage({ params }: TopicPageProps) {
  const [navItems, settings, topicData] = await Promise.all([
    getNavigationItems(),
    getSiteSettings(),
    getTopicBySlug(params.slug),
  ]);

  if (!topicData.topic) {
    notFound();
  }

  const { topic, resources, learningPaths } = topicData;

  const getTopicIcon = (iconName: string) => {
    switch (iconName) {
      case "Code2":
        return <Code2 className="w-8 h-8 text-sage-600" />;
      case "Layout":
        return <Layout className="w-8 h-8 text-cyan-600" />;
      case "Server":
        return <Server className="w-8 h-8 text-navy-400" />;
      case "Database":
        return <Database className="w-8 h-8 text-amber-600" />;
      case "Wrench":
        return <Wrench className="w-8 h-8 text-emerald-600" />;
      default:
        return <Code2 className="w-8 h-8 text-navy" />;
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <PublicHeader navItems={navItems.header} />

      <main className="flex-1">
        {/* Topic Header Banner */}
        <section className="border-b border-border/70 bg-gradient-to-b from-[#F2EFE6]/50 via-[#F8F7F2] to-[#F8F7F2] py-12 md:py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center gap-2 text-xs font-semibold text-navy/70 mb-4">
              <Link href="/" className="hover:underline">
                Explore
              </Link>
              <span className="text-border">/</span>
              <span>Topics</span>
              <span className="text-border">/</span>
              <span className="text-navy font-bold">{topic.name}</span>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center gap-5">
              <div className="p-4 rounded-2xl bg-card border border-border/80 shadow-xs w-fit">
                {getTopicIcon(topic.icon)}
              </div>
              <div className="space-y-1.5">
                <h1 className="text-3xl sm:text-4xl font-extrabold text-navy tracking-tight">
                  {topic.name}
                </h1>
                <p className="text-base text-muted-foreground max-w-3xl leading-relaxed">
                  {topic.description}
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Learning Paths in this Topic (if any) */}
        {learningPaths.length > 0 && (
          <section className="py-10 border-b border-border bg-card/60">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex items-center gap-2 mb-4">
                <Compass className="w-4 h-4 text-sage-600" />
                <h2 className="text-xl font-bold text-navy">
                  Structured Learning Paths in {topic.name}
                </h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {learningPaths.map((lp) => (
                  <div
                    key={lp.id}
                    className="p-6 rounded-xl border border-border bg-cream-50 flex flex-col justify-between"
                  >
                    <div>
                      <h3 className="text-lg font-bold text-navy">
                        <Link href={`/paths/${lp.slug}`} className="hover:underline">
                          {lp.title}
                        </Link>
                      </h3>
                      <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
                        {lp.summary}
                      </p>
                    </div>

                    <div className="mt-4 pt-3 border-t border-border flex items-center justify-between">
                      <span className="text-xs font-semibold text-sage-700">
                        Goal: {lp.final_task_title}
                      </span>
                      <Link
                        href={`/paths/${lp.slug}`}
                        className="inline-flex items-center gap-1 text-xs font-bold text-navy hover:underline"
                      >
                        <span>Follow Roadmap</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Resources in this Topic */}
        <section className="py-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl font-bold text-navy">
                Published Resources
              </h2>
              <p className="text-sm text-muted-foreground mt-0.5">
                {resources.length}{" "}
                {resources.length === 1 ? "resource" : "resources"} available in{" "}
                {topic.name}
              </p>
            </div>

            <Link
              href="/#catalog"
              className="text-xs font-semibold text-navy hover:underline inline-flex items-center gap-1"
            >
              <span>Back to full catalog</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {resources.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {resources.map((res) => (
                <ResourceCard key={res.id} resource={res} />
              ))}
            </div>
          ) : (
            <div className="text-center py-16 px-4 rounded-xl border-2 border-dashed border-border bg-card max-w-md mx-auto space-y-3">
              <BookOpen className="w-8 h-8 text-navy/40 mx-auto" />
              <h3 className="text-base font-bold text-navy">
                No resources in this topic yet
              </h3>
              <p className="text-xs text-muted-foreground">
                Our editorial team is preparing resources for this topic. Check back soon or explore other topics.
              </p>
              <Link
                href="/#catalog"
                className="inline-block mt-2 text-xs font-semibold px-3 py-1.5 rounded-md bg-navy text-white"
              >
                Browse All Resources
              </Link>
            </div>
          )}
        </section>
      </main>

      <PublicFooter navItems={navItems.footer} settings={settings} />
    </div>
  );
}
