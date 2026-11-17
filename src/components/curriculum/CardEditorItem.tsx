"use client";

import React, { useState } from "react";
import { ExplanationCard, ExplanationCardType } from "@/types";
import {
  Trash2,
  ChevronUp,
  ChevronDown,
  Plus,
  Scale,
  BookOpen,
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
  ChevronRight,
  Info,
} from "lucide-react";

interface Props {
  card: ExplanationCard;
  index: number;
  totalCards: number;
  onUpdate: (updated: ExplanationCard) => void;
  onDelete: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
}

const CARD_META: Record<
  ExplanationCardType,
  { title: string; icon: any; color: string; badge: string }
> = {
  tawheedRuling: {
    title: "بطاقة التأصيل والحكم العقدي",
    icon: Scale,
    color: "text-amber-400 bg-amber-500/10 border-amber-500/30",
    badge: "توحيد",
  },
  tawheedDetails: {
    title: "بطاقة تفاصيل العقيدة والسمعيات والمهام",
    icon: BookOpen,
    color: "text-blue-400 bg-blue-500/10 border-blue-500/30",
    badge: "توحيد",
  },
  surahIntro: {
    title: "مقدمة السورة والنبذة العامة",
    icon: BookMarked,
    color: "text-emerald-400 bg-emerald-500/10 border-emerald-500/30",
    badge: "تفسير",
  },
  tafsirAnalysis: {
    title: "التحليل القرآني والقراءات والإعراب",
    icon: Sparkles,
    color: "text-teal-400 bg-teal-500/10 border-teal-500/30",
    badge: "تفسير",
  },
  hadithText: {
    title: "متن الحديث الشريف والراوي",
    icon: Scroll,
    color: "text-cyan-400 bg-cyan-500/10 border-cyan-500/30",
    badge: "حديث",
  },
  hadithVocab: {
    title: "معاني مفردات الحديث والمباحث اللغوية",
    icon: BookA,
    color: "text-sky-400 bg-sky-500/10 border-sky-500/30",
    badge: "حديث",
  },
  hadithExplanation: {
    title: "الشرح والمباحث والفوائد والأحكام",
    icon: Lightbulb,
    color: "text-indigo-400 bg-indigo-500/10 border-indigo-500/30",
    badge: "حديث",
  },
  hadithAnalysis: {
    title: "التحليل الشامل للحديث الشريف",
    icon: Scroll,
    color: "text-cyan-400 bg-cyan-500/10 border-cyan-500/30",
    badge: "حديث",
  },
  debate: {
    title: "حلبة المناظرة وخريطة الفرق",
    icon: Swords,
    color: "text-purple-400 bg-purple-500/10 border-purple-500/30",
    badge: "عقيدة ومناظرات",
  },
  comparison: {
    title: "مقارنة فقهية ثنائية",
    icon: GitCompare,
    color: "text-rose-400 bg-rose-500/10 border-rose-500/30",
    badge: "فقه",
  },
  guessReveal: {
    title: "خمن واكتشف (بطاقة تفاعلية)",
    icon: Eye,
    color: "text-amber-400 bg-amber-500/10 border-amber-500/30",
    badge: "تفاعلي",
  },
  wordMeaning: {
    title: "قاموس المفردات والكلمات",
    icon: BookmarkCheck,
    color: "text-emerald-400 bg-emerald-500/10 border-emerald-500/30",
    badge: "لغويات",
  },
  flipCard: {
    title: "قاموس المفردات والبطاقات المنقلبة",
    icon: BookmarkCheck,
    color: "text-emerald-400 bg-emerald-500/10 border-emerald-500/30",
    badge: "لغويات",
  },
  microQuiz: {
    title: "سؤال ميكرو خاطف",
    icon: HelpCircle,
    color: "text-violet-400 bg-violet-500/10 border-violet-500/30",
    badge: "تثبيت فهم",
  },
  standard: {
    title: "بطاقة شرح نصية قياسية",
    icon: FileText,
    color: "text-slate-300 bg-slate-500/10 border-slate-500/30",
    badge: "عام",
  },
};

