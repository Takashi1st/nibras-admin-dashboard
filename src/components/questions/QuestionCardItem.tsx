"use client";

import React from "react";
import { QuizQuestion, QuestionType } from "@/types";
import {
  Edit,
  Trash2,
  CheckCircle2,
  XCircle,
  HelpCircle,
  Sparkles,
  GitCompare,
  ArrowRightLeft,
  Check,
  BookOpen,
} from "lucide-react";

interface Props {
  question: QuizQuestion;
  index: number;
  onEdit: (q: QuizQuestion) => void;
  onDelete: (id: string) => void;
}

const TYPE_CONFIG: Record<
  QuestionType,
  { label: string; color: string; badge: string }
> = {
  mcq: {
    label: "اختيار من متعدد",
    color: "bg-blue-500/15 text-blue-400 border-blue-500/30",
    badge: "MCQ",
  },
  true_false: {
    label: "صح أم خطأ",
    color: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
    badge: "صواب/خطأ",
  },
  fill_blank: {
    label: "أكمل الفراغ",
    color: "bg-amber-500/15 text-amber-400 border-amber-500/30",
    badge: "فراغات",
  },
  matching: {
    label: "طابق ووصل",
    color: "bg-purple-500/15 text-purple-400 border-purple-500/30",
    badge: "مطابقة",
  },
  spot_error: {
    label: "اكتشف الخطأ وصححه",
    color: "bg-rose-500/15 text-rose-400 border-rose-500/30",
    badge: "اكتشاف خطأ",
  },
  sorting: {
    label: "تصنيف المجموعات",
    color: "bg-teal-500/15 text-teal-400 border-teal-500/30",
    badge: "تصنيف",
  },
  rearrangement: {
    label: "ترتيب الكلمات",
    color: "bg-cyan-500/15 text-cyan-400 border-cyan-500/30",
    badge: "ترتيب",
  },
  scenario: {
    label: "موقف ومسألة فقهية",
    color: "bg-indigo-500/15 text-indigo-400 border-indigo-500/30",
    badge: "نازلة / سيناريو",
  },
  word_meaning: {
    label: "معنى المفردة",
    color: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
    badge: "مفردات",
  },
  short_answer: {
    label: "سؤال مقالي قصير",
    color: "bg-violet-500/15 text-violet-400 border-violet-500/30",
    badge: "علل / مقالي",
  },
};

