import React from "react";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import {
  getChapterDetails,
  getNavigationItems,
  getSiteSettings,
} from "@/lib/services/public-service";
import { getAdminSession } from "@/lib/auth";
import { PublicHeader } from "@/components/layout/PublicHeader";
import { PublicFooter } from "@/components/layout/PublicFooter";
import { Button } from "@/components/ui/button";
import {
  BookOpen,
  ArrowLeft,
  ArrowRight,
  ListTree,
  ChevronRight,
  CheckCircle2,
  Eye,
  FileCode,
} from "lucide-react";

export const dynamic = "force-dynamic";

interface ChapterPageProps {
  params: {
    slug: string;
    chapter: string;
  };
  searchParams: {
    preview?: string;
  };
}

export default async function ChapterReaderPage({
  params,
  searchParams,
}: ChapterPageProps) {
  const isPreviewRequested = searchParams.preview === "true";
  let isPreview = false;

  if (isPreviewRequested) {
    const admin = await getAdminSession();
    if (!admin) {
      redirect(
        `/admin/login?returnUrl=/resources/${params.slug}/${params.chapter}?preview=true`
      );
    }
    isPreview = true;
  }

  const [navItems, settings, data] = await Promise.all([
    getNavigationItems(),
    getSiteSettings(),
    getChapterDetails(params.slug, params.chapter, { preview: isPreview }),
  ]);

  if (!data.resource || !data.chapter) {
    notFound();
  }

  const { resource, chapter, chapters, previousChapter, nextChapter } = data;

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <PublicHeader navItems={navItems.header} />

      {isPreview && (
        <div className="bg-amber-100 border-b border-amber-300 py-2 px-4 text-center text-xs font-bold text-amber-900 flex items-center justify-center gap-2">
          <Eye className="w-4 h-4 text-amber-700" />
          <span>Editor Preview Mode: Viewing draft revision of this chapter.</span>
        </div>
      )}

      {/* Chapter Reader Sub-Header */}
      <div className="sticky top-16 z-30 border-b border-border/70 bg-[#F8F7F2]/90 backdrop-blur-md py-3 px-4 sm:px-8">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-xs truncate">
            <Link
              href={`/resources/${resource.slug}`}
              className="text-navy hover:underline flex items-center gap-1 font-semibold"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Resource</span>
            </Link>
            <span className="text-border">/</span>
            <span className="text-muted-foreground truncate hidden sm:inline">
              {resource.title}
            </span>
            <span className="text-border hidden sm:inline">/</span>
            <span className="text-navy font-bold truncate">
              {chapter.title}
            </span>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <span className="text-xs font-mono px-2.5 py-0.5 rounded-full bg-card border border-border/70 text-navy tnum shadow-2xs">
              Chapter {chapter.chapter_order} of {chapters.length}
            </span>
          </div>
        </div>
      </div>

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 lg:gap-12 items-start">
          {/* Left Table of Contents Sidebar */}
          <aside className="lg:col-span-1 space-y-4 lg:sticky lg:top-32 order-2 lg:order-1">
            <div className="rounded-2xl border border-border/80 bg-card p-5 shadow-xs">
              <div className="flex items-center gap-2 pb-3 mb-3 border-b border-border/70">
                <ListTree className="w-4 h-4 text-navy" />
                <h2 className="text-xs font-bold uppercase tracking-wider text-navy">
                  Table of Contents
                </h2>
              </div>

              <nav className="space-y-1" aria-label="Chapter Table of Contents">
                {chapters.map((ch, idx) => {
                  const isCurrent = ch.slug === chapter.slug;
                  return (
                    <Link
                      key={ch.id}
                      href={`/resources/${resource.slug}/${ch.slug}${isPreview ? "?preview=true" : ""}`}
                      className={`flex items-start gap-2.5 p-2 rounded-xl text-xs transition-all ${
                        isCurrent
                          ? "bg-navy text-white font-semibold shadow-xs"
                          : "text-navy/80 hover:bg-cream-100 hover:text-navy"
                      }`}
                    >
                      <span
                        className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 text-[10px] font-bold tnum ${
                          isCurrent
                            ? "bg-white/20 text-white"
                            : "bg-cream-200 text-navy"
                        }`}
                      >
                        {idx + 1}
                      </span>
                      <span className="leading-snug pt-0.5 line-clamp-2">
                        {ch.title}
                      </span>
                    </Link>
                  );
                })}
              </nav>
            </div>
          </aside>

          {/* Main Reading Surface */}
          <article className="lg:col-span-3 order-1 lg:order-2 space-y-8">
            <div className="bg-card rounded-2xl border border-border p-6 sm:p-10 lg:p-12 shadow-xs">
              {/* Chapter Title & Meta */}
              <header className="border-b border-border pb-6 mb-8">
                <span className="text-xs font-bold uppercase tracking-wider text-sage-700">
                  Chapter {chapter.chapter_order}
                </span>
                <h1 className="text-2xl sm:text-4xl font-extrabold text-navy tracking-tight mt-1">
                  {chapter.title}
                </h1>
              </header>

              {/* Rendered Markdown Body with Syntax Highlighting */}
              <div
                className="prose-reading"
                dangerouslySetInnerHTML={{ __html: chapter.rendered_html }}
              />
            </div>

            {/* Previous and Next Navigation Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-border">
              {previousChapter ? (
                <Link
                  href={`/resources/${resource.slug}/${previousChapter.slug}${isPreview ? "?preview=true" : ""}`}
                  className="w-full sm:w-auto inline-flex items-center gap-2 px-5 py-3 rounded-lg border border-border bg-card hover:bg-cream-200 text-navy text-xs font-semibold shadow-xs transition-all"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <div className="text-left">
                    <span className="block text-[10px] text-muted-foreground uppercase">
                      Previous Chapter
                    </span>
                    <span className="block font-bold truncate max-w-[200px]">
                      {previousChapter.title}
                    </span>
                  </div>
                </Link>
              ) : (
                <div />
              )}

              {nextChapter ? (
                <Link
                  href={`/resources/${resource.slug}/${nextChapter.slug}${isPreview ? "?preview=true" : ""}`}
                  className="w-full sm:w-auto inline-flex items-center justify-between sm:justify-start gap-2 px-5 py-3 rounded-lg bg-navy hover:bg-navy-700 text-white text-xs font-semibold shadow-xs transition-all"
                >
                  <div className="text-right">
                    <span className="block text-[10px] text-white/70 uppercase">
                      Next Chapter
                    </span>
                    <span className="block font-bold truncate max-w-[200px]">
                      {nextChapter.title}
                    </span>
                  </div>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              ) : (
                <Link
                  href={`/resources/${resource.slug}`}
                  className="inline-flex items-center gap-2 px-5 py-3 rounded-lg bg-sage-300 hover:bg-sage-400 text-navy font-bold text-xs shadow-xs"
                >
                  <span>Completed Guide! Back to Overview</span>
                  <CheckCircle2 className="w-4 h-4 text-emerald-800" />
                </Link>
              )}
            </div>
          </article>
        </div>
      </main>

      <PublicFooter navItems={navItems.footer} settings={settings} />
    </div>
  );
}