export function CardEditorItem({
  card,
  index,
  totalCards,
  onUpdate,
  onDelete,
  onMoveUp,
  onMoveDown,
}: Props) {
  const [collapsed, setCollapsed] = useState(false);
  const meta = CARD_META[card.type] || CARD_META.standard;
  const Icon = meta.icon;
  const extra = card.extraData || {};

  function updateExtra(field: string, val: any) {
    onUpdate({
      ...card,
      extraData: {
        ...(card.extraData || {}),
        [field]: val,
      },
    });
  }

  return (
    <div className="rounded-2xl bg-surface-low border border-outline-variant/30 shadow-lg overflow-hidden transition-all">
      {/* Header Bar */}
      <div className="flex items-center justify-between p-4 bg-surface-container/60 border-b border-outline-variant/20">
        <div
          onClick={() => setCollapsed(!collapsed)}
          className="flex items-center gap-3 cursor-pointer select-none flex-1 min-w-0"
        >
          <button
            type="button"
            className="p-1 rounded-lg text-outline hover:text-on-surface transition-colors"
          >
            {collapsed ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
          </button>

          <div className={`p-2 rounded-xl border ${meta.color}`}>
            <Icon className="w-4 h-4" />
          </div>

          <div className="flex items-center gap-2 truncate">
            <span className="text-xs font-bold text-outline">#{index + 1}</span>
            <span className="text-xs font-bold text-on-surface truncate">{meta.title}</span>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-surface-lowest border border-outline-variant/30 text-outline shrink-0">
              {meta.badge}
            </span>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-1 shrink-0">
          <button
            type="button"
            onClick={onMoveUp}
            disabled={index === 0}
            className="p-1.5 rounded-lg text-outline hover:text-on-surface hover:bg-surface-high disabled:opacity-30 disabled:pointer-events-none transition-colors"
            title="تحريك لأعلى"
          >
            <ChevronUp className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={onMoveDown}
            disabled={index === totalCards - 1}
            className="p-1.5 rounded-lg text-outline hover:text-on-surface hover:bg-surface-high disabled:opacity-30 disabled:pointer-events-none transition-colors"
            title="تحريك لأسفل"
          >
            <ChevronDown className="w-4 h-4" />
          </button>
          <div className="w-px h-4 bg-outline-variant/30 mx-1" />
          <button
            type="button"
            onClick={onDelete}
            className="p-1.5 rounded-lg text-outline hover:text-error hover:bg-error/10 transition-colors"
            title="حذف هذه البطاقة"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Body / Forms */}
      {!collapsed && (
        <div className="p-5 space-y-4">
          {/* 1. Tawheed Ruling */}
          {card.type === "tawheedRuling" && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-outline mb-1">
                    عنوان المسألة العقدية
                  </label>
                  <input
                    type="text"
                    value={extra.title || ""}
                    onChange={(e) => updateExtra("title", e.target.value)}
                    placeholder="مثال: حكم معرفة الله تعالى والنظر في الآيات"
                    className="w-full text-xs p-2.5 rounded-xl bg-surface-lowest border border-outline-variant/30 text-on-surface focus:outline-none focus:border-primary"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-outline mb-1">
                    شارة الحكم العقدي
                  </label>
                  <div className="flex items-center gap-2">
                    {["واجب", "واجب عيني", "واجب كفائي", "جائز", "مستحيل", "حرام"].map((badge) => (
                      <button
                        key={badge}
                        type="button"
                        onClick={() => updateExtra("rulingBadge", badge)}
                        className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                          (extra.rulingBadge || "واجب") === badge
                            ? "bg-amber-500 text-surface-lowest shadow-sm"
                            : "bg-surface-container text-outline hover:text-on-surface"
                        }`}
                      >
                        {badge}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-outline mb-1">
                    التعريف لغة
                  </label>
                  <input
                    type="text"
                    value={extra.defLang || ""}
                    onChange={(e) => updateExtra("defLang", e.target.value)}
                    placeholder="مثال: الإدراك الجازم أو العلم بالشيء"
                    className="w-full text-xs p-2.5 rounded-xl bg-surface-lowest border border-outline-variant/30 text-on-surface focus:outline-none focus:border-primary"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-outline mb-1">
                    التعريف اصطلاحاً
                  </label>
                  <input
                    type="text"
                    value={extra.defTerm || ""}
                    onChange={(e) => updateExtra("defTerm", e.target.value)}
                    placeholder="مثال: التصديق الجازم المطابق للواقع عن دليل"
                    className="w-full text-xs p-2.5 rounded-xl bg-surface-lowest border border-outline-variant/30 text-on-surface focus:outline-none focus:border-primary"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-outline mb-1">
                  نص الحكم الشرعي وتأصيله
                </label>
                <textarea
                  rows={2}
                  value={extra.rulingText || ""}
                  onChange={(e) => updateExtra("rulingText", e.target.value)}
                  placeholder="نص الحكم الذي يقرره أهل السنة والجماعة..."
                  className="w-full text-xs p-2.5 rounded-xl bg-surface-lowest border border-outline-variant/30 text-on-surface focus:outline-none focus:border-primary leading-relaxed"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-outline mb-1">
                    📜 الدليل النقلي (القرآن أو السنة)
                  </label>
                  <textarea
                    rows={2}
                    value={extra.naqliProof || ""}
                    onChange={(e) => updateExtra("naqliProof", e.target.value)}
                    placeholder="قال تعالى: {فَاعْلَمْ أَنَّهُ لَا إِلَٰهَ إِلَّا اللَّهُ}..."
                    className="w-full text-xs p-2.5 rounded-xl bg-surface-lowest border border-outline-variant/30 text-on-surface focus:outline-none focus:border-primary leading-relaxed"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-outline mb-1">
                    🧠 الدليل العقلي والبرهان
                  </label>
                  <textarea
                    rows={2}
                    value={extra.aqliProof || ""}
                    onChange={(e) => updateExtra("aqliProof", e.target.value)}
                    placeholder="العالم حادث، وكل حادث لا بد له من محدث، فالمحدث هو الله تعالى واجب الوجود..."
                    className="w-full text-xs p-2.5 rounded-xl bg-surface-lowest border border-outline-variant/30 text-on-surface focus:outline-none focus:border-primary leading-relaxed"
                  />
                </div>
              </div>
            </div>
          )}

          {/* 2. Tawheed Details */}
          {card.type === "tawheedDetails" && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-outline mb-1">
                    عنوان الشرح التفصيلي
                  </label>
                  <input
                    type="text"
                    value={extra.title || ""}
                    onChange={(e) => updateExtra("title", e.target.value)}
                    placeholder="مثال: أصناف الملائكة الكرام ووظائفهم"
                    className="w-full text-xs p-2.5 rounded-xl bg-surface-lowest border border-outline-variant/30 text-on-surface focus:outline-none focus:border-primary"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-outline mb-1">
                    عنوان قائمة البنود
                  </label>
                  <input
                    type="text"
                    value={extra.itemsHeader || ""}
                    onChange={(e) => updateExtra("itemsHeader", e.target.value)}
                    placeholder="مثال: بيان الأصناف والمهام الموكلة إليهم"
                    className="w-full text-xs p-2.5 rounded-xl bg-surface-lowest border border-outline-variant/30 text-on-surface focus:outline-none focus:border-primary"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-outline mb-1">
                  المقدمة والتمهيد
                </label>
                <textarea
                  rows={2}
                  value={extra.explanation || ""}
                  onChange={(e) => updateExtra("explanation", e.target.value)}
                  placeholder="الملائكة أجسام نورانية لطيفة قادرة على التشكل بأشكال حسنة..."
                  className="w-full text-xs p-2.5 rounded-xl bg-surface-lowest border border-outline-variant/30 text-on-surface focus:outline-none focus:border-primary leading-relaxed"
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-outline">
                    قائمة البنود والمهام التفصيلية:
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      const items = extra.items || [];
                      updateExtra("items", [...items, { name: "", task: "" }]);
                    }}
                    className="flex items-center gap-1 text-[11px] text-primary hover:underline font-bold"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>إضافة بند / مهمة</span>
                  </button>
                </div>

                {(extra.items || []).map((item: any, idx: number) => (
                  <div key={idx} className="flex items-center gap-2">
                    <input
                      type="text"
                      value={item.name}
                      onChange={(e) => {
                        const items = [...(extra.items || [])];
                        items[idx] = { ...items[idx], name: e.target.value };
                        updateExtra("items", items);
                      }}
                      placeholder="اسم الصنف أو الملك (مثال: جبريل عليه السلام)"
                      className="w-1/3 text-xs p-2 rounded-lg bg-surface-lowest border border-outline-variant/30 text-on-surface focus:outline-none focus:border-primary"
                    />
                    <input
                      type="text"
                      value={item.task}
                      onChange={(e) => {
                        const items = [...(extra.items || [])];
                        items[idx] = { ...items[idx], task: e.target.value };
                        updateExtra("items", items);
                      }}
                      placeholder="المهمة والوصف (مثال: موكل بالوحي وإنزاله على الرسل)"
                      className="flex-1 text-xs p-2 rounded-lg bg-surface-lowest border border-outline-variant/30 text-on-surface focus:outline-none focus:border-primary"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        const items = [...(extra.items || [])];
                        items.splice(idx, 1);
                        updateExtra("items", items);
                      }}
                      className="p-1.5 text-outline hover:text-error rounded-lg"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 3. Surah Intro */}
          {card.type === "surahIntro" && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-outline mb-1">
                    اسم السورة
                  </label>
                  <input
                    type="text"
                    value={extra.surahName || ""}
                    onChange={(e) => updateExtra("surahName", e.target.value)}
                    placeholder="مثال: الذاريات"
                    className="w-full text-xs p-2.5 rounded-xl bg-surface-lowest border border-outline-variant/30 text-on-surface focus:outline-none focus:border-primary"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-outline mb-1">النوع</label>
                  <div className="flex items-center gap-2">
                    {["مكّيّة", "مدنيّة"].map((t) => (
                      <button
                        key={t}
                        type="button"
                        onClick={() => updateExtra("type", t)}
                        className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all ${
                          (extra.type || "مكّيّة") === t
                            ? "bg-emerald-600 text-surface-lowest shadow-sm"
                            : "bg-surface-container text-outline hover:text-on-surface"
                        }`}
                      >
                        {t}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-outline mb-1">
                    عدد الآيات
                  </label>
                  <input
                    type="text"
                    value={extra.versesCount || ""}
                    onChange={(e) => updateExtra("versesCount", e.target.value)}
                    placeholder="مثال: 60 آية"
                    className="w-full text-xs p-2.5 rounded-xl bg-surface-lowest border border-outline-variant/30 text-on-surface focus:outline-none focus:border-primary"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-outline mb-1">
                  سبب التسمية أو النزول
                </label>
                <input
                  type="text"
                  value={extra.revelationReason || ""}
                  onChange={(e) => updateExtra("revelationReason", e.target.value)}
                  placeholder="سميت بالذاريات لأن الله افتتحها بالقَسَم بالرياح التي تذرو التراب..."
                  className="w-full text-xs p-2.5 rounded-xl bg-surface-lowest border border-outline-variant/30 text-on-surface focus:outline-none focus:border-primary"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-outline mb-1">
                  خلاصة محاور السورة وأهدافها
                </label>
                <textarea
                  rows={2}
                  value={extra.summary || card.content || ""}
                  onChange={(e) => {
                    updateExtra("summary", e.target.value);
                    onUpdate({ ...card, content: e.target.value });
                  }}
                  placeholder="بيان قدرة الله تعالى في خلق الكون، وإثبات البعث والجزاء، وقصص الأنبياء..."
                  className="w-full text-xs p-2.5 rounded-xl bg-surface-lowest border border-outline-variant/30 text-on-surface focus:outline-none focus:border-primary leading-relaxed"
                />
              </div>
            </div>
          )}

          {/* 4. Tafsir Analysis */}
          {card.type === "tafsirAnalysis" && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-outline mb-1">
                    اسم السورة
                  </label>
                  <input
                    type="text"
                    value={extra.surahName || ""}
                    onChange={(e) => updateExtra("surahName", e.target.value)}
                    placeholder="مثال: سورة النجم"
                    className="w-full text-xs p-2.5 rounded-xl bg-surface-lowest border border-outline-variant/30 text-on-surface focus:outline-none focus:border-primary"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-outline mb-1">
                    رقم الآية الكريمة
                  </label>
                  <input
                    type="text"
                    value={extra.ayahNumber || ""}
                    onChange={(e) => updateExtra("ayahNumber", e.target.value)}
                    placeholder="مثال: 1 - 4"
                    className="w-full text-xs p-2.5 rounded-xl bg-surface-lowest border border-outline-variant/30 text-on-surface focus:outline-none focus:border-primary"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-outline mb-1">
                  نص الآية الكريمة (بالرسم العثماني أو المشكول)
                </label>
                <textarea
                  rows={2}
                  value={extra.verseText || card.content || ""}
                  onChange={(e) => {
                    updateExtra("verseText", e.target.value);
                    onUpdate({ ...card, content: e.target.value });
                  }}
                  placeholder="وَٱلنَّجۡمِ إِذَا هَوَىٰ (1) مَا ضَلَّ صَاحِبُكُمۡ وَمَا غَوَىٰ (2)..."
                  className="w-full text-xs p-2.5 rounded-xl bg-surface-lowest border border-outline-variant/30 text-on-surface focus:outline-none focus:border-primary font-serif leading-relaxed"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-outline mb-1">
                  التفسير الإجمالي والبيان
                </label>
                <textarea
                  rows={2}
                  value={extra.generalExegesis || ""}
                  onChange={(e) => updateExtra("generalExegesis", e.target.value)}
                  placeholder="يقسم الله تعالى بالنجوم الثوابت، مؤكداً سلامة دعوة النبي صلى الله عليه وسلم..."
                  className="w-full text-xs p-2.5 rounded-xl bg-surface-lowest border border-outline-variant/30 text-on-surface focus:outline-none focus:border-primary leading-relaxed"
                />
              </div>

              {/* Words & Exegesis List */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-outline">
                    المفردات، القراءات، والإعراب:
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      const words = extra.words || [];
                      updateExtra("words", [...words, { word: "", meaning: "", qiraat: "", irab: "" }]);
                    }}
                    className="flex items-center gap-1 text-[11px] text-teal-400 hover:underline font-bold"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>إضافة مفردة / إعراب</span>
                  </button>
                </div>

                {(extra.words || []).map((w: any, idx: number) => (
                  <div key={idx} className="p-2.5 rounded-xl bg-surface-container/60 space-y-2">
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={w.word}
                        onChange={(e) => {
                          const words = [...(extra.words || [])];
                          words[idx] = { ...words[idx], word: e.target.value };
                          updateExtra("words", words);
                        }}
                        placeholder="الكلمة القرآنية (مثال: هَوَىٰ)"
                        className="w-1/3 text-xs p-1.5 rounded-lg bg-surface-lowest border border-outline-variant/30 text-on-surface"
                      />
                      <input
                        type="text"
                        value={w.meaning}
                        onChange={(e) => {
                          const words = [...(extra.words || [])];
                          words[idx] = { ...words[idx], meaning: e.target.value };
                          updateExtra("words", words);
                        }}
                        placeholder="المعنى (مثال: سقط وغاب في المغرب)"
                        className="flex-1 text-xs p-1.5 rounded-lg bg-surface-lowest border border-outline-variant/30 text-on-surface"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          const words = [...(extra.words || [])];
                          words.splice(idx, 1);
                          updateExtra("words", words);
                        }}
                        className="p-1 text-outline hover:text-error"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={w.qiraat || ""}
                        onChange={(e) => {
                          const words = [...(extra.words || [])];
                          words[idx] = { ...words[idx], qiraat: e.target.value };
                          updateExtra("words", words);
                        }}
                        placeholder="القراءات (اختياري، مثال: قرأ حمزة بالإمالة)"
                        className="flex-1 text-[11px] p-1.5 rounded-lg bg-surface-lowest border border-outline-variant/20 text-on-surface"
                      />
                      <input
                        type="text"
                        value={w.irab || ""}
                        onChange={(e) => {
                          const words = [...(extra.words || [])];
                          words[idx] = { ...words[idx], irab: e.target.value };
                          updateExtra("words", words);
                        }}
                        placeholder="الإعراب (اختياري، مثال: فعل ماضٍ مبني على الفتح المقدر)"
                        className="flex-1 text-[11px] p-1.5 rounded-lg bg-surface-lowest border border-outline-variant/20 text-on-surface"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 5. Hadith Text */}
          {card.type === "hadithText" && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-outline mb-1">
                    عنوان الحديث
                  </label>
                  <input
                    type="text"
                    value={extra.title || ""}
                    onChange={(e) => updateExtra("title", e.target.value)}
                    placeholder="مثال: الحديث الأول: إنما الأعمال بالنيات"
                    className="w-full text-xs p-2.5 rounded-xl bg-surface-lowest border border-outline-variant/30 text-on-surface focus:outline-none focus:border-primary"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-outline mb-1">
                    التخريج والمصدر
                  </label>
                  <input
                    type="text"
                    value={extra.takhrij || ""}
                    onChange={(e) => updateExtra("takhrij", e.target.value)}
                    placeholder="مثال: متفق عليه (رواه البخاري ومسلم)"
                    className="w-full text-xs p-2.5 rounded-xl bg-surface-lowest border border-outline-variant/30 text-on-surface focus:outline-none focus:border-primary"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-outline mb-1">
                  متن الحديث الشريف المشكول
                </label>
                <textarea
                  rows={3}
                  value={extra.hadithText || card.content || ""}
                  onChange={(e) => {
                    updateExtra("hadithText", e.target.value);
                    onUpdate({ ...card, content: e.target.value });
                  }}
                  placeholder="«إِنَّمَا الأَعْمَالُ بِالنِّيَّاتِ، وَإِنَّمَا لِكُلِّ امْرِئٍ مَا نَوَى...»"
                  className="w-full text-xs p-2.5 rounded-xl bg-surface-lowest border border-outline-variant/30 text-on-surface focus:outline-none focus:border-primary font-serif leading-relaxed"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-outline mb-1">
                  نبذة عن الصحابي الراوي
                </label>
                <input
                  type="text"
                  value={extra.narrator || ""}
                  onChange={(e) => updateExtra("narrator", e.target.value)}
                  placeholder="مثال: أمير المؤمنين عمر بن الخطاب رضي الله عنه، ثاني الخلفاء الراشدين..."
                  className="w-full text-xs p-2.5 rounded-xl bg-surface-lowest border border-outline-variant/30 text-on-surface focus:outline-none focus:border-primary"
                />
              </div>
            </div>
          )}

          {/* 6. Hadith Vocab */}
          {card.type === "hadithVocab" && (
            <div className="space-y-4">
              <div>
                <label className="block text-[11px] font-semibold text-outline mb-1">
                  عنوان القائمة
                </label>
                <input
                  type="text"
                  value={extra.title || "معاني المفردات والمباحث العربية"}
                  onChange={(e) => updateExtra("title", e.target.value)}
                  className="w-full text-xs p-2.5 rounded-xl bg-surface-lowest border border-outline-variant/30 text-on-surface focus:outline-none focus:border-primary"
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-outline">
                    المفردات والمباحث اللغوية:
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      const items = extra.items || [];
                      updateExtra("items", [...items, { word: "", meaning: "", linguistic: "" }]);
                    }}
                    className="flex items-center gap-1 text-[11px] text-sky-400 hover:underline font-bold"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>إضافة مفردة</span>
                  </button>
                </div>

                {(extra.items || []).map((item: any, idx: number) => (
                  <div key={idx} className="p-2.5 rounded-xl bg-surface-container/60 space-y-2">
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={item.word}
                        onChange={(e) => {
                          const items = [...(extra.items || [])];
                          items[idx] = { ...items[idx], word: e.target.value };
                          updateExtra("items", items);
                        }}
                        placeholder="المفردة (مثال: امرئ)"
                        className="w-1/3 text-xs p-1.5 rounded-lg bg-surface-lowest border border-outline-variant/30 text-on-surface"
                      />
                      <input
                        type="text"
                        value={item.meaning}
                        onChange={(e) => {
                          const items = [...(extra.items || [])];
                          items[idx] = { ...items[idx], meaning: e.target.value };
                          updateExtra("items", items);
                        }}
                        placeholder="المعنى (مثال: إنسان، مذكراً كان أو مؤنثاً)"
                        className="flex-1 text-xs p-1.5 rounded-lg bg-surface-lowest border border-outline-variant/30 text-on-surface"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          const items = [...(extra.items || [])];
                          items.splice(idx, 1);
                          updateExtra("items", items);
                        }}
                        className="p-1 text-outline hover:text-error"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    <input
                      type="text"
                      value={item.linguistic || ""}
                      onChange={(e) => {
                        const items = [...(extra.items || [])];
                        items[idx] = { ...items[idx], linguistic: e.target.value };
                        updateExtra("items", items);
                      }}
                      placeholder="مبحث لغوي أو بلاغي اختياري (مثال: (إنما) أداة حصر تفيد إثبات الحكم للمذكور ونفيه عما عداه)"
                      className="w-full text-[11px] p-1.5 rounded-lg bg-surface-lowest border border-outline-variant/20 text-on-surface"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 7. Hadith Explanation */}
          {card.type === "hadithExplanation" && (
            <div className="space-y-4">
              <div>
                <label className="block text-[11px] font-semibold text-outline mb-1">
                  عنوان المبحث
                </label>
                <input
                  type="text"
                  value={extra.title || "الشرح والمباحث والفوائد والأحكام"}
                  onChange={(e) => updateExtra("title", e.target.value)}
                  className="w-full text-xs p-2.5 rounded-xl bg-surface-lowest border border-outline-variant/30 text-on-surface focus:outline-none focus:border-primary"
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-outline">
                    المسائل والنقاط المستفادة:
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      const items = extra.items || [];
                      updateExtra("items", [...items, { point: "", explanation: "" }]);
                    }}
                    className="flex items-center gap-1 text-[11px] text-indigo-400 hover:underline font-bold"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>إضافة مسألة / نقطة</span>
                  </button>
                </div>

                {(extra.items || []).map((item: any, idx: number) => (
                  <div key={idx} className="p-2.5 rounded-xl bg-surface-container/60 space-y-2">
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={item.point}
                        onChange={(e) => {
                          const items = [...(extra.items || [])];
                          items[idx] = { ...items[idx], point: e.target.value };
                          updateExtra("items", items);
                        }}
                        placeholder="عنوان المسألة (مثال: 1. النية شرط لصحة سائر العبادات)"
                        className="flex-1 text-xs font-bold p-1.5 rounded-lg bg-surface-lowest border border-outline-variant/30 text-on-surface"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          const items = [...(extra.items || [])];
                          items.splice(idx, 1);
                          updateExtra("items", items);
                        }}
                        className="p-1 text-outline hover:text-error"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    <textarea
                      rows={2}
                      value={item.explanation}
                      onChange={(e) => {
                        const items = [...(extra.items || [])];
                        items[idx] = { ...items[idx], explanation: e.target.value };
                        updateExtra("items", items);
                      }}
                      placeholder="الشرح والتفصيل... (مثال: لا تصح صلاة ولا وضوء ولا صوم بغير نية مميزة للعبادة عن العادة)"
                      className="w-full text-xs p-2 rounded-lg bg-surface-lowest border border-outline-variant/30 text-on-surface leading-relaxed"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 8. Debate */}
          {card.type === "debate" && (
            <div className="space-y-4">
              <div>
                <label className="block text-[11px] font-semibold text-outline mb-1">
                  عنوان القضية أو المسألة الخلافية
                </label>
                <input
                  type="text"
                  value={extra.title || card.content || ""}
                  onChange={(e) => {
                    updateExtra("title", e.target.value);
                    onUpdate({ ...card, content: e.target.value });
                  }}
                  placeholder="مثال: حكم رؤية الله تعالى في الآخرة للمؤمنين"
                  className="w-full text-xs p-2.5 rounded-xl bg-surface-lowest border border-outline-variant/30 text-on-surface focus:outline-none focus:border-primary font-bold"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Side 1 */}
                <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 space-y-2">
                  <input
                    type="text"
                    value={extra.side1_title || "مذهب أهل السنة والجماعة"}
                    onChange={(e) => updateExtra("side1_title", e.target.value)}
                    placeholder="الرأي الأول"
                    className="w-full text-xs font-bold p-1.5 rounded-lg bg-surface-lowest border border-emerald-500/30 text-emerald-300"
                  />
                  <textarea
                    rows={3}
                    value={extra.side1_text || ""}
                    onChange={(e) => updateExtra("side1_text", e.target.value)}
                    placeholder="حجة مذهب أهل السنة: الرؤية جائزة عقلاً وواجبة سمعاً للمؤمنين في الجنة لقوله تعالى: {وُجُوهٌ يَوْمَئِذٍ نَاضِرَةٌ * إِلَىٰ رَبِّهَا نَاظِرَةٌ}..."
                    className="w-full text-xs p-2 rounded-lg bg-surface-lowest border border-outline-variant/30 text-on-surface leading-relaxed"
                  />
                </div>

                {/* Side 2 */}
                <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 space-y-2">
                  <input
                    type="text"
                    value={extra.side2_title || "مذهب المعتزلة"}
                    onChange={(e) => updateExtra("side2_title", e.target.value)}
                    placeholder="الرأي المقابل"
                    className="w-full text-xs font-bold p-1.5 rounded-lg bg-surface-lowest border border-rose-500/30 text-rose-300"
                  />
                  <textarea
                    rows={3}
                    value={extra.side2_text || ""}
                    onChange={(e) => updateExtra("side2_text", e.target.value)}
                    placeholder="شبهة المعتزلة: أنكروا الرؤية زاعمين أنها تستلزم الجهة والمكان والتجسيم..."
                    className="w-full text-xs p-2 rounded-lg bg-surface-lowest border border-outline-variant/30 text-on-surface leading-relaxed"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-outline mb-1">
                    ⚖️ القول الراجح المعتمد
                  </label>
                  <input
                    type="text"
                    value={extra.verdict || "القول الراجح مذهب أهل السنة والجماعة (الأشاعرة والماتريدية)"}
                    onChange={(e) => updateExtra("verdict", e.target.value)}
                    className="w-full text-xs p-2.5 rounded-xl bg-surface-lowest border border-primary/40 text-primary font-bold"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-outline mb-1">
                    علة الترجيح ودفع الشبهة
                  </label>
                  <input
                    type="text"
                    value={extra.explanation || ""}
                    onChange={(e) => updateExtra("explanation", e.target.value)}
                    placeholder="الله يرى بلا كيف ولا انحصار ولا جهة، كما يعلم بلا جهة"
                    className="w-full text-xs p-2.5 rounded-xl bg-surface-lowest border border-outline-variant/30 text-on-surface"
                  />
                </div>
              </div>
            </div>
          )}

          {/* 9. Comparison */}
          {card.type === "comparison" && (
            <div className="space-y-4">
              <div>
                <label className="block text-[11px] font-semibold text-outline mb-1">
                  عنوان المقارنة الفقهية
                </label>
                <input
                  type="text"
                  value={extra.title || "مقارنة فقهية"}
                  onChange={(e) => updateExtra("title", e.target.value)}
                  placeholder="مثال: الفرق بين الماء الراكد والماء الجاري في التطهير"
                  className="w-full text-xs p-2.5 rounded-xl bg-surface-lowest border border-outline-variant/30 text-on-surface focus:outline-none focus:border-primary font-bold"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-3 rounded-xl bg-surface-container/60 space-y-2">
                  <input
                    type="text"
                    value={extra.col1_title || "الطرف الأول"}
                    onChange={(e) => updateExtra("col1_title", e.target.value)}
                    placeholder="عنوان العمود الأول (مثال: الماء الكثير - القلتان)"
                    className="w-full text-xs font-bold p-1.5 rounded-lg bg-surface-lowest border border-outline-variant/30 text-primary"
                  />
                  <textarea
                    rows={3}
                    value={extra.col1_text || ""}
                    onChange={(e) => updateExtra("col1_text", e.target.value)}
                    placeholder="التفاصيل: لا ينجس إلا بالتغير (طعم أو لون أو ريح)..."
                    className="w-full text-xs p-2 rounded-lg bg-surface-lowest border border-outline-variant/30 text-on-surface leading-relaxed"
                  />
                </div>

                <div className="p-3 rounded-xl bg-surface-container/60 space-y-2">
                  <input
                    type="text"
                    value={extra.col2_title || "الطرف الثاني"}
                    onChange={(e) => updateExtra("col2_title", e.target.value)}
                    placeholder="عنوان العمود الثاني (مثال: الماء القليل دون القلتين)"
                    className="w-full text-xs font-bold p-1.5 rounded-lg bg-surface-lowest border border-outline-variant/30 text-secondary"
                  />
                  <textarea
                    rows={3}
                    value={extra.col2_text || ""}
                    onChange={(e) => updateExtra("col2_text", e.target.value)}
                    placeholder="التفاصيل: ينجس بمجرد وقوع النجاسة فيه ولو لم يتغير..."
                    className="w-full text-xs p-2 rounded-lg bg-surface-lowest border border-outline-variant/30 text-on-surface leading-relaxed"
                  />
                </div>
              </div>
            </div>
          )}

          {/* 10. Guess / Reveal */}
          {card.type === "guessReveal" && (
            <div className="space-y-4">
              <div>
                <label className="block text-[11px] font-semibold text-outline mb-1">
                  السؤال أو اللغز التخميني (المرئي للطالب أولاً)
                </label>
                <textarea
                  rows={2}
                  value={extra.question || card.content || ""}
                  onChange={(e) => {
                    updateExtra("question", e.target.value);
                    onUpdate({ ...card, content: e.target.value });
                  }}
                  placeholder="مثال: ما هو الماء الطاهر غير المطهر الذي لا يرفع الحدث؟"
                  className="w-full text-xs p-2.5 rounded-xl bg-surface-lowest border border-outline-variant/30 text-on-surface focus:outline-none focus:border-primary leading-relaxed"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-amber-400 mb-1">
                  🙈 الجواب المكشوف بالنقر (المغطى بضباب بلوري)
                </label>
                <textarea
                  rows={2}
                  value={extra.answer || ""}
                  onChange={(e) => updateExtra("answer", e.target.value)}
                  placeholder="مثال: هو الماء المستعمل في فرض الطهارة، أو المتغير بمخالط طاهر كالشاي والزعفران."
                  className="w-full text-xs p-2.5 rounded-xl bg-surface-lowest border border-amber-500/40 text-on-surface focus:outline-none focus:border-amber-500 leading-relaxed"
                />
              </div>
            </div>
          )}

          {/* 11. Word Meaning / FlipCard */}
          {(card.type === "wordMeaning" || card.type === "flipCard") && (
            <div className="space-y-4">
              <div>
                <label className="block text-[11px] font-semibold text-outline mb-1">
                  عنوان القاموس
                </label>
                <input
                  type="text"
                  value={extra.title || "معاني مفردات وكلمات الدرس 📚🌫️"}
                  onChange={(e) => updateExtra("title", e.target.value)}
                  className="w-full text-xs p-2.5 rounded-xl bg-surface-lowest border border-outline-variant/30 text-on-surface focus:outline-none focus:border-primary"
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-outline">
                    قائمة الكلمات ومعانيها:
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      const items = extra.items || [];
                      updateExtra("items", [
                        ...items,
                        { word: "", meaning: "", context: "", root: "" },
                      ]);
                    }}
                    className="flex items-center gap-1 text-[11px] text-emerald-400 hover:underline font-bold"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>إضافة كلمة</span>
                  </button>
                </div>

                {(extra.items || []).map((item: any, idx: number) => (
                  <div key={idx} className="p-2.5 rounded-xl bg-surface-container/60 space-y-2">
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={item.word}
                        onChange={(e) => {
                          const items = [...(extra.items || [])];
                          items[idx] = { ...items[idx], word: e.target.value };
                          updateExtra("items", items);
                        }}
                        placeholder="الكلمة (مثال: القلتين)"
                        className="w-1/3 text-xs p-1.5 rounded-lg bg-surface-lowest border border-outline-variant/30 text-on-surface font-bold"
                      />
                      <input
                        type="text"
                        value={item.meaning}
                        onChange={(e) => {
                          const items = [...(extra.items || [])];
                          items[idx] = { ...items[idx], meaning: e.target.value };
                          updateExtra("items", items);
                        }}
                        placeholder="المعنى (مثال: تثنية قلة، وهي الجرة العظيمة)"
                        className="flex-1 text-xs p-1.5 rounded-lg bg-surface-lowest border border-outline-variant/30 text-on-surface"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          const items = [...(extra.items || [])];
                          items.splice(idx, 1);
                          updateExtra("items", items);
                        }}
                        className="p-1 text-outline hover:text-error"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 12. Micro Quiz */}
          {card.type === "microQuiz" && (
            <div className="space-y-4">
              <div>
                <label className="block text-[11px] font-semibold text-outline mb-1">
                  نص السؤال الخاطف
                </label>
                <input
                  type="text"
                  value={extra.question || card.content || ""}
                  onChange={(e) => {
                    updateExtra("question", e.target.value);
                    onUpdate({ ...card, content: e.target.value });
                  }}
                  placeholder="مثال: ينجس الماء الكثير بمجرد سقوط النجاسة فيه وإن لم يتغير طعمه أو لونه أو ريحه."
                  className="w-full text-xs p-2.5 rounded-xl bg-surface-lowest border border-outline-variant/30 text-on-surface focus:outline-none focus:border-primary font-bold"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-outline mb-1">
                  الإجابة الصحيحة
                </label>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => updateExtra("is_true", true)}
                    className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all ${
                      extra.is_true === true
                        ? "bg-emerald-600 text-surface-lowest shadow-sm"
                        : "bg-surface-container text-outline hover:text-on-surface"
                    }`}
                  >
                    ✓ صواب (صح)
                  </button>
                  <button
                    type="button"
                    onClick={() => updateExtra("is_true", false)}
                    className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all ${
                      extra.is_true === false
                        ? "bg-rose-600 text-surface-lowest shadow-sm"
                        : "bg-surface-container text-outline hover:text-on-surface"
                    }`}
                  >
                    ✗ خطأ (غير صحيح)
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-outline mb-1">
                  التعليل الشرعي والتوضيح الفوري
                </label>
                <textarea
                  rows={2}
                  value={extra.explanation || ""}
                  onChange={(e) => updateExtra("explanation", e.target.value)}
                  placeholder="مثال: العبارة خاطئة؛ لأن الماء الكثير لا ينجس إلا بالتغير بالاتفاق لحديث: «الماء طهور لا ينجسه شيء إلا ما غلب على ريحه وطعمه ولونه»."
                  className="w-full text-xs p-2.5 rounded-xl bg-surface-lowest border border-outline-variant/30 text-on-surface focus:outline-none focus:border-primary leading-relaxed"
                />
              </div>
            </div>
          )}

          {/* 13. Standard Card */}
          {card.type === "standard" && (
            <div>
              <label className="block text-[11px] font-semibold text-outline mb-1">
                نص الشرح (يدعم التنسيق والفقرات الحرة)
              </label>
              <textarea
                rows={5}
                value={card.content}
                onChange={(e) => onUpdate({ ...card, content: e.target.value })}
                placeholder="اكتب تفاصيل وشرح هذه الفقرة هنا..."
                className="w-full text-xs p-3 rounded-xl bg-surface-lowest border border-outline-variant/30 text-on-surface focus:outline-none focus:border-primary leading-relaxed"
              />
            </div>
          )}

          {/* Extra Details [MORE] Accordion Section */}
          <div className="pt-3 border-t border-outline-variant/20">
            <div className="flex items-center justify-between mb-2">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={extra.hasExtra || false}
                  onChange={(e) => updateExtra("hasExtra", e.target.checked)}
                  className="rounded border-outline-variant/40 text-primary focus:ring-0 cursor-pointer"
                />
                <span className="text-[11px] font-bold text-outline hover:text-on-surface transition-colors flex items-center gap-1.5">
                  <span>📜 إضافة حواشي وأدلة إضافية قابلة للطي [MORE]</span>
                </span>
              </label>
            </div>

            {extra.hasExtra && (
              <div className="p-3 rounded-xl bg-surface-container/60 border border-outline-variant/20 space-y-2">
                <input
                  type="text"
                  value={extra.extraTitle || "📜 الأدلة الشرعية وحواشي المسألة"}
                  onChange={(e) => updateExtra("extraTitle", e.target.value)}
                  placeholder="عنوان الحاشية"
                  className="w-full text-xs font-bold p-2 rounded-lg bg-surface-lowest border border-outline-variant/30 text-on-surface"
                />
                <textarea
                  rows={2}
                  value={extra.extraContent || ""}
                  onChange={(e) => updateExtra("extraContent", e.target.value)}
                  placeholder="تفاصيل الحواشي أو أقوال العلماء أو أدلة إضافية يفتحها الطالب بالضغط على السهم..."
                  className="w-full text-xs p-2 rounded-lg bg-surface-lowest border border-outline-variant/30 text-on-surface leading-relaxed"
                />
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
