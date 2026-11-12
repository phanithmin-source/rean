import Link from "next/link";
import { ReanLogo } from "../brand/ReanLogo";
import type {
  NavigationItem,
  SiteSettings,
} from "@/lib/services/public-service";
import { ArrowUpRight, Heart } from "lucide-react";

export function PublicFooter({
  navItems,
  settings,
}: {
  navItems: NavigationItem[];
  settings?: SiteSettings;
}) {
  const links = navItems.length
    ? navItems
    : [
        { label: "Explore resources", url: "/" },
        { label: "All categories", url: "/topics" },
        { label: "About Rean", url: "/about" },
      ];
  return (
    <footer className="border-t border-border bg-[#F0F6F2]">
      <div className="mx-auto max-w-7xl px-5 py-12 sm:px-8 lg:py-16">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-[2fr_1fr_1fr]">
          <div>
            <ReanLogo size="md" />
            <p className="mt-5 max-w-sm text-sm leading-7 text-muted-foreground">
              A thoughtful collection of developer tools, books, guides, and
              practical resources. Less searching. More creating.
            </p>
            <p className="mt-5 inline-flex items-center gap-2 text-xs text-sage-700">
              <Heart size={13} /> Curated with care. Open to everyone.
            </p>
          </div>
          <div>
            <h2 className="mb-5 text-xs font-semibold text-navy">
              Find your next resource
            </h2>
            <ul className="space-y-3 text-sm text-muted-foreground">
              {[
                { label: "Programming", slug: "programming" },
                { label: "Frontend development", slug: "frontend" },
                { label: "Backend development", slug: "backend" },
                { label: "Databases", slug: "databases" },
                { label: "Developer tools", slug: "developer-tools" },
              ].map((item) => (
                <li key={item.slug}>
                  <Link
                    href={`/topics/${item.slug}`}
                    className="transition-colors hover:text-primary"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h2 className="mb-5 text-xs font-semibold text-navy">
              Around Rean
            </h2>
            <ul className="space-y-3 text-sm text-muted-foreground">
              {links.map((item) => (
                <li key={item.url + item.label}>
                  <Link
                    href={item.url}
                    className="transition-colors hover:text-primary"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
              <li>
                <Link
                  href="/admin"
                  className="inline-flex items-center gap-1 transition-colors hover:text-primary"
                >
                  Editorial studio <ArrowUpRight size={13} />
                </Link>
              </li>
            </ul>
          </div>
        </div>
        <div className="mt-12 flex flex-col justify-between gap-3 border-t border-border pt-6 text-[11px] leading-relaxed text-muted-foreground sm:flex-row">
          <p>
            {settings?.footer_copy ||
              "© 2026 Rean (រៀន). A little help for your next big idea."}
          </p>
          <span className="font-khmer">រៀនដើម្បីកសាងអនាគត</span>
        </div>
      </div>
    </footer>
  );
}
