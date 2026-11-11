import React from "react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getAdminSession } from "@/lib/auth";
import { getDashboardStats } from "@/lib/services/admin-service";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Bookmark,
  BookOpen,
  Compass,
  Layers,
  FolderOpen,
  PlusCircle,
  FileText,
  Home,
  Navigation,
  ArrowRight,
  Clock,
  Sparkles,
} from "lucide-react";

export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
  const session = await getAdminSession();
  if (!session) {
    redirect("/admin/login?returnUrl=/admin");
  }

  const stats = await getDashboardStats();

  return (
    <div className="p-6 sm:p-10 max-w-7xl w-full mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-navy tracking-tight">
            Editorial Dashboard
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Welcome back, {session.displayName}. Manage catalog resources, draft revisions, and live site publishing.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link href="/admin/resources/new">
            <Button className="font-semibold flex items-center gap-1.5 shadow-sm">
              <PlusCircle className="w-4 h-4" />
              <span>New Resource</span>
            </Button>
          </Link>
          <a
            href="/"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-md border border-border bg-card hover:bg-cream-200 text-xs font-semibold text-navy transition-colors"
          >
            <span>Live Site &rarr;</span>
          </a>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {/* Resources Stat */}
        <div className="p-6 rounded-2xl border border-border/80 bg-card shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Resources
            </span>
            <Bookmark className="w-4 h-4 text-navy/60" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-navy tnum">
              {stats.counts.publishedResources}
            </span>
            <span className="text-xs text-emerald-700 font-semibold">Published</span>
          </div>
          <div className="text-xs text-muted-foreground pt-1 border-t border-border/60 flex items-center justify-between">
            <span>Drafts / In-progress:</span>
            <span className="font-bold text-amber-700 tnum">{stats.counts.draftResources}</span>
          </div>
        </div>

        {/* Chapters Stat */}
        <div className="p-6 rounded-2xl border border-border/80 bg-card shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Book Chapters
            </span>
            <BookOpen className="w-4 h-4 text-navy/60" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-navy tnum">
              {stats.counts.publishedChapters}
            </span>
            <span className="text-xs text-emerald-700 font-semibold">Published</span>
          </div>
          <div className="text-xs text-muted-foreground pt-1 border-t border-border/60 flex items-center justify-between">
            <span>Draft chapters:</span>
            <span className="font-bold text-amber-700 tnum">{stats.counts.draftChapters}</span>
          </div>
        </div>

        {/* Learning Paths Stat */}
        <div className="p-6 rounded-2xl border border-border/80 bg-card shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Learning Paths
            </span>
            <Compass className="w-4 h-4 text-navy/60" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-navy tnum">
              {stats.counts.publishedPaths}
            </span>
            <span className="text-xs text-emerald-700 font-semibold">Live Paths</span>
          </div>
          <div className="text-xs text-muted-foreground pt-1 border-t border-border/60 flex items-center justify-between">
            <span>Draft roadmaps:</span>
            <span className="font-bold text-amber-700 tnum">{stats.counts.draftPaths}</span>
          </div>
        </div>

        {/* Topics & Media */}
        <div className="p-6 rounded-2xl border border-border/80 bg-card shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Taxonomy & Media
            </span>
            <Layers className="w-4 h-4 text-navy/60" />
          </div>
          <div className="flex items-baseline gap-3">
            <div>
              <span className="text-2xl font-extrabold text-navy tnum">
                {stats.counts.topicsCount}
              </span>
              <span className="text-xs text-muted-foreground ml-1">Topics</span>
            </div>
            <div>
              <span className="text-2xl font-extrabold text-navy tnum">
                {stats.counts.assetsCount}
              </span>
              <span className="text-xs text-muted-foreground ml-1">Assets</span>
            </div>
          </div>
          <div className="text-xs text-muted-foreground pt-1 border-t border-border/60 flex items-center justify-between">
            <span>All systems operational</span>
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
          </div>
        </div>
      </div>

      {/* Main Sections: Recent Edits & Shortcuts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Left 2 Cols: Recent Edits */}
        <div className="lg:col-span-2 rounded-2xl border border-border bg-card p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-border pb-4">
            <div>
              <h2 className="text-base font-bold text-navy flex items-center gap-2">
                <Clock className="w-4 h-4 text-sage-600" />
                <span>Recent Editorial Activity</span>
              </h2>
              <p className="text-xs text-muted-foreground mt-0.5">
                Latest modified resources, chapters, and paths.
              </p>
            </div>
            <Link
              href="/admin/resources"
              className="text-xs font-semibold text-navy hover:underline"
            >
              View catalog &rarr;
            </Link>
          </div>

          <div className="divide-y divide-border">
            {stats.recentEdits.length > 0 ? (
              stats.recentEdits.map((item) => (
                <div
                  key={item.id}
                  className="py-3 flex items-center justify-between gap-4"
                >
                  <div className="space-y-0.5 truncate">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-mono uppercase px-1.5 py-0.5 rounded bg-cream-200 text-navy font-semibold">
                        {item.type}
                      </span>
                      <h4 className="text-xs font-bold text-navy truncate">
                        {item.title}
                      </h4>
                    </div>
                    <p className="text-[11px] text-muted-foreground">
                      Updated {new Date(item.updated_at).toLocaleString()}
                    </p>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {item.has_draft_changes && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-100 text-amber-900 border border-amber-300">
                        Draft Changes
                      </span>
                    )}
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded border capitalize ${
                        item.status === "published"
                          ? "bg-emerald-50 text-emerald-800 border-emerald-300"
                          : "bg-gray-100 text-gray-800 border-gray-300"
                      }`}
                    >
                      {item.status}
                    </span>
                    <Link
                      href={
                        item.type === "resource"
                          ? `/admin/resources/${item.id}`
                          : `/admin/paths/${item.id}`
                      }
                      className="text-xs font-bold text-navy hover:underline ml-1"
                    >
                      Edit &rarr;
                    </Link>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-xs text-muted-foreground py-4">
                No recent activity recorded.
              </p>
            )}
          </div>
        </div>

        {/* Right Col: Shortcuts to Content Sections */}
        <div className="rounded-2xl border border-border bg-card p-6 shadow-xs space-y-4">
          <h2 className="text-base font-bold text-navy border-b border-border pb-3">
            Editorial Shortcuts
          </h2>

          <div className="grid grid-cols-1 gap-2.5">
            <Link
              href="/admin/topics"
              className="flex items-center justify-between p-3 rounded-xl border border-border hover:bg-cream-100 transition-colors group"
            >
              <div className="flex items-center gap-2.5">
                <Layers className="w-4 h-4 text-navy/70 group-hover:text-navy" />
                <span className="text-xs font-semibold text-navy">Manage Topics</span>
              </div>
              <ArrowRight className="w-3.5 h-3.5 text-navy/40 group-hover:text-navy group-hover:translate-x-0.5 transition-all" />
            </Link>

            <Link
              href="/admin/resources"
              className="flex items-center justify-between p-3 rounded-xl border border-border hover:bg-cream-100 transition-colors group"
            >
              <div className="flex items-center gap-2.5">
                <Bookmark className="w-4 h-4 text-navy/70 group-hover:text-navy" />
                <span className="text-xs font-semibold text-navy">Manage Catalog Resources</span>
              </div>
              <ArrowRight className="w-3.5 h-3.5 text-navy/40 group-hover:text-navy group-hover:translate-x-0.5 transition-all" />
            </Link>

            <Link
              href="/admin/chapters"
              className="flex items-center justify-between p-3 rounded-xl border border-border hover:bg-cream-100 transition-colors group"
            >
              <div className="flex items-center gap-2.5">
                <BookOpen className="w-4 h-4 text-navy/70 group-hover:text-navy" />
                <span className="text-xs font-semibold text-navy">Books & Chapters</span>
              </div>
              <ArrowRight className="w-3.5 h-3.5 text-navy/40 group-hover:text-navy group-hover:translate-x-0.5 transition-all" />
            </Link>

            <Link
              href="/admin/paths"
              className="flex items-center justify-between p-3 rounded-xl border border-border hover:bg-cream-100 transition-colors group"
            >
              <div className="flex items-center gap-2.5">
                <Compass className="w-4 h-4 text-navy/70 group-hover:text-navy" />
                <span className="text-xs font-semibold text-navy">Learning Path Roadmaps</span>
              </div>
              <ArrowRight className="w-3.5 h-3.5 text-navy/40 group-hover:text-navy group-hover:translate-x-0.5 transition-all" />
            </Link>

            <Link
              href="/admin/explore"
              className="flex items-center justify-between p-3 rounded-xl border border-border hover:bg-cream-100 transition-colors group"
            >
              <div className="flex items-center gap-2.5">
                <Home className="w-4 h-4 text-navy/70 group-hover:text-navy" />
                <span className="text-xs font-semibold text-navy">Explore Homepage Copy</span>
              </div>
              <ArrowRight className="w-3.5 h-3.5 text-navy/40 group-hover:text-navy group-hover:translate-x-0.5 transition-all" />
            </Link>

            <Link
              href="/admin/about"
              className="flex items-center justify-between p-3 rounded-xl border border-border hover:bg-cream-100 transition-colors group"
            >
              <div className="flex items-center gap-2.5">
                <FileText className="w-4 h-4 text-navy/70 group-hover:text-navy" />
                <span className="text-xs font-semibold text-navy">About Page Editorial</span>
              </div>
              <ArrowRight className="w-3.5 h-3.5 text-navy/40 group-hover:text-navy group-hover:translate-x-0.5 transition-all" />
            </Link>

            <Link
              href="/admin/navigation"
              className="flex items-center justify-between p-3 rounded-xl border border-border hover:bg-cream-100 transition-colors group"
            >
              <div className="flex items-center gap-2.5">
                <Navigation className="w-4 h-4 text-navy/70 group-hover:text-navy" />
                <span className="text-xs font-semibold text-navy">Navigation & Footer Links</span>
              </div>
              <ArrowRight className="w-3.5 h-3.5 text-navy/40 group-hover:text-navy group-hover:translate-x-0.5 transition-all" />
            </Link>

            <Link
              href="/admin/assets"
              className="flex items-center justify-between p-3 rounded-xl border border-border hover:bg-cream-100 transition-colors group"
            >
              <div className="flex items-center gap-2.5">
                <FolderOpen className="w-4 h-4 text-navy/70 group-hover:text-navy" />
                <span className="text-xs font-semibold text-navy">Media & Downloads</span>
              </div>
              <ArrowRight className="w-3.5 h-3.5 text-navy/40 group-hover:text-navy group-hover:translate-x-0.5 transition-all" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
