"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ReanLogo } from "../brand/ReanLogo";
import { NavigationItem } from "@/lib/services/public-service";
import { Menu, X, Search, Compass, BookOpen, Layers } from "lucide-react";

interface PublicHeaderProps {
  navItems: NavigationItem[];
}

export function PublicHeader({ navItems }: PublicHeaderProps) {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const defaultLinks = [
    { label: "Explore", url: "/" },
    { label: "Learning Paths", url: "/paths" },
    { label: "Programming", url: "/topics/programming" },
    { label: "About", url: "/about" },
  ];

  const links = navItems && navItems.length > 0 ? navItems : defaultLinks;

  const isActive = (url: string) => {
    if (url === "/" && pathname === "/") return true;
    if (url !== "/" && pathname.startsWith(url)) return true;
    return false;
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border/70 bg-background/90 backdrop-blur-md supports-[backdrop-filter]:bg-background/80 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Real Logo with crisp presentation */}
        <Link
          href="/"
          className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-navy/30 rounded-xl p-0.5"
          aria-label="Rean Home"
        >
          <ReanLogo size="sm" />
        </Link>

        {/* Desktop Navigation */}
        <nav
          className="hidden md:flex items-center gap-1.5"
          aria-label="Main Navigation"
        >
          {links.map((item) => {
            const active = isActive(item.url);
            return (
              <Link
                key={item.url + item.label}
                href={item.url}
                className={`px-3.5 py-1.5 rounded-full text-xs font-semibold tracking-wide transition-all duration-150 ${
                  active
                    ? "bg-navy text-white shadow-xs"
                    : "text-navy/75 hover:text-navy hover:bg-cream-200/80"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Right side Actions */}
        <div className="flex items-center gap-2.5">
          <Link
            href="/#catalog"
            className="hidden sm:inline-flex items-center gap-1.5 text-xs font-semibold px-3.5 py-1.5 rounded-full border border-border/80 bg-card hover:bg-cream-100 hover:border-navy/30 text-navy transition-all shadow-xs"
          >
            <Search className="w-3.5 h-3.5 text-navy-400" />
            <span>Search Catalog</span>
          </Link>

          <Link
            href="/paths"
            className="hidden lg:inline-flex items-center gap-1.5 text-xs font-semibold px-3.5 py-1.5 rounded-full bg-sage-100 border border-sage-300/80 hover:bg-sage-200 text-navy-900 transition-all shadow-xs"
          >
            <Compass className="w-3.5 h-3.5 text-sage-700" />
            <span>Start a Path</span>
          </Link>

          {/* Mobile hamburger */}
          <button
            type="button"
            className="md:hidden inline-flex items-center justify-center p-2 rounded-lg text-navy hover:bg-cream-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-navy/30"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-expanded={mobileMenuOpen}
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? (
              <X className="w-5 h-5" />
            ) : (
              <Menu className="w-5 h-5" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-border bg-card px-4 pt-3 pb-6 space-y-3 shadow-lg animate-in slide-in-from-top-2">
          <div className="flex flex-col space-y-1">
            {links.map((item) => {
              const active = isActive(item.url);
              return (
                <Link
                  key={item.url + item.label}
                  href={item.url}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`px-3 py-2 rounded-md text-base font-medium flex items-center justify-between ${
                    active
                      ? "bg-navy text-white font-semibold"
                      : "text-navy hover:bg-cream-200"
                  }`}
                >
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </div>

          <div className="pt-3 border-t border-border flex flex-col gap-2">
            <Link
              href="/#catalog"
              onClick={() => setMobileMenuOpen(false)}
              className="w-full flex items-center justify-center gap-2 py-2 rounded-md border border-border text-sm font-medium text-navy bg-cream-100"
            >
              <Search className="w-4 h-4 text-navy-400" />
              <span>Search Catalog</span>
            </Link>
            <Link
              href="/paths"
              onClick={() => setMobileMenuOpen(false)}
              className="w-full flex items-center justify-center gap-2 py-2 rounded-md text-sm font-semibold text-navy-900 bg-sage-300"
            >
              <BookOpen className="w-4 h-4 text-navy" />
              <span>Explore Learning Paths</span>
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
