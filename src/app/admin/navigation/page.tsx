"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Navigation,
  PlusCircle,
  Edit2,
  Trash2,
  Check,
  AlertCircle,
  ArrowUp,
  ArrowDown,
  Layers,
} from "lucide-react";

interface NavItem {
  id: string;
  label: string;
  url: string;
  display_order: number;
  position: "header" | "footer" | "both";
  is_published: boolean;
}

export default function AdminNavigationPage() {
  const [items, setItems] = useState<NavItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [activeItem, setActiveItem] = useState<NavItem | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    label: "",
    url: "",
    display_order: 1,
    position: "header" as "header" | "footer" | "both",
    is_published: true,
  });

  const fetchNav = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/admin/navigation");
      const data = await res.json();
      setItems(data.items || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNav();
  }, []);

  const openCreate = () => {
    setActiveItem(null);
    setFormData({
      label: "",
      url: "/",
      display_order: items.length + 1,
      position: "header",
      is_published: true,
    });
    setIsModalOpen(true);
    setError(null);
    setSuccess(null);
  };

  const openEdit = (item: NavItem) => {
    setActiveItem(item);
    setFormData({
      label: item.label,
      url: item.url,
      display_order: item.display_order,
      position: item.position,
      is_published: item.is_published,
    });
    setIsModalOpen(true);
    setError(null);
    setSuccess(null);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    try {
      const payload = {
        id: activeItem ? activeItem.id : undefined,
        ...formData,
      };

      const res = await fetch("/api/admin/navigation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to save link");

      setSuccess(`Navigation link "${formData.label}" saved and live!`);
      setIsModalOpen(false);
      setActiveItem(null);
      await fetchNav();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleDelete = async (item: NavItem) => {
    if (!confirm(`Delete navigation link "${item.label}"?`)) return;
    setError(null);
    try {
      const res = await fetch(`/api/admin/navigation/${item.id}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to delete link");
      setSuccess(`Link "${item.label}" deleted.`);
      await fetchNav();
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <div className="p-6 sm:p-10 max-w-5xl w-full mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-navy tracking-tight flex items-center gap-2.5">
            <Navigation className="w-7 h-7 text-sage-600" />
            <span>Navigation & Footer Links</span>
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Manage header and footer navigation menus, display ordering, and URLs without modifying code.
          </p>
        </div>

        <Button
          onClick={openCreate}
          className="font-semibold flex items-center gap-1.5 shadow-sm shrink-0"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Add Navigation Link</span>
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

      {/* Nav Items Table */}
      <div className="rounded-2xl border border-border bg-card shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-border bg-cream-100/70 text-[11px] font-bold uppercase tracking-wider text-navy/70">
                <th className="py-3.5 px-4">Order</th>
                <th className="py-3.5 px-4">Label</th>
                <th className="py-3.5 px-4">Destination URL</th>
                <th className="py-3.5 px-4">Menu Position</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border text-xs">
              {loading ? (
                <tr>
                  <td colSpan={6} className="text-center py-10 text-muted-foreground">
                    Loading links...
                  </td>
                </tr>
              ) : items.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-10 text-muted-foreground">
                    No navigation items found.
                  </td>
                </tr>
              ) : (
                items.map((item) => (
                  <tr key={item.id} className="hover:bg-cream-50/80 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-bold text-navy">
                      #{item.display_order}
                    </td>
                    <td className="py-3.5 px-4 font-bold text-navy text-sm">
                      {item.label}
                    </td>
                    <td className="py-3.5 px-4 font-mono text-muted-foreground">
                      {item.url}
                    </td>
                    <td className="py-3.5 px-4 uppercase font-semibold text-navy/80 text-[11px]">
                      {item.position}
                    </td>
                    <td className="py-3.5 px-4">
                      {item.is_published ? (
                        <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 text-[10px] font-bold border border-emerald-300">
                          Live
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded bg-gray-100 text-gray-800 text-[10px] font-bold border border-gray-300">
                          Draft
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => openEdit(item)}
                          className="h-7 px-2.5 text-xs font-semibold"
                        >
                          <Edit2 className="w-3 h-3 mr-1" />
                          <span>Edit</span>
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleDelete(item)}
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

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-navy/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-card rounded-2xl border border-border shadow-xl max-w-md w-full p-6 sm:p-8 space-y-4 animate-in zoom-in-95">
            <h2 className="text-xl font-bold text-navy border-b border-border pb-3">
              {activeItem ? `Edit Link: ${activeItem.label}` : "Add Navigation Link"}
            </h2>

            <form onSubmit={handleSave} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-bold uppercase text-navy">Link Label *</label>
                <Input
                  value={formData.label}
                  onChange={(e) => setFormData({ ...formData, label: e.target.value })}
                  placeholder="e.g. Tutorials"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold uppercase text-navy">Destination URL *</label>
                <Input
                  value={formData.url}
                  onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                  placeholder="e.g. /tutorials or https://..."
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold uppercase text-navy">Placement</label>
                  <select
                    value={formData.position}
                    onChange={(e) => setFormData({ ...formData, position: e.target.value as any })}
                    className="w-full h-10 px-3 rounded-md border border-input bg-card text-xs text-navy font-semibold focus:outline-none focus:ring-1 focus:ring-navy cursor-pointer"
                  >
                    <option value="header">Header Only</option>
                    <option value="footer">Footer Only</option>
                    <option value="both">Both Header & Footer</option>
                  </select>
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

              <div className="pt-4 border-t border-border flex items-center justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" variant="sage" className="font-bold">
                  Save Navigation Link
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
