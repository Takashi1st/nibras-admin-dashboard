"use client";

import React, { useState, useEffect } from "react";
import { QuizQuestion, QuestionType, SubjectName, Unit, Lesson } from "@/types";
import {
  X,
  HelpCircle,
  Plus,
  Trash2,
  CheckCircle2,
  Layers,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  Save,
  Check,
  ArrowLeftRight,
  BookOpen,
  AlignLeft,
  SlidersHorizontal,
} from "lucide-react";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSave: (question: QuizQuestion) => Promise<void>;
  initialQuestion?: QuizQuestion | null;
  subjectName: SubjectName;
  units: Unit[];
  defaultUnitId?: string;
  defaultLessonId?: string;
}

const QUESTION_TYPES: {
  type: QuestionType;
  label: string;
  badge: string;
  defaultInstruction: string;
}[] = [
  {
    type: "mcq",
    label: "اختيار من متعدد",
    badge: "MCQ",
    defaultInstruction: "اختر الإجابة الصحيحة من بين الخيارات التالية:",
  },
  {
    type: "true_false",
    label: "صح أم خطأ",
    badge: "صواب/خطأ",
    defaultInstruction: "هل العبارة التالية صحيحة أم خاطئة؟",
  },
  {
    type: "scenario",
    label: "مسألة وسيناريو فقهي",
    badge: "فقه / نازلة",
    defaultInstruction: "اقرأ الموقف التالي ثم استنبط الحكم الأزهري المعتمد:",
  },
  {
    type: "spot_error",
    label: "اكتشف الخطأ وصححه",
    badge: "نحو / ضبط",
    defaultInstruction: "حدّد الكلمة الخاطئة في العبارة التالية وصوّب ضبطها:",
  },
  {
    type: "fill_blank",
    label: "أكمل الفراغ",
    badge: "فراغات",
    defaultInstruction: "امْلأ الفراغ بالكلمة المناسبة:",
  },
  {
    type: "matching",
    label: "طابق ووصل",
    badge: "مطابقة",
    defaultInstruction: "طابق المصطلحات بما يناسبها من أحكام وتعريفات:",
  },
  {
    type: "word_meaning",
    label: "معنى المفردة والمصطلح",
    badge: "مفردات ولغويات",
    defaultInstruction: "بيّن معنى المفردة أو المصطلح المذكور:",
  },
  {
    type: "short_answer",
    label: "سؤال مقالي قصير",
    badge: "علل / مقالي",
    defaultInstruction: "علّل / أجب بأسلوبك وبإيجاز ✍️",
  },
  {
    type: "sorting",
    label: "تصنيف المجموعات",
    badge: "تصنيف",
    defaultInstruction: "صنّف المسائل التالية إلى مجموعتيها المناسبتين:",
  },
  {
    type: "rearrangement",
    label: "ترتيب الكلمات والعبارات",
    badge: "ترتيب",
    defaultInstruction: "رتّب الكلمات والعبارات التالية لتكوين جملة تامة:",
  },
];

