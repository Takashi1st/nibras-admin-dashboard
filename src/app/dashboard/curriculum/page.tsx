"use client";

import React, { useState, useEffect } from "react";
import { Header } from "@/components/layout/Header";
import {
  SUBJECTS_LIST,
  getUnitsForSubject,
  addUnit,
  updateUnit,
  deleteUnit,
  saveLesson,
  deleteLesson,
  getAllQuestions,
  saveQuestion,
  deleteQuestion,
} from "@/lib/firestore-admin";
import { generateSubjectExcelTemplate } from "@/lib/excel-templates";
import { parseDslToCards, serializeCardsToDsl } from "@/lib/dsl-converter";
import { CardTypePickerModal } from "@/components/curriculum/CardTypePickerModal";
import { CardEditorItem } from "@/components/curriculum/CardEditorItem";
import { CardPreview } from "@/components/curriculum/CardPreview";
import { QuestionEditorModal } from "@/components/questions/QuestionEditorModal";
import {
  SubjectName,
  Unit,
  Lesson,
  ExplanationCard,
  ExplanationCardType,
  QuizQuestion,
} from "@/types";
import {
  BookOpen,
  Plus,
  Trash2,
  Edit2,
  Save,
  Download,
  Eye,
  Layers,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  HelpCircle,
  Sparkles,
  FoldHorizontal,
  UnfoldHorizontal,
  Code,
  X,
  FileQuestion,
} from "lucide-react";

