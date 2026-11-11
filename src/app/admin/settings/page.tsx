"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Settings,
  CheckCircle2,
  AlertCircle,
  Check,
  Search,
  Globe,
  Share2,
} from "lucide-react";

export default function AdminSettingsPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    site_name: "",
    site_description: "",
    logo_url: "",
    favicon_url: "",
    default_social_image: "",
    footer_copy: "",
    meta_explore_title: "",
    meta_explore_desc: "",
    meta_about_title: "",
    meta_about_desc: "",
    meta_paths_title: "",
    meta_paths_desc: "",
  });

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/admin/settings");
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to load settings");

      const s = data.settings || {};
      setFormData({
        site_name: s.site_name || "",
        site_description: s.site_description || "",
        logo_url: s.logo_url || "",
        favicon_url: s.favicon_url || "",
        default_social_image: s.default_social_image || "",
        footer_copy: s.footer_copy || "",
        meta_explore_title: s.meta_titles?.explore || "",
        meta_explore_desc: s.meta_descriptions?.explore || "",
        meta_about_title: s.meta_titles?.about || "",
        meta_about_desc: s.meta_descriptions?.about || "",
        meta_paths_title: s.meta_titles?.paths || "",
        meta_paths_desc: s.meta_descriptions?.paths || "",
      });
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setSaving(true);

    try {
      const payload = {
        site_name: formData.site_name,
        site_description: formData.site_description,
        logo_url: formData.logo_url,
        favicon_url: formData.favicon_url,
        default_social_image: formData.default_social_image,
        footer_copy: formData.footer_copy,
        meta_titles: {
          explore: formData.meta_explore_title,
          about: formData.meta_about_title,
          paths: formData.meta_paths_title,
        },
        meta_descriptions: {
          explore: formData.meta_explore_desc,
          about: formData.meta_about_desc,
          paths: formData.meta_paths_desc,
        },
      };

      const res = await fetch("/api/admin/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to save settings");

      setSuccess("Site settings and SEO metadata saved successfully!");
      await fetchSettings();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="p-10 text-center font-bold text-navy">Loading settings...</div>;
  }

  return (
    <div className="p-6 sm:p-10 max-w-4xl w-full mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-navy tracking-tight flex items-center gap-2.5">
            <Settings className="w-7 h-7 text-sage-600" />
            <span>Site Settings & SEO Configuration</span>
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Global metadata, branding assets, copyright footer, and page-level search engine tags.
          </p>
        </div>

        <Button
          onClick={handleSave}
          disabled={saving}
          variant="sage"
          className="font-bold flex items-center gap-1.5 shadow-sm shrink-0"
        >
          <CheckCircle2 className="w-4 h-4 text-emerald-900" />
          <span>Save Changes</span>
        </Button>
      </div>

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

      {/* Main Settings Form */}
      <form onSubmit={handleSave} className="space-y-8">
        {/* Brand Identity */}
        <div className="bg-card rounded-2xl border border-border p-6 sm:p-8 shadow-xs space-y-5">
          <h2 className="text-base font-bold text-navy flex items-center gap-2 border-b border-border pb-3">
            <Globe className="w-4 h-4 text-sage-600" />
            <span>Platform Identity & Branding</span>
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="space-y-1">
              <label className="text-xs font-bold uppercase text-navy">Site Name *</label>
              <Input
                value={formData.site_name}
                onChange={(e) => setFormData({ ...formData, site_name: e.target.value })}
                required
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold uppercase text-navy">Default Social Image URL</label>
              <Input
                value={formData.default_social_image}
                onChange={(e) => setFormData({ ...formData, default_social_image: e.target.value })}
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold uppercase text-navy">Global Description</label>
            <Textarea
              value={formData.site_description}
              onChange={(e) => setFormData({ ...formData, site_description: e.target.value })}
              rows={2}
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="space-y-1">
              <label className="text-xs font-bold uppercase text-navy">Brand Logo Path / URL</label>
              <Input
                value={formData.logo_url}
                onChange={(e) => setFormData({ ...formData, logo_url: e.target.value })}
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold uppercase text-navy">Favicon Path / URL</label>
              <Input
                value={formData.favicon_url}
                onChange={(e) => setFormData({ ...formData, favicon_url: e.target.value })}
              />
            </div>
          </div>

          <div className="space-y-1 pt-2">
            <label className="text-xs font-bold uppercase text-navy">Footer Copyright Copy</label>
            <Input
              value={formData.footer_copy}
              onChange={(e) => setFormData({ ...formData, footer_copy: e.target.value })}
            />
          </div>
        </div>

        {/* SEO Page Titles & Meta Descriptions */}
        <div className="bg-card rounded-2xl border border-border p-6 sm:p-8 shadow-xs space-y-6">
          <h2 className="text-base font-bold text-navy flex items-center gap-2 border-b border-border pb-3">
            <Search className="w-4 h-4 text-cyan-700" />
            <span>Page-Level SEO Meta Titles & Descriptions</span>
          </h2>

          {/* Explore Page SEO */}
          <div className="space-y-3 p-4 rounded-xl bg-cream-50/70 border border-border">
            <h3 className="text-xs font-bold uppercase tracking-wider text-navy">
              Explore Homepage ( / )
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-muted-foreground">Page Title Tag</label>
                <Input
                  value={formData.meta_explore_title}
                  onChange={(e) => setFormData({ ...formData, meta_explore_title: e.target.value })}
                />
              </div>
              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-muted-foreground">Meta Description</label>
                <Input
                  value={formData.meta_explore_desc}
                  onChange={(e) => setFormData({ ...formData, meta_explore_desc: e.target.value })}
                />
              </div>
            </div>
          </div>

          {/* About Page SEO */}
          <div className="space-y-3 p-4 rounded-xl bg-cream-50/70 border border-border">
            <h3 className="text-xs font-bold uppercase tracking-wider text-navy">
              About Rean ( /about )
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-muted-foreground">Page Title Tag</label>
                <Input
                  value={formData.meta_about_title}
                  onChange={(e) => setFormData({ ...formData, meta_about_title: e.target.value })}
                />
              </div>
              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-muted-foreground">Meta Description</label>
                <Input
                  value={formData.meta_about_desc}
                  onChange={(e) => setFormData({ ...formData, meta_about_desc: e.target.value })}
                />
              </div>
            </div>
          </div>

          {/* Learning Paths Page SEO */}
          <div className="space-y-3 p-4 rounded-xl bg-cream-50/70 border border-border">
            <h3 className="text-xs font-bold uppercase tracking-wider text-navy">
              Learning Paths ( /paths )
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-muted-foreground">Page Title Tag</label>
                <Input
                  value={formData.meta_paths_title}
                  onChange={(e) => setFormData({ ...formData, meta_paths_title: e.target.value })}
                />
              </div>
              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-muted-foreground">Meta Description</label>
                <Input
                  value={formData.meta_paths_desc}
                  onChange={(e) => setFormData({ ...formData, meta_paths_desc: e.target.value })}
                />
              </div>
            </div>
          </div>

          <div className="pt-2 flex justify-end">
            <Button type="submit" disabled={saving} variant="sage" className="font-bold">
              Save Settings & SEO
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}
