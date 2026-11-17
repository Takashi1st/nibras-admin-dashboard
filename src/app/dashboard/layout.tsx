"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { Sidebar } from "@/components/layout/Sidebar";
import { Loader2 } from "lucide-react";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { user, isAdmin, loading } = useAuth();

  useEffect(() => {
    if (!loading) {
      if (!user || !isAdmin) {
        router.push("/login");
      }
    }
  }, [user, isAdmin, loading, router]);

  if (loading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-[#0b0f19] text-on-surface">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 text-primary animate-spin" />
          <p className="text-xs text-on-surface-muted font-medium">جاري فحص اتصال السحابة...</p>
        </div>
      </div>
    );
  }

  if (!user || !isAdmin) {
    return null;
  }

  return (
    <div className="min-h-screen bg-[#0b0f19] text-on-surface">
      {/* Persistent Sidebar */}
      <Sidebar />

      {/* Main Workspace Canvas with offset for right sidebar */}
      <div className="mr-72 min-h-screen flex flex-col">
        {children}
      </div>
    </div>
  );
}
