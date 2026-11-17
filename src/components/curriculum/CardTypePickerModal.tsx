"use client";

import React from "react";
import { ExplanationCardType } from "@/types";
import {
  X,
  BookOpen,
  Scale,
  Sparkles,
  Scroll,
  HelpCircle,
  Eye,
  GitCompare,
  Swords,
  BookA,
  BookMarked,
  Lightbulb,
  FileText,
  BookmarkCheck,
  Check,
} from "lucide-react";

interface CardOption {
  type: ExplanationCardType;
  title: string;
  subtitle: string;
  icon: any;
  color: string;
  badge: string;
}

interface CategoryGroup {
  id: string;
  category: string;
  subjectMatch: string[];
  cards: CardOption[];
}

const CATEGORIES: CategoryGroup[] = [
  {
    id: "tawheed",
    category: "✨ بطاقات مادة التوحيد والعقيدة",
    subjectMatch: ["توحيد"],
    cards: [
      {
        type: "tawheedRuling",
        title: "التأصيل والحكم العقدي",
        subtitle: "التعريف اللغوي والاصطلاحي، شارة الحكم (واجب/جائز/مستحيل)، والأدلة العقلية والنقلية",
        icon: Scale,
        color: "text-amber-400 bg-amber-500/10 border-amber-500/30",
        badge: "توحيد",
      },
      {
        type: "tawheedDetails",
        title: "تفاصيل العقيدة والسمعيات",
        subtitle: "شرح تفاصيل أصناف الملائكة، مهامهم، وصف الصراط، المحشر والغيبيات في بنود منظمة",
        icon: BookOpen,
        color: "text-blue-400 bg-blue-500/10 border-blue-500/30",
        badge: "توحيد",
      },
      {
        type: "debate",
        title: "حلبة المناظرة وخريطة الفرق",
        subtitle: "عرض رأيين متقابلين (أهل السنة 🆚 الفرق الأخرى) مع بيان الحجج والقول الراجح",
        icon: Swords,
        color: "text-purple-400 bg-purple-500/10 border-purple-500/30",
        badge: "عقيدة ومناظرات",
      },
    ],
  },
  {
    id: "tafsir",
    category: "📖 بطاقات مادة التفسير وعلوم القرآن",
    subjectMatch: ["تفسير"],
    cards: [
      {
        type: "surahIntro",
        title: "مقدمة السورة والنبذة العامة",
        subtitle: "اسم السورة، مكية/مدنية، عدد الآيات، سبب النزول وأبرز المحاور",
        icon: BookMarked,
        color: "text-emerald-400 bg-emerald-500/10 border-emerald-500/30",
        badge: "تفسير",
      },
      {
        type: "tafsirAnalysis",
        title: "التحليل القرآني والقراءات والإعراب",
        subtitle: "عرض الآية بالخط العثماني المشكول، مفردات وضباب تفاعلي، قراءات متواترة، وإعراب",
        icon: Sparkles,
        color: "text-teal-400 bg-teal-500/10 border-teal-500/30",
        badge: "تفسير",
      },
    ],
  },
  {
    id: "hadith",
    category: "📜 بطاقات مادة الحديث النبوي الشريف",
    subjectMatch: ["حديث"],
    cards: [
      {
        type: "hadithText",
        title: "متن الحديث الشريف والراوي",
        subtitle: "نص الحديث المشكول مع ضبط الحركات، التخريج، ونبذة مختصرة عن الصحابي الراوي",
        icon: Scroll,
        color: "text-cyan-400 bg-cyan-500/10 border-cyan-500/30",
        badge: "حديث",
      },
      {
        type: "hadithVocab",
        title: "معاني مفردات الحديث والمباحث اللغوية",
        subtitle: "الكلمة الغريبة ومعناها بجانبها مع مبحث لغوي وبلاغي اختياري",
        icon: BookA,
        color: "text-sky-400 bg-sky-500/10 border-sky-500/30",
        badge: "لغويات الحديث",
      },
      {
        type: "hadithExplanation",
        title: "التحليل والشرح المستنبط وما يرشد إليه",
        subtitle: "المعنى العام، فوائد الحديث، مع سؤال ميكرو خاطف مدمج أسفل البطاقة",
        icon: Lightbulb,
        color: "text-amber-300 bg-amber-400/10 border-amber-400/30",
        badge: "شرح وتوجيه",
      },
    ],
  },
  {
    id: "fiqh",
    category: "⚖️ بطاقات الفقه والمسائل المذهبية",
    subjectMatch: ["فقه"],
    cards: [
      {
        type: "comparison",
        title: "مقارنة المذاهب الفقهية",
        subtitle: "مقارنة جدولية بين آراء الشافعية، الحنفية، المالكية، والحنابلة مع الأدلة والتعليل",
        icon: GitCompare,
        color: "text-indigo-400 bg-indigo-500/10 border-indigo-500/30",
        badge: "فقه مقارن",
      },
      {
        type: "guessReveal",
        title: "بطاقة خمن واكشف الحكم الفقهي",
        subtitle: "سؤال تشويقي يخفي الحكم أو العلة خلف ضباب تفاعلي ينكشف بنقرة واحدة",
        icon: Eye,
        color: "text-rose-400 bg-rose-500/10 border-rose-500/30",
        badge: "تفاعل وتشويق",
      },
    ],
  },
  {
    id: "arabic",
    category: "🖋️ بطاقات العلوم العربية (نحو، صرف، بلاغة، أدب)",
    subjectMatch: ["نحو", "صرف", "بلاغة", "أدب"],
    cards: [
      {
        type: "wordMeaning",
        title: "قاموس المفردات والشواهد اللغوية",
        subtitle: "قائمة مصطلحات وكلمات الدرس مع معانيها وشواهدها بأسلوب تفاعلي",
        icon: BookOpen,
        color: "text-emerald-400 bg-emerald-500/10 border-emerald-500/30",
        badge: "علوم اللغة",
      },
      {
        type: "microQuiz",
        title: "سؤال ميكرو خاطف",
        subtitle: "سؤال صح/خطأ تفاعلي سريع داخل الشرح لترسيخ الفهم مع تعليل فوري",
        icon: HelpCircle,
        color: "text-violet-400 bg-violet-500/10 border-violet-500/30",
        badge: "تثبيت فهم",
      },
      {
        type: "standard",
        title: "بطاقة شرح نصية قياسية",
        subtitle: "فقرة شرح عادية تدعم النصوص والعناوين والنقاط السردية",
        icon: FileText,
        color: "text-slate-300 bg-slate-500/10 border-slate-500/30",
        badge: "عام",
      },
    ],
  },
];

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (type: ExplanationCardType) => void;
  currentSubject?: string;
}

