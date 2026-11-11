import React from "react";
import { redirect } from "next/navigation";
import { getAdminSession } from "@/lib/auth";
import { AdminSidebar } from "@/components/admin/AdminSidebar";

export const dynamic = "force-dynamic";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getAdminSession();

  // If session is missing, only allow the login route
  // We can let page-level checks or layout handle this.
  // Note: if user is on /admin/login, session can be null.
  return (
    <div className="min-h-screen bg-[#FAF9F5] text-navy flex flex-col md:flex-row">
      {session && <AdminSidebar session={session} />}
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        {children}
      </div>
    </div>
  );
}
