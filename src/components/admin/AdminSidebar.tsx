"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { AdminSession } from "@/lib/auth";
import {
  Menu,
  X,
  LayoutDashboard,
  Layers,
  BookOpen,
  Bookmark,
  Compass,
  Home,
  FileText,
  Navigation,
  FolderOpen,
  Settings,
  LogOut,
  ExternalLink,
} from "lucide-react";

interface AdminSidebarProps {
  session: AdminSession;
}

export function AdminSidebar({ session }: AdminSidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);

  if (pathname === "/admin/login") {
    return null;
  }

  const navSections = [
    {
      group: "Core Catalog",
      items: [
        { label: "Dashboard", href: "/admin", icon: LayoutDashboard },
        { label: "Topics", href: "/admin/topics", icon: Layers },
        { label: "Resources", href: "/admin/resources", icon: Bookmark },
        { label: "Books & Chapters", href: "/admin/chapters", icon: BookOpen },
      ],
    },
    {
      group: "Editorial Pages",
      items: [
        { label: "Explore Homepage", href: "/admin/explore", icon: Home },
        { label: "About Page", href: "/admin/about", icon: FileText },
        {
          label: "Navigation & Footer",
          href: "/admin/navigation",
          icon: Navigation,
        },
      ],
    },
    {
      group: "Assets & System",
      items: [
        { label: "Media & Downloads", href: "/admin/assets", icon: FolderOpen },
        {
          label: "Site Settings & SEO",
          href: "/admin/settings",
          icon: Settings,
        },
      ],
    },
  ];

  const handleLogout = async () => {
    try {
      await fetch("/api/admin/logout", { method: "POST" });
      router.push("/admin/login");
      router.refresh();
    } catch (e) {
      console.error("Logout failed", e);
    }
  };

  const isCurrent = (href: string) => {
    if (href === "/admin") return pathname === "/admin";
    return pathname.startsWith(href);
  };

  return (
    <>
      <div className="flex h-[72px] items-center justify-between border-b border-border bg-white px-5 lg:hidden">
        <Link href="/admin" className="font-semibold text-navy">
          Rean{" "}
          <span className="font-normal text-muted-foreground">
            / Editorial studio
          </span>
        </Link>
        <button
          type="button"
          className="rounded-xl border border-border p-2.5"
          aria-label="Toggle editorial navigation"
          aria-expanded={open}
          aria-controls="editorial-navigation"
          onClick={() => setOpen(!open)}
        >
          {open ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>
      <aside
        id="editorial-navigation"
        className={`w-full lg:w-64 lg:sticky lg:top-0 lg:h-screen border-r border-border bg-white text-navy flex-col shrink-0 select-none ${open ? "flex" : "hidden lg:flex"}`}
      >
        {/* Top Branding */}
        <div className="p-4 sm:p-5 border-b border-border flex items-center justify-between">
          <Link href="/admin" className="focus:outline-none group">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 relative rounded-xl overflow-hidden border border-[#A8C8B2]/40 shadow-xs bg-[#343D4F] shrink-0 group-hover:border-[#A8C8B2] transition-colors">
                <Image
                  src="/images/logo.png"
                  alt="Rean Brand Logo"
                  fill
                  sizes="36px"
                  className="object-cover"
                  priority
                />
              </div>
              <div>
                <div className="font-extrabold text-sm tracking-tight text-navy flex items-center gap-1.5 leading-none">
                  <span>Rean Admin</span>
                  <span className="font-khmer text-xs text-sage-600 font-semibold">
                    រៀន
                  </span>
                </div>
                <span className="text-[10px] text-sage-600/80 uppercase tracking-wider font-mono font-medium mt-1 block">
                  Editorial Studio
                </span>
              </div>
            </div>
          </Link>
        </div>

        {/* Nav Menu */}
        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-6">
          {navSections.map((group) => (
            <div key={group.group} className="space-y-1">
              <span className="px-3 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                {group.group}
              </span>
              <div className="space-y-1 pt-1">
                {group.items.map((item) => {
                  const active = isCurrent(item.href);
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.href}
                      onClick={() => setOpen(false)}
                      aria-current={active ? "page" : undefined}
                      href={item.href}
                      className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-[13px] font-medium transition-all ${
                        active
                          ? "bg-sage-50 text-sage-700 font-bold shadow-xs"
                          : "text-muted-foreground hover:bg-cream-100 hover:text-navy"
                      }`}
                    >
                      <Icon
                        className={`w-4 h-4 shrink-0 ${active ? "text-sage-600" : "text-muted-foreground"}`}
                      />
                      <span>{item.label}</span>
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* User profile & bottom bar */}
        <div className="p-4 border-t border-border space-y-3 bg-cream-50">
          <div className="flex items-center justify-between text-xs">
            <div className="truncate pr-2">
              <p className="font-bold text-navy truncate text-xs">
                {session.displayName}
              </p>
              <p className="text-[10px] text-muted-foreground truncate">
                {session.email}
              </p>
            </div>
            <span className="px-1.5 py-0.5 rounded bg-sage-50 text-sage-600 text-[10px] font-mono capitalize">
              {session.role}
            </span>
          </div>

          <div className="flex items-center justify-between pt-1 border-t border-border">
            <a
              href="/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-xs text-sage-600 hover:text-navy transition-colors"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>Public Site</span>
            </a>

            <button
              onClick={handleLogout}
              className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-destructive transition-colors"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