export default function UnifiedCurriculumPage() {
  const [selectedSubject, setSelectedSubject] = useState<SubjectName>("فقه");
  const [units, setUnits] = useState<Unit[]>([]);
  const [selectedLesson, setSelectedLesson] = useState<Lesson | null>(null);
  const [selectedUnitId, setSelectedUnitId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  // Tree collapse state
  const [isTreeVisible, setIsTreeVisible] = useState(true);
  const [expandedUnits, setExpandedUnits] = useState<Record<string, boolean>>({});

  // Dialog / form states
  const [showAddUnit, setShowAddUnit] = useState(false);
  const [newUnitTitle, setNewUnitTitle] = useState("");
  const [editingUnitId, setEditingUnitId] = useState<string | null>(null);
  const [editingUnitTitle, setEditingUnitTitle] = useState("");

  const [showAddLesson, setShowAddLesson] = useState<string | null>(null);
  const [newLessonTitle, setNewLessonTitle] = useState("");

  // Cards in currently open lesson
  const [cards, setCards] = useState<ExplanationCard[]>([]);
  const [showCardPicker, setShowCardPicker] = useState(false);

  // Lesson tabs: 'cards' | 'questions' | 'raw_dsl'
  const [activeTab, setActiveTab] = useState<"cards" | "questions" | "raw_dsl">("cards");

  // Phone preview slide-over drawer
  const [showPhonePreview, setShowPhonePreview] = useState(false);

  // Questions for this lesson
  const [lessonQuestions, setLessonQuestions] = useState<QuizQuestion[]>([]);
  const [loadingQuestions, setLoadingQuestions] = useState(false);
  const [questionModalOpen, setQuestionModalOpen] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<QuizQuestion | null>(null);

  useEffect(() => {
    loadUnits(selectedSubject);
  }, [selectedSubject]);

  useEffect(() => {
    if (selectedLesson && activeTab === "questions") {
      loadLessonQuestions();
    }
  }, [selectedLesson, activeTab]);

  async function loadUnits(subject: SubjectName) {
    setLoading(true);
    try {
      const data = await getUnitsForSubject(subject);
      setUnits(data);

      const initialExpanded: Record<string, boolean> = {};
      data.forEach((u, idx) => {
        initialExpanded[u.id] = idx === 0;
      });
      setExpandedUnits(initialExpanded);

      if (data.length > 0 && data[0].lessons.length > 0) {
        selectLesson(data[0].id, data[0].lessons[0]);
      } else {
        setSelectedLesson(null);
        setSelectedUnitId(null);
        setCards([]);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  async function loadLessonQuestions() {
    if (!selectedLesson) return;
    setLoadingQuestions(true);
    try {
      const allQ = await getAllQuestions(selectedSubject);
      const filtered = allQ.filter((q) => q.lessonId === selectedLesson.id);
      setLessonQuestions(filtered);
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingQuestions(false);
    }
  }

  function toggleUnit(unitId: string) {
    setExpandedUnits((prev) => ({
      ...prev,
      [unitId]: !prev[unitId],
    }));
  }

  function collapseAllUnits() {
    const collapsed: Record<string, boolean> = {};
    units.forEach((u) => {
      collapsed[u.id] = false;
    });
    setExpandedUnits(collapsed);
  }

  function expandAllUnits() {
    const expanded: Record<string, boolean> = {};
    units.forEach((u) => {
      expanded[u.id] = true;
    });
    setExpandedUnits(expanded);
  }

  function selectLesson(unitId: string, lesson: Lesson) {
    setSelectedUnitId(unitId);
    setSelectedLesson(lesson);
    const parsedCards = parseDslToCards(lesson.explanation);
    setCards(parsedCards);
    setSavedSuccess(false);
  }

  async function handleAddUnit() {
    if (!newUnitTitle.trim()) return;
    try {
      const unitId = await addUnit(selectedSubject, newUnitTitle.trim());
      const newUnit: Unit = {
        id: unitId,
        title: newUnitTitle.trim(),
        order: units.length,
        lessons: [],
        subjectName: selectedSubject,
      };
      setUnits([...units, newUnit]);
      setExpandedUnits((prev) => ({ ...prev, [unitId]: true }));
      setNewUnitTitle("");
      setShowAddUnit(false);
    } catch (e) {
      alert("حدث خطأ أثناء إضافة الوحدة");
    }
  }

  async function handleUpdateUnit(unitId: string) {
    if (!editingUnitTitle.trim()) return;
    try {
      await updateUnit(selectedSubject, unitId, editingUnitTitle.trim());
      setUnits((prev) =>
        prev.map((u) => (u.id === unitId ? { ...u, title: editingUnitTitle.trim() } : u))
      );
      setEditingUnitId(null);
    } catch (e) {
      alert("حدث خطأ أثناء تعديل الوحدة");
    }
  }

  async function handleDeleteUnit(unitId: string, title: string) {
    if (!confirm(`هل أنت متأكد من حذف الوحدة "${title}" وكافة دروسها؟`)) return;
    try {
      await deleteUnit(selectedSubject, unitId);
      setUnits((prev) => prev.filter((u) => u.id !== unitId));
      if (selectedUnitId === unitId) {
        setSelectedLesson(null);
        setSelectedUnitId(null);
        setCards([]);
      }
    } catch (e) {
      alert("حدث خطأ أثناء حذف الوحدة");
    }
  }

  async function handleAddLesson(unitId: string) {
    if (!newLessonTitle.trim()) return;
    const lessonId = `l_${Date.now()}`;
    try {
      await saveLesson(
        selectedSubject,
        unitId,
        lessonId,
        newLessonTitle.trim(),
        "",
        "available"
      );
      const newLesson: Lesson = {
        id: lessonId,
        title: newLessonTitle.trim(),
        status: "available",
        explanation: "",
        order: 99,
        unitId,
        subjectName: selectedSubject,
      };

      setUnits((prev) =>
        prev.map((u) => {
          if (u.id === unitId) {
            return { ...u, lessons: [...u.lessons, newLesson] };
          }
          return u;
        })
      );

      selectLesson(unitId, newLesson);
      setNewLessonTitle("");
      setShowAddLesson(null);
    } catch (e) {
      alert("حدث خطأ أثناء إضافة الدرس");
    }
  }

  async function handleDeleteLesson(unitId: string, lessonId: string) {
    if (!confirm("هل أنت متأكد من حذف هذا الدرس؟")) return;
    try {
      await deleteLesson(selectedSubject, unitId, lessonId);
      setUnits((prev) =>
        prev.map((u) => {
          if (u.id === unitId) {
            return { ...u, lessons: u.lessons.filter((l) => l.id !== lessonId) };
          }
          return u;
        })
      );
      if (selectedLesson?.id === lessonId) {
        setSelectedLesson(null);
        setCards([]);
      }
    } catch (e) {
      alert("حدث خطأ أثناء حذف الدرس");
    }
  }

  function handleAddCard(type: ExplanationCardType) {
    let initialExtra: Record<string, any> = {};

    switch (type) {
      case "tawheedRuling":
        initialExtra = {
          issue_title: "",
          ruling_badge: "واجب عقلاً",
          definition: "",
          naqli_proof: "",
          aqli_proof: "",
        };
        break;
      case "tawheedDetails":
        initialExtra = {
          title: "",
          items: [{ point: "", explanation: "" }],
        };
        break;
      case "surahIntro":
        initialExtra = {
          surah_name: "",
          is_makki: true,
          verses_count: 0,
          revelation_order: 0,
          cause_of_revelation: "",
          key_themes: [],
        };
        break;
      case "tafsirAnalysis":
        initialExtra = {
          ayah_text: "",
          surah_name: "",
          ayah_number: 1,
          vocabulary: [{ word: "", meaning: "" }],
          qiraat: [],
          grammar_notes: "",
        };
        break;
      case "hadithText":
        initialExtra = {
          raw_text: "",
          narrator: "",
          takhrij: "متفق عليه",
          narrator_bio: "",
        };
        break;
      case "hadithVocab":
        initialExtra = {
          items: [{ word: "", meaning: "" }],
          linguistic_benefit: "",
        };
        break;
      case "hadithExplanation":
        initialExtra = {
          general_meaning: "",
          benefits: [],
          micro_quiz: { question: "", is_true: true, explanation: "" },
        };
        break;
      case "comparison":
        initialExtra = {
          title: "مقارنة فقهية بين المذاهب",
          col1_title: "الرأي الأول",
          col1_text: "",
          col2_title: "الرأي الثاني",
          col2_text: "",
        };
        break;
      case "wordMeaning":
        initialExtra = {
          title: "معاني مفردات ومصطلحات الدرس",
          items: [{ word: "", meaning: "" }],
        };
        break;
      case "microQuiz":
        initialExtra = {
          question: "",
          is_true: true,
          explanation: "",
        };
        break;
      default:
        initialExtra = {};
        break;
    }

    const newCard: ExplanationCard = {
      type,
      content: "",
      extraData: initialExtra,
    };

    setCards([...cards, newCard]);
  }

  function handleUpdateCard(index: number, updated: ExplanationCard) {
    const next = [...cards];
    next[index] = updated;
    setCards(next);
  }

  function handleDeleteCard(index: number) {
    const next = [...cards];
    next.splice(index, 1);
    setCards(next);
  }

  function handleMoveCard(index: number, direction: "up" | "down") {
    if (direction === "up" && index === 0) return;
    if (direction === "down" && index === cards.length - 1) return;
    const targetIdx = direction === "up" ? index - 1 : index + 1;
    const next = [...cards];
    const [moved] = next.splice(index, 1);
    next.splice(targetIdx, 0, moved);
    setCards(next);
  }

  async function handleSaveLessonCards() {
    if (!selectedLesson || !selectedUnitId) return;
    setSaving(true);
    try {
      const dslExplanation = serializeCardsToDsl(cards);
      await saveLesson(
        selectedSubject,
        selectedUnitId,
        selectedLesson.id,
        selectedLesson.title,
        dslExplanation,
        selectedLesson.status
      );

      setUnits((prev) =>
        prev.map((u) => {
          if (u.id === selectedUnitId) {
            return {
              ...u,
              lessons: u.lessons.map((l) =>
                l.id === selectedLesson.id ? { ...l, explanation: dslExplanation } : l
              ),
            };
          }
          return u;
        })
      );

      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3000);
    } catch (e) {
      alert("حدث خطأ أثناء حفظ الشرح");
    } finally {
      setSaving(false);
    }
  }

  async function handleDeleteQuestion(qId: string) {
    if (!confirm("هل أنت متأكد من حذف هذا السؤال؟")) return;
    try {
      await deleteQuestion(qId);
      setLessonQuestions((prev) => prev.filter((q) => q.id !== qId));
    } catch (e) {
      alert("حدث خطأ أثناء حذف السؤال");
    }
  }

  const currentUnit = units.find((u) => u.id === selectedUnitId);

  return (
    <div className="flex-1 flex flex-col pb-12">
      <Header
        title="استوديو المناهج والدروس الموحد"
        subtitle={`المادة: ${selectedSubject} • شروحات وأسئلة تفاعلية`}
        breadcrumbs={[
          { title: "الرئيسية", href: "/dashboard" },
          { title: "استوديو المحتوى" },
        ]}
      />

      <main className="p-6 space-y-5 max-w-7xl mx-auto w-full">
        {/* Top Control Bar: Subject Selector & Actions */}
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
              onClick={() => generateSubjectExcelTemplate(selectedSubject)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-surface-container hover:bg-surface-high text-xs text-on-surface-muted hover:text-on-surface transition-colors cursor-pointer"
              title="تحميل شيت إكسل مهيأ لهذه المادة"
            >
              <Download className="w-3.5 h-3.5 text-secondary" />
              <span>قالب إكسل</span>
            </button>

            <button
              onClick={() => setIsTreeVisible(!isTreeVisible)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs transition-colors cursor-pointer ${
                isTreeVisible
                  ? "bg-surface-container text-on-surface"
                  : "bg-primary/10 text-primary font-bold border border-primary/20"
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>{isTreeVisible ? "إخفاء الشجرة" : "إظهار شجرة المنهج"}</span>
            </button>
          </div>
        </div>

        {/* Main Work Area */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
          {/* Collapsible Units & Lessons Tree */}
          {isTreeVisible && (
            <div className="lg:col-span-4 rounded-xl bg-surface-low border border-white/5 p-4 space-y-3">
              <div className="flex items-center justify-between border-b border-white/5 pb-2.5">
                <div className="flex items-center gap-2">
                  <Layers className="w-4 h-4 text-primary" />
                  <span className="text-xs font-bold text-on-surface">وحدات ودروس المنهج</span>
                </div>
                <button
                  onClick={() => setShowAddUnit(true)}
                  className="px-2 py-1 rounded-md bg-primary text-[#0b0f19] font-bold text-[11px] hover:brightness-105 cursor-pointer"
                >
                  + وحدة جديدة
                </button>
              </div>

              {/* Add Unit Field */}
              {showAddUnit && (
                <div className="p-2.5 rounded-lg bg-surface-container border border-primary/30 space-y-2">
                  <input
                    type="text"
                    placeholder="عنوان الوحدة الجديدة..."
                    value={newUnitTitle}
                    onChange={(e) => setNewUnitTitle(e.target.value)}
                    className="w-full text-xs p-1.5 rounded bg-surface-low border border-white/10 text-on-surface focus:outline-none focus:border-primary"
                  />
                  <div className="flex items-center justify-end gap-1.5">
                    <button
                      onClick={() => setShowAddUnit(false)}
                      className="px-2 py-0.5 text-[11px] text-on-surface-muted"
                    >
                      إلغاء
                    </button>
                    <button
                      onClick={handleAddUnit}
                      className="px-2.5 py-0.5 bg-primary text-[#0b0f19] font-bold text-[11px] rounded"
                    >
                      حفظ
                    </button>
                  </div>
                </div>
              )}

              {/* Units List */}
              {loading ? (
                <div className="py-8 text-center text-xs text-on-surface-muted">
                  جاري جلب الوحدات...
                </div>
              ) : units.length === 0 ? (
                <div className="py-8 text-center text-xs text-on-surface-muted">
                  لا توجد وحدات بعد في مادة {selectedSubject}.
                </div>
              ) : (
                <div className="space-y-2 max-h-[70vh] overflow-y-auto pr-1">
                  {units.map((unit, uIdx) => {
                    const isExpanded = !!expandedUnits[unit.id];
                    const isEditing = editingUnitId === unit.id;

                    return (
                      <div
                        key={unit.id}
                        className="rounded-lg bg-surface-container/60 border border-white/5 overflow-hidden"
                      >
                        <div className="p-2 bg-surface-container flex items-center justify-between gap-1.5">
                          <div
                            onClick={() => toggleUnit(unit.id)}
                            className="flex items-center gap-1.5 flex-1 min-w-0 cursor-pointer select-none"
                          >
                            <span className="text-on-surface-muted">
                              {isExpanded ? (
                                <ChevronDown className="w-3.5 h-3.5 text-primary" />
                              ) : (
                                <ChevronLeft className="w-3.5 h-3.5" />
                              )}
                            </span>
                            {isEditing ? (
                              <div
                                onClick={(e) => e.stopPropagation()}
                                className="flex items-center gap-1 flex-1"
                              >
                                <input
                                  type="text"
                                  value={editingUnitTitle}
                                  onChange={(e) => setEditingUnitTitle(e.target.value)}
                                  className="w-full text-xs p-1 rounded bg-[#0b0f19] border border-primary text-on-surface"
                                />
                                <button
                                  onClick={() => handleUpdateUnit(unit.id)}
                                  className="px-2 py-0.5 bg-primary text-[#0b0f19] text-[10px] font-bold rounded"
                                >
                                  حفظ
                                </button>
                              </div>
                            ) : (
                              <div className="flex items-center gap-1 truncate">
                                <span className="text-xs font-semibold text-on-surface truncate">
                                  {unit.title}
                                </span>
                                <span className="text-[10px] text-on-surface-muted">
                                  ({unit.lessons.length})
                                </span>
                              </div>
                            )}
                          </div>

                          {!isEditing && (
                            <div className="flex items-center gap-1 shrink-0">
                              <button
                                onClick={() => {
                                  setShowAddLesson(unit.id);
                                  if (!isExpanded) toggleUnit(unit.id);
                                }}
                                className="px-1.5 py-0.5 rounded bg-surface-high hover:bg-primary/20 text-primary text-[10px] font-bold transition-colors cursor-pointer"
                                title="إضافة درس"
                              >
                                + درس
                              </button>
                              <button
                                onClick={() => {
                                  setEditingUnitId(unit.id);
                                  setEditingUnitTitle(unit.title);
                                }}
                                className="p-1 text-on-surface-muted hover:text-on-surface rounded cursor-pointer"
                              >
                                <Edit2 className="w-3 h-3" />
                              </button>
                              <button
                                onClick={() => handleDeleteUnit(unit.id, unit.title)}
                                className="p-1 text-on-surface-muted hover:text-error rounded cursor-pointer"
                              >
                                <Trash2 className="w-3 h-3" />
                              </button>
                            </div>
                          )}
                        </div>

                        {showAddLesson === unit.id && (
                          <div className="p-2 bg-surface-low border-b border-white/5 space-y-1.5">
                            <input
                              type="text"
                              placeholder="عنوان الدرس الجديد..."
                              value={newLessonTitle}
                              onChange={(e) => setNewLessonTitle(e.target.value)}
                              className="w-full text-xs p-1.5 rounded bg-[#0b0f19] border border-white/10 text-on-surface"
                            />
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                onClick={() => setShowAddLesson(null)}
                                className="text-[10px] text-on-surface-muted"
                              >
                                إلغاء
                              </button>
                              <button
                                onClick={() => handleAddLesson(unit.id)}
                                className="px-2.5 py-0.5 bg-secondary text-[#0b0f19] font-bold text-[10px] rounded"
                              >
                                حفظ الدرس
                              </button>
                            </div>
                          </div>
                        )}

                        {isExpanded && (
                          <div className="p-1 space-y-0.5 bg-[#0b0f19]/40">
                            {unit.lessons.length === 0 ? (
                              <div className="p-2 text-center text-[10px] text-on-surface-muted">
                                لا توجد دروس بعد.
                              </div>
                            ) : (
                              unit.lessons.map((lesson) => {
                                const isSelected = selectedLesson?.id === lesson.id;
                                return (
                                  <div
                                    key={lesson.id}
                                    onClick={() => selectLesson(unit.id, lesson)}
                                    className={`flex items-center justify-between p-2 rounded-md text-xs transition-colors cursor-pointer ${
                                      isSelected
                                        ? "bg-primary/15 text-primary font-bold border-r-2 border-primary"
                                        : "hover:bg-white/5 text-on-surface-muted hover:text-on-surface"
                                    }`}
                                  >
                                    <span className="truncate max-w-[170px]">
                                      {lesson.title}
                                    </span>
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleDeleteLesson(unit.id, lesson.id);
                                      }}
                                      className="p-1 text-on-surface-muted hover:text-error rounded"
                                    >
                                      <Trash2 className="w-3 h-3" />
                                    </button>
                                  </div>
                                );
                              })
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* Unified Lesson Workspace */}
          <div
            className={`${
              isTreeVisible ? "lg:col-span-8" : "lg:col-span-12"
            } rounded-xl bg-surface-low border border-white/5 p-6 shadow-sm space-y-5`}
          >
            {selectedLesson ? (
              <>
                {/* Lesson Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-white/5">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <BookOpen className="w-4 h-4 text-primary" />
                      <h2 className="text-base font-bold text-on-surface">
                        {selectedLesson.title}
                      </h2>
                    </div>
                    <p className="text-[11px] text-on-surface-muted">
                      الوحدة: {currentUnit?.title} • المادة: {selectedSubject}
                    </p>
                  </div>

                  {/* Actions & Tab Switcher */}
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setShowPhonePreview(true)}
                      className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-surface-container hover:bg-surface-high text-xs text-on-surface-muted hover:text-on-surface transition-colors cursor-pointer"
                      title="معاينة شاشة الهاتف الحية"
                    >
                      <Eye className="w-3.5 h-3.5 text-secondary" />
                      <span>معاينة الهاتف</span>
                    </button>

                    {activeTab === "cards" && (
                      <button
                        onClick={handleSaveLessonCards}
                        disabled={saving}
                        className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-primary text-[#0b0f19] font-bold text-xs hover:brightness-105 active:scale-95 disabled:opacity-50 transition-all cursor-pointer shadow-sm"
                      >
                        {saving ? (
                          <span>جاري الحفظ...</span>
                        ) : savedSuccess ? (
                          <>
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>تم الحفظ!</span>
                          </>
                        ) : (
                          <>
                            <Save className="w-3.5 h-3.5" />
                            <span>حفظ الشرح</span>
                          </>
                        )}
                      </button>
                    )}
                  </div>
                </div>

                {/* Two Core Tabs: Cards vs Questions */}
                <div className="flex items-center gap-2 border-b border-white/5 pb-2">
                  <button
                    onClick={() => setActiveTab("cards")}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                      activeTab === "cards"
                        ? "bg-surface-container text-primary font-bold border border-primary/20"
                        : "text-on-surface-muted hover:text-on-surface"
                    }`}
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>بطاقات الشرح والتأصيل ({cards.length})</span>
                  </button>

                  <button
                    onClick={() => setActiveTab("questions")}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                      activeTab === "questions"
                        ? "bg-surface-container text-primary font-bold border border-primary/20"
                        : "text-on-surface-muted hover:text-on-surface"
                    }`}
                  >
                    <HelpCircle className="w-3.5 h-3.5" />
                    <span>أسئلة واختبارات الدرس ({lessonQuestions.length})</span>
                  </button>

                  <button
                    onClick={() => setActiveTab("raw_dsl")}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                      activeTab === "raw_dsl"
                        ? "bg-surface-container text-on-surface"
                        : "text-on-surface-muted hover:text-on-surface"
                    }`}
                  >
                    <Code className="w-3.5 h-3.5" />
                    <span>DSL</span>
                  </button>
                </div>

                {/* TAB 1: CARDS BUILDER */}
                {activeTab === "cards" && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-on-surface-muted">
                        البطاقات المعروضة للطالب داخل تطبيق الموبايل:
                      </span>
                      <button
                        onClick={() => setShowCardPicker(true)}
                        className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-primary/10 border border-primary/20 text-primary text-xs font-bold hover:bg-primary/20 transition-all cursor-pointer"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>+ إضافة كتلة متخصصة للمادة</span>
                      </button>
                    </div>

                    {cards.length === 0 ? (
                      <div className="p-8 text-center rounded-xl bg-surface-container/30 border border-dashed border-white/10 space-y-2.5">
                        <Sparkles className="w-7 h-7 text-primary mx-auto opacity-70" />
                        <p className="text-xs text-on-surface-muted">
                          لا توجد بطاقات شرح في هذا الدرس بعد.
                        </p>
                        <button
                          onClick={() => setShowCardPicker(true)}
                          className="px-3.5 py-1.5 bg-primary text-[#0b0f19] rounded-lg text-xs font-bold cursor-pointer"
                        >
                          + إضافة أول بطاقة شرح
                        </button>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {cards.map((card, idx) => (
                          <CardEditorItem
                            key={idx}
                            card={card}
                            index={idx}
                            totalCards={cards.length}
                            onUpdate={(updated) => handleUpdateCard(idx, updated)}
                            onDelete={() => handleDeleteCard(idx)}
                            onMoveUp={() => handleMoveCard(idx, "up")}
                            onMoveDown={() => handleMoveCard(idx, "down")}
                          />
                        ))}

                        <button
                          onClick={() => setShowCardPicker(true)}
                          className="w-full py-2.5 rounded-xl border border-dashed border-white/10 hover:border-primary/40 text-on-surface-muted hover:text-primary text-xs font-semibold flex items-center justify-center gap-2 transition-colors cursor-pointer bg-surface-container/20 hover:bg-surface-container/40"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          <span>إضافة كتلة شرح أخرى لهذا الدرس</span>
                        </button>
                      </div>
                    )}
                  </div>
                )}

                {/* TAB 2: LESSON QUESTIONS */}
                {activeTab === "questions" && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-on-surface-muted">
                        الأسئلة والاختبارات المرتبطة بهذا الدرس تحديداً:
                      </span>
                      <button
                        onClick={() => {
                          setEditingQuestion(null);
                          setQuestionModalOpen(true);
                        }}
                        className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-primary text-[#0b0f19] font-bold text-xs hover:brightness-105 transition-all cursor-pointer shadow-sm"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>+ إضافة سؤال جديد للدرس عبر المعالج</span>
                      </button>
                    </div>

                    {loadingQuestions ? (
                      <div className="py-8 text-center text-xs text-on-surface-muted">
                        جاري جلب أسئلة الدرس...
                      </div>
                    ) : lessonQuestions.length === 0 ? (
                      <div className="p-8 text-center rounded-xl bg-surface-container/30 border border-dashed border-white/10 space-y-2.5">
                        <HelpCircle className="w-7 h-7 text-primary mx-auto opacity-70" />
                        <p className="text-xs text-on-surface-muted">
                          لا توجد أسئلة مرتبطة بهذا الدرس بعد.
                        </p>
                        <button
                          onClick={() => {
                            setEditingQuestion(null);
                            setQuestionModalOpen(true);
                          }}
                          className="px-3.5 py-1.5 bg-primary text-[#0b0f19] rounded-lg text-xs font-bold cursor-pointer"
                        >
                          + إضافة أول سؤال عبر المعالج
                        </button>
                      </div>
                    ) : (
                      <div className="space-y-2.5">
                        {lessonQuestions.map((q) => (
                          <div
                            key={q.id}
                            className="p-3.5 rounded-xl bg-surface-container/60 border border-white/5 flex items-start justify-between gap-3 hover:border-white/10 transition-colors"
                          >
                            <div className="space-y-1 flex-1">
                              <div className="flex items-center gap-2">
                                <span className="px-2 py-0.5 rounded bg-white/5 text-[10px] font-semibold text-primary border border-white/5">
                                  {q.type}
                                </span>
                                <span className="text-xs font-bold text-on-surface">
                                  {q.data?.question ||
                                    q.data?.statement ||
                                    q.data?.sentence ||
                                    q.instruction ||
                                    "سؤال بدون عنوان"}
                                </span>
                              </div>
                              {q.data?.explanation && (
                                <p className="text-[11px] text-on-surface-muted line-clamp-1">
                                  التعليل: {q.data.explanation}
                                </p>
                              )}
                            </div>

                            <div className="flex items-center gap-1 shrink-0">
                              <button
                                onClick={() => {
                                  setEditingQuestion(q);
                                  setQuestionModalOpen(true);
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
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* TAB 3: RAW DSL */}
                {activeTab === "raw_dsl" && (
                  <div className="space-y-3">
                    <span className="text-xs text-on-surface-muted">
                      تنسيق DSL المتوافق 100% مع تطبيق الموبايل:
                    </span>
                    <textarea
                      rows={14}
                      value={serializeCardsToDsl(cards)}
                      onChange={(e) => {
                        const parsed = parseDslToCards(e.target.value);
                        setCards(parsed);
                      }}
                      className="w-full text-xs font-mono p-3 rounded-xl bg-[#0b0f19] border border-white/10 text-on-surface focus:outline-none focus:border-primary leading-relaxed"
                    />
                  </div>
                )}
              </>
            ) : (
              <div className="py-20 text-center space-y-2 text-on-surface-muted">
                <BookOpen className="w-8 h-8 mx-auto opacity-40 text-primary" />
                <h4 className="text-sm font-bold text-on-surface">لم يتم اختيار درس بعد</h4>
                <p className="text-xs max-w-sm mx-auto">
                  اختر درساً من قائمة الوحدات لتحرير بطاقات شرحه أو إدارة أسئلته.
                </p>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Slide-over Phone Preview Drawer (Pinned to Left, opposite to Right Sidebar) */}
      {showPhonePreview && selectedLesson && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-[90] bg-black/60 backdrop-blur-xs"
            onClick={() => setShowPhonePreview(false)}
          />

          {/* Drawer Canvas on the left */}
          <div className="fixed top-0 left-0 h-screen w-full max-w-md bg-[#121622] border-r border-white/10 shadow-2xl z-[100] flex flex-col select-none">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-white/5 bg-[#0e121d]">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-secondary/10 text-secondary border border-secondary/20">
                  <Eye className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-xs font-bold text-on-surface">
                    📱 محاكاة شاشة هاتف الطالب
                  </h3>
                  <p className="text-[10px] text-on-surface-muted truncate max-w-[240px]">
                    {selectedLesson.title}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowPhonePreview(false)}
                className="p-1.5 rounded-lg hover:bg-white/5 text-on-surface-muted hover:text-on-surface cursor-pointer"
                title="إغلاق المعاينة"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Simulated Phone Body */}
            <div className="flex-1 overflow-y-auto p-4 bg-[#0b0f19]">
              <div className="rounded-2xl border border-white/10 p-3 bg-[#0e121d] shadow-inner">
                <CardPreview cards={cards} lessonTitle={selectedLesson.title} />
              </div>
            </div>
          </div>
        </>
      )}

      {/* Card Type Picker Modal */}
      <CardTypePickerModal
        isOpen={showCardPicker}
        onClose={() => setShowCardPicker(false)}
        onSelect={handleAddCard}
        currentSubject={selectedSubject}
      />

      {/* Step-by-Step Question Wizard Modal */}
      <QuestionEditorModal
        isOpen={questionModalOpen}
        onClose={() => setQuestionModalOpen(false)}
        onSave={async (q) => {
          await saveQuestion(q);
          if (selectedLesson) await loadLessonQuestions();
        }}
        initialQuestion={editingQuestion}
        subjectName={selectedSubject}
        units={units}
        defaultUnitId={selectedUnitId || undefined}
        defaultLessonId={selectedLesson?.id || undefined}
      />
    </div>
  );
}
