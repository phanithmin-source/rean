"use client";

import React, { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  BookOpen,
  PlusCircle,
  Edit2,
  Trash2,
  Check,
  AlertCircle,
  Eye,
  ArrowUp,
  ArrowDown,
  Layers,
} from "lucide-react";

interface ResourceOption {
  id: string;
  title: string;
  slug: string;
  type: string;
}

interface ChapterItem {
  id: string;
  resource_id: string;
  slug: string;
  title: string;
  chapter_order: number;
  content_markdown: string;
  status: string;
  has_draft_changes: boolean;
  draft_title?: string;
  draft_content_markdown?: string;
  draft_chapter_order?: number;
}

export default function AdminChaptersPage() {
  const searchParams = useSearchParams();
  const initialResourceId = searchParams.get("resourceId") || "";

  const [resources, setResources] = useState<ResourceOption[]>([]);
  const [selectedResourceId, setSelectedResourceId] = useState<string>(initialResourceId);
  const [chapters, setChapters] = useState<ChapterItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Editor Modal State
  const [activeChapter, setActiveChapter] = useState<ChapterItem | null>(null);
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    slug: "",
    chapter_order: 1,
    content_markdown: "",
  });

  // Fetch all resources with type 'book' or 'guide'
  useEffect(() => {
    const fetchResources = async () => {
      try {
        const res = await fetch("/api/admin/resources");
        const data = await res.json();
        const bookResources = (data.resources || []).filter(
          (r: any) => r.type === "book" || r.type === "guide"
        );
        setResources(bookResources);

        if (!selectedResourceId && bookResources.length > 0) {
          setSelectedResourceId(bookResources[0].id);
        }
      } catch (e: any) {
        setError(e.message);
      }
    };
    fetchResources();
  }, []);

  // Fetch chapters whenever selectedResourceId changes
  const fetchChapters = async () => {
    if (!selectedResourceId) return;
    try {
      setLoading(true);
      const res = await fetch(`/api/admin/chapters?resourceId=${selectedResourceId}`);
      const data = await res.json();
      setChapters(data.chapters || []);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchChapters();
  }, [selectedResourceId]);

  const openCreate = () => {
    setActiveChapter(null);
    setFormData({
      title: "",
      slug: "",
      chapter_order: chapters.length + 1,
      content_markdown: "## Chapter Title\n\nWrite chapter content in Markdown here...\n\n```java\n// Code example\n```",
    });
    setIsEditorOpen(true);
    setError(null);
    setSuccess(null);
  };

  const openEdit = (ch: ChapterItem) => {
    setActiveChapter(ch);
    setFormData({
      title: ch.draft_title || ch.title,
      slug: ch.slug,
      chapter_order: ch.draft_chapter_order || ch.chapter_order,
      content_markdown: ch.draft_content_markdown || ch.content_markdown,
    });
    setIsEditorOpen(true);
    setError(null);
    setSuccess(null);
  };

  const handleSave = async (publish: boolean) => {
    setError(null);
    setSuccess(null);

    try {
      if (activeChapter) {
        // Update existing
        const res = await fetch(`/api/admin/chapters/${activeChapter.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...formData, publish }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Failed to update chapter");
        setSuccess(publish ? "Chapter published to reader!" : "Chapter draft saved!");
      } else {
        // Create new
        const res = await fetch("/api/admin/chapters", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ...formData,
            resource_id: selectedResourceId,
            publishImmediately: publish,
          }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Failed to create chapter");
        setSuccess(publish ? "Chapter created and published!" : "Chapter created as draft.");
      }

      setIsEditorOpen(false);
      setActiveChapter(null);
      await fetchChapters();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleDelete = async (ch: ChapterItem) => {
    if (!confirm(`Are you sure you want to delete chapter "${ch.title}"?`)) return;
    setError(null);
    try {
      const res = await fetch(`/api/admin/chapters/${ch.id}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to delete chapter");
      setSuccess(`Chapter "${ch.title}" deleted.`);
      await fetchChapters();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const currentResource = resources.find((r) => r.id === selectedResourceId);

  return (
    <div className="p-6 sm:p-10 max-w-7xl w-full mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-navy tracking-tight flex items-center gap-2.5">
            <BookOpen className="w-7 h-7 text-sage-600" />
            <span>Book Chapters & Reader Content</span>
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Author Markdown chapters with syntax highlighting, manage chapter progression, and publish.
          </p>
        </div>

        <Button
          onClick={openCreate}
          disabled={!selectedResourceId}
          className="font-semibold flex items-center gap-1.5 shadow-sm shrink-0"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Add Chapter</span>
        </Button>
      </div>

      {/* Select Parent Resource */}
      <div className="p-4 rounded-xl border border-border bg-card flex flex-col sm:flex-row sm:items-center gap-4">
        <label className="text-xs font-bold uppercase tracking-wider text-navy shrink-0">
          Select Book / Resource:
        </label>
        <select
          value={selectedResourceId}
          onChange={(e) => setSelectedResourceId(e.target.value)}
          className="w-full sm:max-w-md h-10 px-3 rounded-md border border-input bg-card text-sm text-navy font-semibold focus:outline-none focus:ring-2 focus:ring-navy cursor-pointer"
        >
          {resources.map((r) => (
            <option key={r.id} value={r.id}>
              {r.title} ({r.type})
            </option>
          ))}
        </select>
        {currentResource && (
          <span className="text-xs text-muted-foreground font-mono">
            Slug: /resources/{currentResource.slug}
          </span>
        )}
      </div>

      {/* Alerts */}
      {error && (
        <div className="p-4 rounded-xl bg-destructive/10 border border-destructive/30 flex items-start gap-3 text-destructive text-sm font-semibold">
          <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
          <div>
            <p className="font-bold">Error</p>
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

      {/* Chapters Table */}
      <div className="rounded-2xl border border-border bg-card shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-border bg-cream-100/70 text-[11px] font-bold uppercase tracking-wider text-navy/70">
                <th className="py-3.5 px-4">Order</th>
                <th className="py-3.5 px-4">Chapter Title</th>
                <th className="py-3.5 px-4">Reader Route</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border text-xs">
              {loading ? (
                <tr>
                  <td colSpan={5} className="text-center py-10 text-muted-foreground">
                    Loading chapters...
                  </td>
                </tr>
              ) : chapters.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center py-10 text-muted-foreground">
                    No chapters added to this resource yet.
                  </td>
                </tr>
              ) : (
                chapters.map((ch) => (
                  <tr key={ch.id} className="hover:bg-cream-50/80 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-bold text-navy">
                      Ch. {ch.draft_chapter_order || ch.chapter_order}
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-navy text-sm flex items-center gap-2">
                        <span>{ch.draft_title || ch.title}</span>
                        {ch.has_draft_changes && (
                          <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-amber-100 text-amber-900 border border-amber-300">
                            Draft Edits
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="py-3.5 px-4 font-mono text-muted-foreground">
                      /{ch.slug}
                    </td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`inline-block px-2 py-0.5 rounded text-[11px] font-bold border capitalize ${
                          ch.status === "published"
                            ? "bg-emerald-50 text-emerald-800 border-emerald-300"
                            : "bg-gray-100 text-gray-800 border-gray-300"
                        }`}
                      >
                        {ch.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {currentResource && (
                          <a
                            href={`/resources/${currentResource.slug}/${ch.slug}?preview=true`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded border border-border bg-card hover:bg-cream-200 text-navy font-semibold"
                          >
                            <Eye className="w-3 h-3 text-navy/70" />
                            <span>Preview</span>
                          </a>
                        )}

                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => openEdit(ch)}
                          className="h-7 px-2.5 text-xs font-semibold"
                        >
                          <Edit2 className="w-3 h-3 mr-1" />
                          <span>Edit</span>
                        </Button>

                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleDelete(ch)}
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

      {/* Chapter Markdown Editor Modal */}
      {isEditorOpen && (
        <div className="fixed inset-0 z-50 bg-primary/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-card rounded-2xl border border-border shadow-xl max-w-4xl w-full p-6 sm:p-8 space-y-5 max-h-[90vh] flex flex-col animate-in zoom-in-95">
            <div className="border-b border-border pb-4 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-navy">
                  {activeChapter ? `Edit Chapter: ${activeChapter.title}` : "Create New Chapter"}
                </h2>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Markdown content with syntax-highlighted code blocks and scrollable pre tags.
                </p>
              </div>
              <button
                onClick={() => setIsEditorOpen(false)}
                className="text-navy/60 hover:text-navy text-sm font-bold p-1"
              >
                ✕
              </button>
            </div>

            <div className="overflow-y-auto flex-1 space-y-4 pr-1">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="sm:col-span-2 space-y-1">
                  <label className="text-xs font-bold uppercase text-navy">Chapter Title *</label>
                  <Input
                    value={formData.title}
                    onChange={(e) => {
                      const title = e.target.value;
                      const slug = title
                        .toLowerCase()
                        .replace(/[^a-z0-9]+/g, "-")
                        .replace(/^-|-$/g, "");
                      setFormData({
                        ...formData,
                        title,
                        slug: activeChapter ? formData.slug : slug,
                      });
                    }}
                    required
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold uppercase text-navy">Chapter Order *</label>
                  <Input
                    type="number"
                    value={formData.chapter_order}
                    onChange={(e) =>
                      setFormData({ ...formData, chapter_order: parseInt(e.target.value, 10) || 1 })
                    }
                    min={1}
                    required
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold uppercase text-navy">Chapter Slug *</label>
                <Input
                  value={formData.slug}
                  onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                  placeholder="e.g. 01-introduction"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold uppercase text-navy flex items-center justify-between">
                  <span>Markdown Body Content *</span>
                  <span className="text-[11px] font-mono text-muted-foreground">GFM Markdown</span>
                </label>
                <Textarea
                  value={formData.content_markdown}
                  onChange={(e) => setFormData({ ...formData, content_markdown: e.target.value })}
                  rows={14}
                  className="font-mono text-xs leading-relaxed"
                  required
                />
              </div>
            </div>

            <div className="pt-4 border-t border-border flex items-center justify-between">
              <Button variant="outline" onClick={() => setIsEditorOpen(false)}>
                Cancel
              </Button>
              <div className="flex items-center gap-2">
                <Button variant="outline" onClick={() => handleSave(false)}>
                  Save as Draft
                </Button>
                <Button variant="sage" onClick={() => handleSave(true)} className="font-bold">
                  Publish Chapter
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
