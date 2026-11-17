"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { Lock, Mail, ShieldAlert, ArrowLeft, Loader2 } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    const res = await login(email, password);
    if (res.success) {
      router.push("/dashboard");
    } else {
      setError(res.error || "تعذر تسجيل الدخول.");
      setSubmitting(false);
    }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center bg-surface-lowest px-4 py-12">
      <div className="fixed inset-0 pointer-events-none lux-glow-top z-0" />
      <div className="fixed inset-0 pointer-events-none lux-glow-bottom z-0" />

      <div className="relative z-10 w-full max-w-md rounded-2xl bg-surface-low/95 border border-outline-variant/40 p-8 shadow-2xl backdrop-blur-xl">
        {/* Brand Icon & Heading */}
        <div className="flex flex-col items-center text-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary-container via-surface-high to-surface border border-primary/50 flex items-center justify-center shadow-lg shadow-primary-container/20 mb-4">
            <span className="text-3xl font-extrabold text-primary">ن</span>
          </div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-2xl font-bold text-on-surface">منصة نبراس الأزهرية</h1>
            <span className="text-[10px] px-2 py-0.5 rounded bg-primary/10 text-primary border border-primary/30 font-bold">
              لوحة الإشراف
            </span>
          </div>
          <p className="text-xs text-on-surface-variant max-w-xs">
            تسجيل دخول المشرف العام لإدارة المناهج، بنك الأسئلة، وتفعيل الاشتراكات
          </p>
        </div>

        {error && (
          <div className="mb-6 flex items-start gap-3 rounded-xl bg-error-container/20 border border-error/30 p-3.5 text-xs text-error">
            <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-on-surface-variant mb-1.5">
              البريد الإلكتروني للمشرف
            </label>
            <div className="relative">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="abdoark7@gmail.com"
                className="w-full rounded-xl bg-surface-container border border-outline-variant/30 pr-10 pl-4 py-2.5 text-sm text-on-surface placeholder:text-outline/60 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary transition-all"
              />
              <Mail className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-outline" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-on-surface-variant mb-1.5">
              كلمة المرور
            </label>
            <div className="relative">
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full rounded-xl bg-surface-container border border-outline-variant/30 pr-10 pl-4 py-2.5 text-sm text-on-surface placeholder:text-outline/60 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary transition-all"
              />
              <Lock className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-outline" />
            </div>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full mt-2 flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-primary-container to-primary py-3 text-sm font-bold text-surface-lowest shadow-lg shadow-primary-container/20 hover:brightness-105 active:scale-[0.99] disabled:opacity-50 transition-all cursor-pointer"
          >
            {submitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>جاري تسجيل الدخول...</span>
              </>
            ) : (
              <>
                <span>دخول إلى لوحة التحكم</span>
                <ArrowLeft className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        <div className="mt-8 pt-4 border-t border-outline-variant/20 text-center">
          <p className="text-[11px] text-outline">
            تقتصر هذه اللوحة على الإدارة التعليمية لمنظومة نبراس الأزهرية
          </p>
        </div>
      </div>
    </div>
  );
}
