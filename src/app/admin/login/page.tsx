"use client";

import React, { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ReanLogo } from "@/components/brand/ReanLogo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Lock, Mail, AlertCircle, ArrowRight } from "lucide-react";

export default function AdminLoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const returnUrl = searchParams.get("returnUrl") || "/admin";

  const [email, setEmail] = useState("admin@rean.dev");
  const [password, setPassword] = useState("AdminPassword123!");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Login failed");
      }

      router.push(returnUrl);
      router.refresh();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-center items-center px-4 py-12 bg-background selection:bg-cyan/40">
      <div className="w-full max-w-md space-y-8">
        <div className="flex flex-col items-center text-center space-y-2">
          <ReanLogo size="lg" />
          <h1 className="text-2xl font-extrabold tracking-tight text-navy pt-4">
            Editor Sign In
          </h1>
          <p className="text-sm text-muted-foreground">
            Sign in with your editor credentials to manage catalog, pages, and downloads.
          </p>
        </div>

        <div className="bg-card p-8 rounded-2xl border border-border/80 shadow-xs">
          {error && (
            <div className="mb-6 p-3 rounded-xl bg-destructive/10 border border-destructive/20 flex items-center gap-2 text-destructive text-xs font-semibold">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-navy">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-2.5 w-4 h-4 text-navy/40" />
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@rean.dev"
                  className="pl-9"
                  required
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-navy">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-2.5 w-4 h-4 text-navy/40" />
                <Input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="pl-9"
                  required
                />
              </div>
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full mt-2 font-bold flex items-center justify-center gap-2"
            >
              <span>{loading ? "Verifying..." : "Sign in to Dashboard"}</span>
              <ArrowRight className="w-4 h-4" />
            </Button>
          </form>

          {/* Seed account hint */}
          <div className="mt-6 pt-5 border-t border-border text-center">
            <p className="text-xs text-muted-foreground">
              Default seeded administrator:
            </p>
            <p className="text-xs font-mono text-navy font-semibold mt-1">
              admin@rean.dev / AdminPassword123!
            </p>
          </div>
        </div>

        <div className="text-center">
          <a
            href="/"
            className="text-xs text-navy/70 hover:text-navy hover:underline"
          >
            &larr; Return to public platform
          </a>
        </div>
      </div>
    </div>
  );
}
