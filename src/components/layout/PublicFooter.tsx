import React from "react";
import Link from "next/link";
import { ReanLogo } from "../brand/ReanLogo";
import { NavigationItem, SiteSettings } from "@/lib/services/public-service";
import { ShieldCheck, BookOpen, Compass, ExternalLink } from "lucide-react";

interface PublicFooterProps {
  navItems: NavigationItem[];
  settings?: SiteSettings;
}

export function PublicFooter({ navItems, settings }: PublicFooterProps) {
  const footerLinks =
    navItems && navItems.length > 0
      ? navItems
      : [
          { label: "Explore", url: "/" },
          { label: "Learning Paths", url: "/paths" },
          { label: "About Rean", url: "/about" },
          { label: "Admin Portal", url: "/admin" },
        ];

  return (
    <footer className="w-full border-t border-border/70 bg-[#F3EFE6]/70 mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 lg:gap-12">
          {/* Brand Col */}
          <div className="md:col-span-2 space-y-4">
            <ReanLogo size="md" />
            <p className="text-sm text-navy/75 max-w-md leading-relaxed">
              Rean (រៀន) is a dedicated software development learning and resource platform.
              Curated for students and early-career developers to discover top resources, follow structured learning paths, and master practical coding skills.
            </p>
            <div className="pt-2 flex items-center gap-2 text-xs font-semibold text-sage-700">
              <span className="inline-block w-2 h-2 rounded-full bg-emerald-500"></span>
              <span>100% Free & Open Developer Curriculum</span>
            </div>
          </div>

          {/* Catalog & Roadmaps */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-navy">
              Learning Domains
            </h4>
            <ul className="space-y-2 text-sm text-navy/80">
              <li>
                <Link
                  href="/topics/programming"
                  className="hover:text-navy hover:underline text-navy/70"
                >
                  Programming & OOP
                </Link>
              </li>
              <li>
                <Link
                  href="/topics/backend"
                  className="hover:text-navy hover:underline text-navy/70"
                >
                  Backend & REST APIs
                </Link>
              </li>
              <li>
                <Link
                  href="/topics/frontend"
                  className="hover:text-navy hover:underline text-navy/70"
                >
                  Frontend Foundations
                </Link>
              </li>
              <li>
                <Link
                  href="/topics/databases"
                  className="hover:text-navy hover:underline text-navy/70"
                >
                  Databases & SQL
                </Link>
              </li>
              <li>
                <Link
                  href="/topics/developer-tools"
                  className="hover:text-navy hover:underline text-navy/70"
                >
                  Developer Tools & Git
                </Link>
              </li>
            </ul>
          </div>

          {/* Quick Links & Platform */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-navy">
              Platform & Editorial
            </h4>
            <ul className="space-y-2 text-sm text-navy/80">
              {footerLinks.map((item) => (
                <li key={item.url + item.label}>
                  <Link
                    href={item.url}
                    className="hover:text-navy hover:underline text-navy/70"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
              <li className="pt-2">
                <Link
                  href="/admin"
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-navy/90 hover:text-navy bg-cream-200 hover:bg-cream-300 px-2.5 py-1 rounded border border-border"
                >
                  <ShieldCheck className="w-3.5 h-3.5 text-navy" />
                  <span>Editor Dashboard</span>
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-12 pt-6 border-t border-border/80 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-navy/60">
          <p>{settings?.footer_copy || "© 2026 Rean (រៀន). Dedicated to software craftsmanship and student empowerment."}</p>
          <div className="flex items-center gap-4">
            <span>Built with Next.js, TypeScript & PostgreSQL</span>
            <span className="hidden sm:inline">•</span>
            <span className="font-khmer">រៀនដើម្បីកសាងអនាគត</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