export function QuestionCardItem({ question, index, onEdit, onDelete }: Props) {
  const typeCfg = TYPE_CONFIG[question.type] || TYPE_CONFIG.mcq;
  const d = question.data || {};

  return (
    <div className="rounded-2xl bg-surface-low border border-outline-variant/30 p-4 shadow-sm hover:shadow-md transition-all space-y-3">
      {/* Top Meta Bar */}
      <div className="flex items-center justify-between gap-2 border-b border-outline-variant/15 pb-2.5">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs font-bold text-outline">#{index + 1}</span>
          <span
            className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${typeCfg.color}`}
          >
            {typeCfg.label}
          </span>
          {question.lessonTitle && (
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-surface-container text-on-surface-variant border border-outline-variant/20 flex items-center gap-1">
              <BookOpen className="w-3 h-3 text-primary" />
              <span>{question.lessonTitle}</span>
            </span>
          )}
          <span className="text-[10px] text-outline font-mono">id: {question.id}</span>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-1.5 shrink-0">
          <button
            onClick={() => onEdit(question)}
            className="p-1.5 rounded-lg bg-surface-container hover:bg-surface-high text-outline hover:text-primary transition-colors cursor-pointer"
            title="تعديل السؤال"
          >
            <Edit className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => onDelete(question.id)}
            className="p-1.5 rounded-lg bg-surface-container hover:bg-surface-high text-outline hover:text-error transition-colors cursor-pointer"
            title="حذف السؤال"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Instruction */}
      {question.instruction && (
        <p className="text-[11px] text-outline font-semibold">{question.instruction}</p>
      )}

      {/* Main Content Body */}
      <div className="space-y-2 text-xs">
        {/* 1. MCQ */}
        {question.type === "mcq" && (
          <div className="space-y-2">
            <h4 className="font-bold text-on-surface leading-relaxed">{d.question}</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
              {(d.options || []).map((opt: string, i: number) => {
                const isCorrect = d.correctIndex === i;
                return (
                  <div
                    key={i}
                    className={`flex items-center gap-2 p-2 rounded-xl text-xs border ${
                      isCorrect
                        ? "bg-emerald-500/10 border-emerald-500/40 text-emerald-300 font-bold"
                        : "bg-surface-lowest border-outline-variant/20 text-on-surface-variant"
                    }`}
                  >
                    {isCorrect ? (
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    ) : (
                      <span className="w-3.5 h-3.5 rounded-full border border-outline-variant/40 shrink-0" />
                    )}
                    <span className="truncate">{opt}</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* 2. True / False */}
        {question.type === "true_false" && (
          <div className="space-y-2">
            <h4 className="font-bold text-on-surface leading-relaxed">
              « {d.statement || question.instruction} »
            </h4>
            <div className="flex items-center gap-2">
              <span className="text-[11px] text-outline">الحكم الصحيح:</span>
              <span
                className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full ${
                  d.answer === true
                    ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                    : "bg-rose-500/20 text-rose-400 border border-rose-500/30"
                }`}
              >
                {d.answer === true ? "✓ صواب (صح)" : "✗ خطأ (غير صحيح)"}
              </span>
            </div>
          </div>
        )}

        {/* 3. Fill in Blank */}
        {question.type === "fill_blank" && (
          <div className="space-y-1.5">
            <p className="font-bold text-on-surface leading-relaxed">{d.sentence}</p>
            <div className="flex items-center gap-2 text-[11px]">
              <span className="text-outline">الكلمة الصحيحة في الفراغ:</span>
              <span className="font-bold px-2 py-0.5 rounded bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                {d.correctAnswer || (d.options && d.options[0])}
              </span>
            </div>
          </div>
        )}

        {/* 4. Matching */}
        {question.type === "matching" && (
          <div className="space-y-1.5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {(d.pairs || []).map((p: any, i: number) => (
                <div
                  key={i}
                  className="flex items-center justify-between p-2 rounded-xl bg-surface-lowest border border-outline-variant/20 text-[11px]"
                >
                  <span className="font-bold text-primary">{p.word}</span>
                  <span className="text-outline">↔</span>
                  <span className="text-on-surface-variant truncate max-w-[150px]">
                    {p.definition}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 5. Spot Error */}
        {question.type === "spot_error" && (
          <div className="space-y-1.5">
            <p className="font-bold text-on-surface leading-relaxed">{d.sentence}</p>
            <div className="flex items-center gap-3 text-[11px]">
              <span>
                الخطأ: <strong className="text-rose-400 line-through">{d.incorrectWord}</strong>
              </span>
              <span>
                التصويب: <strong className="text-emerald-400">{d.correctWord}</strong>
              </span>
            </div>
          </div>
        )}

        {/* 6. Sorting */}
        {question.type === "sorting" && (
          <div className="space-y-2">
            <div className="flex items-center gap-4 text-[11px] font-bold">
              <span className="text-primary">1. {d.categories?.[0]}</span>
              <span className="text-secondary">2. {d.categories?.[1]}</span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {(d.items || []).map((it: any, i: number) => (
                <span
                  key={i}
                  className={`text-[10px] px-2 py-0.5 rounded-full border ${
                    it.category === d.categories?.[0]
                      ? "bg-primary/10 border-primary/30 text-primary"
                      : "bg-secondary/10 border-secondary/30 text-secondary"
                  }`}
                >
                  {it.text} ({it.category})
                </span>
              ))}
            </div>
          </div>
        )}

        {/* 7. Rearrangement */}
        {question.type === "rearrangement" && (
          <p className="text-xs font-bold text-on-surface">
            الجملة المستهدفة: « {d.targetSentence || d.sentence} »
          </p>
        )}

        {/* 8. Scenario */}
        {question.type === "scenario" && (
          <div className="space-y-2">
            <div className="p-2.5 rounded-xl bg-purple-500/10 border border-purple-500/20 text-[11px] text-purple-200">
              {d.situation}
            </div>
            <p className="font-bold text-on-surface">{d.question}</p>
          </div>
        )}

        {/* 9. Word Meaning */}
        {question.type === "word_meaning" && (
          <div className="flex items-center gap-2 text-xs">
            <span className="font-bold text-primary font-serif">{d.word}</span>
            <span className="text-outline">←</span>
            <span className="text-on-surface">{d.meaning}</span>
          </div>
        )}

        {/* 10. Short Answer */}
        {question.type === "short_answer" && (
          <div className="space-y-1">
            <p className="font-bold text-on-surface">{d.question}</p>
            <p className="text-[11px] text-emerald-400">
              الإجابة النموذجية: {d.modelAnswer}
            </p>
          </div>
        )}
      </div>

      {/* Explanation Box */}
      {d.explanation && (
        <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-[11px] text-on-surface-variant flex items-start gap-2">
          <span className="font-bold text-amber-400 shrink-0">💡 التعليل:</span>
          <p className="leading-relaxed">{d.explanation}</p>
        </div>
      )}
    </div>
  );
}
