import React from "react";
import Link from "next/link";
import { redirect } from "next/navigation";
import {
  getPageCopy,
  getNavigationItems,
  getSiteSettings,
} from "@/lib/services/public-service";
import { getAdminSession } from "@/lib/auth";
import { PublicHeader } from "@/components/layout/PublicHeader";
import { PublicFooter } from "@/components/layout/PublicFooter";
import { ReanLogo } from "@/components/brand/ReanLogo";
import {
  Target,
  Users,
  Lightbulb,
  ShieldCheck,
  Compass,
  ArrowRight,
  BookOpen,
  Eye,
  CheckCircle2,
} from "lucide-react";

export const dynamic = "force-dynamic";

interface AboutPageProps {
  searchParams: {
    preview?: string;
  };
}

export default async function AboutPage({ searchParams }: AboutPageProps) {
  const isPreviewRequested = searchParams.preview === "true";
  let isPreview = false;

  if (isPreviewRequested) {
    const admin = await getAdminSession();
    if (!admin) {
      redirect(`/admin/login?returnUrl=/about?preview=true`);
    }
    isPreview = true;
  }

  const [navItems, settings, aboutData] = await Promise.all([
    getNavigationItems(),
    getSiteSettings(),
    getPageCopy("about", { preview: isPreview }),
  ]);

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <PublicHeader navItems={navItems.header} />

      {isPreview && (
        <div className="bg-amber-100 border-b border-amber-300 py-2 px-4 text-center text-xs font-bold text-amber-900 flex items-center justify-center gap-2">
          <Eye className="w-4 h-4 text-amber-700" />
          <span>
            Editor Preview Mode: Viewing unpublished draft revision of the About page.
          </span>
          <Link
            href="/admin/about"
            className="underline ml-2 hover:text-amber-950"
          >
            Edit in Admin
          </Link>
        </div>
      )}

      <main className="flex-1">
        {/* Hero Banner */}
        <section className="border-b border-border bg-[#ECE8DC]/50 py-16 md:py-24">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-4">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-cream-200 border border-border text-xs font-semibold text-navy mx-auto">
              <span className="font-khmer text-sage-700">អំពី រៀន</span>
              <span>•</span>
              <span>Our Purpose & Pedagogy</span>
            </div>

            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold text-navy tracking-tight">
              {aboutData?.pageTitle || "About Rean (រៀន)"}
            </h1>

            <p className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              Empowering students and aspiring software developers through structured pathways,
              rigorous open curricula, and hands-on project craftsmanship.
            </p>
          </div>
        </section>

        {/* Content Pillars */}
        <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-16">
          {/* Mission */}
          <div className="rounded-2xl border border-border bg-card p-8 sm:p-10 shadow-xs space-y-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-sage-100 text-sage-800">
                <Target className="w-6 h-6 text-sage-700" />
              </div>
              <h2 className="text-2xl font-bold text-navy">Our Mission</h2>
            </div>
            <p className="text-base sm:text-lg text-navy/80 leading-relaxed">
              {aboutData?.mission ||
                "Rean (រៀន — Khmer for 'Learn') was founded to provide accessible, structured, and practical software engineering education. Our mission is to bridge the gap between academic theory and the daily realities of production software engineering."}
            </p>
          </div>

          {/* Audience */}
          <div className="rounded-2xl border border-border bg-card p-8 sm:p-10 shadow-xs space-y-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-cyan-100 text-cyan-800">
                <Users className="w-6 h-6 text-cyan-700" />
              </div>
              <h2 className="text-2xl font-bold text-navy">Who Rean Is For</h2>
            </div>
            <p className="text-base sm:text-lg text-navy/80 leading-relaxed">
              {aboutData?.audience ||
                "Rean is designed specifically for high school and university students, self-taught developers, and early-career software engineers who seek clear, disciplined learning pathways rather than fragmented tutorials."}
            </p>
          </div>

          {/* Learning Approach */}
          <div className="rounded-2xl border border-border bg-card p-8 sm:p-10 shadow-xs space-y-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-cream-200 text-navy">
                <Lightbulb className="w-6 h-6 text-navy-600" />
              </div>
              <h2 className="text-2xl font-bold text-navy">Learning Approach</h2>
            </div>
            <p className="text-base sm:text-lg text-navy/80 leading-relaxed">
              {aboutData?.learningApproach ||
                "We believe in project-driven mastery. Every concept is explained with direct code examples, and every learning path culminates in a real practice project. We prioritize fundamentals over fleeting hype."}
            </p>
          </div>

          {/* Selection Criteria */}
          <div className="rounded-2xl border border-border bg-card p-8 sm:p-10 shadow-xs space-y-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-emerald-100 text-emerald-800">
                <ShieldCheck className="w-6 h-6 text-emerald-700" />
              </div>
              <h2 className="text-2xl font-bold text-navy">
                How Resources Are Selected
              </h2>
            </div>
            <p className="text-base sm:text-lg text-navy/80 leading-relaxed">
              {aboutData?.selectionCriteria ||
                "Every book, guide, and tool included in the Rean catalog is vetted against rigorous criteria: clarity of explanation, adherence to modern industry standards, zero marketing fluff, and open accessibility."}
            </p>
          </div>

          {/* Action CTAs */}
          <div className="rounded-2xl border-2 border-sage-300 bg-[#ECE8DC]/60 p-8 sm:p-12 text-center space-y-6">
            <h3 className="text-2xl sm:text-3xl font-extrabold text-navy">
              Ready to Advance Your Software Journey?
            </h3>
            <p className="text-sm sm:text-base text-muted-foreground max-w-lg mx-auto leading-relaxed">
              Begin by exploring our full catalog of topics or choose a guided learning path to build your first portfolio project.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
              <Link
                href="/#catalog"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-navy text-white font-semibold text-sm hover:bg-navy-700 shadow-sm transition-all"
              >
                <BookOpen className="w-4 h-4" />
                <span>{aboutData?.ctaExploreLabel || "Explore Resource Catalog"}</span>
              </Link>
              <Link
                href="/paths"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-sage-200 text-navy-900 font-semibold text-sm hover:bg-sage-300 border border-sage-300 shadow-sm transition-all"
              >
                <Compass className="w-4 h-4 text-navy" />
                <span>{aboutData?.ctaPathsLabel || "View Learning Paths"}</span>
              </Link>
            </div>
          </div>
        </section>
      </main>

      <PublicFooter navItems={navItems.footer} settings={settings} />
    </div>
  );
}
