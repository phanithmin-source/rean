"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Bookmark,
  PlusCircle,
  Edit2,
  Trash2,
  Eye,
  Check,
  AlertCircle,
  ExternalLink,
  BookOpen,
  ArrowUpRight,
  Filter,
} from "lucide-react";

interface AdminResource {
  id: string;
  slug: string;
  title: string;
  draft_title?: string;
  summary: string;
  type: string;
  difficulty: string;
  topic_name: string;
  status: string;
  has_draft_changes: boolean;
  chapter_count: string | number;
  updated_at: string;
}

export default function AdminResourcesPage() {
  const [resources, setResources] = useState<AdminResource[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<"all" | "published" | "draft">("all");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const fetchResources = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/admin/resources");
      if (!res.ok) throw new Error("Failed to load resources");
      const data = await res.json();
      setResources(data.resources || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchResources();
  }, []);

  const handlePublish = async (id: string, title: string) => {
    setError(null);
    setSuccess(null);
    try {
      const res = await fetch(`/api/admin/resources/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "publish" }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to publish resource");
      setSuccess(`"${title}" published successfully! Public catalog updated.`);
      await fetchResources();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleUnpublish = async (id: string, title: string) => {
    setError(null);
    setSuccess(null);
    try {
      const res = await fetch(`/api/admin/resources/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "unpublish" }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to unpublish resource");
      setSuccess(`"${title}" unpublished and switched to draft.`);
      await fetchResources();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`Are you sure you want to delete resource "${title}"?`)) return;
    setError(null);
    setSuccess(null);
    try {
      const res = await fetch(`/api/admin/resources/${id}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to delete resource");
      setSuccess(`"${title}" deleted successfully.`);
      await fetchResources();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const filteredResources = resources.filter((r) => {
    if (filterStatus === "published") return r.status === "published";
    if (filterStatus === "draft") return r.status !== "published" || r.has_draft_changes;
    return true;
  });

  return (
    <div className="p-6 sm:p-10 max-w-7xl w-full mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-navy tracking-tight flex items-center gap-2.5">
            <Bookmark className="w-7 h-7 text-sage-600" />
            <span>Catalog Resources</span>
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Create, edit, privately preview, and publish books, guides, tools, and courses.
          </p>
        </div>

        <Link href="/admin/resources/new">
          <Button className="font-semibold flex items-center gap-1.5 shadow-sm">
            <PlusCircle className="w-4 h-4" />
            <span>Create New Resource</span>
          </Button>
        </Link>
      </div>

      {/* Alerts */}
      {error && (
        <div className="p-4 rounded-xl bg-destructive/10 border border-destructive/30 flex items-start gap-3 text-destructive text-sm font-semibold">
          <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <p className="font-bold">Publishing Rule Blocked</p>
            <p className="text-xs font-normal leading-relaxed">{error}</p>
          </div>
        </div>
      )}

      {success && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-300 flex items-center gap-2 text-emerald-800 text-sm font-semibold">
          <Check className="w-5 h-5 text-emerald-600 shrink-0" />
          <span>{success}</span>
        </div>
      )}

      {/* Filter Tabs */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => setFilterStatus("all")}
          className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-colors border ${
            filterStatus === "all"
              ? "bg-primary text-white border-navy"
              : "bg-card text-navy border-border hover:bg-cream-200"
          }`}
        >
          All Resources ({resources.length})
        </button>
        <button
          onClick={() => setFilterStatus("published")}
          className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-colors border ${
            filterStatus === "published"
              ? "bg-primary text-white border-navy"
              : "bg-card text-navy border-border hover:bg-cream-200"
          }`}
        >
          Live Published ({resources.filter((r) => r.status === "published").length})
        </button>
        <button
          onClick={() => setFilterStatus("draft")}
          className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-colors border ${
            filterStatus === "draft"
              ? "bg-primary text-white border-navy"
              : "bg-card text-navy border-border hover:bg-cream-200"
          }`}
        >
          Drafts & Pending Edits ({resources.filter((r) => r.status !== "published" || r.has_draft_changes).length})
        </button>
      </div>

      {/* Resources Table */}
      <div className="rounded-2xl border border-border bg-card shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-border bg-cream-100/70 text-[11px] font-bold uppercase tracking-wider text-navy/70">
                <th className="py-3.5 px-4">Title & Slug</th>
                <th className="py-3.5 px-4">Topic</th>
                <th className="py-3.5 px-4">Format</th>
                <th className="py-3.5 px-4">Level</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border text-xs">
              {loading ? (
                <tr>
                  <td colSpan={6} className="text-center py-10 text-muted-foreground">
                    Loading catalog resources...
                  </td>
                </tr>
              ) : filteredResources.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-10 text-muted-foreground">
                    No resources match this filter.
                  </td>
                </tr>
              ) : (
                filteredResources.map((res) => (
                  <tr key={res.id} className="hover:bg-cream-50/80 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-navy text-sm flex items-center gap-2">
                        <span>{res.draft_title || res.title}</span>
                        {res.has_draft_changes && (
                          <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-amber-100 text-amber-900 border border-amber-300">
                            Unpublished Draft
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] text-muted-foreground font-mono mt-0.5">
                        /resources/{res.slug}
                      </div>
                      {parseInt(String(res.chapter_count), 10) > 0 && (
                        <div className="mt-1 flex items-center gap-1 text-[11px] text-sage-700 font-semibold">
                          <BookOpen className="w-3 h-3" />
                          <span>{res.chapter_count} chapters</span>
                        </div>
                      )}
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-navy">
                      {res.topic_name}
                    </td>
                    <td className="py-3.5 px-4 capitalize font-medium text-navy/80">
                      {res.type}
                    </td>
                    <td className="py-3.5 px-4 capitalize">
                      <span className="px-2 py-0.5 rounded bg-cream-200 border border-border font-semibold text-navy text-[11px]">
                        {res.difficulty}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`inline-block px-2 py-0.5 rounded text-[11px] font-bold border capitalize ${
                          res.status === "published"
                            ? "bg-emerald-50 text-emerald-800 border-emerald-300"
                            : "bg-gray-100 text-gray-800 border-gray-300"
                        }`}
                      >
                        {res.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {/* Private Preview Link */}
                        <a
                          href={`/resources/${res.slug}?preview=true`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded border border-border bg-card hover:bg-cream-200 text-navy font-semibold"
                          title="Private Preview Draft"
                        >
                          <Eye className="w-3 h-3 text-navy/70" />
                          <span>Preview</span>
                        </a>

                        {/* Edit Button */}
                        <Link href={`/admin/resources/${res.id}`}>
                          <Button size="sm" variant="outline" className="h-7 px-2.5 text-xs font-semibold">
                            <Edit2 className="w-3 h-3 mr-1" />
                            <span>Edit</span>
                          </Button>
                        </Link>

                        {/* Publish / Unpublish Toggle */}
                        {res.status === "published" && !res.has_draft_changes ? (
                          <Button
                            size="sm"
                            variant="secondary"
                            onClick={() => handleUnpublish(res.id, res.title)}
                            className="h-7 px-2 text-xs font-semibold"
                          >
                            Unpublish
                          </Button>
                        ) : (
                          <Button
                            size="sm"
                            variant="sage"
                            onClick={() => handlePublish(res.id, res.title)}
                            className="h-7 px-2.5 text-xs font-bold"
                          >
                            Publish
                          </Button>
                        )}

                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleDelete(res.id, res.title)}
                          className="h-7 px-2 text-xs font-semibold"
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
