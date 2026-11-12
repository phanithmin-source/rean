"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Layers,
  PlusCircle,
  Edit2,
  Trash2,
  Check,
  AlertCircle,
  Eye,
  EyeOff,
  Code2,
} from "lucide-react";

interface TopicItem {
  id: string;
  slug: string;
  name: string;
  description: string;
  icon: string;
  display_order: number;
  is_visible: boolean;
  status: string;
  resource_count: string | number;
  published_resource_count: string | number;
}

export default function AdminTopicsPage() {
  const [topics, setTopics] = useState<TopicItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Form state
  const [editingTopic, setEditingTopic] = useState<TopicItem | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    description: "",
    icon: "Code2",
    display_order: 1,
    is_visible: true,
  });

  const fetchTopics = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/admin/topics");
      if (!res.ok) throw new Error("Failed to load topics");
      const data = await res.json();
      setTopics(data.topics || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTopics();
  }, []);

  const openCreate = () => {
    setEditingTopic(null);
    setFormData({
      name: "",
      slug: "",
      description: "",
      icon: "Code2",
      display_order: topics.length + 1,
      is_visible: true,
    });
    setIsCreating(true);
    setError(null);
    setSuccess(null);
  };

  const openEdit = (topic: TopicItem) => {
    setEditingTopic(topic);
    setFormData({
      name: topic.name,
      slug: topic.slug,
      description: topic.description,
      icon: topic.icon,
      display_order: topic.display_order,
      is_visible: topic.is_visible,
    });
    setIsCreating(true);
    setError(null);
    setSuccess(null);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    try {
      if (editingTopic) {
        const res = await fetch(`/api/admin/topics/${editingTopic.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...formData, publish: true }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Failed to update topic");
        setSuccess(`Topic "${formData.name}" updated and published!`);
      } else {
        const res = await fetch("/api/admin/topics", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Failed to create topic");
        setSuccess(`Topic "${formData.name}" created successfully!`);
      }

      setIsCreating(false);
      setEditingTopic(null);
      await fetchTopics();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleDelete = async (topic: TopicItem) => {
    if (!confirm(`Are you sure you want to delete topic "${topic.name}"?`)) return;
    setError(null);
    setSuccess(null);

    try {
      const res = await fetch(`/api/admin/topics/${topic.id}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to delete topic");
      setSuccess(`Topic "${topic.name}" deleted.`);
      await fetchTopics();
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
            <Layers className="w-7 h-7 text-sage-600" />
            <span>Learning Domains & Topics</span>
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Manage public categories, display ordering, icons, and visibility across catalog filters.
          </p>
        </div>

        <Button
          onClick={openCreate}
          className="font-semibold flex items-center gap-1.5 shadow-sm shrink-0"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Add New Topic</span>
        </Button>
      </div>

      {/* Alerts */}
      {error && (
        <div className="p-4 rounded-xl bg-destructive/10 border border-destructive/30 flex items-start gap-3 text-destructive text-sm font-semibold">
          <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <p className="font-bold">Action Blocked</p>
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

      {/* Topics Table */}
      <div className="rounded-2xl border border-border bg-card shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-border bg-cream-100/70 text-[11px] font-bold uppercase tracking-wider text-navy/70">
                <th className="py-3.5 px-4">Order</th>
                <th className="py-3.5 px-4">Topic Name</th>
                <th className="py-3.5 px-4">Slug</th>
                <th className="py-3.5 px-4">Icon</th>
                <th className="py-3.5 px-4">Resources</th>
                <th className="py-3.5 px-4">Visibility</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border text-xs">
              {loading ? (
                <tr>
                  <td colSpan={7} className="text-center py-10 text-muted-foreground">
                    Loading topics...
                  </td>
                </tr>
              ) : topics.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-10 text-muted-foreground">
                    No topics created yet.
                  </td>
                </tr>
              ) : (
                topics.map((topic) => (
                  <tr key={topic.id} className="hover:bg-cream-50/80 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-bold text-navy">
                      #{topic.display_order}
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-navy text-sm">{topic.name}</div>
                      <div className="text-[11px] text-muted-foreground line-clamp-1 max-w-sm">
                        {topic.description}
                      </div>
                    </td>
                    <td className="py-3.5 px-4 font-mono text-muted-foreground">
                      /topics/{topic.slug}
                    </td>
                    <td className="py-3.5 px-4 font-mono text-navy font-semibold">
                      {topic.icon}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="font-semibold text-navy">
                        {topic.resource_count} total
                      </span>{" "}
                      <span className="text-[11px] text-emerald-700 font-semibold">
                        ({topic.published_resource_count} live)
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      {topic.is_visible ? (
                        <span className="inline-flex items-center gap-1 text-emerald-800 bg-emerald-50 border border-emerald-300 px-2 py-0.5 rounded text-[10px] font-bold">
                          <Eye className="w-3 h-3" />
                          <span>Visible</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-gray-700 bg-gray-100 border border-gray-300 px-2 py-0.5 rounded text-[10px] font-bold">
                          <EyeOff className="w-3 h-3" />
                          <span>Hidden</span>
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => openEdit(topic)}
                          className="h-7 px-2.5 text-xs font-semibold"
                        >
                          <Edit2 className="w-3 h-3 mr-1" />
                          <span>Edit</span>
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleDelete(topic)}
                          className="h-7 px-2.5 text-xs font-semibold"
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

      {/* Create / Edit Modal */}
      {isCreating && (
        <div className="fixed inset-0 z-50 bg-primary/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-card rounded-2xl border border-border shadow-xl max-w-lg w-full p-6 sm:p-8 space-y-5 animate-in zoom-in-95">
            <div className="border-b border-border pb-4">
              <h2 className="text-xl font-bold text-navy">
                {editingTopic ? `Edit Topic: ${editingTopic.name}` : "Create New Topic"}
              </h2>
              <p className="text-xs text-muted-foreground mt-0.5">
                Configure topic slug, display name, description, and catalog placement.
              </p>
            </div>

            <form onSubmit={handleSave} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold uppercase text-navy">Name</label>
                  <Input
                    value={formData.name}
                    onChange={(e) => {
                      const name = e.target.value;
                      const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
                      setFormData({
                        ...formData,
                        name,
                        slug: editingTopic ? formData.slug : slug,
                      });
                    }}
                    placeholder="e.g. Cloud & DevOps"
                    required
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold uppercase text-navy">Slug</label>
                  <Input
                    value={formData.slug}
                    onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                    placeholder="e.g. cloud-devops"
                    required
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold uppercase text-navy">Description</label>
                <Textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Summarize what this domain covers..."
                  rows={3}
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold uppercase text-navy">Lucide Icon Name</label>
                  <Input
                    value={formData.icon}
                    onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                    placeholder="Code2, Server, Database..."
                    required
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold uppercase text-navy">Display Order</label>
                  <Input
                    type="number"
                    value={formData.display_order}
                    onChange={(e) => setFormData({ ...formData, display_order: parseInt(e.target.value, 10) || 1 })}
                    min={1}
                    required
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="topic_visible"
                  checked={formData.is_visible}
                  onChange={(e) => setFormData({ ...formData, is_visible: e.target.checked })}
                  className="rounded border-border text-navy focus:ring-navy h-4 w-4"
                />
                <label htmlFor="topic_visible" className="text-xs font-bold text-navy cursor-pointer">
                  Visible in public explore filters and topics index
                </label>
              </div>

              <div className="pt-4 border-t border-border flex items-center justify-end gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsCreating(false)}
                >
                  Cancel
                </Button>
                <Button type="submit">
                  {editingTopic ? "Update & Publish Topic" : "Create Topic"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
