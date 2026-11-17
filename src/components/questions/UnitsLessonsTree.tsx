"use client";

import React, { useState } from "react";
import { Unit, Lesson, SubjectName, QuizQuestion } from "@/types";
import {
  Layers,
  ChevronDown,
  ChevronLeft,
  BookOpen,
  HelpCircle,
  Plus,
  Star,
  CheckCircle2,
  FolderOpen,
  FoldHorizontal,
  UnfoldHorizontal,
} from "lucide-react";

interface Props {
  units: Unit[];
  selectedSubject: SubjectName;
  selectedLessonId: string | null;
  selectedUnitId: string | null;
  showAllSubjectQuestions: boolean;
  onSelectLesson: (unitId: string, lessonId: string) => void;
  onSelectUnitAll: (unitId: string) => void;
  onSelectSubjectAll: () => void;
  onQuickAddQuestion: (unitId: string, lessonId: string) => void;
  questions: QuizQuestion[];
}

export function UnitsLessonsTree({
  units,
  selectedSubject,
  selectedLessonId,
  selectedUnitId,
  showAllSubjectQuestions,
  onSelectLesson,
  onSelectUnitAll,
  onSelectSubjectAll,
  onQuickAddQuestion,
  questions,
}: Props) {
  // Accordion state
  const [expandedUnits, setExpandedUnits] = useState<Record<string, boolean>>(() => {
    const init: Record<string, boolean> = {};
    units.forEach((u, i) => {
      init[u.id] = i === 0; // expand first unit by default
    });
    return init;
  });

  function toggleUnit(unitId: string) {
    setExpandedUnits((prev) => ({ ...prev, [unitId]: !prev[unitId] }));
  }

  function collapseAll() {
    const c: Record<string, boolean> = {};
    units.forEach((u) => {
      c[u.id] = false;
    });
    setExpandedUnits(c);
  }

  function expandAll() {
    const e: Record<string, boolean> = {};
    units.forEach((u) => {
      e[u.id] = true;
    });
    setExpandedUnits(e);
  }

  // Count questions per lesson
  function getLessonQuestionCount(lessonId: string): number {
    return questions.filter((q) => q.lessonId === lessonId).length;
  }

  // Count questions per unit
  function getUnitQuestionCount(unit: Unit): number {
    const lessonIds = new Set(unit.lessons.map((l) => l.id));
    lessonIds.add(`unit_exam_${unit.id}`);
    return questions.filter((q) => lessonIds.has(q.lessonId) || q.unitId === unit.id).length;
  }

  return (
    <div className="rounded-2xl bg-surface-low border border-outline-variant/30 p-4 shadow-xl space-y-3">
      {/* Header */}
      <div className="space-y-2 border-b border-outline-variant/20 pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-primary" />
            <h3 className="text-sm font-bold text-on-surface">فهرس الوحدات والدروس</h3>
          </div>
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-primary/10 text-primary font-bold">
            {selectedSubject}
          </span>
        </div>

        {/* Global Controls */}
        <div className="flex items-center justify-between text-[11px] pt-1">
          <button
            onClick={onSelectSubjectAll}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg font-bold transition-all ${
              showAllSubjectQuestions
                ? "bg-primary text-surface-lowest shadow-sm"
                : "bg-surface-container text-on-surface-variant hover:text-on-surface"
            }`}
          >
            <FolderOpen className="w-3.5 h-3.5" />
            <span>جميع أسئلة المادة ({questions.length})</span>
          </button>

          <div className="flex items-center gap-1">
            <button
              onClick={collapseAll}
              className="p-1 rounded text-outline hover:text-on-surface"
              title="ضم الكل"
            >
              <FoldHorizontal className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={expandAll}
              className="p-1 rounded text-outline hover:text-on-surface"
              title="فتح الكل"
            >
              <UnfoldHorizontal className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Units List */}
      <div className="space-y-2.5">
        {units.length === 0 ? (
          <div className="py-8 text-center text-xs text-outline">
            لا توجد وحدات بعد في مادة {selectedSubject}.
          </div>
        ) : (
          units.map((unit, uIdx) => {
            const isExpanded = !!expandedUnits[unit.id];
            const unitQCount = getUnitQuestionCount(unit);
            const isUnitSelected = selectedUnitId === unit.id && !selectedLessonId && !showAllSubjectQuestions;

            return (
              <div
                key={unit.id}
                className="rounded-xl bg-surface-container/40 border border-outline-variant/20 overflow-hidden shadow-sm"
              >
                {/* Unit Header */}
                <div
                  onClick={() => toggleUnit(unit.id)}
                  className={`p-2.5 flex items-center justify-between gap-2 cursor-pointer select-none transition-colors ${
                    isUnitSelected
                      ? "bg-primary/20 border-r-4 border-primary text-primary"
                      : "bg-surface-container/80 hover:bg-surface-high/60 text-on-surface"
                  }`}
                >
                  <div className="flex items-center gap-2 truncate flex-1">
                    <button type="button" className="p-0.5 text-outline">
                      {isExpanded ? (
                        <ChevronDown className="w-3.5 h-3.5 text-primary" />
                      ) : (
                        <ChevronLeft className="w-3.5 h-3.5 text-outline" />
                      )}
                    </button>
                    <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-surface-low border border-outline-variant/30 text-outline">
                      {uIdx + 1}
                    </span>
                    <span className="text-xs font-bold truncate">{unit.title}</span>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        unitQCount > 0
                          ? "bg-secondary/20 text-secondary"
                          : "bg-surface-low text-outline"
                      }`}
                    >
                      {unitQCount} {unitQCount === 1 ? "سؤال" : "أسئلة"}
                    </span>
                  </div>
                </div>

                {/* Unit Body (Lessons Accordion) */}
                {isExpanded && (
                  <div className="p-1.5 space-y-1 bg-surface-lowest/60 border-t border-outline-variant/10 text-xs">
                    {/* View all questions of this unit button */}
                    <button
                      onClick={() => onSelectUnitAll(unit.id)}
                      className={`w-full text-right p-2 rounded-lg text-[11px] font-semibold flex items-center justify-between transition-colors ${
                        selectedUnitId === unit.id && !selectedLessonId && !showAllSubjectQuestions
                          ? "bg-primary/15 text-primary font-bold"
                          : "text-outline hover:text-on-surface hover:bg-surface-container"
                      }`}
                    >
                      <span>📂 عرض كامل أسئلة الوحدة</span>
                      <span className="text-[10px] text-outline font-bold">({unitQCount})</span>
                    </button>

                    {/* Lessons list */}
                    {unit.lessons.map((lesson, lIdx) => {
                      const isSelected =
                        selectedLessonId === lesson.id && !showAllSubjectQuestions;
                      const qCount = getLessonQuestionCount(lesson.id);

                      return (
                        <div
                          key={lesson.id}
                          onClick={() => onSelectLesson(unit.id, lesson.id)}
                          className={`flex items-center justify-between p-2 rounded-lg cursor-pointer transition-all ${
                            isSelected
                              ? "bg-primary/20 text-primary font-bold border-r-3 border-primary shadow-sm"
                              : "text-on-surface-variant hover:text-on-surface hover:bg-surface-container"
                          }`}
                        >
                          <div className="flex items-center gap-1.5 truncate flex-1 min-w-0">
                            <BookOpen className="w-3.5 h-3.5 shrink-0 opacity-70" />
                            <span className="truncate">
                              الدرس {lIdx + 1}: {lesson.title}
                            </span>
                          </div>

                          <div className="flex items-center gap-1.5 shrink-0">
                            <span
                              className={`text-[10px] font-bold px-1.5 py-0.2 rounded-full ${
                                qCount > 0
                                  ? "bg-emerald-500/20 text-emerald-400"
                                  : "bg-surface-high text-outline"
                              }`}
                            >
                              {qCount}
                            </span>

                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                onQuickAddQuestion(unit.id, lesson.id);
                              }}
                              className="p-1 rounded hover:bg-primary/20 text-primary transition-colors"
                              title="إضافة سؤال سريع لهذا الدرس"
                            >
                              <Plus className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                      );
                    })}

                    {/* Unit Exam Questions button */}
                    <div
                      onClick={() => onSelectLesson(unit.id, `unit_exam_${unit.id}`)}
                      className={`flex items-center justify-between p-2 rounded-lg cursor-pointer transition-all ${
                        selectedLessonId === `unit_exam_${unit.id}` && !showAllSubjectQuestions
                          ? "bg-amber-500/20 text-amber-300 font-bold border-r-3 border-amber-400"
                          : "text-amber-400/80 hover:text-amber-300 hover:bg-amber-500/10"
                      }`}
                    >
                      <div className="flex items-center gap-1.5 truncate">
                        <Star className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                        <span className="truncate">امتحان الوحدة الشامل</span>
                      </div>
                      <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-amber-500/20 text-amber-400 font-bold">
                        {getLessonQuestionCount(`unit_exam_${unit.id}`)}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