export function CardTypePickerModal({
  isOpen,
  onClose,
  onSelect,
  currentSubject,
}: Props) {
  if (!isOpen) return null;

  // Sort categories: put matching subject first
  const sortedCategories = [...CATEGORIES].sort((a, b) => {
    const aMatches = currentSubject && a.subjectMatch.includes(currentSubject);
    const bMatches = currentSubject && b.subjectMatch.includes(currentSubject);
    if (aMatches && !bMatches) return -1;
    if (!aMatches && bMatches) return 1;
    return 0;
  });

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="relative w-full max-w-3xl max-h-[88vh] flex flex-col rounded-2xl bg-[#121622] border border-white/10 shadow-2xl overflow-hidden text-xs text-on-surface">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/5 bg-surface-low">
          <div className="flex items-center gap-3">
            <div className="p-1.5 rounded-lg bg-primary/10 text-primary border border-primary/20">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-on-surface">
                إضافة بطاقة شرح متخصصة
              </h2>
              <p className="text-[11px] text-on-surface-muted">
                {currentSubject
                  ? `القوالب المتوافقة مع مادة (${currentSubject}) ومعايير الأزهر الشريف`
                  : "اختر نوع الكتلة المناسبة لطبيعة الدرس"}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-white/5 text-on-surface-muted hover:text-on-surface cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Categories List */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {sortedCategories.map((cat, idx) => {
            const isTargetSubject =
              currentSubject && cat.subjectMatch.includes(currentSubject);

            return (
              <div key={cat.id} className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold text-primary flex items-center gap-2">
                    <span>{cat.category}</span>
                    {isTargetSubject && (
                      <span className="text-[10px] px-2 py-0.5 rounded-md bg-primary/15 text-primary font-bold border border-primary/30">
                        موصى به لمادتك الحالية ⭐
                      </span>
                    )}
                  </h3>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {cat.cards.map((c) => {
                    const Icon = c.icon;
                    return (
                      <button
                        key={c.type}
                        type="button"
                        onClick={() => {
                          onSelect(c.type);
                          onClose();
                        }}
                        className={`flex items-start gap-3 p-3 rounded-xl border text-right transition-all cursor-pointer ${
                          isTargetSubject
                            ? "bg-surface-low border-primary/30 hover:border-primary hover:bg-surface-container"
                            : "bg-surface-low border-white/5 hover:border-white/10 hover:bg-surface-container"
                        }`}
                      >
                        <div
                          className={`p-2 rounded-lg border shrink-0 ${c.color}`}
                        >
                          <Icon className="w-4 h-4" />
                        </div>
                        <div className="flex-1 min-w-0 space-y-1">
                          <div className="flex items-center justify-between gap-1">
                            <h4 className="text-xs font-bold text-on-surface">
                              {c.title}
                            </h4>
                            <span className="text-[10px] px-1.5 py-0.2 rounded bg-surface-high text-on-surface-muted border border-white/5">
                              {c.badge}
                            </span>
                          </div>
                          <p className="text-[11px] text-on-surface-muted line-clamp-2 leading-relaxed">
                            {c.subtitle}
                          </p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end px-6 py-3 border-t border-white/5 bg-surface-low">
          <button
            type="button"
            onClick={onClose}
            className="px-3.5 py-1.5 text-xs font-medium rounded-lg text-on-surface-muted hover:text-on-surface cursor-pointer"
          >
            إلغاء
          </button>
        </div>
      </div>
    </div>
  );
}
