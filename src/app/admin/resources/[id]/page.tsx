"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  ArrowLeft,
  Save,
  CheckCircle2,
  AlertCircle,
  Eye,
  BookOpen,
  PlusCircle,
  Trash2,
  RotateCcw,
  Check,
  ExternalLink,
} from "lucide-react";

interface AdminResourceDetail {
  id: string;
  slug: string;
  title: string;
  summary: string;
  description_markdown: string;
  type: string;
  difficulty: string;
  topic_id: string;
  tags: string[];
  source_url: string | null;
  curation_note: string | null;
  download_asset_id: string | null;
  featured_order: number | null;
  status: string;
  has_draft_changes: boolean;
  draft_title?: string;
  draft_summary?: string;
  draft_description_markdown?: string;
  draft_type?: string;
  draft_difficulty?: string;
  draft_topic_id?: string;
  draft_tags?: string[];
  draft_source_url?: string | null;
  draft_curation_note?: string | null;
  draft_download_asset_id?: string | null;
  draft_featured_order?: number | null;
}

interface ChapterSummary {
  id: string;
  slug: string;
  title: string;
  chapter_order: number;
  status: string;
}

export default function EditResourcePage({ params }: { params: { id: string } }) {
  const router = useRouter();

  const [resource, setResource] = useState<AdminResourceDetail | null>(null);
  const [chapters, setChapters] = useState<ChapterSummary[]>([]);
  const [topics, setTopics] = useState<any[]>([]);
  const [assets, setAssets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    title: "",
    slug: "",
    summary: "",
    description_markdown: "",
    type: "guide",
    difficulty: "beginner",
    topic_id: "",
    tagsInput: "",
    source_url: "",
    curation_note: "",
    download_asset_id: "",
    featured_order: "",
  });

  const fetchData = async () => {
    try {
      setLoading(true);
      const [rRes, cRes, tRes, aRes] = await Promise.all([
        fetch(`/api/admin/resources/${params.id}`),
        fetch(`/api/admin/chapters?resourceId=${params.id}`),
        fetch("/api/admin/topics"),
        fetch("/api/admin/assets"),
      ]);

      const rData = await rRes.json();
      const cData = await cRes.json();
      const tData = await tRes.json();
      const aData = await aRes.json();

      if (!rRes.ok) throw new Error(rData.error || "Failed to load resource");

      const r = rData.resource;
      setResource(r);
      setChapters(cData.chapters || []);
      setTopics(tData.topics || []);
      setAssets(aData.assets || []);

      // Populate draft fields if available, otherwise fallback to published fields
      const currentTags = r.draft_tags || r.tags || [];
      const tagsArray = Array.isArray(currentTags) ? currentTags : typeof currentTags === "string" ? JSON.parse(currentTags) : [];

      setFormData({
        title: r.draft_title || r.title || "",
        slug: r.slug || "",
        summary: r.draft_summary || r.summary || "",
        description_markdown: r.draft_description_markdown || r.description_markdown || "",
        type: r.draft_type || r.type || "guide",
        difficulty: r.draft_difficulty || r.difficulty || "beginner",
        topic_id: r.draft_topic_id || r.topic_id || "",
        tagsInput: tagsArray.join(", "),
        source_url: r.draft_source_url || r.source_url || "",
        curation_note: r.draft_curation_note || r.curation_note || "",
        download_asset_id: r.draft_download_asset_id || r.download_asset_id || "",
        featured_order: r.draft_featured_order ?? r.featured_order ?? "",
      });
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [params.id]);

  const handleSaveDraft = async () => {
    setError(null);
    setSuccess(null);
    setSaving(true);
    try {
      const tags = formData.tagsInput
        .split(",")
        .map((t) => t.trim().toLowerCase())
        .filter(Boolean);

      const payload = {
        action: "save_draft",
        title: formData.title,
        slug: formData.slug,
        summary: formData.summary,
        description_markdown: formData.description_markdown,
        type: formData.type,
        difficulty: formData.difficulty,
        topic_id: formData.topic_id,
        tags,
        source_url: formData.source_url || null,
        curation_note: formData.curation_note || null,
        download_asset_id: formData.download_asset_id || null,
        featured_order: formData.featured_order ? parseInt(String(formData.featured_order), 10) : null,
      };

      const res = await fetch(`/api/admin/resources/${params.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to save draft");

      setSuccess("Draft saved! The live published version remains live and untouched until you publish.");
      await fetchData();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handlePublish = async () => {
    setError(null);
    setSuccess(null);
    setSaving(true);
    try {
      const tags = formData.tagsInput
        .split(",")
        .map((t) => t.trim().toLowerCase())
        .filter(Boolean);

      const payload = {
        action: "publish",
        title: formData.title,
        slug: formData.slug,
        summary: formData.summary,
        description_markdown: formData.description_markdown,
        type: formData.type,
        difficulty: formData.difficulty,
        topic_id: formData.topic_id,
        tags,
        source_url: formData.source_url || null,
        curation_note: formData.curation_note || null,
        download_asset_id: formData.download_asset_id || null,
        featured_order: formData.featured_order ? parseInt(String(formData.featured_order), 10) : null,
      };

      const res = await fetch(`/api/admin/resources/${params.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Publish failed");

      setSuccess("Resource published! Live catalog and search updated.");
      await fetchData();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleUnpublish = async () => {
    setError(null);
    setSuccess(null);
    setSaving(true);
    try {
      const res = await fetch(`/api/admin/resources/${params.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "unpublish" }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Unpublish failed");

      setSuccess("Resource unpublished and switched to draft.");
      await fetchData();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="p-10 text-center text-navy font-bold">Loading editor...</div>;
  }

  if (!resource) {
    return <div className="p-10 text-center text-destructive font-bold">Resource not found.</div>;
  }

  return (
    <div className="p-6 sm:p-10 max-w-5xl w-full mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-6">
        <div>
          <Link
            href="/admin/resources"
            className="text-xs font-semibold text-navy/70 hover:underline flex items-center gap-1 mb-2"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Catalog</span>
          </Link>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-navy tracking-tight truncate max-w-lg">
              {resource.draft_title || resource.title}
            </h1>
            <span
              className={`text-xs font-bold px-2.5 py-0.5 rounded border capitalize ${
                resource.status === "published"
                  ? "bg-emerald-50 text-emerald-800 border-emerald-300"
                  : "bg-gray-100 text-gray-800 border-gray-300"
              }`}
            >
              {resource.status}
            </span>
          </div>
          {resource.has_draft_changes && (
            <p className="text-xs text-amber-800 font-semibold mt-1">
              ⚠️ You have unpublished draft changes. The live published version remains live until you click Publish.
            </p>
          )}
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Private Preview Link */}
          <a
            href={`/resources/${resource.slug}?preview=true`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-xs px-3 py-2 rounded-lg border border-border bg-card hover:bg-cream-200 text-navy font-semibold shadow-xs"
          >
            <Eye className="w-3.5 h-3.5 text-navy/70" />
            <span>Preview Draft</span>
          </a>

          {resource.status === "published" && (
            <Button
              variant="outline"
              disabled={saving}
              onClick={handleUnpublish}
              className="text-xs font-semibold"
            >
              Unpublish
            </Button>
          )}

          <Button
            variant="outline"
            disabled={saving}
            onClick={handleSaveDraft}
            className="font-semibold text-xs"
          >
            Save Draft
          </Button>

          <Button
            variant="sage"
            disabled={saving}
            onClick={handlePublish}
            className="font-bold text-xs flex items-center gap-1 shadow-sm"
          >
            <CheckCircle2 className="w-4 h-4 text-emerald-900" />
            <span>Publish Changes</span>
          </Button>
        </div>
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

      {/* Form Fields */}
      <div className="bg-card rounded-2xl border border-border p-6 sm:p-8 shadow-xs space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div className="space-y-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-navy">
              Title *
            </label>
            <Input
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              required
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-navy">
              URL Slug *
            </label>
            <Input
              value={formData.slug}
              onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
              required
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-bold uppercase tracking-wider text-navy">
            Summary *
          </label>
          <Textarea
            value={formData.summary}
            onChange={(e) => setFormData({ ...formData, summary: e.target.value })}
            rows={2}
            required
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div className="space-y-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-navy">
              Topic Domain *
            </label>
            <select
              value={formData.topic_id}
              onChange={(e) => setFormData({ ...formData, topic_id: e.target.value })}
              className="w-full h-10 px-3 rounded-md border border-input bg-card text-sm text-navy font-semibold focus:outline-none focus:ring-2 focus:ring-navy"
            >
              {topics.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-navy">
              Resource Format *
            </label>
            <select
              value={formData.type}
              onChange={(e) => setFormData({ ...formData, type: e.target.value })}
              className="w-full h-10 px-3 rounded-md border border-input bg-card text-sm text-navy font-semibold focus:outline-none focus:ring-2 focus:ring-navy"
            >
              <option value="book">Book / Handbook</option>
              <option value="guide">Guide / Article</option>
              <option value="course">Course / Tutorial</option>
              <option value="tool">Developer Tool</option>
              <option value="documentation">Documentation</option>
              <option value="project">Practice Project</option>
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-navy">
              Difficulty Level *
            </label>
            <select
              value={formData.difficulty}
              onChange={(e) => setFormData({ ...formData, difficulty: e.target.value })}
              className="w-full h-10 px-3 rounded-md border border-input bg-card text-sm text-navy font-semibold focus:outline-none focus:ring-2 focus:ring-navy"
            >
              <option value="beginner">Beginner</option>
              <option value="intermediate">Intermediate</option>
              <option value="advanced">Advanced</option>
            </select>
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-bold uppercase tracking-wider text-navy flex items-center justify-between">
            <span>Description & Content (Markdown) *</span>
            <span className="text-[11px] font-mono text-muted-foreground">Markdown syntax</span>
          </label>
          <Textarea
            value={formData.description_markdown}
            onChange={(e) => setFormData({ ...formData, description_markdown: e.target.value })}
            rows={12}
            className="font-mono text-xs leading-relaxed"
            required
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div className="space-y-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-navy">
              Tags (comma separated)
            </label>
            <Input
              value={formData.tagsInput}
              onChange={(e) => setFormData({ ...formData, tagsInput: e.target.value })}
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-navy">
              External Source Link
            </label>
            <Input
              type="url"
              value={formData.source_url}
              onChange={(e) => setFormData({ ...formData, source_url: e.target.value })}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div className="space-y-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-navy">
              Downloadable File Asset
            </label>
            <select
              value={formData.download_asset_id}
              onChange={(e) => setFormData({ ...formData, download_asset_id: e.target.value })}
              className="w-full h-10 px-3 rounded-md border border-input bg-card text-sm text-navy font-semibold focus:outline-none focus:ring-2 focus:ring-navy cursor-pointer"
            >
              <option value="">None (No file download)</option>
              {assets.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.original_name} ({a.mime_type})
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-navy">
              Featured Order on Explore (Optional)
            </label>
            <Input
              type="number"
              value={formData.featured_order}
              onChange={(e) => setFormData({ ...formData, featured_order: e.target.value })}
              placeholder="e.g. 1"
              min={1}
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-bold uppercase tracking-wider text-navy">
            Editorial Curation Note
          </label>
          <Input
            value={formData.curation_note}
            onChange={(e) => setFormData({ ...formData, curation_note: e.target.value })}
          />
        </div>
      </div>

      {/* Chapters Section if book/guide */}
      <div className="bg-card rounded-2xl border border-border p-6 sm:p-8 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-border pb-4">
          <div>
            <h2 className="text-lg font-bold text-navy flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-sage-600" />
              <span>Interactive Book Chapters ({chapters.length})</span>
            </h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              Manage chapter ordering, Markdown contents, and reader sequence.
            </p>
          </div>

          <Link href={`/admin/chapters?resourceId=${resource.id}`}>
            <Button size="sm" variant="outline" className="font-semibold text-xs flex items-center gap-1">
              <span>Open Chapter Manager &rarr;</span>
            </Button>
          </Link>
        </div>

        <div className="divide-y divide-border">
          {chapters.length > 0 ? (
            chapters.map((ch) => (
              <div key={ch.id} className="py-2.5 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-cream-200 text-navy font-bold flex items-center justify-center text-[10px]">
                    {ch.chapter_order}
                  </span>
                  <span className="font-bold text-navy">{ch.title}</span>
                  <span className="font-mono text-muted-foreground text-[10px]">
                    /{ch.slug}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 text-[10px] font-bold border border-emerald-300">
                    {ch.status}
                  </span>
                  <a
                    href={`/resources/${resource.slug}/${ch.slug}?preview=true`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-navy hover:underline font-semibold"
                  >
                    View in Reader &rarr;
                  </a>
                </div>
              </div>
            ))
          ) : (
            <p className="text-xs text-muted-foreground py-3">
              No individual chapters added for this resource.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
