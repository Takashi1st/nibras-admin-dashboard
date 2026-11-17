"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";

export default function Home() {
  const router = useRouter();
  const { user, isAdmin, loading } = useAuth();

  useEffect(() => {
    if (!loading) {
      if (user && isAdmin) {
        router.push("/dashboard");
      } else {
        router.push("/login");
      }
    }
  }, [user, isAdmin, loading, router]);

  return (
    <div className="flex h-screen w-full items-center justify-center bg-surface-lowest text-on-surface">
      <div className="flex flex-col items-center gap-3">
        <div className="w-12 h-12 rounded-xl bg-primary-container border border-primary/50 flex items-center justify-center text-surface-lowest font-bold text-2xl animate-pulse">
          ن
        </div>
        <p className="text-sm text-on-surface-variant font-medium">جاري التحقق من الصلاحيات والاتصال السحابي...</p>
      </div>
    </div>
  );
}
