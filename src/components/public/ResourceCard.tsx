import Link from "next/link";
import type { ResourceItem } from "@/lib/services/public-service";
import {
  BookOpen,
  FileCode,
  Compass,
  FileText,
  Wrench,
  Download,
  ArrowUpRight,
  FolderGit2,
} from "lucide-react";

const formats = {
  book: {
    label: "Book",
    icon: BookOpen,
    color: "bg-[#EAF3ED] text-[#5C9375]",
    symbol: "{ }",
  },
  guide: {
    label: "Guide",
    icon: Compass,
    color: "bg-[#EDF2FB] text-[#708DB9]",
    symbol: "</>",
  },
  documentation: {
    label: "Documentation",
    icon: FileText,
    color: "bg-[#F1EEFA] text-[#9480BA]",
    symbol: "//",
  },
  course: {
    label: "Course",
    icon: FileCode,
    color: "bg-[#FBF3E5] text-[#B49A64]",
    symbol: "( )",
  },
  tool: {
    label: "Tool",
    icon: Wrench,
    color: "bg-[#EAF5F5] text-[#659C9F]",
    symbol: ">_",
  },
  project: {
    label: "Project",
    icon: FolderGit2,
    color: "bg-[#F9EDEE] text-[#B3818A]",
    symbol: "++",
  },
};
export function ResourceCard({ resource }: { resource: ResourceItem }) {
  const meta = formats[resource.type] || formats.guide;
  const Icon = meta.icon;
  return (
    <article className="resource-card group">
      <div className={`resource-art ${meta.color}`} aria-hidden="true">
        <span className="absolute left-5 top-4 font-mono text-[10px] uppercase tracking-widest opacity-70">
          {resource.topic_name || "Resource"}
        </span>
        <span className="flex h-[72px] w-24 rotate-[-6deg] items-center justify-center rounded-xl border border-white/90 bg-white/65 shadow-sm transition-transform duration-300 group-hover:rotate-0">
          <Icon size={35} strokeWidth={1.3} />
        </span>
        <span className="absolute bottom-3 right-5 font-mono text-3xl font-light opacity-25">
          {meta.symbol}
        </span>
      </div>
      <div className="flex flex-1 flex-col p-5 sm:p-6">
        <div className="mb-3 flex items-center justify-between gap-3">
          <span className="text-[10px] font-semibold uppercase tracking-wider text-sage-600">
            {meta.label}
          </span>
          <span className="rounded-full bg-cream-100 px-2.5 py-1 text-[10px] font-medium capitalize text-muted-foreground">
            {resource.difficulty}
          </span>
        </div>
        <h3 className="text-[17px] font-semibold leading-snug tracking-tight text-navy">
          <Link
            href={`/resources/${resource.slug}`}
            className="outline-none after:absolute after:inset-0 after:content-[''] group-hover:text-primary"
          >
            {resource.title}
          </Link>
        </h3>
        <p className="mt-3 line-clamp-3 text-[13px] leading-6 text-muted-foreground">
          {resource.summary}
        </p>
        {resource.curation_note && (
          <p className="mt-4 line-clamp-2 border-l-2 border-sage-200 pl-3 text-[11px] leading-5 text-muted-foreground">
            <span className="font-medium text-sage-700">
              Why we picked it:{" "}
            </span>
            {resource.curation_note}
          </p>
        )}
        <div className="mt-auto pt-5">
          <div className="flex items-center justify-between gap-2 border-t border-border pt-4">
            <div className="flex min-w-0 flex-wrap gap-1.5">
              {resource.tags?.slice(0, 2).map((tag) => (
                <span
                  key={tag}
                  className="rounded-md bg-cream-100 px-2 py-1 text-[10px] text-muted-foreground"
                >
                  {tag}
                </span>
              ))}
            </div>
            <div className="flex shrink-0 items-center gap-2 text-sage-600">
              {resource.has_chapters && (
                <BookOpen size={14} aria-label="Read online" />
              )}
              {resource.download_asset_id && (
                <Download size={14} aria-label="Downloads available" />
              )}
              <ArrowUpRight
                size={17}
                className="transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
              />
            </div>
          </div>
        </div>
      </div>
    </article>
  );
}
