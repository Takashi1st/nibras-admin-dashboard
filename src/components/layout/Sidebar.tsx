"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  BookOpen,
  HelpCircle,
  Users,
  LogOut,
  ChevronLeft,
  GraduationCap,
  Sparkles,
} from "lucide-react";
import { useAuth } from "@/lib/auth-context";

export function Sidebar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();

  const platformNav = [
    {
      title: "لوحة المتابعة والمؤشرات",
      href: "/dashboard",
      icon: LayoutDashboard,
      active: pathname === "/dashboard",
    },
    {
      title: "الطلاب والاشتراكات اليدوية",
      href: "/dashboard/students",
      icon: Users,
      active: pathname.startsWith("/dashboard/students"),
    },
  ];

  const contentNav = [
    {
      title: "استوديو المناهج والدروس",
      href: "/dashboard/curriculum",
      icon: BookOpen,
      active: pathname.startsWith("/dashboard/curriculum"),
    },
    {
      title: "بنك الأسئلة ومركز الإكسل",
      href: "/dashboard/questions",
      icon: HelpCircle,
      active: pathname.startsWith("/dashboard/questions"),
      badge: "مركزي",
    },
  ];

  const isContentActive =
    pathname.startsWith("/dashboard/curriculum") ||
    pathname.startsWith("/dashboard/questions");

  return (
    <aside className="fixed top-0 right-0 h-screen w-72 z-20 border-l border-white/5 bg-[#0e121d] flex flex-col justify-between p-4 select-none">
      {/* Brand Header */}
      <div className="flex flex-col gap-6">
        <div className="flex items-center gap-3 px-2 pt-2 border-b border-white/5 pb-5">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-container/20 to-primary/10 border border-primary/30 flex items-center justify-center text-primary font-bold text-xl shadow-sm">
            <span>ن</span>
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-1.5">
              <span className="text-sm font-bold text-on-surface tracking-wide">
                منصة نبراس
              </span>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-primary/10 text-primary font-medium border border-primary/20">
                الأزهرية
              </span>
            </div>
            <span className="text-[11px] text-on-surface-muted">
              لوحة التحكم والإشراف
            </span>
          </div>
        </div>

        {/* Section 1: Platform & Students */}
        <div className="flex flex-col gap-1.5">
          <div className="px-3 py-1 text-[11px] font-semibold text-outline tracking-wider flex items-center justify-between">
            <span>إدارة المنصة والطلاب</span>
            {!isContentActive && (
              <span className="w-1.5 h-1.5 rounded-full bg-secondary" />
            )}
          </div>
          <nav className="flex flex-col gap-1" aria-label="إدارة المنصة">
            {platformNav.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-medium transition-all ${
                    item.active
                      ? "bg-surface-container text-primary font-bold border border-primary/20 shadow-sm"
                      : "text-on-surface-variant hover:text-on-surface hover:bg-surface-low"
                  }`}
                >
                  <Icon
                    className={`w-4 h-4 ${
                      item.active ? "text-primary" : "text-outline"
                    }`}
                  />
                  <span className="flex-1">{item.title}</span>
                  {item.active && (
                    <ChevronLeft className="w-3.5 h-3.5 text-primary opacity-80" />
                  )}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Section 2: Curriculum & Content Studio */}
        <div className="flex flex-col gap-1.5">
          <div className="px-3 py-1 text-[11px] font-semibold text-outline tracking-wider flex items-center justify-between">
            <span>استوديو المحتوى والمناهج</span>
            {isContentActive && (
              <span className="w-1.5 h-1.5 rounded-full bg-primary" />
            )}
          </div>
          <nav className="flex flex-col gap-1" aria-label="استوديو المحتوى">
            {contentNav.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-medium transition-all ${
                    item.active
                      ? "bg-surface-container text-primary font-bold border border-primary/20 shadow-sm"
                      : "text-on-surface-variant hover:text-on-surface hover:bg-surface-low"
                  }`}
                >
                  <Icon
                    className={`w-4 h-4 ${
                      item.active ? "text-primary" : "text-outline"
                    }`}
                  />
                  <span className="flex-1">{item.title}</span>
                  {item.badge && (
                    <span className="text-[10px] px-2 py-0.5 rounded-md bg-surface-highest text-on-surface-muted border border-white/5">
                      {item.badge}
                    </span>
                  )}
                  {item.active && (
                    <ChevronLeft className="w-3.5 h-3.5 text-primary opacity-80" />
                  )}
                </Link>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Footer / Admin Account Status */}
      <div className="pt-4 border-t border-white/5 flex flex-col gap-3">
        <div className="flex items-center justify-between px-2">
          <div className="flex items-center gap-2.5 overflow-hidden">
            <div className="w-8 h-8 rounded-lg bg-surface-high flex items-center justify-center text-on-surface font-semibold text-xs border border-white/5 shrink-0">
              {user?.email?.charAt(0).toUpperCase() || "أ"}
            </div>
            <div className="flex flex-col overflow-hidden text-right">
              <span className="text-xs font-semibold text-on-surface truncate">
                المشرف العام
              </span>
              <span className="text-[10px] text-on-surface-muted truncate font-mono">
                {user?.email || "abdoark7@gmail.com"}
              </span>
            </div>
          </div>
          <button
            onClick={() => logout()}
            title="تسجيل الخروج"
            className="p-1.5 rounded-lg text-outline hover:text-error hover:bg-surface-low transition-colors cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
  );
}
