import React from "react";
import Link from "next/link";
import {
  getLearningPaths,
  getNavigationItems,
  getSiteSettings,
} from "@/lib/services/public-service";
import { PublicHeader } from "@/components/layout/PublicHeader";
import { PublicFooter } from "@/components/layout/PublicFooter";
import { Compass, ArrowRight, FolderGit2, CheckCircle2, Clock } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function LearningPathsIndexPage() {
  const [navItems, settings, learningPaths] = await Promise.all([
    getNavigationItems(),
    getSiteSettings(),
    getLearningPaths(),
  ]);

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <PublicHeader navItems={navItems.header} />

      <main className="flex-1">
        {/* Banner */}
        <section className="border-b border-border bg-[#ECE8DC]/50 py-12 md:py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cream-200 border border-border text-xs font-semibold text-navy">
              <Compass className="w-3.5 h-3.5 text-sage-600" />
              <span>Step-by-Step Roadmaps</span>
            </div>

            <h1 className="text-3xl sm:text-5xl font-extrabold text-navy tracking-tight">
              Structured Learning Paths
            </h1>

            <p className="text-base sm:text-lg text-muted-foreground max-w-2xl leading-relaxed">
              Skip the fragmented tutorials. Follow disciplined, progressive roadmaps designed to take you from foundational concepts to building real portfolio-grade software.
            </p>
          </div>
        </section>

        {/* Learning Paths List */}
        <section className="py-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {learningPaths.map((path) => (
              <div
                key={path.id}
                className="flex flex-col justify-between rounded-2xl border border-border bg-card p-6 sm:p-8 hover:border-navy/40 transition-all shadow-xs"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span className="text-xs font-bold uppercase tracking-wider text-sage-700 bg-sage-100 border border-sage-300 px-2.5 py-0.5 rounded-full">
                      {path.topic_name || "Engineering Path"}
                    </span>
                    <span className="text-xs font-semibold text-muted-foreground flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" />
                      <span>{path.steps?.length || 0} Ordered Steps</span>
                    </span>
                  </div>

                  <h2 className="text-2xl font-bold text-navy">
                    <Link href={`/paths/${path.slug}`} className="hover:underline">
                      {path.title}
                    </Link>
                  </h2>

                  <p className="text-sm text-muted-foreground mt-3 leading-relaxed">
                    {path.summary}
                  </p>

                  {/* Outcome */}
                  <div className="mt-5 p-4 rounded-xl bg-cream-50 border border-border space-y-1.5">
                    <span className="text-xs font-bold uppercase tracking-wider text-navy block">
                      Target Outcome
                    </span>
                    <p className="text-xs text-navy/80 leading-relaxed">
                      {path.outcome}
                    </p>
                  </div>

                  {/* Final Practice Project Preview */}
                  <div className="mt-4 p-4 rounded-xl bg-sage-50/70 border border-sage-200 flex items-start gap-3">
                    <FolderGit2 className="w-5 h-5 text-sage-700 mt-0.5 shrink-0" />
                    <div>
                      <h3 className="text-xs font-bold text-navy">
                        Capstone Practice Project: {path.final_task_title}
                      </h3>
                      <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
                        {path.final_task_description}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="mt-8 pt-5 border-t border-border flex items-center justify-between">
                  <span className="text-xs font-medium text-navy/60">
                    Self-paced curriculum
                  </span>
                  <Link
                    href={`/paths/${path.slug}`}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-navy text-white text-xs font-semibold hover:bg-navy-700 shadow-xs transition-all"
                  >
                    <span>Start Learning Path</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>

      <PublicFooter navItems={navItems.footer} settings={settings} />
    </div>
  );
}
