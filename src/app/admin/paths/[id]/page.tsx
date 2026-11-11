"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  ArrowLeft,
  Save,
  CheckCircle2,
  AlertCircle,
  Eye,
  PlusCircle,
  Trash2,
  Compass,
  Check,
  FolderGit2,
} from "lucide-react";

interface StepData {
  id?: string;
  step_order: number;
  title: string;
  description: string;
  resource_id?: string | null;
  external_url?: string | null;
  estimated_minutes: number;
}

export default function EditLearningPathPage({ params }: { params: { id: string } }) {
  const [pathData, setPathData] = useState<any>(null);
  const [topics, setTopics] = useState<any[]>([]);
  const [resources, setResources] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    title: "",
    slug: "",
    summary: "",
    outcome: "",
    prerequisitesText: "",
    final_task_title: "",
    final_task_description: "",
    topic_id: "",
    featured_order: "",
    steps: [] as StepData[],
  });

  const fetchData = async () => {
    try {
      setLoading(true);
      const [pRes, tRes, rRes] = await Promise.all([
        fetch(`/api/admin/paths/${params.id}`),
        fetch("/api/admin/topics"),
        fetch("/api/admin/resources"),
      ]);

      const pData = await pRes.json();
      const tData = await tRes.json();
      const rData = await rRes.json();

      if (!pRes.ok) throw new Error(pData.error || "Failed to load path");

      const p = pData.path;
      setPathData(p);
      setTopics(tData.topics || []);
      setResources(rData.resources || []);

      const prereqs = p.draft_prerequisites || p.prerequisites || [];
      const prereqsArray = Array.isArray(prereqs)
        ? prereqs
        : typeof prereqs === "string"
        ? JSON.parse(prereqs)
        : [];

      setFormData({
        title: p.draft_title || p.title || "",
        slug: p.slug || "",
        summary: p.draft_summary || p.summary || "",
        outcome: p.draft_outcome || p.outcome || "",
        prerequisitesText: prereqsArray.join("\n"),
        final_task_title: p.draft_final_task_title || p.final_task_title || "",
        final_task_description: p.draft_final_task_description || p.final_task_description || "",
        topic_id: p.draft_topic_id || p.topic_id || "",
        featured_order: p.draft_featured_order ?? p.featured_order ?? "",
        steps: p.steps || [],
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
      const prerequisites = formData.prerequisitesText
        .split("\n")
        .map((s) => s.trim())
        .filter(Boolean);

      const payload = {
        action: "save_draft",
        title: formData.title,
        slug: formData.slug,
        summary: formData.summary,
        outcome: formData.outcome,
        prerequisites,
        final_task_title: formData.final_task_title,
        final_task_description: formData.final_task_description,
        topic_id: formData.topic_id || null,
        featured_order: formData.featured_order ? parseInt(String(formData.featured_order), 10) : null,
        steps: formData.steps,
      };

      const res = await fetch(`/api/admin/paths/${params.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to save draft");

      setSuccess("Path draft saved! The live roadmap remains unchanged until published.");
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
      const prerequisites = formData.prerequisitesText
        .split("\n")
        .map((s) => s.trim())
        .filter(Boolean);

      const payload = {
        action: "publish",
        title: formData.title,
        slug: formData.slug,
        summary: formData.summary,
        outcome: formData.outcome,
        prerequisites,
        final_task_title: formData.final_task_title,
        final_task_description: formData.final_task_description,
        topic_id: formData.topic_id || null,
        featured_order: formData.featured_order ? parseInt(String(formData.featured_order), 10) : null,
        steps: formData.steps,
      };

      const res = await fetch(`/api/admin/paths/${params.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Publish failed");

      setSuccess("Learning path published! Public roadmaps updated.");
      await fetchData();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const addStep = () => {
    const nextOrder = formData.steps.length + 1;
    const newStep: StepData = {
      step_order: nextOrder,
      title: `Step ${nextOrder}: New Lesson`,
      description: "Explain what the learner must study and implement...",
      resource_id: resources[0]?.id || null,
      external_url: null,
      estimated_minutes: 45,
    };
    setFormData({
      ...formData,
      steps: [...formData.steps, newStep],
    });
  };

  const updateStep = (index: number, updates: Partial<StepData>) => {
    const updated = [...formData.steps];
    updated[index] = { ...updated[index], ...updates };
    setFormData({ ...formData, steps: updated });
  };

  const removeStep = (index: number) => {
    const updated = formData.steps.filter((_, i) => i !== index);
    const reordered = updated.map((s, idx) => ({ ...s, step_order: idx + 1 }));
    setFormData({ ...formData, steps: reordered });
  };

  if (loading) {
    return <div className="p-10 text-center font-bold text-navy">Loading path editor...</div>;
  }

  if (!pathData) {
    return <div className="p-10 text-center font-bold text-destructive">Path not found.</div>;
  }

  return (
    <div className="p-6 sm:p-10 max-w-5xl w-full mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-6">
        <div>
          <Link
            href="/admin/paths"
            className="text-xs font-semibold text-navy/70 hover:underline flex items-center gap-1 mb-2"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Learning Paths</span>
          </Link>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-navy tracking-tight truncate max-w-lg">
              {pathData.draft_title || pathData.title}
            </h1>
            <span
              className={`text-xs font-bold px-2.5 py-0.5 rounded border capitalize ${
                pathData.status === "published"
                  ? "bg-emerald-50 text-emerald-800 border-emerald-300"
                  : "bg-gray-100 text-gray-800 border-gray-300"
              }`}
            >
              {pathData.status}
            </span>
          </div>
          {pathData.has_draft_changes && (
            <p className="text-xs text-amber-800 font-semibold mt-1">
              ⚠️ You have unpublished draft changes. The live published version remains live until you click Publish.
            </p>
          )}
        </div>

        <div className="flex items-center gap-2">
          <a
            href={`/paths/${pathData.slug}?preview=true`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-xs px-3 py-2 rounded-lg border border-border bg-card hover:bg-cream-200 text-navy font-semibold"
          >
            <Eye className="w-3.5 h-3.5 text-navy/70" />
            <span>Preview Draft</span>
          </a>

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
            className="font-bold text-xs flex items-center gap-1"
          >
            <CheckCircle2 className="w-4 h-4 text-emerald-900" />
            <span>Publish Roadmap</span>
          </Button>
        </div>
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

      {/* Main Path Details */}
      <div className="bg-card rounded-2xl border border-border p-6 sm:p-8 shadow-xs space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div className="space-y-1">
            <label className="text-xs font-bold uppercase text-navy">Path Title *</label>
            <Input
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              required
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold uppercase text-navy">URL Slug *</label>
            <Input
              value={formData.slug}
              onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
              required
            />
          </div>
        </div>

        <div className="space-y-1">
          <label className="text-xs font-bold uppercase text-navy">Summary *</label>
          <Textarea
            value={formData.summary}
            onChange={(e) => setFormData({ ...formData, summary: e.target.value })}
            rows={2}
            required
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div className="space-y-1">
            <label className="text-xs font-bold uppercase text-navy">Target Outcome *</label>
            <Input
              value={formData.outcome}
              onChange={(e) => setFormData({ ...formData, outcome: e.target.value })}
              required
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold uppercase text-navy">Topic Domain</label>
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
        </div>

        <div className="space-y-1">
          <label className="text-xs font-bold uppercase text-navy flex items-center justify-between">
            <span>Prerequisites (one per line)</span>
            <span className="text-[11px] text-muted-foreground">Line separated</span>
          </label>
          <Textarea
            value={formData.prerequisitesText}
            onChange={(e) => setFormData({ ...formData, prerequisitesText: e.target.value })}
            rows={3}
            placeholder="Basic computer literacy&#10;Basic command line navigation"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div className="space-y-1">
            <label className="text-xs font-bold uppercase text-navy">Final Practice Task Title *</label>
            <Input
              value={formData.final_task_title}
              onChange={(e) => setFormData({ ...formData, final_task_title: e.target.value })}
              required
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold uppercase text-navy">Final Practice Task Description *</label>
            <Textarea
              value={formData.final_task_description}
              onChange={(e) => setFormData({ ...formData, final_task_description: e.target.value })}
              rows={2}
              required
            />
          </div>
        </div>
      </div>

      {/* Ordered Steps Manager */}
      <div className="bg-card rounded-2xl border border-border p-6 sm:p-8 shadow-xs space-y-6">
        <div className="flex items-center justify-between border-b border-border pb-4">
          <div>
            <h2 className="text-lg font-bold text-navy flex items-center gap-2">
              <Compass className="w-5 h-5 text-sage-600" />
              <span>Ordered Progression Steps ({formData.steps.length})</span>
            </h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              Sequence of learning lessons leading to the final practice project.
            </p>
          </div>

          <Button
            size="sm"
            onClick={addStep}
            className="font-semibold text-xs flex items-center gap-1.5 shadow-sm"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Add Step</span>
          </Button>
        </div>

        <div className="space-y-4">
          {formData.steps.map((step, index) => (
            <div
              key={index}
              className="p-5 rounded-xl border border-border bg-cream-50/60 space-y-4"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-navy bg-cream-200 border border-border px-2 py-0.5 rounded">
                  Step {step.step_order}
                </span>

                <Button
                  size="sm"
                  variant="destructive"
                  onClick={() => removeStep(index)}
                  className="h-6 px-2 text-[11px]"
                >
                  <Trash2 className="w-3 h-3 mr-1" />
                  <span>Remove</span>
                </Button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="sm:col-span-2 space-y-1">
                  <label className="text-[11px] font-bold uppercase text-navy">Step Title</label>
                  <Input
                    value={step.title}
                    onChange={(e) => updateStep(index, { title: e.target.value })}
                    required
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-bold uppercase text-navy">Estimated Study Mins</label>
                  <Input
                    type="number"
                    value={step.estimated_minutes}
                    onChange={(e) =>
                      updateStep(index, { estimated_minutes: parseInt(e.target.value, 10) || 30 })
                    }
                    min={5}
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-bold uppercase text-navy">Step Description</label>
                <Textarea
                  value={step.description}
                  onChange={(e) => updateStep(index, { description: e.target.value })}
                  rows={2}
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[11px] font-bold uppercase text-navy">
                    Link to Catalog Resource
                  </label>
                  <select
                    value={step.resource_id || ""}
                    onChange={(e) => updateStep(index, { resource_id: e.target.value || null })}
                    className="w-full h-9 px-3 rounded-md border border-input bg-card text-xs text-navy font-semibold focus:outline-none focus:ring-1 focus:ring-navy"
                  >
                    <option value="">None (Custom external link)</option>
                    {resources.map((r) => (
                      <option key={r.id} value={r.id}>
                        {r.title} ({r.type})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-bold uppercase text-navy">
                    External Resource URL (Optional)
                  </label>
                  <Input
                    value={step.external_url || ""}
                    onChange={(e) => updateStep(index, { external_url: e.target.value || null })}
                    placeholder="https://..."
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
