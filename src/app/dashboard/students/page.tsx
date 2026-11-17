"use client";

import React, { useState, useEffect } from "react";
import { Header } from "@/components/layout/Header";
import {
  getStudentsList,
  activateStudentSubscription,
  deactivateStudentSubscription,
  refillHearts,
  resetStudentMistakes,
} from "@/lib/firestore-admin";
import { StudentUser } from "@/types";
import {
  Users,
  Search,
  CreditCard,
  Heart,
  CheckCircle2,
  XCircle,
  X,
  RotateCcw,
  Sparkles,
  Phone,
  FileText,
  Calendar,
} from "lucide-react";

export default function StudentsManagementPage() {
  const [students, setStudents] = useState<StudentUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterPlan, setFilterPlan] = useState<string>("all");

  // Manual Activation Modal State
  const [selectedStudent, setSelectedStudent] = useState<StudentUser | null>(
    null
  );
  const [selectedPaths, setSelectedPaths] = useState<("sharia" | "arabic")[]>([
    "sharia",
    "arabic",
  ]);
  const [durationDays, setDurationDays] = useState<number>(120);
  const [transferPhone, setTransferPhone] = useState("");
  const [adminNotes, setAdminNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [actionSuccess, setActionSuccess] = useState("");

  useEffect(() => {
    loadStudents();
  }, []);

  async function loadStudents() {
    setLoading(true);
    try {
      const data = await getStudentsList();
      setStudents(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  const filteredStudents = students.filter((st) => {
    if (filterPlan === "active" && !st.isPremium) return false;
    if (filterPlan === "free" && st.isPremium) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const match =
        (st.displayName || "").toLowerCase().includes(q) ||
        (st.email || "").toLowerCase().includes(q) ||
        (st.uid || "").toLowerCase().includes(q);
      if (!match) return false;
    }
    return true;
  });

  // Handle Manual Activation Confirm
  async function handleConfirmActivation(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedStudent) return;
    setSubmitting(true);
    try {
      await activateStudentSubscription(
        selectedStudent.uid,
        selectedPaths,
        durationDays
      );
      setActionSuccess(
        `تم تفعيل الاشتراك للطالب (${selectedStudent.displayName}) بنجاح!`
      );
      setSelectedStudent(null);
      await loadStudents();
      setTimeout(() => setActionSuccess(""), 4000);
    } catch (err) {
      console.error(err);
      alert("حدث خطأ أثناء تفعيل الاشتراك.");
    } finally {
      setSubmitting(false);
    }
  }

  // Quick Action: Refill Hearts
  async function handleRefillHearts(student: StudentUser) {
    await refillHearts(student.uid);
    setActionSuccess(`تم إعادة شحن القلوب (6 ❤️) للطالب: ${student.displayName}`);
    await loadStudents();
    setTimeout(() => setActionSuccess(""), 3000);
  }

  // Quick Action: Reset Mistakes
  async function handleResetMistakes(student: StudentUser) {
    await resetStudentMistakes(student.uid);
    setActionSuccess(`تم تفريغ سجل الأخطاء للطالب: ${student.displayName}`);
    await loadStudents();
    setTimeout(() => setActionSuccess(""), 3000);
  }

  // Quick Action: Deactivate
  async function handleDeactivate(student: StudentUser) {
    if (
      !confirm(
        `هل أنت متأكد من إلغاء تفعيل اشتراك الطالب: ${student.displayName}؟`
      )
    )
      return;
    await deactivateStudentSubscription(student.uid);
    setActionSuccess(`تم إلغاء اشتراك الطالب: ${student.displayName}`);
    await loadStudents();
    setTimeout(() => setActionSuccess(""), 3000);
  }

  return (
    <div className="flex-1 flex flex-col pb-12">
      <Header
        title="إدارة الطلاب وتفعيل الاشتراكات اليدوية"
        subtitle={`${students.length} طالب`}
        breadcrumbs={[
          { title: "الرئيسية", href: "/dashboard" },
          { title: "إدارة الطلاب والاشتراكات" },
        ]}
      />

      <main className="p-8 space-y-6 max-w-7xl mx-auto w-full">
        {/* Action Alert Banner */}
        {actionSuccess && (
          <div className="flex items-center gap-3 p-3.5 rounded-xl bg-secondary/10 border border-secondary/30 text-secondary text-xs font-semibold shadow-sm">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{actionSuccess}</span>
          </div>
        )}

        {/* Top Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-4 rounded-xl bg-surface-low border border-white/5 flex items-center justify-between">
            <div>
              <span className="text-xs text-on-surface-muted font-medium">
                إجمالي الطلاب
              </span>
              <div className="text-2xl font-bold text-on-surface font-mono">
                {students.length}
              </div>
            </div>
            <Users className="w-7 h-7 text-primary opacity-80" />
          </div>

          <div className="p-4 rounded-xl bg-surface-low border border-white/5 flex items-center justify-between">
            <div>
              <span className="text-xs text-on-surface-muted font-medium">
                الاشتراكات النشطة
              </span>
              <div className="text-2xl font-bold text-secondary font-mono">
                {students.filter((s) => s.isPremium).length}
              </div>
            </div>
            <CreditCard className="w-7 h-7 text-secondary opacity-80" />
          </div>

          <div className="p-4 rounded-xl bg-surface-low border border-white/5 flex items-center justify-between">
            <div>
              <span className="text-xs text-on-surface-muted font-medium">
                الحسابات المجانية
              </span>
              <div className="text-2xl font-bold text-on-surface-muted font-mono">
                {students.filter((s) => !s.isPremium).length}
              </div>
            </div>
            <Sparkles className="w-7 h-7 text-on-surface-muted opacity-60" />
          </div>
        </div>

        {/* Filter & Search Bar */}
        <div className="flex flex-col sm:flex-row items-center gap-3 p-3.5 rounded-xl bg-surface-low border border-white/5 text-xs">
          <div className="relative flex-1 w-full">
            <input
              type="text"
              placeholder="ابحث بالاسم، البريد الإلكتروني، أو المعرف..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-surface-container rounded-lg pr-9 pl-4 py-2 text-on-surface border border-white/5 focus:outline-none focus:border-primary text-xs placeholder:text-outline"
            />
            <Search className="w-4 h-4 text-outline absolute right-3 top-1/2 -translate-y-1/2" />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <select
              value={filterPlan}
              onChange={(e) => setFilterPlan(e.target.value)}
              className="bg-surface-container rounded-lg px-3 py-2 text-on-surface border border-white/5 focus:outline-none focus:border-primary text-xs"
            >
              <option value="all">كافة الحسابات ({students.length})</option>
              <option value="active">المشتركون النشطون فقط</option>
              <option value="free">الحسابات المجانية فقط</option>
            </select>
          </div>
        </div>

        {/* Students Table */}
        <div className="rounded-xl bg-surface-low border border-white/5 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-right text-xs">
              <thead>
                <tr className="bg-surface-container/50 text-on-surface-muted border-b border-white/5">
                  <th className="py-3 px-4 font-semibold">بيانات الطالب</th>
                  <th className="py-3 px-4 font-semibold">النقاط (XP)</th>
                  <th className="py-3 px-4 font-semibold">القلوب</th>
                  <th className="py-3 px-4 font-semibold">حالة الاشتراك</th>
                  <th className="py-3 px-4 font-semibold">المسارات المفعلة</th>
                  <th className="py-3 px-4 font-semibold text-center">
                    إجراءات التحكم والمساندة
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {loading ? (
                  <tr>
                    <td
                      colSpan={6}
                      className="py-12 text-center text-on-surface-muted"
                    >
                      جاري جلب قائمة الطلاب...
                    </td>
                  </tr>
                ) : filteredStudents.length === 0 ? (
                  <tr>
                    <td
                      colSpan={6}
                      className="py-12 text-center text-on-surface-muted"
                    >
                      لا يوجد طلاب مطابقون للبحث الحالي.
                    </td>
                  </tr>
                ) : (
                  filteredStudents.map((st) => (
                    <tr
                      key={st.uid}
                      className="hover:bg-surface-container/40 transition-colors"
                    >
                      <td className="py-3 px-4">
                        <div className="font-bold text-on-surface">
                          {st.displayName || "طالب بدون اسم"}
                        </div>
                        <div className="text-[11px] text-on-surface-muted font-mono">
                          {st.email}
                        </div>
                      </td>

                      <td className="py-3 px-4">
                        <div className="font-bold text-primary font-mono">
                          {st.xp || 0} XP
                        </div>
                        <div className="text-[10px] text-on-surface-muted font-mono">
                          أسبوعي: {st.weeklyXp || 0} XP
                        </div>
                      </td>

                      <td className="py-3 px-4">
                        <div className="flex items-center gap-1 font-bold text-error font-mono">
                          <Heart className="w-3.5 h-3.5 fill-error" />
                          <span>{st.hearts ?? 6}/6</span>
                        </div>
                      </td>

                      <td className="py-3 px-4">
                        {st.isPremium ? (
                          <div>
                            <span className="px-2 py-0.5 rounded-md bg-secondary/15 text-secondary border border-secondary/30 text-[10px] font-bold">
                              مشترك نشط
                            </span>
                            {st.subscriptionExpiresAt && (
                              <div className="text-[10px] text-on-surface-muted mt-0.5 font-mono">
                                ينتهي: {st.subscriptionExpiresAt.slice(0, 10)}
                              </div>
                            )}
                          </div>
                        ) : (
                          <span className="px-2 py-0.5 rounded-md bg-white/5 text-on-surface-muted text-[10px]">
                            حساب مجاني
                          </span>
                        )}
                      </td>

                      <td className="py-3 px-4">
                        {st.premiumPaths && st.premiumPaths.length > 0 ? (
                          <div className="flex flex-wrap gap-1">
                            {st.premiumPaths.map((p) => (
                              <span
                                key={p}
                                className="px-1.5 py-0.5 rounded bg-surface-high text-[10px] text-primary border border-white/5"
                              >
                                {p === "sharia"
                                  ? "شرعي"
                                  : p === "arabic"
                                  ? "عربي"
                                  : p}
                              </span>
                            ))}
                          </div>
                        ) : (
                          <span className="text-on-surface-muted text-[11px]">
                            —
                          </span>
                        )}
                      </td>

                      <td className="py-3 px-4">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => setSelectedStudent(st)}
                            className="px-2.5 py-1 rounded-lg bg-primary text-[#0b0f19] font-bold text-[11px] hover:brightness-105 active:scale-95 transition-all cursor-pointer"
                            title="تفعيل أو تجديد الاشتراك"
                          >
                            {st.isPremium ? "تجديد" : "تفعيل اشتراك"}
                          </button>

                          <button
                            onClick={() => handleRefillHearts(st)}
                            className="px-2 py-1 rounded-lg bg-surface-high hover:bg-surface-highest text-error text-[11px] font-medium transition-colors flex items-center gap-1 cursor-pointer"
                            title="إعادة شحن القلوب (6 ❤️)"
                          >
                            <RotateCcw className="w-3 h-3" />
                            <span>شحن ❤️</span>
                          </button>

                          {st.isPremium && (
                            <button
                              onClick={() => handleDeactivate(st)}
                              className="px-2 py-1 rounded-lg bg-surface-high hover:bg-error/20 text-on-surface-muted hover:text-error text-[11px] transition-colors cursor-pointer"
                              title="إلغاء الاشتراك"
                            >
                              إلغاء
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Manual Activation Modal */}
        {selectedStudent && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
            <div className="w-full max-w-md rounded-2xl bg-[#121622] border border-white/10 p-6 shadow-2xl space-y-4">
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <div className="flex items-center gap-2">
                  <CreditCard className="w-4 h-4 text-primary" />
                  <h3 className="text-sm font-bold text-on-surface">
                    تفعيل اشتراك يدوي (فودافون كاش / إنستاباي)
                  </h3>
                </div>
                <button
                  onClick={() => setSelectedStudent(null)}
                  className="p-1 text-on-surface-muted hover:text-on-surface cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="p-3 rounded-xl bg-surface-low border border-white/5 space-y-1 text-xs">
                <div className="text-on-surface-muted">الطالب المستهدف:</div>
                <div className="font-bold text-on-surface">
                  {selectedStudent.displayName}
                </div>
                <div className="text-[11px] text-on-surface-muted font-mono">
                  {selectedStudent.email}
                </div>
              </div>

              <form onSubmit={handleConfirmActivation} className="space-y-4 text-xs">
                {/* Path Choice */}
                <div>
                  <label className="block text-on-surface-muted mb-1.5 font-medium">
                    المسارات الدراسية المصرح بها:
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        if (selectedPaths.includes("sharia")) {
                          setSelectedPaths(
                            selectedPaths.filter((p) => p !== "sharia")
                          );
                        } else {
                          setSelectedPaths([...selectedPaths, "sharia"]);
                        }
                      }}
                      className={`py-2 px-3 rounded-lg border text-xs font-semibold text-center transition-all cursor-pointer ${
                        selectedPaths.includes("sharia")
                          ? "bg-secondary/15 border-secondary text-secondary"
                          : "bg-surface-low border-white/5 text-on-surface-muted"
                      }`}
                    >
                      العلوم الشرعية
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        if (selectedPaths.includes("arabic")) {
                          setSelectedPaths(
                            selectedPaths.filter((p) => p !== "arabic")
                          );
                        } else {
                          setSelectedPaths([...selectedPaths, "arabic"]);
                        }
                      }}
                      className={`py-2 px-3 rounded-lg border text-xs font-semibold text-center transition-all cursor-pointer ${
                        selectedPaths.includes("arabic")
                          ? "bg-primary/15 border-primary text-primary"
                          : "bg-surface-low border-white/5 text-on-surface-muted"
                      }`}
                    >
                      العلوم العربية
                    </button>
                  </div>
                </div>

                {/* Duration */}
                <div>
                  <label className="block text-on-surface-muted mb-1.5 font-medium">
                    مدة الاشتراك:
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { label: "شهر (30 يوم)", days: 30 },
                      { label: "ترم (120 يوم)", days: 120 },
                      { label: "سنة (365 يوم)", days: 365 },
                    ].map((d) => (
                      <button
                        key={d.days}
                        type="button"
                        onClick={() => setDurationDays(d.days)}
                        className={`py-2 px-2 rounded-lg border text-xs text-center transition-all cursor-pointer ${
                          durationDays === d.days
                            ? "bg-primary text-[#0b0f19] font-bold border-primary"
                            : "bg-surface-low border-white/5 text-on-surface-muted"
                        }`}
                      >
                        {d.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Phone */}
                <div>
                  <label className="block text-on-surface-muted mb-1 font-medium">
                    رقم هاتف المحول (اختياري):
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="مثال: 01012345678"
                      value={transferPhone}
                      onChange={(e) => setTransferPhone(e.target.value)}
                      className="w-full rounded-lg bg-surface-low border border-white/5 pr-9 pl-3 py-2 text-on-surface focus:outline-none focus:border-primary text-xs"
                    />
                    <Phone className="w-3.5 h-3.5 text-outline absolute right-3 top-1/2 -translate-y-1/2" />
                  </div>
                </div>

                {/* Notes */}
                <div>
                  <label className="block text-on-surface-muted mb-1 font-medium">
                    ملاحظات المشرف الإداري:
                  </label>
                  <textarea
                    rows={2}
                    placeholder="رقم العملية، اسم المحول، أو أي تفاصيل..."
                    value={adminNotes}
                    onChange={(e) => setAdminNotes(e.target.value)}
                    className="w-full rounded-lg bg-surface-low border border-white/5 p-2.5 text-on-surface focus:outline-none focus:border-primary text-xs resize-none"
                  />
                </div>

                {/* Actions */}
                <div className="flex items-center justify-end gap-2 pt-2 border-t border-white/10">
                  <button
                    type="button"
                    onClick={() => setSelectedStudent(null)}
                    className="px-3 py-2 rounded-lg text-on-surface-muted hover:text-on-surface text-xs cursor-pointer"
                  >
                    إلغاء
                  </button>
                  <button
                    type="submit"
                    disabled={submitting || selectedPaths.length === 0}
                    className="px-4 py-2 rounded-lg bg-primary text-[#0b0f19] font-bold text-xs hover:brightness-105 active:scale-95 disabled:opacity-50 transition-all cursor-pointer"
                  >
                    {submitting ? "جاري الاعتماد..." : "تأكيد وتفعيل الاشتراك"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
