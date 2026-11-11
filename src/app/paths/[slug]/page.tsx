import React from "react";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import {
  getLearningPathBySlug,
  getNavigationItems,
  getSiteSettings,
} from "@/lib/services/public-service";
import { getAdminSession } from "@/lib/auth";
import { PublicHeader } from "@/components/layout/PublicHeader";
import { PublicFooter } from "@/components/layout/PublicFooter";
import { Badge } from "@/components/ui/badge";
import {
  Compass,
  ArrowLeft,
  ArrowRight,
  Clock,
  BookOpen,
  CheckCircle2,
  FolderGit2,
  ExternalLink,
  Eye,
  ListChecks,
} from "lucide-react";

export const dynamic = "force-dynamic";

interface PathDetailsProps {
  params: {
    slug: string;
  };
  searchParams: {
    preview?: string;
  };
}

export default async function PathDetailsPage({
  params,
  searchParams,
}: PathDetailsProps) {
  const isPreviewRequested = searchParams.preview === "true";
  let isPreview = false;

  if (isPreviewRequested) {
    const admin = await getAdminSession();
    if (!admin) {
      redirect(`/admin/login?returnUrl=/paths/${params.slug}?preview=true`);
    }
    isPreview = true;
  }

  const [navItems, settings, path] = await Promise.all([
    getNavigationItems(),
    getSiteSettings(),
    getLearningPathBySlug(params.slug, { preview: isPreview }),
  ]);

  if (!path) {
    notFound();
  }

  const totalMinutes =
    path.steps?.reduce((acc, s) => acc + (s.estimated_minutes || 0), 0) || 0;

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <PublicHeader navItems={navItems.header} />

      {isPreview && (
        <div className="bg-amber-100 border-b border-amber-300 py-2 px-4 text-center text-xs font-bold text-amber-900 flex items-center justify-center gap-2">
          <Eye className="w-4 h-4 text-amber-700" />
          <span>Editor Preview Mode: Viewing draft revision of this learning path.</span>
        </div>
      )}

      <main className="flex-1">
        {/* Path Header */}
        <div className="border-b border-border bg-[#ECE8DC]/50 py-12 md:py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center gap-2 text-xs font-medium text-navy/60 mb-6">
              <Link href="/" className="hover:underline">
                Explore
              </Link>
              <span>/</span>
              <Link href="/paths" className="hover:underline">
                Learning Paths
              </Link>
              <span>/</span>
              <span className="text-navy font-semibold">{path.title}</span>
            </div>

            <div className="max-w-3xl space-y-4">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-sage-800 bg-sage-200 border border-sage-300 px-2.5 py-0.5 rounded-full">
                  {path.topic_name || "Engineering Path"}
                </span>
                <span className="text-xs font-semibold px-2 py-0.5 rounded bg-cream-200 border border-border text-navy flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  <span>~{Math.round(totalMinutes / 60)} hrs total study</span>
                </span>
              </div>

              <h1 className="text-3xl sm:text-5xl font-extrabold text-navy tracking-tight">
                {path.title}
              </h1>

              <p className="text-base sm:text-lg text-muted-foreground leading-relaxed">
                {path.summary}
              </p>
            </div>
          </div>
        </div>

        {/* Overview: Outcome & Prerequisites */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Target Outcome */}
            <div className="p-6 rounded-2xl border border-border bg-card shadow-xs space-y-3">
              <div className="flex items-center gap-2 text-navy">
                <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                <h2 className="text-sm font-bold uppercase tracking-wider">
                  Target Outcome
                </h2>
              </div>
              <p className="text-sm text-navy/90 leading-relaxed">
                {path.outcome}
              </p>
            </div>

            {/* Prerequisites */}
            <div className="p-6 rounded-2xl border border-border bg-card shadow-xs space-y-3">
              <div className="flex items-center gap-2 text-navy">
                <ListChecks className="w-5 h-5 text-sage-600" />
                <h2 className="text-sm font-bold uppercase tracking-wider">
                  Prerequisites
                </h2>
              </div>
              <ul className="space-y-1.5 text-sm text-navy/90">
                {path.prerequisites && path.prerequisites.length > 0 ? (
                  path.prerequisites.map((pre, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="text-sage-600 font-bold">•</span>
                      <span>{pre}</span>
                    </li>
                  ))
                ) : (
                  <li className="text-muted-foreground text-xs">
                    No strict prerequisites. Suitable for enthusiastic beginners.
                  </li>
                )}
              </ul>
            </div>
          </div>
        </div>

        {/* Ordered Learning Steps */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-navy">
              Ordered Learning Progression
            </h2>
            <p className="text-sm text-muted-foreground mt-1">
              Complete each step sequentially before tackling the capstone practice task.
            </p>
          </div>

          <div className="space-y-6">
            {path.steps && path.steps.length > 0 ? (
              path.steps.map((step, index) => (
                <div
                  key={step.id}
                  className="rounded-2xl border border-border bg-card p-6 shadow-xs hover:border-navy/30 transition-all flex flex-col md:flex-row items-start md:items-center justify-between gap-6"
                >
                  <div className="flex items-start gap-4">
                    <span className="w-10 h-10 rounded-full bg-cream-200 border border-border text-navy font-bold text-sm flex items-center justify-center shrink-0 mt-0.5">
                      {step.step_order}
                    </span>
                    <div className="space-y-1 max-w-2xl">
                      <div className="flex items-center gap-2">
                        <span className="text-[11px] font-semibold text-muted-foreground font-mono">
                          Step {step.step_order}
                        </span>
                        <span className="text-[11px] text-navy/50">•</span>
                        <span className="text-[11px] font-semibold text-sage-700">
                          {step.estimated_minutes} mins
                        </span>
                      </div>
                      <h3 className="text-lg font-bold text-navy">
                        {step.title}
                      </h3>
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        {step.description}
                      </p>
                    </div>
                  </div>

                  <div className="w-full md:w-auto shrink-0 flex items-center gap-2">
                    {step.resource_slug ? (
                      <Link
                        href={`/resources/${step.resource_slug}`}
                        className="w-full md:w-auto inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-navy hover:bg-navy-700 text-white text-xs font-semibold transition-all shadow-xs"
                      >
                        <BookOpen className="w-3.5 h-3.5" />
                        <span>Study Resource</span>
                      </Link>
                    ) : step.external_url ? (
                      <a
                        href={step.external_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-full md:w-auto inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg border border-border bg-cream-200 hover:bg-cream-300 text-navy text-xs font-semibold transition-all"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                        <span>External Link</span>
                      </a>
                    ) : null}
                  </div>
                </div>
              ))
            ) : (
              <p className="text-sm text-muted-foreground">No steps configured yet.</p>
            )}
          </div>
        </section>

        {/* Final Practice Project Task */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="rounded-2xl border-2 border-sage-300 bg-gradient-to-br from-cream-50 to-sage-50/50 p-6 sm:p-10 shadow-xs">
            <div className="flex items-center gap-2 text-sage-800 text-xs font-bold uppercase tracking-wider mb-2">
              <FolderGit2 className="w-4 h-4 text-sage-700" />
              <span>Capstone Practice Task</span>
            </div>

            <h2 className="text-2xl sm:text-3xl font-extrabold text-navy">
              {path.final_task_title}
            </h2>

            <p className="text-sm sm:text-base text-navy/80 mt-3 leading-relaxed max-w-3xl">
              {path.final_task_description}
            </p>

            <div className="mt-6 pt-6 border-t border-sage-200/80 flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-2 text-xs font-semibold text-navy/70">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Publish your source code on GitHub to demonstrate competence</span>
              </div>

              <Link
                href="/#catalog"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-navy text-white text-xs font-semibold hover:bg-navy-700 transition-all shadow-xs"
              >
                <span>Find Related Tools & Books</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </section>
      </main>

      <PublicFooter navItems={navItems.footer} settings={settings} />
    </div>
  );
}
