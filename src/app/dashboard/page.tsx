"use client";

import React, { useEffect, useState } from "react";
import { Header } from "@/components/layout/Header";
import {
  Users,
  CreditCard,
  HelpCircle,
  BookOpen,
  ArrowUpRight,
  TrendingUp,
  FileSpreadsheet,
  GraduationCap,
  Sparkles,
  ChevronLeft,
  CheckCircle2,
} from "lucide-react";
import Link from "next/link";
import {
  getDashboardStats,
  SUBJECTS_LIST,
  getStudentsList,
} from "@/lib/firestore-admin";
import { StudentUser } from "@/types";

export default function DashboardOverviewPage() {
  const [stats, setStats] = useState({
    totalStudents: 0,
    activeSubscriptions: 0,
    subscriptionBreakdown: { shariaCount: 0, arabicCount: 0, bothCount: 0 },
    totalQuestions: 0,
  });
  const [recentStudents, setRecentStudents] = useState<StudentUser[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const s = await getDashboardStats();
        setStats(s);
        const allStudents = await getStudentsList();
        setRecentStudents(allStudents.slice(0, 5));
      } catch (err) {
        console.error("Error loading dashboard data:", err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  return (
    <div className="flex-1 flex flex-col pb-12">
      <Header
        title="لوحة المتابعة والمؤشرات الأكاديمية"
        subtitle="العام الدراسي 2024 / 2025"
        breadcrumbs={[
          { title: "الرئيسية", href: "/dashboard" },
          { title: "نظرة عامة" },
        ]}
        actionLabel="إدارة الاشتراكات والطلاب"
        actionHref="/dashboard/students"
      />

      <main className="p-8 space-y-8 max-w-7xl mx-auto w-full">
        {/* KPI Metrics Cards */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Metric 1 */}
          <div className="rounded-xl bg-surface-low border border-white/5 p-5 shadow-sm transition-all hover:border-white/10">
            <div className="flex items-center justify-between text-on-surface-muted text-xs mb-2">
              <span>إجمالي الطلاب</span>
              <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-on-surface">
                <Users className="w-4 h-4 text-primary" />
              </div>
            </div>
            <div className="text-2xl font-bold text-on-surface font-mono tracking-tight">
              {stats.totalStudents}{" "}
              <span className="text-xs font-normal text-on-surface-muted font-sans">
                طالب
              </span>
            </div>
            <div className="mt-3 pt-2.5 border-t border-white/5 flex items-center justify-between text-[11px] text-on-surface-muted">
              <span>حسابات مسجلة</span>
              <span className="text-secondary font-medium">سحابي مباشر</span>
            </div>
          </div>

          {/* Metric 2 */}
          <div className="rounded-xl bg-surface-low border border-white/5 p-5 shadow-sm transition-all hover:border-white/10">
            <div className="flex items-center justify-between text-on-surface-muted text-xs mb-2">
              <span>الاشتراكات النشطة</span>
              <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-on-surface">
                <CreditCard className="w-4 h-4 text-secondary" />
              </div>
            </div>
            <div className="text-2xl font-bold text-on-surface font-mono tracking-tight">
              {stats.activeSubscriptions}{" "}
              <span className="text-xs font-normal text-on-surface-muted font-sans">
                مشترك
              </span>
            </div>
            <div className="mt-3 pt-2.5 border-t border-white/5 flex items-center justify-between text-[11px] text-on-surface-muted">
              <span>
                شرعي: {stats.subscriptionBreakdown.shariaCount} | عربي:{" "}
                {stats.subscriptionBreakdown.arabicCount}
              </span>
              <span className="text-primary font-medium">مدفوع</span>
            </div>
          </div>

          {/* Metric 3 */}
          <div className="rounded-xl bg-surface-low border border-white/5 p-5 shadow-sm transition-all hover:border-white/10">
            <div className="flex items-center justify-between text-on-surface-muted text-xs mb-2">
              <span>بنك الأسئلة المعتمد</span>
              <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-on-surface">
                <HelpCircle className="w-4 h-4 text-primary" />
              </div>
            </div>
            <div className="text-2xl font-bold text-on-surface font-mono tracking-tight">
              {stats.totalQuestions}{" "}
              <span className="text-xs font-normal text-on-surface-muted font-sans">
                سؤال
              </span>
            </div>
            <div className="mt-3 pt-2.5 border-t border-white/5 flex items-center justify-between text-[11px] text-on-surface-muted">
              <span>موزع على 8 مواد</span>
              <span className="text-secondary font-medium">مفحوص آلياً</span>
            </div>
          </div>

          {/* Metric 4 */}
          <div className="rounded-xl bg-surface-low border border-white/5 p-5 shadow-sm transition-all hover:border-white/10">
            <div className="flex items-center justify-between text-on-surface-muted text-xs mb-2">
              <span>المواد والمناهج الأزهرية</span>
              <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-on-surface">
                <BookOpen className="w-4 h-4 text-secondary" />
              </div>
            </div>
            <div className="text-2xl font-bold text-on-surface font-mono tracking-tight">
              8{" "}
              <span className="text-xs font-normal text-on-surface-muted font-sans">
                مواد أساسية
              </span>
            </div>
            <div className="mt-3 pt-2.5 border-t border-white/5 flex items-center justify-between text-[11px] text-on-surface-muted">
              <span>4 علوم شرعية • 4 علوم عربية</span>
              <span className="text-primary font-medium">بطاقات متخصصة</span>
            </div>
          </div>
        </section>

        {/* Studio Subjects Grid */}
        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold text-on-surface">
                استوديو المناهج والمواد الـ 8
              </h2>
              <p className="text-xs text-on-surface-muted">
                اختر أي مادة لفتح استوديو الدرس وبناء بطاقات الشرح والأسئلة المتخصصة
              </p>
            </div>
            <Link
              href="/dashboard/curriculum"
              className="text-xs text-primary hover:underline flex items-center gap-1 font-semibold"
            >
              <span>فتح استوديو المناهج</span>
              <ChevronLeft className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {SUBJECTS_LIST.map((sub) => (
              <Link
                key={sub.name}
                href={`/dashboard/curriculum?subject=${encodeURIComponent(
                  sub.name
                )}`}
                className="p-4 rounded-xl bg-surface-low border border-white/5 hover:border-primary/40 hover:bg-surface-container transition-all group flex flex-col justify-between min-h-[110px]"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div
                      className="w-2.5 h-2.5 rounded-full"
                      style={{ backgroundColor: sub.color }}
                    />
                    <span className="text-sm font-bold text-on-surface group-hover:text-primary transition-colors">
                      {sub.title}
                    </span>
                  </div>
                  <span
                    className={`text-[10px] px-2 py-0.5 rounded font-medium ${
                      sub.path === "sharia"
                        ? "bg-secondary/10 text-secondary border border-secondary/20"
                        : "bg-primary/10 text-primary border border-primary/20"
                    }`}
                  >
                    {sub.path === "sharia" ? "علوم شرعية" : "علوم عربية"}
                  </span>
                </div>
                <div className="flex items-center justify-between text-[11px] text-on-surface-muted pt-2 border-t border-white/5">
                  <span>إدارة الوحدات والدروس</span>
                  <ChevronLeft className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 group-hover:text-primary transition-opacity" />
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* Recent Students Table Preview */}
        <section className="rounded-xl bg-surface-low border border-white/5 p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-white/5 pb-4">
            <div>
              <h3 className="text-sm font-bold text-on-surface">
                أحدث الطلاب المسجلين
              </h3>
              <p className="text-xs text-on-surface-muted">
                متابعة سريعة لحسابات الطلاب ومستويات التقدم
              </p>
            </div>
            <Link
              href="/dashboard/students"
              className="text-xs text-primary hover:underline flex items-center gap-1 font-semibold"
            >
              <span>عرض سجل الطلاب كاملاً</span>
              <ChevronLeft className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-right text-xs">
              <thead>
                <tr className="border-b border-white/5 text-on-surface-muted">
                  <th className="py-2 px-3 font-semibold">الطالب</th>
                  <th className="py-2 px-3 font-semibold">البريد الإلكتروني</th>
                  <th className="py-2 px-3 font-semibold">النقاط (XP)</th>
                  <th className="py-2 px-3 font-semibold">القلوب</th>
                  <th className="py-2 px-3 font-semibold">حالة الاشتراك</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {recentStudents.length === 0 ? (
                  <tr>
                    <td
                      colSpan={5}
                      className="py-6 text-center text-on-surface-muted"
                    >
                      لا توجد بيانات طلاب حالياً أو جاري التحميل...
                    </td>
                  </tr>
                ) : (
                  recentStudents.map((st) => (
                    <tr
                      key={st.uid}
                      className="hover:bg-surface-container/50 transition-colors"
                    >
                      <td className="py-3 px-3 font-semibold text-on-surface">
                        {st.displayName || "طالب جديد"}
                      </td>
                      <td className="py-3 px-3 text-on-surface-muted font-mono">
                        {st.email}
                      </td>
                      <td className="py-3 px-3 font-bold text-primary font-mono">
                        {st.xp || 0} XP
                      </td>
                      <td className="py-3 px-3 text-error font-medium font-mono">
                        {st.hearts ?? 6}/6 ❤️
                      </td>
                      <td className="py-3 px-3">
                        {st.isPremium ? (
                          <span className="px-2 py-0.5 rounded-md bg-secondary/15 text-secondary border border-secondary/30 text-[10px] font-bold">
                            مشترك نشط
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-md bg-white/5 text-on-surface-muted text-[10px]">
                            مجاني / غير مفعل
                          </span>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>
      </main>
    </div>
  );
}
