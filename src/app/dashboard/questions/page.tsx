"use client";

import React, { useState, useEffect } from "react";
import { Header } from "@/components/layout/Header";
import {
  getAllQuestions,
  saveQuestion,
  deleteQuestion,
  batchSaveQuestions,
  getUnitsForSubject,
  SUBJECTS_LIST,
} from "@/lib/firestore-admin";
import { generateSubjectExcelTemplate } from "@/lib/excel-templates";
import { parseExcelFile, ParseResult } from "@/lib/excel-importer";
import { QuestionEditorModal } from "@/components/questions/QuestionEditorModal";
import { QuizQuestion, QuestionType, SubjectName, Unit } from "@/types";
import {
  FileSpreadsheet,
  Plus,
  Download,
  Upload,
  CheckCircle2,
  AlertCircle,
  Search,
  Filter,
  X,
  HelpCircle,
  Sparkles,
  Layers,
  Edit2,
  Trash2,
} from "lucide-react";

export default function QuestionsBankPage() {
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSubject, setSelectedSubject] = useState<SubjectName>("فقه");
  const [units, setUnits] = useState<Unit[]>([]);

  // Filter & Search
  const [selectedType, setSelectedType] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedUnitFilter, setSelectedUnitFilter] = useState<string>("all");

  // Excel Bulk Import State
  const [showImportBox, setShowImportBox] = useState(false);
  const [importResult, setImportResult] = useState<ParseResult | null>(null);
  const [importingToDb, setImportingToDb] = useState(false);
  const [importSuccessMsg, setImportSuccessMsg] = useState("");

  // Question Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<QuizQuestion | null>(
    null
  );

  useEffect(() => {
    loadAllData(selectedSubject);
  }, [selectedSubject]);

  async function loadAllData(subject: SubjectName) {
    setLoading(true);
    try {
      const [allQ, loadedUnits] = await Promise.all([
        getAllQuestions(),
        getUnitsForSubject(subject),
      ]);
      setQuestions(allQ);
      setUnits(loadedUnits);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  async function refreshQuestions() {
    try {
      const allQ = await getAllQuestions();
      setQuestions(allQ);
    } catch (e) {
      console.error(e);
    }
  }

  // Filter questions by subject
  const subjectQuestions = questions.filter(
    (q) => q.subjectName === selectedSubject
  );

  // Filter by Unit, Type, and Search
  const filteredQuestions = subjectQuestions.filter((q) => {
    if (selectedUnitFilter !== "all" && q.unitId !== selectedUnitFilter)
      return false;
    if (selectedType !== "all" && q.type !== selectedType) return false;
    if (searchQuery.trim()) {
      const qText = `${q.id} ${q.instruction} ${JSON.stringify(
        q.data || {}
      )}`.toLowerCase();
      if (!qText.includes(searchQuery.toLowerCase())) return false;
    }
    return true;
  });

  async function handleDeleteQuestion(id: string) {
    if (!confirm("هل أنت متأكد من حذف هذا السؤال؟")) return;
    try {
      await deleteQuestion(id);
      setQuestions((prev) => prev.filter((q) => q.id !== id));
    } catch (e) {
      alert("حدث خطأ أثناء حذف السؤال");
    }
  }

  // Excel Importer
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      const buffer = evt.target?.result as ArrayBuffer;
      const parsed = parseExcelFile(buffer, selectedSubject);
      setImportResult(parsed);
    };
    reader.readAsArrayBuffer(file);
  };

  async function handleCommitImport() {
    if (!importResult || importResult.questions.length === 0) return;
    setImportingToDb(true);
    try {
      const res = await batchSaveQuestions(importResult.questions);
      setImportSuccessMsg(
        `تم بنجاح استيراد واعتماد ${res.saved} سؤالاً في قاعدة Firestore!`
      );
      setImportResult(null);
      await refreshQuestions();
      setTimeout(() => setImportSuccessMsg(""), 5000);
    } catch (e) {
      console.error(e);
      alert("حدث خطأ أثناء اعتماد الأسئلة.");
    } finally {
      setImportingToDb(false);
    }
  }

  return (
    <div className="flex-1 flex flex-col pb-12">
      <Header
        title="بنك الأسئلة المركزي ومركز الإكسل"
        subtitle={`المادة: ${selectedSubject} • ${subjectQuestions.length} سؤالاً`}
        breadcrumbs={[
          { title: "الرئيسية", href: "/dashboard" },
          { title: "بنك الأسئلة" },
        ]}
      />

      <main className="p-6 space-y-5 max-w-7xl mx-auto w-full">
        {/* Top Control Bar: Subject Selector & Primary Actions */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 p-3 rounded-xl bg-surface-low border border-white/5">
          <div className="flex flex-wrap items-center gap-1.5">
            {SUBJECTS_LIST.map((sub) => (
              <button
                key={sub.name}
                onClick={() => setSelectedSubject(sub.name)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  selectedSubject === sub.name
                    ? "bg-primary text-[#0b0f19] font-bold shadow-sm"
                    : "bg-surface-container text-on-surface-muted hover:text-on-surface hover:bg-surface-high"
                }`}
              >
                {sub.title}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowImportBox(!showImportBox)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer border ${
                showImportBox
                  ? "bg-primary/10 border-primary/30 text-primary"
                  : "bg-surface-container border-white/5 text-on-surface hover:bg-surface-high"
              }`}
            >
              <Upload className="w-3.5 h-3.5 text-primary" />
              <span>استيراد شيت إكسل</span>
            </button>

            <button
              onClick={() => generateSubjectExcelTemplate(selectedSubject)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-surface-container hover:bg-surface-high border border-white/5 text-xs text-on-surface-muted hover:text-on-surface transition-colors cursor-pointer"
              title="تحميل شيت إكسل مهيأ للمادة"
            >
              <Download className="w-3.5 h-3.5 text-secondary" />
              <span>قالب إكسل</span>
            </button>

            <button
              onClick={() => {
                setEditingQuestion(null);
                setModalOpen(true);
              }}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-primary text-[#0b0f19] text-xs font-bold hover:brightness-105 active:scale-95 transition-all cursor-pointer shadow-sm"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>+ إضافة سؤال بالمعالج</span>
            </button>
          </div>
        </div>

        {/* Success Alert */}
        {importSuccessMsg && (
          <div className="p-3.5 rounded-xl bg-secondary/15 border border-secondary/30 flex items-center gap-2.5 text-secondary text-xs font-bold">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{importSuccessMsg}</span>
          </div>
        )}

        {/* Excel Import Panel */}
        {showImportBox && (
          <div className="p-5 rounded-xl bg-surface-low border border-white/10 shadow-sm space-y-3">
            <div className="flex items-center justify-between border-b border-white/5 pb-2.5">
              <div className="flex items-center gap-2">
                <FileSpreadsheet className="w-4 h-4 text-primary" />
                <h3 className="text-xs font-bold text-on-surface">
                  الاستيراد الجماعي الذكي من ملف Excel (مادة {selectedSubject})
                </h3>
              </div>
              <button
                onClick={() => setShowImportBox(false)}
                className="p-1 text-on-surface-muted hover:text-on-surface cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            <p className="text-[11px] text-on-surface-muted leading-relaxed">
              ارفع شيت إكسل بصيغة <code>.xlsx</code>. يقوم النظام بفحص الأعمدة
              والصفوف آلياً وعرض تقرير الأخطاء قبل الاعتماد النهائي في
              قاعدة Firestore.
            </p>

            <div className="flex items-center gap-3 flex-wrap">
              <label className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-primary text-[#0b0f19] text-xs font-bold shadow-sm hover:brightness-105 transition-all cursor-pointer">
                <Upload className="w-3.5 h-3.5" />
                <span>اختيار ملف Excel (.xlsx)</span>
                <input
                  type="file"
                  accept=".xlsx, .xls"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </label>

              {importResult && (
                <div className="flex items-center gap-3 text-xs">
                  <span className="text-on-surface">
                    الأسئلة المستخرجة:{" "}
                    <strong className="text-primary font-mono">
                      {importResult.questions.length}
                    </strong>
                  </span>
                  {importResult.errors.length > 0 ? (
                    <span className="text-rose-400 font-bold">
                      ({importResult.errors.length} خطأ بحاجة لمراجعة)
                    </span>
                  ) : (
                    <span className="text-secondary font-bold">
                      ✓ كافة الصفوف سليمة
                    </span>
                  )}
                  <button
                    onClick={handleCommitImport}
                    disabled={
                      importingToDb || importResult.questions.length === 0
                    }
                    className="px-3.5 py-1.5 bg-secondary text-[#0b0f19] rounded-lg font-bold text-xs transition-all disabled:opacity-50 cursor-pointer"
                  >
                    {importingToDb ? "جاري الحفظ..." : "اعتماد الأسئلة في Firestore"}
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Filters and Search Bar */}
        <div className="flex flex-col sm:flex-row items-center gap-3 p-3.5 rounded-xl bg-surface-low border border-white/5 text-xs">
          <div className="relative flex-1 w-full">
            <input
              type="text"
              placeholder="ابحث في نص السؤال، التوجيه، أو التعليل..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-surface-container rounded-lg pr-9 pl-4 py-2 text-on-surface border border-white/5 focus:outline-none focus:border-primary text-xs placeholder:text-outline"
            />
            <Search className="w-4 h-4 text-outline absolute right-3 top-1/2 -translate-y-1/2" />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            {/* Unit Filter */}
            <select
              value={selectedUnitFilter}
              onChange={(e) => setSelectedUnitFilter(e.target.value)}
              className="bg-surface-container rounded-lg px-3 py-2 text-on-surface border border-white/5 focus:outline-none focus:border-primary text-xs"
            >
              <option value="all">كافة الوحدات</option>
              {units.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.title}
                </option>
              ))}
            </select>

            {/* Type Filter */}
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="bg-surface-container rounded-lg px-3 py-2 text-on-surface border border-white/5 focus:outline-none focus:border-primary text-xs"
            >
              <option value="all">كافة الأنواع</option>
              <option value="mcq">اختيار من متعدد (MCQ)</option>
              <option value="true_false">صح أو خطأ</option>
              <option value="scenario">سيناريو فقهي / نازلة</option>
              <option value="spot_error">اكتشف الخطأ وصححه</option>
              <option value="fill_blank">أكمل الفراغ</option>
              <option value="matching">توصيل ومطابقة</option>
              <option value="rearrangement">ترتيب</option>
              <option value="sorting">تصنيف</option>
            </select>
          </div>
        </div>

        {/* Questions List */}
        <div className="rounded-xl bg-surface-low border border-white/5 p-4 space-y-3">
          <div className="flex items-center justify-between text-xs text-on-surface-muted pb-2 border-b border-white/5">
            <span>
              عرض {filteredQuestions.length} سؤالاً من إجمالي{" "}
              {subjectQuestions.length}
            </span>
          </div>

          {loading ? (
            <div className="py-12 text-center text-xs text-on-surface-muted">
              جاري جلب الأسئلة...
            </div>
          ) : filteredQuestions.length === 0 ? (
            <div className="py-12 text-center text-xs text-on-surface-muted space-y-2">
              <HelpCircle className="w-8 h-8 text-outline mx-auto opacity-40" />
              <p>لا توجد أسئلة مطابقة للبحث الحالي في مادة {selectedSubject}.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredQuestions.map((q) => (
                <div
                  key={q.id}
                  className="p-4 rounded-xl bg-surface-container/60 border border-white/5 hover:border-white/10 transition-colors space-y-2"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="px-2 py-0.5 rounded bg-white/5 text-[10px] font-bold text-primary border border-white/5">
                        {q.type}
                      </span>
                      {q.unitTitle && (
                        <span className="px-2 py-0.5 rounded bg-white/5 text-[10px] text-on-surface-muted border border-white/5">
                          {q.unitTitle}
                        </span>
                      )}
                      <span className="text-xs font-bold text-on-surface">
                        {q.data?.question ||
                          q.data?.statement ||
                          q.data?.sentence ||
                          q.instruction ||
                          "سؤال بدون عنوان"}
                      </span>
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        onClick={() => {
                          setEditingQuestion(q);
                          setModalOpen(true);
                        }}
                        className="p-1.5 rounded-lg hover:bg-white/5 text-on-surface-muted hover:text-primary transition-colors cursor-pointer"
                        title="تعديل السؤال"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDeleteQuestion(q.id)}
                        className="p-1.5 rounded-lg hover:bg-white/5 text-on-surface-muted hover:text-error transition-colors cursor-pointer"
                        title="حذف السؤال"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Question details preview */}
                  {q.data?.situation && (
                    <div className="p-2.5 rounded-lg bg-[#0b0f19] text-[11px] text-secondary border border-white/5">
                      الواقعة: {q.data.situation}
                    </div>
                  )}

                  {q.data?.options && Array.isArray(q.data.options) && (
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {q.data.options.map((opt: string, idx: number) => (
                        <span
                          key={idx}
                          className={`text-[11px] px-2 py-0.5 rounded border ${
                            q.data.correctIndex === idx
                              ? "bg-secondary/15 border-secondary/40 text-secondary font-bold"
                              : "bg-surface-low border-white/5 text-on-surface-muted"
                          }`}
                        >
                          {opt}
                        </span>
                      ))}
                    </div>
                  )}

                  {q.data?.explanation && (
                    <p className="text-[11px] text-on-surface-muted pt-1 border-t border-white/5 line-clamp-1">
                      التعليل الأزهري: {q.data.explanation}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Question Wizard Modal */}
      <QuestionEditorModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSave={async (q) => {
          await saveQuestion(q);
          await refreshQuestions();
        }}
        initialQuestion={editingQuestion}
        subjectName={selectedSubject}
        units={units}
      />
    </div>
  );
}
