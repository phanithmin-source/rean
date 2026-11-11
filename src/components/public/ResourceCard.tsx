import React from "react";
import Link from "next/link";
import { ResourceItem } from "@/lib/services/public-service";
import { Badge } from "../ui/badge";
import {
  BookOpen,
  FileCode,
  Compass,
  FileText,
  Wrench,
  Download,
  ExternalLink,
  ChevronRight,
  FolderGit2,
} from "lucide-react";

interface ResourceCardProps {
  resource: ResourceItem;
}

export function ResourceCard({ resource }: ResourceCardProps) {
  const getTypeBadge = (type: string) => {
    switch (type) {
      case "book":
        return { label: "Handbook / Book", icon: BookOpen, variant: "sage" as const };
      case "guide":
        return { label: "Guide", icon: Compass, variant: "cyan" as const };
      case "documentation":
        return { label: "Documentation", icon: FileText, variant: "outline" as const };
      case "course":
        return { label: "Course / Tutorial", icon: FileCode, variant: "secondary" as const };
      case "tool":
        return { label: "Developer Tool", icon: Wrench, variant: "secondary" as const };
      case "project":
        return { label: "Practice Project", icon: FolderGit2, variant: "sage" as const };
      default:
        return { label: type, icon: FileCode, variant: "outline" as const };
    }
  };

  const getDifficultyBadge = (difficulty: string) => {
    switch (difficulty) {
      case "beginner":
        return { label: "Beginner", className: "bg-emerald-50 text-emerald-800 border-emerald-200/80" };
      case "intermediate":
        return { label: "Intermediate", className: "bg-sky-50 text-sky-800 border-sky-200/80" };
      case "advanced":
        return { label: "Advanced", className: "bg-amber-50 text-amber-800 border-amber-200/80" };
      default:
        return { label: difficulty, className: "bg-gray-50 text-gray-800 border-gray-200/80" };
    }
  };

  const typeMeta = getTypeBadge(resource.type);
  const diffMeta = getDifficultyBadge(resource.difficulty);
  const IconComponent = typeMeta.icon;

  return (
    <div className="group relative flex flex-col justify-between rounded-2xl border border-border/80 bg-card p-6 shadow-xs hover:shadow-md hover:border-sage-400/80 hover:-translate-y-0.5 transition-all duration-200">
      <div>
        {/* Top Badges */}
        <div className="flex items-center justify-between gap-2 mb-3.5">
          <Badge variant={typeMeta.variant} className="flex items-center gap-1.5 py-0.5 px-2.5 rounded-full text-xs font-semibold">
            <IconComponent className="w-3.5 h-3.5" />
            <span>{typeMeta.label}</span>
          </Badge>

          <span className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full border ${diffMeta.className}`}>
            {diffMeta.label}
          </span>
        </div>

        {/* Title */}
        <h3 className="text-lg font-extrabold text-navy group-hover:text-navy-900 transition-colors line-clamp-1 tracking-tight">
          <Link href={`/resources/${resource.slug}`} className="focus:outline-none">
            <span className="absolute inset-0" aria-hidden="true" />
            {resource.title}
          </Link>
        </h3>

        {/* Topic indicator */}
        {resource.topic_name && (
          <p className="text-xs font-semibold text-sage-600 mt-1 uppercase tracking-wider">
            {resource.topic_name}
          </p>
        )}

        {/* Summary */}
        <p className="text-sm text-muted-foreground mt-2.5 line-clamp-2 leading-relaxed">
          {resource.summary}
        </p>

        {/* Curation note if present */}
        {resource.curation_note && (
          <div className="mt-3.5 text-xs bg-sage-50/60 border border-sage-200/60 p-2.5 rounded-xl text-navy/80 italic line-clamp-2">
            &ldquo;{resource.curation_note}&rdquo;
          </div>
        )}
      </div>

      {/* Bottom Metadata & Actions */}
      <div className="mt-6 pt-4 border-t border-border/70 flex items-center justify-between gap-2 relative z-10">
        <div className="flex flex-wrap items-center gap-1.5">
          {resource.tags &&
            resource.tags.slice(0, 3).map((tag) => (
              <span
                key={tag}
                className="text-[10px] font-mono px-2 py-0.5 bg-cream-100 text-navy/70 border border-border/60 rounded-md"
              >
                #{tag}
              </span>
            ))}
        </div>

        <div className="flex items-center gap-2 text-xs font-semibold text-navy shrink-0">
          {resource.has_chapters && (
            <span className="inline-flex items-center gap-1 text-sage-700 font-medium">
              <BookOpen className="w-3.5 h-3.5" />
              <span>Read Online</span>
            </span>
          )}

          {resource.download_asset_id && (
            <span className="inline-flex items-center gap-1 text-navy/80 font-medium bg-cream-100 border border-border/60 px-2 py-0.5 rounded-md">
              <Download className="w-3 h-3 text-navy" />
              <span>Files</span>
            </span>
          )}

          <ChevronRight className="w-4 h-4 text-navy/40 group-hover:text-navy group-hover:translate-x-0.5 transition-all" />
        </div>
      </div>
    </div>
  );
}
