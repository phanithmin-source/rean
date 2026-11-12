"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Home,
  CheckCircle2,
  AlertCircle,
  Eye,
  RotateCcw,
  Check,
  Save,
} from "lucide-react";

export default function AdminExplorePage() {
  const [pageData, setPageData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    heroTitle: "",
    heroSubtitle: "",
    featuredTopicsHeading: "",
    curatedPicksHeading: "",
    catalogHeading: "",
  });

  const fetchPage = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/admin/pages?key=explore");
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to load explore page");

      const p = data.page;
      setPageData(p);

      const content = p.draft_content || p.published_content || {};
      setFormData({
        heroTitle: content.heroTitle || "",
        heroSubtitle: content.heroSubtitle || "",
        featuredTopicsHeading: content.featuredTopicsHeading || "",
        curatedPicksHeading: content.curatedPicksHeading || "",
        catalogHeading: content.catalogHeading || "",
      });
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPage();
  }, []);

  const handleSaveDraft = async () => {
    setError(null);
    setSuccess(null);
    setSaving(true);
    try {
      const res = await fetch("/api/admin/pages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          key: "explore",
          action: "save_draft",
          draftContent: formData,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to save draft");
      setSuccess("Homepage draft copy saved! The live homepage remains unchanged until you publish.");
      await fetchPage();
    } catch (e: any) {
      setError(e.message);
    } finally {
      setSaving(false);
    }
  };

  const handlePublish = async () => {
    setError(null);
    setSuccess(null);
    setSaving(true);
    try {
      const res = await fetch("/api/admin/pages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          key: "explore",
          action: "publish",
          draftContent: formData,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to publish");
      setSuccess("Homepage published! Live visitors now see the new copy.");
      await fetchPage();
    } catch (e: any) {
      setError(e.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDiscard = async () => {
    if (!confirm("Discard all pending draft edits and reset to live published copy?")) return;
    setError(null);
    setSaving(true);
    try {
      const res = await fetch("/api/admin/pages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          key: "explore",
          action: "discard",
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to discard");
      setSuccess("Draft discarded. Reset to currently published copy.");
      await fetchPage();
    } catch (e: any) {
      setError(e.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="p-10 text-center font-bold text-navy">Loading homepage copy...</div>;
  }

  return (
    <div className="p-6 sm:p-10 max-w-4xl w-full mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-navy tracking-tight flex items-center gap-2.5">
            <Home className="w-7 h-7 text-sage-600" />
            <span>Explore Homepage Editorial</span>
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Manage public introduction copy, hero banners, and section headings from the browser.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {pageData?.has_draft_changes && (
            <Button
              variant="outline"
              disabled={saving}
              onClick={handleDiscard}
              className="text-xs font-semibold"
            >
              <RotateCcw className="w-3.5 h-3.5 mr-1" />
              <span>Discard Draft</span>
            </Button>
          )}

          <Button
            variant="outline"
            disabled={saving}
            onClick={handleSaveDraft}
            className="text-xs font-semibold"
          >
            Save Draft
          </Button>

          <Button
            variant="sage"
            disabled={saving}
            onClick={handlePublish}
            className="text-xs font-bold flex items-center gap-1 shadow-sm"
          >
            <CheckCircle2 className="w-4 h-4 text-emerald-900" />
            <span>Publish to Live Site</span>
          </Button>
        </div>
      </div>

      {/* Alerts */}
      {error && (
        <div className="p-4 rounded-xl bg-destructive/10 border border-destructive/30 flex items-start gap-3 text-destructive text-sm font-semibold">
          <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
          <p>{error}</p>
        </div>
      )}

      {success && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-300 flex items-center gap-2 text-emerald-800 text-sm font-semibold">
          <Check className="w-5 h-5 text-emerald-600 shrink-0" />
          <span>{success}</span>
        </div>
      )}

      {pageData?.has_draft_changes && (
        <div className="p-3 rounded-lg bg-amber-50 border border-amber-200 text-xs font-semibold text-amber-900 flex items-center gap-2">
          <span>⚠️ You have unpublished draft copy. Public visitors still see the previous published version.</span>
        </div>
      )}

      {/* Form Fields */}
      <div className="bg-card rounded-2xl border border-border p-6 sm:p-8 shadow-xs space-y-6">
        <div className="space-y-1.5">
          <label className="text-xs font-bold uppercase tracking-wider text-navy">
            Hero Heading (Main Title)
          </label>
          <Input
            value={formData.heroTitle}
            onChange={(e) => setFormData({ ...formData, heroTitle: e.target.value })}
            required
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-bold uppercase tracking-wider text-navy">
            Hero Subtitle / Introduction Paragraph
          </label>
          <Textarea
            value={formData.heroSubtitle}
            onChange={(e) => setFormData({ ...formData, heroSubtitle: e.target.value })}
            rows={3}
            required
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-4 border-t border-border">
          <div className="space-y-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-navy">
              Featured Domains Heading
            </label>
            <Input
              value={formData.featuredTopicsHeading}
              onChange={(e) => setFormData({ ...formData, featuredTopicsHeading: e.target.value })}
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-navy">
              Curated Picks Section Heading
            </label>
            <Input
              value={formData.curatedPicksHeading}
              onChange={(e) => setFormData({ ...formData, curatedPicksHeading: e.target.value })}
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-navy">
              Catalog Grid Heading
            </label>
            <Input
              value={formData.catalogHeading}
              onChange={(e) => setFormData({ ...formData, catalogHeading: e.target.value })}
            />
          </div>

        </div>
      </div>
    </div>
  );
}
