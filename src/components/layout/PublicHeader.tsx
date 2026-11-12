"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ReanLogo } from "../brand/ReanLogo";
import type { NavigationItem } from "@/lib/services/public-service";
import { Menu, X, Search, ArrowUpRight } from "lucide-react";

export function PublicHeader({ navItems }: { navItems: NavigationItem[] }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  useEffect(() => {
    setOpen(false);
  }, [pathname]);
  useEffect(() => {
    const close = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", close);
    return () => window.removeEventListener("keydown", close);
  }, []);
  const links = navItems.length
    ? navItems
    : [
        { label: "Explore", url: "/" },
        { label: "Categories", url: "/topics" },
        { label: "About", url: "/about" },
      ];
  const active = (url: string) =>
    url === "/" ? pathname === "/" : pathname.startsWith(url);
  return (
    <header className="sticky top-0 z-40 border-b border-border/80 bg-white/95 backdrop-blur-xl">
      <div className="mx-auto flex h-[72px] max-w-7xl items-center justify-between gap-4 px-5 sm:px-8">
        <Link href="/" aria-label="Rean home" className="shrink-0 rounded-xl">
          <ReanLogo size="sm" />
        </Link>
        <nav
          className="hidden items-center gap-1 lg:flex"
          aria-label="Main navigation"
        >
          {links.map((item) => (
            <Link
              key={item.url + item.label}
              href={item.url}
              aria-current={active(item.url) ? "page" : undefined}
              className={`rounded-xl px-4 py-2.5 text-[13px] font-medium transition-colors ${active(item.url) ? "bg-sage-50 text-sage-700" : "text-muted-foreground hover:bg-cream-100 hover:text-navy"}`}
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-3">
          <Link
            href="/#catalog"
            className="hidden items-center gap-2 text-xs font-medium text-muted-foreground hover:text-primary sm:inline-flex"
          >
            <Search size={16} /> Search resources
          </Link>
          <Link
            href="/?type=tool#catalog"
            className="primary-link hidden !min-h-10 !px-4 !py-2 !text-xs xl:inline-flex"
          >
            Discover tools <ArrowUpRight size={14} />
          </Link>
          <button
            type="button"
            onClick={() => setOpen(!open)}
            aria-expanded={open}
            aria-controls="mobile-navigation"
            aria-label={open ? "Close navigation" : "Open navigation"}
            className="flex h-11 w-11 items-center justify-center rounded-xl border border-border bg-white text-navy lg:hidden"
          >
            {open ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>
      {open && (
        <nav
          id="mobile-navigation"
          aria-label="Mobile navigation"
          className="border-t border-border bg-white px-5 py-4 shadow-md lg:hidden"
        >
          <div className="mx-auto max-w-7xl space-y-1">
            {links.map((item) => (
              <Link
                key={item.url + item.label}
                href={item.url}
                onClick={() => setOpen(false)}
                aria-current={active(item.url) ? "page" : undefined}
                className={`block rounded-xl px-4 py-3 text-sm font-medium ${active(item.url) ? "bg-sage-50 text-sage-700" : "text-navy hover:bg-cream-100"}`}
              >
                {item.label}
              </Link>
            ))}
            <Link
              href="/#catalog"
              onClick={() => setOpen(false)}
              className="primary-link mt-3 w-full"
            >
              <Search size={16} /> Search resources
            </Link>
          </div>
        </nav>
      )}
    </header>
  );
}
