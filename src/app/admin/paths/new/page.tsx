"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  ArrowLeft,
  Compass,
  CheckCircle2,
  AlertCircle,
  PlusCircle,
  Trash2,
} from "lucide-react";

export default function NewLearningPathPage() {
  const router = useRouter();

  const [topics, setTopics] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    title: "",
    slug: "",
    summary: "",
    outcome: "",
    topic_id: "",
    final_task_title: "",
    final_task_description: "",
  });

  useEffect(() => {
    fetch("/api/admin/topics")
      .then((res) => res.json())
      .then((d) => {
        setTopics(d.topics || []);
        if (d.topics?.length > 0) {
          setFormData((prev) => ({ ...prev, topic_id: d.topics[0].id }));
        }
      });
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await fetch("/api/admin/paths", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to create learning path");

      router.push(`/admin/paths/${data.id}`);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 sm:p-10 max-w-4xl w-full mx-auto space-y-6">
      <div className="flex items-center justify-between border-b border-border pb-6">
        <div>
          <Link
            href="/admin/paths"
            className="text-xs font-semibold text-navy/70 hover:underline flex items-center gap-1 mb-2"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Paths</span>
          </Link>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-navy tracking-tight flex items-center gap-2">
            <Compass className="w-7 h-7 text-sage-600" />
            <span>Create Learning Path</span>
          </h1>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-destructive/10 border border-destructive/30 flex items-start gap-3 text-destructive text-sm font-semibold">
          <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
          <p>{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-card rounded-2xl border border-border p-6 sm:p-8 shadow-xs space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div className="space-y-1">
            <label className="text-xs font-bold uppercase text-navy">Title *</label>
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
              placeholder="e.g. Fullstack Foundations"
              required
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold uppercase text-navy">Slug *</label>
            <Input
              value={formData.slug}
              onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
              placeholder="e.g. fullstack-foundations"
              required
            />
          </div>
        </div>

        <div className="space-y-1">
          <label className="text-xs font-bold uppercase text-navy">Summary *</label>
          <Textarea
            value={formData.summary}
            onChange={(e) => setFormData({ ...formData, summary: e.target.value })}
            placeholder="A clear overview of the journey and skills acquired..."
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
              placeholder="What tangible capabilities will learners graduate with?"
              required
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold uppercase text-navy">Domain Topic</label>
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

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div className="space-y-1">
            <label className="text-xs font-bold uppercase text-navy">Final Practice Task Title *</label>
            <Input
              value={formData.final_task_title}
              onChange={(e) => setFormData({ ...formData, final_task_title: e.target.value })}
              placeholder="e.g. Distributed Task Queue"
              required
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold uppercase text-navy">Final Practice Task Description *</label>
            <Textarea
              value={formData.final_task_description}
              onChange={(e) => setFormData({ ...formData, final_task_description: e.target.value })}
              placeholder="Detailed description of the portfolio project deliverable..."
              rows={3}
              required
            />
          </div>
        </div>

        <div className="pt-4 border-t border-border flex justify-end">
          <Button type="submit" disabled={loading} className="font-bold">
            Create Path & Add Steps &rarr;
          </Button>
        </div>
      </form>
    </div>
  );
}
