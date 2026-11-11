"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Compass,
  PlusCircle,
  Edit2,
  Trash2,
  Eye,
  Check,
  AlertCircle,
  ExternalLink,
  Clock,
  FolderGit2,
} from "lucide-react";

interface AdminLearningPath {
  id: string;
  slug: string;
  title: string;
  draft_title?: string;
  summary: string;
  outcome: string;
  topic_name: string;
  final_task_title: string;
  step_count: string | number;
  status: string;
  has_draft_changes: boolean;
  featured_order: number | null;
}

export default function AdminLearningPathsPage() {
  const [paths, setPaths] = useState<AdminLearningPath[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const fetchPaths = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/admin/paths");
      if (!res.ok) throw new Error("Failed to load learning paths");
      const data = await res.json();
      setPaths(data.paths || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPaths();
  }, []);

  const handlePublish = async (id: string, title: string) => {
    setError(null);
    setSuccess(null);
    try {
      const res = await fetch(`/api/admin/paths/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "publish" }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to publish learning path");
      setSuccess(`"${title}" published successfully! Public roadmaps updated.`);
      await fetchPaths();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleUnpublish = async (id: string, title: string) => {
    setError(null);
    setSuccess(null);
    try {
      const res = await fetch(`/api/admin/paths/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "unpublish" }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to unpublish learning path");
      setSuccess(`"${title}" unpublished and switched to draft.`);
      await fetchPaths();
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <div className="p-6 sm:p-10 max-w-7xl w-full mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-navy tracking-tight flex items-center gap-2.5">
            <Compass className="w-7 h-7 text-sage-600" />
            <span>Learning Paths & Practice Roadmaps</span>
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Design structured engineering progressions with ordered learning steps and final practice tasks.
          </p>
        </div>

        <Link href="/admin/paths/new">
          <Button className="font-semibold flex items-center gap-1.5 shadow-sm">
            <PlusCircle className="w-4 h-4" />
            <span>New Learning Path</span>
          </Button>
        </Link>
      </div>

      {/* Alerts */}
      {error && (
        <div className="p-4 rounded-xl bg-destructive/10 border border-destructive/30 flex items-start gap-3 text-destructive text-sm font-semibold">
          <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
          <div>
            <p className="font-bold">Publishing Guard Blocked</p>
            <p className="text-xs font-normal mt-0.5">{error}</p>
          </div>
        </div>
      )}

      {success && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-300 flex items-center gap-2 text-emerald-800 text-sm font-semibold">
          <Check className="w-5 h-5 text-emerald-600 shrink-0" />
          <span>{success}</span>
        </div>
      )}

      {/* Paths Table */}
      <div className="rounded-2xl border border-border bg-card shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-border bg-cream-100/70 text-[11px] font-bold uppercase tracking-wider text-navy/70">
                <th className="py-3.5 px-4">Roadmap & Route</th>
                <th className="py-3.5 px-4">Domain</th>
                <th className="py-3.5 px-4">Steps</th>
                <th className="py-3.5 px-4">Final Capstone Project</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border text-xs">
              {loading ? (
                <tr>
                  <td colSpan={6} className="text-center py-10 text-muted-foreground">
                    Loading learning paths...
                  </td>
                </tr>
              ) : paths.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-10 text-muted-foreground">
                    No learning paths created yet.
                  </td>
                </tr>
              ) : (
                paths.map((p) => (
                  <tr key={p.id} className="hover:bg-cream-50/80 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-navy text-sm flex items-center gap-2">
                        <span>{p.draft_title || p.title}</span>
                        {p.has_draft_changes && (
                          <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-amber-100 text-amber-900 border border-amber-300">
                            Unsaved Draft
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] text-muted-foreground font-mono mt-0.5">
                        /paths/{p.slug}
                      </div>
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-navy">
                      {p.topic_name || "General"}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="font-bold text-navy">{p.step_count}</span> steps
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-1.5 font-bold text-navy">
                        <FolderGit2 className="w-3.5 h-3.5 text-sage-600" />
                        <span>{p.final_task_title}</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`inline-block px-2 py-0.5 rounded text-[11px] font-bold border capitalize ${
                          p.status === "published"
                            ? "bg-emerald-50 text-emerald-800 border-emerald-300"
                            : "bg-gray-100 text-gray-800 border-gray-300"
                        }`}
                      >
                        {p.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <a
                          href={`/paths/${p.slug}?preview=true`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded border border-border bg-card hover:bg-cream-200 text-navy font-semibold"
                        >
                          <Eye className="w-3 h-3 text-navy/70" />
                          <span>Preview</span>
                        </a>

                        <Link href={`/admin/paths/${p.id}`}>
                          <Button size="sm" variant="outline" className="h-7 px-2.5 text-xs font-semibold">
                            <Edit2 className="w-3 h-3 mr-1" />
                            <span>Edit</span>
                          </Button>
                        </Link>

                        {p.status === "published" && !p.has_draft_changes ? (
                          <Button
                            size="sm"
                            variant="secondary"
                            onClick={() => handleUnpublish(p.id, p.title)}
                            className="h-7 px-2 text-xs font-semibold"
                          >
                            Unpublish
                          </Button>
                        ) : (
                          <Button
                            size="sm"
                            variant="sage"
                            onClick={() => handlePublish(p.id, p.title)}
                            className="h-7 px-2.5 text-xs font-bold"
                          >
                            Publish
                          </Button>
                        )}
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
