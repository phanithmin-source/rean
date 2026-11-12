import React from "react";
import Link from "next/link";
import Image from "next/image";
import { DEFAULT_PROFILE } from "@/lib/directory-content";
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
  Send,
  Briefcase,
  Code2,
  Mail,
  ArrowUpRight,
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

  const profile = {
    ...DEFAULT_PROFILE,
    ...Object.fromEntries(
      Object.entries(aboutData || {}).filter(
        ([key, value]) =>
          key.startsWith("profile") &&
          typeof value === "string" &&
          value.trim(),
      ),
    ),
  };
  const socialUrl = (value: string) => {
    try {
      const url = new URL(value);
      return url.protocol === "https:" || url.protocol === "http:"
        ? url.href
        : undefined;
    } catch {
      return undefined;
    }
  };
  const photo =
    profile.profilePhoto.startsWith("/") &&
    !profile.profilePhoto.startsWith("//")
      ? profile.profilePhoto
      : DEFAULT_PROFILE.profilePhoto;

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <PublicHeader navItems={navItems.header} />

      {isPreview && (
        <div className="bg-amber-100 border-b border-amber-300 py-2 px-4 text-center text-xs font-bold text-amber-900 flex items-center justify-center gap-2">
          <Eye className="w-4 h-4 text-amber-700" />
          <span>
            Editor Preview Mode: Viewing unpublished draft revision of the About
            page.
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
        <section className="border-b border-border/70 page-banner py-16 md:py-24">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-4">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-card border border-border/80 text-xs font-semibold text-navy mx-auto shadow-xs">
              <span className="font-khmer text-sage-700">អំពី រៀន</span>
              <span className="text-border">•</span>
              <span>The story behind the directory</span>
            </div>

            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold text-navy tracking-tight leading-tight">
              {aboutData?.pageTitle || "About Rean (រៀន)"}
            </h1>

            <p className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              Helping curious developers discover resources worth their time,
              thoughtfully selected tools, clear guides, and practical projects.
            </p>
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-5 pt-14 sm:px-8 lg:pt-20">
          <div className="grid overflow-hidden rounded-[2rem] border border-border bg-white shadow-soft md:grid-cols-[0.8fr_1.2fr]">
            <div className="relative min-h-[360px] bg-[#ECF3EE] sm:min-h-[440px]">
              <Image
                src={photo}
                alt={profile.profileName}
                fill
                priority
                sizes="(max-width: 767px) 100vw, 440px"
                className="object-cover object-[50%_30%]"
              />
              <div className="absolute bottom-5 left-5 rounded-full border border-white/60 bg-white/90 px-4 py-2 text-xs font-medium text-navy backdrop-blur-md">
                The person behind Rean
              </div>
            </div>
            <div className="flex flex-col justify-center p-7 sm:p-10 lg:p-12">
              <p className="eyebrow">Hello, nice to meet you</p>
              <h2 className="text-4xl font-semibold tracking-tight text-navy sm:text-5xl">
                {profile.profileName}
              </h2>
              <p className="mt-3 text-base font-medium text-sage-600">
                {profile.profileRole}
              </p>
              <p className="mt-6 text-sm leading-7 text-muted-foreground sm:text-base">
                {profile.profileBio}
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                {socialUrl(profile.profileGithub) && (
                  <a
                    href={socialUrl(profile.profileGithub)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="secondary-link !px-4 !py-2 !text-xs"
                  >
                    <Code2 size={15} /> GitHub <ArrowUpRight size={12} />
                  </a>
                )}
                {socialUrl(profile.profileTelegram) && (
                  <a
                    href={socialUrl(profile.profileTelegram)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="secondary-link !px-4 !py-2 !text-xs"
                  >
                    <Send size={15} /> Telegram <ArrowUpRight size={12} />
                  </a>
                )}
                {socialUrl(profile.profileLinkedIn) && (
                  <a
                    href={socialUrl(profile.profileLinkedIn)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="secondary-link !px-4 !py-2 !text-xs"
                  >
                    <Briefcase size={15} /> LinkedIn <ArrowUpRight size={12} />
                  </a>
                )}
              </div>
              <a
                href={`mailto:${encodeURIComponent(profile.profileEmail)}`}
                className="mt-5 inline-flex w-fit items-center gap-2 break-all text-sm text-muted-foreground hover:text-primary"
              >
                <Mail size={15} className="shrink-0" /> {profile.profileEmail}
              </a>
            </div>
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
                "Rean is for students, self-taught developers, and working engineers looking for useful resources without the noise."}
            </p>
          </div>

          {/* Learning Approach */}
          <div className="rounded-2xl border border-border bg-card p-8 sm:p-10 shadow-xs space-y-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-cream-200 text-navy">
                <Lightbulb className="w-6 h-6 text-navy-600" />
              </div>
              <h2 className="text-2xl font-bold text-navy">
                Learning Approach
              </h2>
            </div>
            <p className="text-base sm:text-lg text-navy/80 leading-relaxed">
              {aboutData?.learningApproach ||
                "Discover, evaluate, and put it into practice. We curate resources with clear explanations, useful examples, and an emphasis on fundamentals."}
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
          <div className="rounded-2xl border border-sage-200 bg-sage-50 p-8 sm:p-12 text-center space-y-6">
            <h3 className="text-2xl sm:text-3xl font-extrabold text-navy">
              Ready to Advance Your Software Journey?
            </h3>
            <p className="text-sm sm:text-base text-muted-foreground max-w-lg mx-auto leading-relaxed">
              Find a useful tool, explore a new topic, or pick up a practical
              guide. Your next resource is waiting.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
              <Link
                href="/#catalog"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-primary text-white font-semibold text-sm hover:bg-sage-700 shadow-sm transition-all"
              >
                <BookOpen className="w-4 h-4" />
                <span>
                  {aboutData?.ctaExploreLabel || "Explore Resource Catalog"}
                </span>
              </Link>
              <Link
                href="/topics"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-sage-200 text-navy-900 font-semibold text-sm hover:bg-sage-300 border border-sage-300 shadow-sm transition-all"
              >
                <Compass className="w-4 h-4 text-navy" />
                <span>Browse categories</span>
              </Link>
            </div>
          </div>
        </section>
      </main>

      <PublicFooter navItems={navItems.footer} settings={settings} />
    </div>
  );
}
