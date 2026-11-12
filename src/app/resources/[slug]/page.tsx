import React from "react";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import {
  getResourceBySlug,
  getNavigationItems,
  getSiteSettings,
} from "@/lib/services/public-service";
import { getAdminSession } from "@/lib/auth";
import { renderMarkdown } from "@/lib/markdown";
import { PublicHeader } from "@/components/layout/PublicHeader";
import { PublicFooter } from "@/components/layout/PublicFooter";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  BookOpen,
  Download,
  ExternalLink,
  ChevronRight,
  FileCode,
  FileText,
  Compass,
  Wrench,
  FolderGit2,
  Calendar,
  Layers,
  ArrowLeft,
  Eye,
  CheckCircle,
} from "lucide-react";

export const dynamic = "force-dynamic";

interface ResourcePageProps {
  params: {
    slug: string;
  };
  searchParams: {
    preview?: string;
  };
}

export default async function ResourceDetailsPage({
  params,
  searchParams,
}: ResourcePageProps) {
  const isPreviewRequested = searchParams.preview === "true";
  let isPreview = false;

  if (isPreviewRequested) {
    const admin = await getAdminSession();
    if (!admin) {
      redirect(`/admin/login?returnUrl=/resources/${params.slug}?preview=true`);
    }
    isPreview = true;
  }

  const [navItems, settings, resourceData] = await Promise.all([
    getNavigationItems(),
    getSiteSettings(),
    getResourceBySlug(params.slug, { preview: isPreview }),
  ]);

  if (!resourceData.resource) {
    notFound();
  }

  const { resource, chapters } = resourceData;
  const descriptionHtml = renderMarkdown(resource.description_markdown);

  const firstChapter = chapters.length > 0 ? chapters[0] : null;

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <PublicHeader navItems={navItems.header} />

      {isPreview && (
        <div className="bg-amber-100 border-b border-amber-300 py-2 px-4 text-center text-xs font-bold text-amber-900 flex items-center justify-center gap-2">
          <Eye className="w-4 h-4 text-amber-700" />
          <span>Editor Preview Mode: Viewing draft revision of this resource.</span>
          <Link
            href={`/admin/resources/${resource.id}`}
            className="underline ml-2 hover:text-amber-950"
          >
            Edit in Admin
          </Link>
        </div>
      )}

      <main className="flex-1">
        {/* Resource Header */}
        <div className="border-b border-border/70 page-banner py-10 md:py-14">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {/* Breadcrumb */}
            <div className="flex items-center gap-2 text-xs font-medium text-navy/60 mb-6">
              <Link href="/" className="hover:underline">
                Explore
              </Link>
              <span className="text-border">/</span>
              {resource.topic_slug && (
                <>
                  <Link
                    href={`/topics/${resource.topic_slug}`}
                    className="hover:underline capitalize"
                  >
                    {resource.topic_name}
                  </Link>
                  <span className="text-border">/</span>
                </>
              )}
              <span className="text-navy font-semibold truncate max-w-xs">
                {resource.title}
              </span>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
              {/* Left 2 Cols: Main Info */}
              <div className="lg:col-span-2 space-y-4">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant="sage" className="capitalize rounded-full px-3 py-0.5 font-semibold text-xs">
                    {resource.type}
                  </Badge>
                  <span className="text-xs font-semibold px-3 py-0.5 rounded-full bg-cream-100 border border-border/70 text-navy capitalize">
                    {resource.difficulty} Level
                  </span>
                  {resource.topic_name && (
                    <span className="text-xs font-semibold px-3 py-0.5 rounded-full bg-card text-navy/70 border border-border/70">
                      {resource.topic_name}
                    </span>
                  )}
                </div>

                <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-navy tracking-tight leading-tight">
                  {resource.title}
                </h1>

                <p className="text-base sm:text-lg text-muted-foreground leading-relaxed">
                  {resource.summary}
                </p>

                {/* Tags */}
                {resource.tags && resource.tags.length > 0 && (
                  <div className="pt-2 flex flex-wrap items-center gap-1.5">
                    {resource.tags.map((tag) => (
                      <span
                        key={tag}
                        className="text-xs font-mono px-2.5 py-1 rounded-md bg-card border border-border/80 text-navy/80"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Right Col: Action Card */}
              <div className="bg-card rounded-2xl border border-border/80 p-6 shadow-xs space-y-4">
                <h2 className="text-xs font-bold uppercase tracking-wider text-navy/60">
                  Resource Actions
                </h2>

                <div className="space-y-2.5">
                  {/* Read Online action if chapters exist */}
                  {firstChapter && (
                    <Link
                      href={`/resources/${resource.slug}/${firstChapter.slug}${isPreview ? "?preview=true" : ""}`}
                      className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-primary text-white text-sm font-semibold hover:bg-sage-700 shadow-xs hover:shadow-sm hover:-translate-y-0.5 transition-all"
                    >
                      <BookOpen className="w-4 h-4" />
                      <span>Read Online ({chapters.length} Chapters)</span>
                    </Link>
                  )}

                  {/* Download Action: ONLY show when physical asset exists */}
                  {resource.download_asset && (
                    <a
                      href={resource.download_asset.public_url}
                      download
                      className="w-full flex items-center justify-between py-2.5 px-4 rounded-xl bg-cream-100 hover:bg-cream-200 text-navy border border-border/80 text-sm font-semibold transition-all shadow-xs"
                    >
                      <div className="flex items-center gap-2">
                        <Download className="w-4 h-4 text-navy" />
                        <span className="truncate max-w-[170px]">
                          {resource.download_asset.original_name}
                        </span>
                      </div>
                      <span className="text-[11px] text-navy/60 font-mono tnum">
                        {(resource.download_asset.byte_size / 1024).toFixed(0)} KB
                      </span>
                    </a>
                  )}

                  {/* View external source or repository if provided */}
                  {resource.source_url && (
                    <a
                      href={resource.source_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-card hover:bg-cream-100/60 text-navy border border-border/80 text-sm font-medium transition-all shadow-xs"
                    >
                      <ExternalLink className="w-4 h-4 text-navy/60" />
                      <span>Original Source / Documentation</span>
                    </a>
                  )}
                </div>

                {resource.curation_note && (
                  <div className="pt-3 border-t border-border/80">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-sage-700 block mb-1">
                      Editorial Curation Note
                    </span>
                    <p className="text-xs text-muted-foreground leading-relaxed italic">
                      &ldquo;{resource.curation_note}&rdquo;
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Resource Body & Chapter Index */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            {/* Main Content Area */}
            <div className="lg:col-span-2 space-y-10">
              {/* Detailed Markdown Content */}
              <section className="bg-card rounded-2xl border border-border p-6 sm:p-8 shadow-xs">
                <div
                  className="prose-reading"
                  dangerouslySetInnerHTML={{ __html: descriptionHtml }}
                />
              </section>

              {/* Chapter Table of Contents (if chapters exist) */}
              {chapters.length > 0 && (
                <section className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-xl font-bold text-navy">
                        Interactive Chapter Index
                      </h2>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        Read online with syntax-highlighted code and sequential progression.
                      </p>
                    </div>
                  </div>

                  <div className="divide-y divide-border rounded-xl border border-border bg-card overflow-hidden">
                    {chapters.map((ch, index) => (
                      <Link
                        key={ch.id}
                        href={`/resources/${resource.slug}/${ch.slug}${isPreview ? "?preview=true" : ""}`}
                        className="flex items-center justify-between p-4 hover:bg-cream-100 transition-colors group"
                      >
                        <div className="flex items-center gap-3">
                          <span className="w-7 h-7 rounded-full bg-cream-200 border border-border text-navy font-bold text-xs flex items-center justify-center shrink-0">
                            {index + 1}
                          </span>
                          <div>
                            <h3 className="text-sm font-bold text-navy group-hover:text-navy-900 group-hover:underline">
                              {ch.title}
                            </h3>
                            <span className="text-xs text-muted-foreground font-mono">
                              Slug: {ch.slug}
                            </span>
                          </div>
                        </div>

                        <ChevronRight className="w-4 h-4 text-navy/40 group-hover:text-navy group-hover:translate-x-1 transition-all" />
                      </Link>
                    ))}
                  </div>
                </section>
              )}
            </div>

            {/* Sidebar Meta Info */}
            <aside className="space-y-6">
              <div className="rounded-xl border border-border bg-card p-6 space-y-4">
                <h3 className="text-sm font-bold text-navy border-b border-border pb-3">
                  Resource Overview
                </h3>

                <dl className="space-y-3 text-xs">
                  <div>
                    <dt className="text-muted-foreground">Category Domain</dt>
                    <dd className="font-semibold text-navy mt-0.5 capitalize">
                      {resource.topic_name || "General"}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-muted-foreground">Difficulty Level</dt>
                    <dd className="font-semibold text-navy mt-0.5 capitalize">
                      {resource.difficulty}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-muted-foreground">Content Format</dt>
                    <dd className="font-semibold text-navy mt-0.5 capitalize">
                      {resource.type}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-muted-foreground">Publishing Status</dt>
                    <dd className="font-semibold text-emerald-700 mt-0.5 flex items-center gap-1">
                      <CheckCircle className="w-3.5 h-3.5" />
                      <span>Verified & Published</span>
                    </dd>
                  </div>
                </dl>
              </div>

              {/* Related Navigation */}
              <div className="rounded-xl border border-border bg-cream-50 p-6 space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-navy">
                  Discover More
                </h4>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Looking for more? Browse related categories or search the resource directory.
                </p>
                <div className="pt-2 flex flex-col gap-2">
                  <Link
                    href="/topics"
                    className="text-xs font-semibold text-navy hover:underline flex items-center gap-1.5"
                  >
                    <Compass className="w-3.5 h-3.5 text-sage-600" />
                    <span>Browse All Categories</span>
                  </Link>
                  <Link
                    href="/#catalog"
                    className="text-xs font-semibold text-navy hover:underline flex items-center gap-1.5"
                  >
                    <BookOpen className="w-3.5 h-3.5 text-navy" />
                    <span>Browse Full Catalog</span>
                  </Link>
                </div>
              </div>
            </aside>
          </div>
        </div>
      </main>

      <PublicFooter navItems={navItems.footer} settings={settings} />
    </div>
  );
}
