"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  ArrowLeft,
  Save,
  CheckCircle2,
  AlertCircle,
  FileText,
  Bookmark,
} from "lucide-react";

interface TopicOption {
  id: string;
  name: string;
  slug: string;
}

interface AssetOption {
  id: string;
  original_name: string;
  mime_type: string;
}

export default function NewResourcePage() {
  const router = useRouter();

  const [topics, setTopics] = useState<TopicOption[]>([]);
  const [assets, setAssets] = useState<AssetOption[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
    publishImmediately: false,
  });

  useEffect(() => {
    // Fetch topics and assets for selectors
    const init = async () => {
      try {
        const [tRes, aRes] = await Promise.all([
          fetch("/api/admin/topics"),
          fetch("/api/admin/assets"),
        ]);
        const tData = await tRes.json();
        const aData = await aRes.json();
        setTopics(tData.topics || []);
        setAssets(aData.assets || []);
        if (tData.topics && tData.topics.length > 0) {
          setFormData((prev) => ({ ...prev, topic_id: tData.topics[0].id }));
        }
      } catch (err: any) {
        console.error("Init error", err);
      }
    };
    init();
  }, []);

  const handleSubmit = async (publish: boolean) => {
    setError(null);
    setLoading(true);

    try {
      const tags = formData.tagsInput
        .split(",")
        .map((t) => t.trim().toLowerCase())
        .filter(Boolean);

      const payload = {
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
        featured_order: formData.featured_order ? parseInt(formData.featured_order, 10) : null,
        publishImmediately: publish,
      };

      const res = await fetch("/api/admin/resources", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to create resource");

      router.push(`/admin/resources/${data.id}`);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

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
            <span>Back to Resources</span>
          </Link>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-navy tracking-tight flex items-center gap-2">
            <Bookmark className="w-7 h-7 text-sage-600" />
            <span>Create New Resource</span>
          </h1>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            disabled={loading}
            onClick={() => handleSubmit(false)}
            className="font-semibold"
          >
            Save as Draft
          </Button>
          <Button
            variant="sage"
            disabled={loading}
            onClick={() => handleSubmit(true)}
            className="font-bold flex items-center gap-1.5 shadow-sm"
          >
            <CheckCircle2 className="w-4 h-4 text-emerald-900" />
            <span>Publish Directly</span>
          </Button>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-destructive/10 border border-destructive/30 flex items-start gap-3 text-destructive text-sm font-semibold">
          <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
          <div>
            <p className="font-bold">Validation Error</p>
            <p className="text-xs font-normal mt-0.5">{error}</p>
          </div>
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
              onChange={(e) => {
                const title = e.target.value;
                const slug = title
                  .toLowerCase()
                  .replace(/[^a-z0-9]+/g, "-")
                  .replace(/^-|-$/g, "");
                setFormData({
                  ...formData,
                  title,
                  slug: formData.slug || slug,
                });
              }}
              placeholder="e.g. Modern TypeScript Deep Dive"
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
              placeholder="e.g. modern-typescript-deep-dive"
              required
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-bold uppercase tracking-wider text-navy">
            Summary / Short Lead *
          </label>
          <Textarea
            value={formData.summary}
            onChange={(e) => setFormData({ ...formData, summary: e.target.value })}
            placeholder="A concise 1-2 sentence description shown in catalog cards and search previews..."
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
              className="w-full h-10 px-3 rounded-md border border-input bg-card text-sm text-navy font-semibold focus:outline-none focus:ring-2 focus:ring-navy cursor-pointer"
              required
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
              className="w-full h-10 px-3 rounded-md border border-input bg-card text-sm text-navy font-semibold focus:outline-none focus:ring-2 focus:ring-navy cursor-pointer"
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
              className="w-full h-10 px-3 rounded-md border border-input bg-card text-sm text-navy font-semibold focus:outline-none focus:ring-2 focus:ring-navy cursor-pointer"
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
            <span className="text-[11px] font-normal text-muted-foreground font-mono">
              Markdown syntax enabled
            </span>
          </label>
          <Textarea
            value={formData.description_markdown}
            onChange={(e) => setFormData({ ...formData, description_markdown: e.target.value })}
            placeholder="## Overview&#10;&#10;Explain what this resource covers, who it is for, and when to use it..."
            rows={10}
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
              placeholder="e.g. java, backend, oop, rest-api"
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
              placeholder="https://..."
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
              placeholder="e.g. 1 (Featured on homepage)"
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
            placeholder="A short note on why our editors recommend this resource..."
          />
        </div>
      </div>
    </div>
  );
}
