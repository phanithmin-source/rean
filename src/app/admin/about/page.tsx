"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { DEFAULT_PROFILE } from "@/lib/directory-content";
import {
  FileText,
  CheckCircle2,
  AlertCircle,
  Eye,
  RotateCcw,
  Check,
  Target,
  Users,
  Lightbulb,
  ShieldCheck,
} from "lucide-react";

export default function AdminAboutPage() {
  const [pageData, setPageData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    ...DEFAULT_PROFILE,
    pageTitle: "",
    mission: "",
    audience: "",
    learningApproach: "",
    selectionCriteria: "",
    ctaExploreLabel: "",
  });

  const fetchPage = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/admin/pages?key=about");
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to load about page");

      const p = data.page;
      setPageData(p);

      const content = p.draft_content || p.published_content || {};
      setFormData({
        ...(Object.fromEntries(
          Object.entries(DEFAULT_PROFILE).map(([key, fallback]) => [
            key,
            content[key] ?? fallback,
          ]),
        ) as typeof DEFAULT_PROFILE),
        pageTitle: content.pageTitle || "",
        mission: content.mission || "",
        audience: content.audience || "",
        learningApproach: content.learningApproach || "",
        selectionCriteria: content.selectionCriteria || "",
        ctaExploreLabel: content.ctaExploreLabel || "",
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
          key: "about",
          action: "save_draft",
          draftContent: formData,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to save draft");
      setSuccess(
        "About draft copy saved! The live About page remains completely unchanged until published.",
      );
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
          key: "about",
          action: "publish",
          draftContent: formData,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to publish");
      setSuccess(
        "About page published! Live visitors now see the updated editorial copy.",
      );
      await fetchPage();
    } catch (e: any) {
      setError(e.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDiscard = async () => {
    if (
      !confirm(
        "Discard all pending draft edits and reset to currently published copy?",
      )
    )
      return;
    setError(null);
    setSaving(true);
    try {
      const res = await fetch("/api/admin/pages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          key: "about",
          action: "discard",
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to discard");
      setSuccess("Draft discarded. Reset to live published copy.");
      await fetchPage();
    } catch (e: any) {
      setError(e.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="p-10 text-center font-bold text-navy">
        Loading About page copy...
      </div>
    );
  }

  return (
    <div className="p-6 sm:p-10 max-w-4xl w-full mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-navy tracking-tight flex items-center gap-2.5">
            <FileText className="w-7 h-7 text-sage-600" />
            <span>About Page Editorial</span>
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Manage your profile, Rean&apos;s mission, and resource selection
            criteria.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <a
            href="/about?preview=true"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-xs px-3 py-2 rounded-lg border border-border bg-card hover:bg-cream-200 text-navy font-semibold shadow-xs"
          >
            <Eye className="w-3.5 h-3.5 text-navy/70" />
            <span>Preview Draft</span>
          </a>

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
          <span>
            ⚠️ You have unpublished draft edits. The live About page remains
            completely untouched for public visitors until you click Publish.
          </span>
        </div>
      )}

      {/* Form Fields */}
      <div className="bg-card rounded-2xl border border-border p-6 sm:p-8 shadow-xs space-y-6">
        <div className="space-y-1.5">
          <label className="text-xs font-bold uppercase tracking-wider text-navy">
            Page Title
          </label>
          <Input
            value={formData.pageTitle}
            onChange={(e) =>
              setFormData({ ...formData, pageTitle: e.target.value })
            }
            required
          />
        </div>

        <div className="space-y-5 rounded-2xl border border-sage-200 bg-sage-50/50 p-5 sm:p-6">
          <div>
            <h2 className="font-semibold text-navy">Your profile</h2>
            <p className="mt-1 text-xs leading-5 text-muted-foreground">
              Your introduction and contact links appear on the About page.
            </p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            {(
              [
                ["profileName", "Name"],
                ["profileRole", "Role"],
                ["profilePhoto", "Photo path (inside public)"],
                ["profileEmail", "Email"],
                ["profileGithub", "GitHub URL"],
                ["profileTelegram", "Telegram URL"],
                ["profileLinkedIn", "LinkedIn URL"],
              ] as const
            ).map(([key, label]) => (
              <div key={key} className="space-y-1.5">
                <label htmlFor={key} className="text-xs font-medium text-navy">
                  {label}
                </label>
                <Input
                  id={key}
                  type={
                    key === "profileEmail"
                      ? "email"
                      : key === "profileGithub" ||
                          key === "profileTelegram" ||
                          key === "profileLinkedIn"
                        ? "url"
                        : "text"
                  }
                  value={formData[key]}
                  onChange={(e) =>
                    setFormData({ ...formData, [key]: e.target.value })
                  }
                />
              </div>
            ))}
          </div>
          <div className="space-y-1.5">
            <label
              htmlFor="profileBio"
              className="text-xs font-medium text-navy"
            >
              Short introduction
            </label>
            <Textarea
              id="profileBio"
              rows={4}
              value={formData.profileBio}
              onChange={(e) =>
                setFormData({ ...formData, profileBio: e.target.value })
              }
            />
          </div>
        </div>

        {/* Mission */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold uppercase tracking-wider text-navy flex items-center gap-1.5">
            <Target className="w-4 h-4 text-sage-700" />
            <span>Rean&apos;s Mission Statement *</span>
          </label>
          <Textarea
            value={formData.mission}
            onChange={(e) =>
              setFormData({ ...formData, mission: e.target.value })
            }
            rows={3}
            required
          />
        </div>

        {/* Audience */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold uppercase tracking-wider text-navy flex items-center gap-1.5">
            <Users className="w-4 h-4 text-cyan-700" />
            <span>Target Audience & Community *</span>
          </label>
          <Textarea
            value={formData.audience}
            onChange={(e) =>
              setFormData({ ...formData, audience: e.target.value })
            }
            rows={3}
            required
          />
        </div>

        {/* Learning Approach */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold uppercase tracking-wider text-navy flex items-center gap-1.5">
            <Lightbulb className="w-4 h-4 text-amber-600" />
            <span>Pedagogy & Learning Approach *</span>
          </label>
          <Textarea
            value={formData.learningApproach}
            onChange={(e) =>
              setFormData({ ...formData, learningApproach: e.target.value })
            }
            rows={3}
            required
          />
        </div>

        {/* Selection Criteria */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold uppercase tracking-wider text-navy flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-700" />
            <span>Resource Selection Criteria *</span>
          </label>
          <Textarea
            value={formData.selectionCriteria}
            onChange={(e) =>
              setFormData({ ...formData, selectionCriteria: e.target.value })
            }
            rows={3}
            required
          />
        </div>

        {/* CTAs */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-4 border-t border-border">
          <div className="space-y-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-navy">
              Catalog CTA Button Label
            </label>
            <Input
              value={formData.ctaExploreLabel}
              onChange={(e) =>
                setFormData({ ...formData, ctaExploreLabel: e.target.value })
              }
            />
          </div>
        </div>
      </div>
    </div>
  );
}
