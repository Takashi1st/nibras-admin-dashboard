"use client";

import React, { useState } from "react";
import { ExplanationCard } from "@/types";
import {
  Scale,
  BookOpen,
  Sparkles,
  Scroll,
  HelpCircle,
  Eye,
  EyeOff,
  GitCompare,
  Swords,
  BookA,
  BookMarked,
  Lightbulb,
  ChevronDown,
  ChevronUp,
  CheckCircle2,
  XCircle,
} from "lucide-react";

interface Props {
  cards: ExplanationCard[];
  lessonTitle: string;
}

export function CardPreview({ cards, lessonTitle }: Props) {
  const [revealedGuess, setRevealedGuess] = useState<Record<number, boolean>>({});
  const [quizAnswers, setQuizAnswers] = useState<Record<number, boolean | null>>({});
  const [openAccordion, setOpenAccordion] = useState<Record<string, boolean>>({});

  function toggleGuess(idx: number) {
    setRevealedGuess((prev) => ({ ...prev, [idx]: !prev[idx] }));
  }

  function handleAnswerQuiz(idx: number, ans: boolean) {
    setQuizAnswers((prev) => ({ ...prev, [idx]: ans }));
  }

  function toggleAccordion(key: string) {
    setOpenAccordion((prev) => ({ ...prev, [key]: !prev[key] }));
  }

  if (cards.length === 0) {
    return (
      <div className="p-8 text-center text-xs text-outline bg-surface-low rounded-2xl border border-outline-variant/30">
        لا توجد بطاقات شرح لعرضها. أضف بطاقات من المحرر لرؤية المعاينة الحية.
      </div>
    );
  }

  return (
    <div className="space-y-4 max-w-xl mx-auto py-2">
      <div className="text-center pb-2 border-b border-outline-variant/20">
        <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-primary/10 text-primary border border-primary/20">
          📱 محاكاة شاشة الهاتف (تطبيق نبراس)
        </span>
        <h3 className="text-sm font-bold text-on-surface mt-2">{lessonTitle}</h3>
      </div>

      {cards.map((card, idx) => {
        const extra = card.extraData || {};

        return (
          <div
            key={idx}
            className="rounded-2xl bg-surface-container/70 border border-outline-variant/30 p-4 shadow-md space-y-3"
          >
            {/* 1. Tawheed Ruling Card Preview */}
            {card.type === "tawheedRuling" && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 rounded-lg bg-amber-500/20 text-amber-400">
                      <Scale className="w-4 h-4" />
                    </div>
                    <span className="text-xs font-bold text-on-surface">
                      {extra.title || "تأصيل المسألة العقدية"}
                    </span>
                  </div>
                  <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-amber-500 text-surface-lowest font-black">
                    {extra.rulingBadge || "واجب"}
                  </span>
                </div>

                {(extra.defLang || extra.defTerm) && (
                  <div className="p-2.5 rounded-xl bg-surface-low/80 text-[11px] space-y-1 border border-outline-variant/20">
                    {extra.defLang && (
                      <p>
                        <span className="font-bold text-amber-400">لغة: </span>
                        <span className="text-on-surface-variant">{extra.defLang}</span>
                      </p>
                    )}
                    {extra.defTerm && (
                      <p>
                        <span className="font-bold text-amber-400">اصطلاحاً: </span>
                        <span className="text-on-surface-variant">{extra.defTerm}</span>
                      </p>
                    )}
                  </div>
                )}

                {extra.rulingText && (
                  <p className="text-xs font-semibold text-on-surface leading-relaxed">
                    {extra.rulingText}
                  </p>
                )}

                {extra.naqliProof && (
                  <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-[11px]">
                    <span className="font-bold text-emerald-400 block mb-0.5">📜 الدليل النقلي:</span>
                    <span className="text-on-surface font-serif">{extra.naqliProof}</span>
                  </div>
                )}

                {extra.aqliProof && (
                  <div className="p-2.5 rounded-xl bg-blue-500/10 border border-blue-500/20 text-[11px]">
                    <span className="font-bold text-blue-400 block mb-0.5">🧠 الدليل العقلي:</span>
                    <span className="text-on-surface">{extra.aqliProof}</span>
                  </div>
                )}
              </div>
            )}

            {/* 2. Tawheed Details Card Preview */}
            {card.type === "tawheedDetails" && (
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-lg bg-blue-500/20 text-blue-400">
                    <BookOpen className="w-4 h-4" />
                  </div>
                  <h4 className="text-xs font-bold text-on-surface">{extra.title || "تفاصيل العقيدة"}</h4>
                </div>

                {extra.explanation && (
                  <p className="text-xs text-on-surface-variant leading-relaxed">
                    {extra.explanation}
                  </p>
                )}

                {extra.items && extra.items.length > 0 && (
                  <div className="space-y-2 pt-1">
                    {extra.itemsHeader && (
                      <span className="text-[11px] font-bold text-blue-400 block">
                        {extra.itemsHeader}
                      </span>
                    )}
                    <div className="grid grid-cols-1 gap-1.5">
                      {extra.items.map((it: any, i: number) => (
                        <div
                          key={i}
                          className="flex items-start gap-2 p-2 rounded-xl bg-surface-low border border-outline-variant/20 text-[11px]"
                        >
                          <span className="font-bold text-primary shrink-0">{it.name}:</span>
                          <span className="text-on-surface-variant">{it.task}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* 3. Surah Intro Preview */}
            {card.type === "surahIntro" && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <BookMarked className="w-4 h-4 text-emerald-400" />
                    <span className="text-xs font-bold text-on-surface">
                      سورة {extra.surahName || "الكريمة"}
                    </span>
                  </div>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-bold">
                    {extra.type || "مكّيّة"} • {extra.versesCount || ""}
                  </span>
                </div>

                {extra.revelationReason && (
                  <p className="text-[11px] text-on-surface-variant bg-surface-low p-2 rounded-xl border border-outline-variant/20">
                    <span className="font-bold text-emerald-400">سبب النزول: </span>
                    {extra.revelationReason}
                  </p>
                )}

                {extra.summary && (
                  <p className="text-xs text-on-surface leading-relaxed">{extra.summary}</p>
                )}
              </div>
            )}

            {/* 4. Tafsir Analysis Preview */}
            {card.type === "tafsirAnalysis" && (
              <div className="space-y-3">
                <div className="text-center p-3 rounded-xl bg-teal-500/10 border border-teal-500/20 font-serif text-sm text-teal-300 leading-loose">
                  {extra.verseText || card.content}
                </div>

                {extra.generalExegesis && (
                  <p className="text-xs text-on-surface leading-relaxed">
                    <span className="font-bold text-teal-400">التفسير: </span>
                    {extra.generalExegesis}
                  </p>
                )}

                {extra.words && extra.words.length > 0 && (
                  <div className="space-y-1.5">
                    {extra.words.map((w: any, i: number) => (
                      <div
                        key={i}
                        className="p-2 rounded-xl bg-surface-low border border-outline-variant/20 text-[11px]"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-primary font-serif">{w.word}</span>
                          <span className="text-on-surface-variant">{w.meaning}</span>
                        </div>
                        {(w.qiraat || w.irab) && (
                          <div className="mt-1 pt-1 border-t border-outline-variant/10 flex flex-wrap gap-2 text-[10px] text-outline">
                            {w.qiraat && <span>القراءات: {w.qiraat}</span>}
                            {w.irab && <span>الإعراب: {w.irab}</span>}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* 5. Hadith Text Preview */}
            {card.type === "hadithText" && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-cyan-400">
                    {extra.title || "متن الحديث الشريف"}
                  </span>
                  {extra.takhrij && (
                    <span className="text-[10px] text-outline">{extra.takhrij}</span>
                  )}
                </div>

                <div className="p-3.5 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-center font-serif text-sm text-on-surface leading-loose">
                  {extra.hadithText || card.content}
                </div>

                {extra.narrator && (
                  <p className="text-[11px] text-outline">
                    <span className="font-bold text-cyan-400">الراوي: </span>
                    {extra.narrator}
                  </p>
                )}
              </div>
            )}

            {/* 6. Hadith Vocab Preview */}
            {card.type === "hadithVocab" && (
              <div className="space-y-2">
                <span className="text-xs font-bold text-sky-400 block">
                  {extra.title || "معاني المفردات والمباحث"}
                </span>
                <div className="space-y-1.5">
                  {(extra.items || []).map((it: any, i: number) => (
                    <div
                      key={i}
                      className="p-2 rounded-xl bg-surface-low border border-outline-variant/20 text-[11px]"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-primary font-serif">{it.word}</span>
                        <span className="text-on-surface">{it.meaning}</span>
                      </div>
                      {it.linguistic && (
                        <p className="text-[10px] text-sky-400/90 mt-1">{it.linguistic}</p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 7. Hadith Explanation Preview */}
            {card.type === "hadithExplanation" && (
              <div className="space-y-2">
                <span className="text-xs font-bold text-indigo-400 block">
                  {extra.title || "الشرح والمباحث والفوائد"}
                </span>
                <div className="space-y-1.5">
                  {(extra.items || []).map((it: any, i: number) => {
                    const isOpen = openAccordion[`exp-${idx}-${i}`];
                    return (
                      <div
                        key={i}
                        className="rounded-xl bg-surface-low border border-outline-variant/20 overflow-hidden"
                      >
                        <button
                          type="button"
                          onClick={() => toggleAccordion(`exp-${idx}-${i}`)}
                          className="w-full flex items-center justify-between p-2.5 text-right text-xs font-bold text-on-surface hover:bg-surface-high/40 transition-colors"
                        >
                          <span>{it.point}</span>
                          {isOpen ? (
                            <ChevronUp className="w-3.5 h-3.5 text-outline" />
                          ) : (
                            <ChevronDown className="w-3.5 h-3.5 text-outline" />
                          )}
                        </button>
                        {isOpen && (
                          <div className="p-2.5 pt-0 text-[11px] text-on-surface-variant leading-relaxed">
                            {it.explanation}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* 8. Debate Preview */}
            {card.type === "debate" && (
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Swords className="w-4 h-4 text-purple-400" />
                  <span className="text-xs font-bold text-on-surface">{extra.title || card.content}</span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 space-y-1">
                    <span className="font-bold text-emerald-400 block">{extra.side1_title}</span>
                    <p className="text-on-surface-variant">{extra.side1_text}</p>
                  </div>
                  <div className="p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/30 space-y-1">
                    <span className="font-bold text-rose-400 block">{extra.side2_title}</span>
                    <p className="text-on-surface-variant">{extra.side2_text}</p>
                  </div>
                </div>

                {extra.verdict && (
                  <div className="p-2 rounded-xl bg-primary/10 border border-primary/30 text-[11px] text-center">
                    <span className="font-bold text-primary block">⚖️ {extra.verdict}</span>
                    {extra.explanation && (
                      <span className="text-on-surface text-[10px] mt-0.5 block">
                        {extra.explanation}
                      </span>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* 9. Comparison Preview */}
            {card.type === "comparison" && (
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <GitCompare className="w-4 h-4 text-rose-400" />
                  <span className="text-xs font-bold text-on-surface">{extra.title || "مقارنة"}</span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  <div className="p-2.5 rounded-xl bg-surface-low border border-primary/30 space-y-1">
                    <span className="font-bold text-primary block">{extra.col1_title}</span>
                    <p className="text-on-surface-variant">{extra.col1_text}</p>
                  </div>
                  <div className="p-2.5 rounded-xl bg-surface-low border border-secondary/30 space-y-1">
                    <span className="font-bold text-secondary block">{extra.col2_title}</span>
                    <p className="text-on-surface-variant">{extra.col2_text}</p>
                  </div>
                </div>
              </div>
            )}

            {/* 10. Guess / Reveal Preview */}
            {card.type === "guessReveal" && (
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Eye className="w-4 h-4 text-amber-400" />
                  <span className="text-xs font-bold text-on-surface">خمن واكتشف</span>
                </div>

                <p className="text-xs text-on-surface font-semibold">{extra.question || card.content}</p>

                <div
                  onClick={() => toggleGuess(idx)}
                  className={`p-3 rounded-xl border text-center text-xs font-bold transition-all cursor-pointer ${
                    revealedGuess[idx]
                      ? "bg-amber-500/10 border-amber-500/40 text-on-surface"
                      : "bg-surface-low border-dashed border-outline-variant/40 text-outline hover:text-on-surface"
                  }`}
                >
                  {revealedGuess[idx] ? (
                    <div className="space-y-1">
                      <span className="text-[10px] text-amber-400 block font-normal">
                        ✓ الجواب التوضيحي:
                      </span>
                      <p className="font-medium text-xs">{extra.answer}</p>
                    </div>
                  ) : (
                    <span>🙈 انقر هنا لكشف الجواب والتوضيح</span>
                  )}
                </div>
              </div>
            )}

            {/* 11. Word Meaning Preview */}
            {(card.type === "wordMeaning" || card.type === "flipCard") && (
              <div className="space-y-2">
                <span className="text-xs font-bold text-emerald-400 block">
                  {extra.title || "معاني المفردات والكلمات"}
                </span>
                <div className="space-y-1">
                  {(extra.items || []).map((it: any, i: number) => (
                    <div
                      key={i}
                      className="flex items-center justify-between p-2 rounded-xl bg-surface-low border border-outline-variant/20 text-[11px]"
                    >
                      <span className="font-bold text-primary font-serif">{it.word}</span>
                      <span className="text-on-surface">{it.meaning}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 12. Micro Quiz Preview */}
            {card.type === "microQuiz" && (
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <HelpCircle className="w-4 h-4 text-violet-400" />
                  <span className="text-xs font-bold text-on-surface">سؤال ميكرو خاطف</span>
                </div>

                <p className="text-xs font-bold text-on-surface">{extra.question || card.content}</p>

                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => handleAnswerQuiz(idx, true)}
                    className={`flex-1 py-1.5 rounded-xl text-xs font-bold border transition-all ${
                      quizAnswers[idx] === true
                        ? extra.is_true === true
                          ? "bg-emerald-500 text-surface-lowest border-emerald-500"
                          : "bg-rose-500 text-surface-lowest border-rose-500"
                        : "bg-surface-low border-outline-variant/30 text-on-surface hover:bg-surface-high"
                    }`}
                  >
                    ✓ صواب
                  </button>
                  <button
                    type="button"
                    onClick={() => handleAnswerQuiz(idx, false)}
                    className={`flex-1 py-1.5 rounded-xl text-xs font-bold border transition-all ${
                      quizAnswers[idx] === false
                        ? extra.is_true === false
                          ? "bg-emerald-500 text-surface-lowest border-emerald-500"
                          : "bg-rose-500 text-surface-lowest border-rose-500"
                        : "bg-surface-low border-outline-variant/30 text-on-surface hover:bg-surface-high"
                    }`}
                  >
                    ✗ خطأ
                  </button>
                </div>

                {quizAnswers[idx] !== undefined && quizAnswers[idx] !== null && (
                  <div
                    className={`p-2 rounded-xl text-[11px] leading-relaxed ${
                      quizAnswers[idx] === extra.is_true
                        ? "bg-emerald-500/15 text-emerald-300 border border-emerald-500/30"
                        : "bg-rose-500/15 text-rose-300 border border-rose-500/30"
                    }`}
                  >
                    <span className="font-bold block mb-0.5">
                      {quizAnswers[idx] === extra.is_true ? "✓ إجابة صحيحة!" : "✗ إجابة غير دقيقة!"}
                    </span>
                    {extra.explanation}
                  </div>
                )}
              </div>
            )}

            {/* 13. Standard Card Preview */}
            {card.type === "standard" && (
              <p className="text-xs text-on-surface leading-relaxed whitespace-pre-line">
                {card.content}
              </p>
            )}

            {/* Extra Details [MORE] Accordion Preview */}
            {extra.hasExtra && extra.extraContent && (
              <div className="pt-2 border-t border-outline-variant/20">
                <button
                  type="button"
                  onClick={() => toggleAccordion(`more-${idx}`)}
                  className="w-full flex items-center justify-between text-right text-[11px] font-bold text-outline hover:text-on-surface transition-colors"
                >
                  <span>{extra.extraTitle || "📜 الأدلة الشرعية وحواشي المسألة"}</span>
                  {openAccordion[`more-${idx}`] ? (
                    <ChevronUp className="w-3.5 h-3.5" />
                  ) : (
                    <ChevronDown className="w-3.5 h-3.5" />
                  )}
                </button>
                {openAccordion[`more-${idx}`] && (
                  <div className="mt-2 p-2.5 rounded-xl bg-surface-low text-[11px] text-on-surface-variant leading-relaxed border border-outline-variant/20">
                    {extra.extraContent}
                  </div>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