export function QuestionEditorModal({
  isOpen,
  onClose,
  onSave,
  initialQuestion,
  subjectName,
  units,
  defaultUnitId,
  defaultLessonId,
}: Props) {
  // Wizard Stepper State: 1 | 2 | 3
  const [step, setStep] = useState<1 | 2 | 3>(1);

  // Navigation: Unit and Lesson selection
  const [selectedUnitId, setSelectedUnitId] = useState<string>(
    defaultUnitId || units[0]?.id || ""
  );
  const [selectedLessonId, setSelectedLessonId] = useState<string>(
    defaultLessonId || units[0]?.lessons[0]?.id || ""
  );

  // Question Type & Instruction
  const [qType, setQType] = useState<QuestionType>("mcq");
  const [instruction, setInstruction] = useState("");
  const [saving, setSaving] = useState(false);

  // 1. MCQ & Scenario state
  const [mcqQuestion, setMcqQuestion] = useState("");
  const [mcqOptions, setMcqOptions] = useState<string[]>(["", "", "", ""]);
  const [mcqCorrectIndex, setMcqCorrectIndex] = useState(0);
  const [scenarioSituation, setScenarioSituation] = useState("");

  // 2. True / False state
  const [tfStatement, setTfStatement] = useState("");
  const [tfAnswer, setTfAnswer] = useState(true);

  // 3. Fill Blank state
  const [fbSentence, setFbSentence] = useState("");
  const [fbCorrectAnswer, setFbCorrectAnswer] = useState("");
  const [fbOptions, setFbOptions] = useState<string[]>(["", "", ""]);

  // 4. Spot Error state
  const [seSentence, setSeSentence] = useState("");
  const [seIncorrectWord, setSeIncorrectWord] = useState("");
  const [seCorrectWord, setSeCorrectWord] = useState("");

  // 5. Matching state
  const [pairs, setPairs] = useState<{ word: string; definition: string }[]>([
    { word: "", definition: "" },
    { word: "", definition: "" },
    { word: "", definition: "" },
  ]);

  // 6. Word Meaning state
  const [wmWord, setWmWord] = useState("");
  const [wmMeaning, setWmMeaning] = useState("");
  const [wmDistractors, setWmDistractors] = useState<string[]>(["", "", ""]);

  // 7. Short Answer state
  const [saQuestion, setSaQuestion] = useState("");
  const [saModelAnswer, setSaModelAnswer] = useState("");
  const [saKeyword, setSaKeyword] = useState("");

  // 8. Sorting state
  const [sortCat1, setSortCat1] = useState("المجموعة الأولى");
  const [sortCat2, setSortCat2] = useState("المجموعة الثانية");
  const [sortItems, setSortItems] = useState<{ text: string; category: string }[]>([
    { text: "", category: "المجموعة الأولى" },
    { text: "", category: "المجموعة الثانية" },
  ]);

  // 9. Rearrangement state
  const [targetSentence, setTargetSentence] = useState("");

  // Common: Explanation
  const [explanation, setExplanation] = useState("");

  const currentUnit = units.find((u) => u.id === selectedUnitId) || units[0];
  const unitLessons = currentUnit?.lessons || [];

  useEffect(() => {
    if (initialQuestion) {
      setQType(initialQuestion.type);
      setInstruction(initialQuestion.instruction || "");
      setSelectedLessonId(initialQuestion.lessonId);

      const parentUnit = units.find(
        (u) =>
          u.id === initialQuestion.unitId ||
          u.lessons.some((l) => l.id === initialQuestion.lessonId) ||
          initialQuestion.lessonId === `unit_exam_${u.id}`
      );
      if (parentUnit) setSelectedUnitId(parentUnit.id);

      const d = initialQuestion.data || {};
      setExplanation(d.explanation || "");

      if (initialQuestion.type === "mcq") {
        setMcqQuestion(d.question || "");
        setMcqOptions(Array.isArray(d.options) ? d.options : ["", "", "", ""]);
        setMcqCorrectIndex(d.correctIndex ?? 0);
      } else if (initialQuestion.type === "true_false") {
        setTfStatement(d.statement || "");
        setTfAnswer(d.answer ?? true);
      } else if (initialQuestion.type === "scenario") {
        setScenarioSituation(d.situation || "");
        setMcqQuestion(d.question || "");
        setMcqOptions(Array.isArray(d.options) ? d.options : ["", "", "", ""]);
        setMcqCorrectIndex(d.correctIndex ?? 0);
      } else if (initialQuestion.type === "spot_error") {
        setSeSentence(d.sentence || "");
        setSeIncorrectWord(d.incorrectWord || "");
        setSeCorrectWord(d.correctWord || "");
      } else if (initialQuestion.type === "fill_blank") {
        setFbSentence(d.sentence || "");
        setFbCorrectAnswer(d.correctAnswer || "");
        setFbOptions(Array.isArray(d.options) ? d.options.filter((o: string) => o !== d.correctAnswer) : ["", ""]);
      } else if (initialQuestion.type === "matching") {
        setPairs(
          Array.isArray(d.pairs) && d.pairs.length > 0
            ? d.pairs
            : [{ word: "", definition: "" }, { word: "", definition: "" }]
        );
      } else if (initialQuestion.type === "word_meaning") {
        setWmWord(d.word || "");
        setWmMeaning(d.meaning || "");
        const distractors = Array.isArray(d.options)
          ? d.options.filter((o: string) => o !== d.meaning)
          : ["", ""];
        setWmDistractors(distractors.length > 0 ? distractors : ["", ""]);
      } else if (initialQuestion.type === "short_answer") {
        setSaQuestion(d.question || "");
        setSaModelAnswer(d.modelAnswer || "");
        setSaKeyword(d.keyword || d.keywords || "");
      } else if (initialQuestion.type === "sorting") {
        if (Array.isArray(d.categories) && d.categories.length >= 2) {
          setSortCat1(d.categories[0]);
          setSortCat2(d.categories[1]);
        }
        setSortItems(
          Array.isArray(d.items) && d.items.length > 0
            ? d.items
            : [
                { text: "", category: d.categories?.[0] || "المجموعة الأولى" },
                { text: "", category: d.categories?.[1] || "المجموعة الثانية" },
              ]
        );
      } else if (initialQuestion.type === "rearrangement") {
        setTargetSentence(d.targetSentence || d.sentence || "");
      }
      setStep(1);
    } else {
      if (defaultUnitId) setSelectedUnitId(defaultUnitId);
      if (defaultLessonId) setSelectedLessonId(defaultLessonId);
      const defaultMeta = QUESTION_TYPES.find((t) => t.type === qType);
      setInstruction(defaultMeta?.defaultInstruction || "");
      setStep(1);
    }
  }, [initialQuestion, isOpen, defaultUnitId, defaultLessonId]);

  function handleTypeChange(type: QuestionType) {
    setQType(type);
    const meta = QUESTION_TYPES.find((t) => t.type === type);
    if (!instruction || QUESTION_TYPES.some((t) => t.defaultInstruction === instruction)) {
      setInstruction(meta?.defaultInstruction || "");
    }
  }

  function handleUnitChange(newUnitId: string) {
    setSelectedUnitId(newUnitId);
    const u = units.find((un) => un.id === newUnitId);
    if (u && u.lessons.length > 0) {
      setSelectedLessonId(u.lessons[0].id);
    } else if (u) {
      setSelectedLessonId(`unit_exam_${u.id}`);
    }
  }

  async function handleFinalSave() {
    setSaving(true);
    try {
      let data: Record<string, any> = { explanation: explanation.trim() };

      switch (qType) {
        case "mcq":
          data.question = mcqQuestion.trim();
          data.options = mcqOptions.map((o) => o.trim()).filter(Boolean);
          data.correctIndex = mcqCorrectIndex;
          break;

        case "true_false":
          data.statement = tfStatement.trim();
          data.answer = tfAnswer;
          break;

        case "scenario":
          data.situation = scenarioSituation.trim();
          data.question = mcqQuestion.trim();
          data.options = mcqOptions.map((o) => o.trim()).filter(Boolean);
          data.correctIndex = mcqCorrectIndex;
          break;

        case "spot_error":
          data.sentence = seSentence.trim();
          data.incorrectWord = seIncorrectWord.trim();
          data.correctWord = seCorrectWord.trim();
          data.words = seSentence.trim().split(/\s+/);
          break;

        case "fill_blank":
          data.sentence = fbSentence.trim();
          data.correctAnswer = fbCorrectAnswer.trim();
          data.options = [
            fbCorrectAnswer.trim(),
            ...fbOptions.map((o) => o.trim()).filter((o) => o && o !== fbCorrectAnswer.trim()),
          ];
          break;

        case "matching":
          data.pairs = pairs
            .map((p) => ({ word: p.word.trim(), definition: p.definition.trim() }))
            .filter((p) => p.word && p.definition);
          break;

        case "word_meaning":
          data.word = wmWord.trim();
          data.meaning = wmMeaning.trim();
          data.options = [
            wmMeaning.trim(),
            ...wmDistractors.map((o) => o.trim()).filter((o) => o && o !== wmMeaning.trim()),
          ];
          data.correctIndex = 0;
          break;

        case "short_answer":
          data.question = saQuestion.trim();
          data.modelAnswer = saModelAnswer.trim();
          data.keyword = saKeyword.trim();
          data.keywords = saKeyword.trim();
          break;

        case "sorting":
          data.categories = [sortCat1.trim(), sortCat2.trim()];
          data.buckets = [
            { id: "b1", name: sortCat1.trim() },
            { id: "b2", name: sortCat2.trim() },
          ];
          data.items = sortItems
            .map((it) => ({
              text: it.text.trim(),
              category: it.category.trim(),
              bucketId: it.category.trim() === sortCat1.trim() ? "b1" : "b2",
            }))
            .filter((it) => it.text);
          break;

        case "rearrangement":
          data.targetSentence = targetSentence.trim();
          data.pool = targetSentence
            .trim()
            .split(/\s+/)
            .filter(Boolean)
            .sort(() => Math.random() - 0.5);
          break;
      }

      const qId = initialQuestion?.id || `q_${Date.now()}`;
      const questionPayload: QuizQuestion = {
        id: qId,
        lessonId: selectedLessonId,
        type: qType,
        instruction: instruction.trim(),
        data,
        subjectName,
        unitId: selectedUnitId,
      };

      await onSave(questionPayload);
      onClose();
    } catch (err) {
      console.error(err);
      alert("حدث خطأ أثناء حفظ السؤال");
    } finally {
      setSaving(false);
    }
  }

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="relative w-full max-w-3xl max-h-[90vh] flex flex-col rounded-2xl bg-[#121622] border border-white/10 shadow-2xl overflow-hidden text-xs text-on-surface">
        {/* Header with Title and Close */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/5 bg-surface-low">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 rounded-lg bg-primary/10 text-primary border border-primary/20">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-on-surface">
                {initialQuestion ? "تعديل السؤال" : "معالج إنشاء الأسئلة خطوة بخطوة"}
              </h2>
              <p className="text-[11px] text-on-surface-muted">
                المادة: <strong className="text-primary">{subjectName}</strong>
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-white/5 text-on-surface-muted hover:text-on-surface cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* 3-Step Wizard Navigation Stepper */}
        <div className="grid grid-cols-3 border-b border-white/5 bg-[#0e121d] text-center text-xs select-none">
          <button
            type="button"
            onClick={() => setStep(1)}
            className={`py-3 px-2 border-b-2 font-semibold transition-all cursor-pointer ${
              step === 1
                ? "border-primary text-primary bg-white/5"
                : "border-transparent text-on-surface-muted hover:text-on-surface"
            }`}
          >
            <span>1. الموضع والنوع</span>
          </button>
          <button
            type="button"
            onClick={() => setStep(2)}
            className={`py-3 px-2 border-b-2 font-semibold transition-all cursor-pointer ${
              step === 2
                ? "border-primary text-primary bg-white/5"
                : "border-transparent text-on-surface-muted hover:text-on-surface"
            }`}
          >
            <span>2. صياغة السؤال والبدائل</span>
          </button>
          <button
            type="button"
            onClick={() => setStep(3)}
            className={`py-3 px-2 border-b-2 font-semibold transition-all cursor-pointer ${
              step === 3
                ? "border-primary text-primary bg-white/5"
                : "border-transparent text-on-surface-muted hover:text-on-surface"
            }`}
          >
            <span>3. التعليل والاعتماد</span>
          </button>
        </div>

        {/* Step Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5">
          {/* STEP 1: Mوضع ونوع السؤال */}
          {step === 1 && (
            <div className="space-y-4">
              <div className="p-3.5 rounded-xl bg-surface-low border border-white/5 space-y-3">
                <span className="text-xs font-semibold text-primary flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5" />
                  <span>تحديد موضع السؤال في المنهج:</span>
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] text-on-surface-muted mb-1 font-medium">
                      الوحدة الدراسية:
                    </label>
                    <select
                      value={selectedUnitId}
                      onChange={(e) => handleUnitChange(e.target.value)}
                      className="w-full rounded-lg bg-surface-container border border-white/5 p-2 text-xs text-on-surface focus:outline-none focus:border-primary"
                    >
                      {units.map((u) => (
                        <option key={u.id} value={u.id}>
                          {u.title}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-[11px] text-on-surface-muted mb-1 font-medium">
                      الدرس المستهدف:
                    </label>
                    <select
                      value={selectedLessonId}
                      onChange={(e) => setSelectedLessonId(e.target.value)}
                      className="w-full rounded-lg bg-surface-container border border-white/5 p-2 text-xs text-on-surface focus:outline-none focus:border-primary"
                    >
                      {unitLessons.map((l) => (
                        <option key={l.id} value={l.id}>
                          {l.title}
                        </option>
                      ))}
                      {currentUnit && (
                        <option value={`unit_exam_${currentUnit.id}`}>
                          امتحان الوحدة الشامل ({currentUnit.title})
                        </option>
                      )}
                    </select>
                  </div>
                </div>
              </div>

              {/* Question Types Grid */}
              <div className="space-y-2">
                <label className="block text-xs font-semibold text-on-surface-muted">
                  اختر نوع السؤال والقالب المتوافق مع المادة:
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {QUESTION_TYPES.map((t) => (
                    <button
                      key={t.type}
                      type="button"
                      onClick={() => handleTypeChange(t.type)}
                      className={`p-3 rounded-xl border text-right transition-all cursor-pointer flex flex-col justify-between ${
                        qType === t.type
                          ? "bg-primary/10 border-primary text-primary"
                          : "bg-surface-low border-white/5 text-on-surface hover:bg-surface-container"
                      }`}
                    >
                      <div className="font-bold text-xs">{t.label}</div>
                      <span className="text-[10px] text-on-surface-muted mt-1">
                        {t.badge}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Instruction */}
              <div>
                <label className="block text-xs font-semibold text-on-surface-muted mb-1">
                  نص التوجيه / صيغة السؤال (Instruction):
                </label>
                <input
                  type="text"
                  value={instruction}
                  onChange={(e) => setInstruction(e.target.value)}
                  className="w-full rounded-lg bg-surface-low border border-white/5 p-2.5 text-xs text-on-surface focus:outline-none focus:border-primary"
                />
              </div>
            </div>
          )}

          {/* STEP 2: صياغة السؤال والبدائل */}
          {step === 2 && (
            <div className="space-y-4">
              {/* 1. MCQ & Scenario */}
              {(qType === "mcq" || qType === "scenario") && (
                <div className="space-y-3">
                  {qType === "scenario" && (
                    <div>
                      <label className="block text-xs font-semibold text-secondary mb-1">
                        الواقعة أو السيناريو الفقهي:
                      </label>
                      <textarea
                        rows={3}
                        placeholder="مثال: رجل دخل في الصلاة المفروضة ثم تذكر أنه لم يتوضأ..."
                        value={scenarioSituation}
                        onChange={(e) => setScenarioSituation(e.target.value)}
                        className="w-full rounded-lg bg-surface-low border border-white/5 p-2.5 text-xs text-on-surface focus:outline-none focus:border-primary"
                      />
                    </div>
                  )}

                  <div>
                    <label className="block text-xs font-semibold text-on-surface-muted mb-1">
                      نص السؤال / المطلب:
                    </label>
                    <input
                      type="text"
                      placeholder="ما الحكم الأزهري المعتمد في المسألة؟"
                      value={mcqQuestion}
                      onChange={(e) => setMcqQuestion(e.target.value)}
                      className="w-full rounded-lg bg-surface-low border border-white/5 p-2.5 text-xs text-on-surface focus:outline-none focus:border-primary font-semibold"
                    />
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="text-xs font-semibold text-on-surface-muted">
                        الخيارات (انقر على الدائرة لتحديد الإجابة الصحيحة):
                      </label>
                      {mcqOptions.length < 6 && (
                        <button
                          type="button"
                          onClick={() => setMcqOptions([...mcqOptions, ""])}
                          className="text-[11px] text-primary hover:underline flex items-center gap-1 cursor-pointer"
                        >
                          <Plus className="w-3 h-3" />
                          <span>إضافة خيار</span>
                        </button>
                      )}
                    </div>

                    <div className="space-y-2">
                      {mcqOptions.map((opt, oIdx) => (
                        <div key={oIdx} className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => setMcqCorrectIndex(oIdx)}
                            className={`w-6 h-6 rounded-full border flex items-center justify-center shrink-0 cursor-pointer ${
                              mcqCorrectIndex === oIdx
                                ? "bg-secondary border-secondary text-[#0b0f19]"
                                : "border-white/20 text-transparent"
                            }`}
                          >
                            <Check className="w-3.5 h-3.5 font-bold" />
                          </button>
                          <input
                            type="text"
                            placeholder={`الخيار ${oIdx + 1}`}
                            value={opt}
                            onChange={(e) => {
                              const next = [...mcqOptions];
                              next[oIdx] = e.target.value;
                              setMcqOptions(next);
                            }}
                            className={`flex-1 rounded-lg bg-surface-low border p-2 text-xs text-on-surface focus:outline-none ${
                              mcqCorrectIndex === oIdx
                                ? "border-secondary/50 font-bold"
                                : "border-white/5"
                            }`}
                          />
                          {mcqOptions.length > 2 && (
                            <button
                              type="button"
                              onClick={() => {
                                const next = mcqOptions.filter((_, idx) => idx !== oIdx);
                                setMcqOptions(next);
                                if (mcqCorrectIndex >= next.length) {
                                  setMcqCorrectIndex(0);
                                }
                              }}
                              className="p-1.5 text-on-surface-muted hover:text-error"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* 2. True / False */}
              {qType === "true_false" && (
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-semibold text-on-surface-muted mb-1">
                      نص العبارة المراد الحكم عليها:
                    </label>
                    <textarea
                      rows={3}
                      value={tfStatement}
                      onChange={(e) => setTfStatement(e.target.value)}
                      className="w-full rounded-lg bg-surface-low border border-white/5 p-2.5 text-xs text-on-surface focus:outline-none focus:border-primary"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-on-surface-muted mb-2">
                      الحكم الشرعي الصحيح:
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        type="button"
                        onClick={() => setTfAnswer(true)}
                        className={`py-3 rounded-xl border font-bold text-center transition-all cursor-pointer ${
                          tfAnswer === true
                            ? "bg-secondary/15 border-secondary text-secondary"
                            : "bg-surface-low border-white/5 text-on-surface-muted"
                        }`}
                      >
                        صواب (صح ✔️)
                      </button>
                      <button
                        type="button"
                        onClick={() => setTfAnswer(false)}
                        className={`py-3 rounded-xl border font-bold text-center transition-all cursor-pointer ${
                          tfAnswer === false
                            ? "bg-rose-500/15 border-rose-500 text-rose-400"
                            : "bg-surface-low border-white/5 text-on-surface-muted"
                        }`}
                      >
                        خطأ (❌)
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* 3. Matching (طابق ووصل) */}
              {qType === "matching" && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-xs font-bold text-on-surface">
                        أزواج المطابقة والتوصيل:
                      </h4>
                      <p className="text-[11px] text-on-surface-muted">
                        اكتب الكلمة/المصطلح وما يقابلها من تعريف أو حكم (يخلطها التطبيق تلقائياً للطالب).
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setPairs([...pairs, { word: "", definition: "" }])}
                      className="px-2.5 py-1 rounded-lg bg-primary/10 border border-primary/20 text-primary text-xs font-bold flex items-center gap-1 hover:bg-primary/20 cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>+ إضافة زوج جديد</span>
                    </button>
                  </div>

                  <div className="space-y-2">
                    {pairs.map((p, pIdx) => (
                      <div
                        key={pIdx}
                        className="p-3 rounded-xl bg-surface-low border border-white/5 flex items-center gap-2.5"
                      >
                        <span className="text-[10px] font-bold text-primary px-1.5 py-0.5 rounded bg-white/5">
                          #{pIdx + 1}
                        </span>
                        <input
                          type="text"
                          placeholder="الكلمة / المصطلح (الطرف الأول)"
                          value={p.word}
                          onChange={(e) => {
                            const next = [...pairs];
                            next[pIdx].word = e.target.value;
                            setPairs(next);
                          }}
                          className="flex-1 rounded-lg bg-[#0b0f19] border border-white/10 p-2 text-xs text-on-surface focus:outline-none focus:border-primary"
                        />
                        <ArrowLeftRight className="w-3.5 h-3.5 text-secondary shrink-0" />
                        <input
                          type="text"
                          placeholder="التعريف / الحكم المقابل (الطرف الثاني)"
                          value={p.definition}
                          onChange={(e) => {
                            const next = [...pairs];
                            next[pIdx].definition = e.target.value;
                            setPairs(next);
                          }}
                          className="flex-1 rounded-lg bg-[#0b0f19] border border-white/10 p-2 text-xs text-on-surface focus:outline-none focus:border-primary"
                        />
                        {pairs.length > 1 && (
                          <button
                            type="button"
                            onClick={() => setPairs(pairs.filter((_, idx) => idx !== pIdx))}
                            className="p-1.5 text-on-surface-muted hover:text-error cursor-pointer"
                            title="حذف الزوج"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* 4. Word Meaning (معاني المفردات والمصطلحات) */}
              {qType === "word_meaning" && (
                <div className="space-y-3">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-primary mb-1">
                        الكلمة أو المصطلح اللغوي / الفقهي:
                      </label>
                      <input
                        type="text"
                        placeholder="مثال: الغاشية / عول الفرائض"
                        value={wmWord}
                        onChange={(e) => setWmWord(e.target.value)}
                        className="w-full rounded-lg bg-surface-low border border-white/5 p-2.5 text-xs text-on-surface focus:outline-none focus:border-primary font-bold"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-secondary mb-1">
                        المعنى أو التفسير الصحيح:
                      </label>
                      <input
                        type="text"
                        placeholder="مثال: القيامة التي تغشى الناس بأهوالها"
                        value={wmMeaning}
                        onChange={(e) => setWmMeaning(e.target.value)}
                        className="w-full rounded-lg bg-surface-low border border-secondary/30 p-2.5 text-xs text-on-surface focus:outline-none focus:border-secondary font-semibold"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-on-surface-muted mb-1.5">
                      خيارات بديلة مضللة (مشتتات لاختبار الطالب في معنى المفردة):
                    </label>
                    <div className="space-y-2">
                      {wmDistractors.map((d, dIdx) => (
                        <div key={dIdx} className="flex items-center gap-2">
                          <span className="text-[10px] text-on-surface-muted w-14">
                            مشتت {dIdx + 1}:
                          </span>
                          <input
                            type="text"
                            placeholder="معنى مضلل آخر..."
                            value={d}
                            onChange={(e) => {
                              const next = [...wmDistractors];
                              next[dIdx] = e.target.value;
                              setWmDistractors(next);
                            }}
                            className="flex-1 rounded-lg bg-surface-low border border-white/5 p-2 text-xs text-on-surface focus:outline-none focus:border-primary"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* 5. Short Answer (سؤال مقالي قصير / علل) */}
              {qType === "short_answer" && (
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-semibold text-on-surface-muted mb-1">
                      نص السؤال المقالي أو مسألة التعليل:
                    </label>
                    <textarea
                      rows={2}
                      placeholder="مثال: علل: وجوب تقديم غسل الوجه على اليدين في الوضوء."
                      value={saQuestion}
                      onChange={(e) => setSaQuestion(e.target.value)}
                      className="w-full rounded-lg bg-surface-low border border-white/5 p-2.5 text-xs text-on-surface focus:outline-none focus:border-primary font-semibold"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-secondary mb-1">
                      الإجابة النموذجية الكاملة (تظهر للطالب بعد التسليم):
                    </label>
                    <textarea
                      rows={3}
                      placeholder="اكتب الإجابة النموذجية المفصلة..."
                      value={saModelAnswer}
                      onChange={(e) => setSaModelAnswer(e.target.value)}
                      className="w-full rounded-lg bg-surface-low border border-white/5 p-2.5 text-xs text-on-surface focus:outline-none focus:border-primary"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-primary mb-1">
                      الكلمات المفتاحية المطلوبة للتصحيح الآلي (افصل بينها بفاصلة ,):
                    </label>
                    <input
                      type="text"
                      placeholder="مثال: الترتيب, الآية الكريمة, فرض"
                      value={saKeyword}
                      onChange={(e) => setSaKeyword(e.target.value)}
                      className="w-full rounded-lg bg-surface-low border border-primary/30 p-2.5 text-xs text-on-surface focus:outline-none focus:border-primary"
                    />
                    <p className="text-[10px] text-on-surface-muted mt-1">
                      إذا تضمنت إجابة الطالب أياً من هذه الكلمات المفتاحية يُعتبر جوابه صواباً تلقائياً.
                    </p>
                  </div>
                </div>
              )}

              {/* 6. Sorting (تصنيف المجموعات) */}
              {qType === "sorting" && (
                <div className="space-y-3">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-primary mb-1">
                        اسم المجموعة الأولى:
                      </label>
                      <input
                        type="text"
                        value={sortCat1}
                        onChange={(e) => setSortCat1(e.target.value)}
                        className="w-full rounded-lg bg-surface-low border border-primary/30 p-2 text-xs text-on-surface focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-secondary mb-1">
                        اسم المجموعة الثانية:
                      </label>
                      <input
                        type="text"
                        value={sortCat2}
                        onChange={(e) => setSortCat2(e.target.value)}
                        className="w-full rounded-lg bg-surface-low border border-secondary/30 p-2 text-xs text-on-surface focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="space-y-2 pt-2">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-semibold text-on-surface-muted">
                        العناصر المراد تصنيفها:
                      </label>
                      <button
                        type="button"
                        onClick={() => setSortItems([...sortItems, { text: "", category: sortCat1 }])}
                        className="px-2 py-1 rounded-md bg-primary/10 text-primary text-[11px] font-bold hover:bg-primary/20 flex items-center gap-1 cursor-pointer"
                      >
                        <Plus className="w-3 h-3" />
                        <span>+ إضافة عنصر</span>
                      </button>
                    </div>

                    <div className="space-y-2">
                      {sortItems.map((it, itIdx) => (
                        <div
                          key={itIdx}
                          className="flex items-center gap-2 p-2.5 rounded-lg bg-surface-low border border-white/5"
                        >
                          <input
                            type="text"
                            placeholder="نص المسألة أو العنصر..."
                            value={it.text}
                            onChange={(e) => {
                              const next = [...sortItems];
                              next[itIdx].text = e.target.value;
                              setSortItems(next);
                            }}
                            className="flex-1 rounded-lg bg-[#0b0f19] border border-white/10 p-2 text-xs text-on-surface focus:outline-none"
                          />
                          <select
                            value={it.category}
                            onChange={(e) => {
                              const next = [...sortItems];
                              next[itIdx].category = e.target.value;
                              setSortItems(next);
                            }}
                            className="rounded-lg bg-[#0b0f19] border border-white/10 p-2 text-xs text-on-surface focus:outline-none"
                          >
                            <option value={sortCat1}>{sortCat1}</option>
                            <option value={sortCat2}>{sortCat2}</option>
                          </select>
                          {sortItems.length > 2 && (
                            <button
                              type="button"
                              onClick={() => setSortItems(sortItems.filter((_, idx) => idx !== itIdx))}
                              className="p-1 text-on-surface-muted hover:text-error cursor-pointer"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* 7. Spot Error (اكتشف الخطأ وصححه) */}
              {qType === "spot_error" && (
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-semibold text-on-surface-muted mb-1">
                      الجملة التي تحتوي على الخطأ (نحو أو إعراب أو معنى):
                    </label>
                    <input
                      type="text"
                      placeholder="مثال: كان الطالبان مجتهدان"
                      value={seSentence}
                      onChange={(e) => setSeSentence(e.target.value)}
                      className="w-full rounded-lg bg-surface-low border border-white/5 p-2.5 text-xs text-on-surface focus:outline-none focus:border-primary"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] text-rose-400 mb-1 font-semibold">
                        الكلمة الخاطئة:
                      </label>
                      <input
                        type="text"
                        placeholder="مجتهدان"
                        value={seIncorrectWord}
                        onChange={(e) => setSeIncorrectWord(e.target.value)}
                        className="w-full rounded-lg bg-surface-low border border-rose-500/30 p-2 text-xs text-on-surface focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] text-secondary mb-1 font-semibold">
                        التصويب الصحيح:
                      </label>
                      <input
                        type="text"
                        placeholder="مجتهدين"
                        value={seCorrectWord}
                        onChange={(e) => setSeCorrectWord(e.target.value)}
                        className="w-full rounded-lg bg-surface-low border border-secondary/30 p-2 text-xs text-on-surface focus:outline-none"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* 8. Fill Blank (أكمل الفراغ) */}
              {qType === "fill_blank" && (
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-semibold text-on-surface-muted mb-1">
                      الجملة وبها علامة الفراغ (استخدم ___ للفراغ):
                    </label>
                    <input
                      type="text"
                      placeholder="المراد بالأصل في لغة العرب هو ما ___ عليه غيره."
                      value={fbSentence}
                      onChange={(e) => setFbSentence(e.target.value)}
                      className="w-full rounded-lg bg-surface-low border border-white/5 p-2.5 text-xs text-on-surface focus:outline-none focus:border-primary"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-secondary mb-1">
                      الكلمة الصحيحة لملء الفراغ:
                    </label>
                    <input
                      type="text"
                      placeholder="يبنى"
                      value={fbCorrectAnswer}
                      onChange={(e) => setFbCorrectAnswer(e.target.value)}
                      className="w-full rounded-lg bg-surface-low border border-secondary/40 p-2 text-xs text-on-surface focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-on-surface-muted mb-1">
                      خيارات بديلة مضللة (مشتتات):
                    </label>
                    <div className="space-y-1.5">
                      {fbOptions.map((opt, idx) => (
                        <input
                          key={idx}
                          type="text"
                          placeholder={`خيار مشتت ${idx + 1}`}
                          value={opt}
                          onChange={(e) => {
                            const next = [...fbOptions];
                            next[idx] = e.target.value;
                            setFbOptions(next);
                          }}
                          className="w-full rounded-lg bg-surface-low border border-white/5 p-2 text-xs text-on-surface focus:outline-none"
                        />
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* 9. Rearrangement (ترتيب الكلمات والعبارات) */}
              {qType === "rearrangement" && (
                <div>
                  <label className="block text-xs font-semibold text-on-surface-muted mb-1">
                    الجملة المرتبة ترتيباً صحيحاً (سيقوم النظام بخلطها تلقائياً للطالب):
                  </label>
                  <input
                    type="text"
                    value={targetSentence}
                    onChange={(e) => setTargetSentence(e.target.value)}
                    className="w-full rounded-lg bg-surface-low border border-white/5 p-2.5 text-xs text-on-surface focus:outline-none focus:border-primary"
                  />
                </div>
              )}
            </div>
          )}

          {/* STEP 3: التعليل والاعتماد */}
          {step === 3 && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-surface-low border border-white/5 space-y-2">
                <span className="text-xs font-bold text-primary">
                  ملخص السؤال قبل الحفظ:
                </span>
                <div className="text-[11px] text-on-surface-muted space-y-1">
                  <div>المادة: <strong className="text-on-surface">{subjectName}</strong></div>
                  <div>نوع السؤال: <strong className="text-on-surface">{QUESTION_TYPES.find(t => t.type === qType)?.label}</strong></div>
                  <div>صيغة التوجيه: {instruction}</div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-on-surface-muted mb-1">
                  التعليل الأزهري / الشرح والتوضيح (يظهر للطالب بعد إجابته):
                </label>
                <textarea
                  rows={4}
                  placeholder="اكتب الدليل، العلة، أو القاعدة الأزهرية المعتمدة لتثبيت الفهم لدى الطالب..."
                  value={explanation}
                  onChange={(e) => setExplanation(e.target.value)}
                  className="w-full rounded-lg bg-surface-low border border-white/5 p-3 text-xs text-on-surface focus:outline-none focus:border-primary resize-none leading-relaxed"
                />
              </div>
            </div>
          )}
        </div>

        {/* Wizard Footer Controls */}
        <div className="flex items-center justify-between px-6 py-3.5 border-t border-white/5 bg-surface-low">
          <div>
            {step > 1 && (
              <button
                type="button"
                onClick={() => setStep((step - 1) as any)}
                className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-surface-container text-on-surface-muted hover:text-on-surface text-xs font-medium cursor-pointer"
              >
                <ChevronRight className="w-3.5 h-3.5" />
                <span>السابق</span>
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1.5 rounded-lg text-on-surface-muted hover:text-on-surface text-xs cursor-pointer"
            >
              إلغاء
            </button>

            {step < 3 ? (
              <button
                type="button"
                onClick={() => setStep((step + 1) as any)}
                className="flex items-center gap-1 px-4 py-1.5 rounded-lg bg-primary text-[#0b0f19] font-bold text-xs hover:brightness-105 active:scale-95 transition-all cursor-pointer"
              >
                <span>التالي</span>
                <ChevronLeft className="w-3.5 h-3.5" />
              </button>
            ) : (
              <button
                type="button"
                onClick={handleFinalSave}
                disabled={saving}
                className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-primary text-[#0b0f19] font-bold text-xs hover:brightness-105 active:scale-95 disabled:opacity-50 transition-all cursor-pointer shadow-sm"
              >
                <Save className="w-3.5 h-3.5" />
                <span>{saving ? "جاري الحفظ..." : "حفظ واعتماد السؤال"}</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
