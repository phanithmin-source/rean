"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  FolderOpen,
  UploadCloud,
  FileText,
  FileArchive,
  Image as ImageIcon,
  Trash2,
  Check,
  AlertCircle,
  ExternalLink,
  ShieldAlert,
  Info,
} from "lucide-react";

interface AssetRecord {
  id: string;
  filename: string;
  original_name: string;
  mime_type: string;
  byte_size: string | number;
  public_url: string;
  is_draft_only: boolean;
  used_in_published_resources: string | number;
  used_in_draft_resources: string | number;
  created_at: string;
}

export default function AdminAssetsPage() {
  const [assets, setAssets] = useState<AssetRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isDraftOnly, setIsDraftOnly] = useState(false);

  const [inspectingAsset, setInspectingAsset] = useState<any | null>(null);

  const fetchAssets = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/admin/assets");
      const data = await res.json();
      setAssets(data.assets || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAssets();
  }, []);

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile) return;

    setError(null);
    setSuccess(null);
    setUploading(true);

    try {
      const formData = new FormData();
      formData.append("file", selectedFile);
      formData.append("isDraftOnly", isDraftOnly ? "true" : "false");

      const res = await fetch("/api/admin/assets/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Upload failed");

      setSuccess(`File "${selectedFile.name}" uploaded successfully!`);
      setSelectedFile(null);
      await fetchAssets();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setUploading(false);
    }
  };

  const handleInspect = async (asset: AssetRecord) => {
    setError(null);
    try {
      const res = await fetch(`/api/admin/assets/${asset.id}`);
      const data = await res.json();
      setInspectingAsset({ ...asset, ...data });
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleDelete = async (asset: AssetRecord) => {
    if (!confirm(`Are you sure you want to delete file "${asset.original_name}"?`)) return;

    setError(null);
    setSuccess(null);

    try {
      const res = await fetch(`/api/admin/assets/${asset.id}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Delete failed");

      setSuccess(`Asset "${asset.original_name}" deleted.`);
      if (inspectingAsset?.id === asset.id) setInspectingAsset(null);
      await fetchAssets();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const getAssetIcon = (mime: string) => {
    if (mime.includes("pdf")) return <FileText className="w-5 h-5 text-red-500" />;
    if (mime.includes("zip") || mime.includes("tar")) return <FileArchive className="w-5 h-5 text-amber-500" />;
    if (mime.includes("image")) return <ImageIcon className="w-5 h-5 text-sky-500" />;
    return <FileText className="w-5 h-5 text-navy/60" />;
  };

  return (
    <div className="p-6 sm:p-10 max-w-7xl w-full mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-navy tracking-tight flex items-center gap-2.5">
            <FolderOpen className="w-7 h-7 text-sage-600" />
            <span>Media & Download Assets</span>
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Upload and manage PDFs, source archives, and illustrations. View dependencies before deleting.
          </p>
        </div>
      </div>

      {/* Alerts */}
      {error && (
        <div className="p-4 rounded-xl bg-destructive/10 border border-destructive/30 flex items-start gap-3 text-destructive text-sm font-semibold">
          <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <p className="font-bold">Deletion Blocked (Integrity Guard)</p>
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

      {/* Upload Box */}
      <form
        onSubmit={handleUpload}
        className="p-6 rounded-2xl border-2 border-dashed border-border bg-card shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4"
      >
        <div className="flex items-center gap-4 w-full sm:w-auto">
          <div className="p-3 rounded-xl bg-cream-200 text-navy shrink-0">
            <UploadCloud className="w-6 h-6 text-navy/70" />
          </div>
          <div className="space-y-1 w-full sm:w-auto">
            <h3 className="text-sm font-bold text-navy">
              Upload PDF Handbook, Code ZIP, or Graphic Asset
            </h3>
            <p className="text-xs text-muted-foreground">
              Allowed formats: .pdf, .zip, .tar.gz, .png, .jpg, .webp (max 50MB)
            </p>
            <input
              type="file"
              onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
              className="text-xs text-navy file:mr-3 file:py-1.5 file:px-3 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-primary file:text-white hover:file:bg-navy-700 cursor-pointer pt-1"
            />
          </div>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
          <div className="flex items-center gap-1.5 mr-2">
            <input
              type="checkbox"
              id="draft_only_check"
              checked={isDraftOnly}
              onChange={(e) => setIsDraftOnly(e.target.checked)}
              className="rounded border-border text-navy focus:ring-navy h-4 w-4"
            />
            <label htmlFor="draft_only_check" className="text-xs font-semibold text-navy cursor-pointer">
              Draft-only asset (Protected from public access)
            </label>
          </div>

          <Button
            type="submit"
            disabled={!selectedFile || uploading}
            className="font-bold shrink-0"
          >
            {uploading ? "Uploading..." : "Upload File"}
          </Button>
        </div>
      </form>

      {/* Assets Table */}
      <div className="rounded-2xl border border-border bg-card shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-border bg-cream-100/70 text-[11px] font-bold uppercase tracking-wider text-navy/70">
                <th className="py-3.5 px-4">File</th>
                <th className="py-3.5 px-4">Type</th>
                <th className="py-3.5 px-4">Size</th>
                <th className="py-3.5 px-4">Usage in Resources</th>
                <th className="py-3.5 px-4">Access Level</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border text-xs">
              {loading ? (
                <tr>
                  <td colSpan={6} className="text-center py-10 text-muted-foreground">
                    Loading media files...
                  </td>
                </tr>
              ) : assets.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-10 text-muted-foreground">
                    No files uploaded yet.
                  </td>
                </tr>
              ) : (
                assets.map((asset) => {
                  const pubCount = parseInt(String(asset.used_in_published_resources), 10);
                  const draftCount = parseInt(String(asset.used_in_draft_resources), 10);
                  return (
                    <tr key={asset.id} className="hover:bg-cream-50/80 transition-colors">
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          {getAssetIcon(asset.mime_type)}
                          <div>
                            <div className="font-bold text-navy text-sm">
                              {asset.original_name}
                            </div>
                            <div className="text-[11px] text-muted-foreground font-mono">
                              {asset.filename}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 font-mono text-muted-foreground text-[11px]">
                        {asset.mime_type}
                      </td>
                      <td className="py-3.5 px-4 font-mono text-navy font-semibold">
                        {(Number(asset.byte_size) / 1024).toFixed(0)} KB
                      </td>
                      <td className="py-3.5 px-4">
                        <button
                          onClick={() => handleInspect(asset)}
                          className="hover:underline flex items-center gap-1 font-semibold text-navy"
                        >
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              pubCount > 0
                                ? "bg-emerald-50 text-emerald-800 border border-emerald-300"
                                : draftCount > 0
                                ? "bg-amber-50 text-amber-800 border border-amber-300"
                                : "bg-gray-100 text-gray-700"
                            }`}
                          >
                            {pubCount > 0
                              ? `Used in ${pubCount} live resource(s)`
                              : draftCount > 0
                              ? `Used in ${draftCount} draft(s)`
                              : "Not in use"}
                          </span>
                        </button>
                      </td>
                      <td className="py-3.5 px-4">
                        {asset.is_draft_only ? (
                          <span className="px-2 py-0.5 rounded bg-amber-100 text-amber-900 text-[10px] font-bold border border-amber-300">
                            Draft Protected
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 text-[10px] font-bold border border-emerald-300">
                            Public Download
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <a
                            href={asset.public_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded border border-border bg-card hover:bg-cream-200 text-navy font-semibold"
                            title="Open / Download"
                          >
                            <ExternalLink className="w-3 h-3" />
                            <span>Open</span>
                          </a>

                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleDelete(asset)}
                            className="h-7 px-2 text-xs font-semibold"
                            title="Delete Asset"
                          >
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Dependency Inspector Modal */}
      {inspectingAsset && (
        <div className="fixed inset-0 z-50 bg-primary/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-card rounded-2xl border border-border shadow-xl max-w-md w-full p-6 space-y-4 animate-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <h2 className="text-lg font-bold text-navy flex items-center gap-2">
                <Info className="w-5 h-5 text-sage-600" />
                <span>Asset Usage Details</span>
              </h2>
              <button
                onClick={() => setInspectingAsset(null)}
                className="text-navy/60 hover:text-navy text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <p className="font-bold text-navy text-sm">
                {inspectingAsset.original_name}
              </p>

              <div>
                <span className="font-bold text-navy block mb-1">
                  Published Resources Using This Asset:
                </span>
                {inspectingAsset.usedInPublished && inspectingAsset.usedInPublished.length > 0 ? (
                  <ul className="space-y-1 pl-4 list-disc text-emerald-800">
                    {inspectingAsset.usedInPublished.map((r: any) => (
                      <li key={r.id}>
                        <a
                          href={`/resources/${r.slug}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="hover:underline font-semibold"
                        >
                          {r.title}
                        </a>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-muted-foreground italic">None</p>
                )}
              </div>

              <div>
                <span className="font-bold text-navy block mb-1">
                  Draft Resources Using This Asset:
                </span>
                {inspectingAsset.usedInDraft && inspectingAsset.usedInDraft.length > 0 ? (
                  <ul className="space-y-1 pl-4 list-disc text-amber-800">
                    {inspectingAsset.usedInDraft.map((r: any) => (
                      <li key={r.id}>
                        <Link
                          href={`/admin/resources/${r.id}`}
                          className="hover:underline font-semibold"
                        >
                          {r.title} (Draft)
                        </Link>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-muted-foreground italic">None</p>
                )}
              </div>

              {!inspectingAsset.canDelete && (
                <div className="p-3 rounded-lg bg-amber-50 border border-amber-200 text-amber-900 font-medium">
                  ⚠️ This asset is locked from deletion because active resources reference it. Remove or replace it in those resources first.
                </div>
              )}
            </div>

            <div className="pt-3 border-t border-border flex justify-end">
              <Button onClick={() => setInspectingAsset(null)} size="sm">
                Close
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
