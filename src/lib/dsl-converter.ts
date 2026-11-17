import { ExplanationCard, ExplanationCardType } from "@/types";

/**
 * Parses raw lesson explanation markup DSL from Firestore / Flutter app
 * into strongly typed ExplanationCard objects for the admin dashboard.
 */
export function parseDslToCards(rawExplanation: string): ExplanationCard[] {
  const text = (rawExplanation || "").trim();
  if (!text) {
    return [
      {
        type: "standard",
        content: "اكتب محتوى الدرس وشرحه هنا...",
        extraData: {},
      },
    ];
  }

  const rawBlocks = text
    .split("---")
    .map((b) => b.trim())
    .filter(Boolean);

  if (rawBlocks.length === 0) {
    return [{ type: "standard", content: text, extraData: {} }];
  }

  const cards: ExplanationCard[] = [];

  for (const rawBlock of rawBlocks) {
    const { cleanBlock, extraTitle, extraContent } = extractExtraDetails(rawBlock);
    let card: ExplanationCard;

    if (cleanBlock.includes("[TAWHEED_RULING]")) {
      card = parseTawheedRuling(cleanBlock);
    } else if (cleanBlock.includes("[TAWHEED_DETAILS]")) {
      card = parseTawheedDetails(cleanBlock);
    } else if (cleanBlock.includes("[SURAH_INTRO]")) {
      card = parseSurahIntro(cleanBlock);
    } else if (cleanBlock.includes("[TAFSIR]")) {
      card = parseTafsirAnalysis(cleanBlock);
    } else if (cleanBlock.includes("[HADITH_TEXT]")) {
      card = parseHadithText(cleanBlock);
    } else if (cleanBlock.includes("[HADITH_VOCAB]")) {
      card = parseHadithVocab(cleanBlock);
    } else if (cleanBlock.includes("[HADITH_EXPLANATION]")) {
      card = parseHadithExplanation(cleanBlock);
    } else if (cleanBlock.includes("[HADITH]")) {
      card = parseHadithAnalysis(cleanBlock);
    } else if (cleanBlock.includes("[DEBATE]")) {
      card = parseDebate(cleanBlock);
    } else if (cleanBlock.includes("[COMPARE]") || cleanBlock.includes("[COMPARISON]")) {
      card = parseComparison(cleanBlock);
    } else if (cleanBlock.includes("[GUESS]")) {
      card = parseGuessReveal(cleanBlock);
    } else if (cleanBlock.includes("[VOCAB]") || cleanBlock.includes("[FLIP]")) {
      card = parseVocab(cleanBlock);
    } else if (cleanBlock.includes("[QUIZ]") || cleanBlock.includes("[MICRO_QUIZ]")) {
      card = parseMicroQuiz(cleanBlock);
    } else {
      card = {
        type: "standard",
        content: cleanTags(cleanBlock),
        extraData: {},
      };
    }

    if (extraContent) {
      card.extraData = {
        ...(card.extraData || {}),
        hasExtra: true,
        extraTitle: extraTitle || "📜 الأدلة الشرعية وحواشي المسألة",
        extraContent: extraContent,
      };
    }

    cards.push(card);
  }

  return cards;
}

/**
 * Serializes cards from the admin dashboard back into the exact markup string
 * expected by the Flutter app's ExplanationParser.
 */
export function serializeCardsToDsl(cards: ExplanationCard[]): string {
  if (!cards || cards.length === 0) return "";

  return cards
    .map((card) => {
      let block = "";
      const extra = card.extraData || {};

      switch (card.type) {
        case "tawheedRuling": {
          const t = extra.title || "";
          const defLang = extra.defLang || "";
          const defTerm = extra.defTerm || "";
          const def = extra.definition || "";
          const rh = extra.rulingTitle || "حكم المسألة والعقيدة";
          const rb = extra.rulingBadge || "واجب";
          const rt = extra.rulingText || "";
          const nq = extra.naqliProof || "";
          const aq = extra.aqliProof || "";
          block = `[TAWHEED_RULING]\ntitle: ${t}\ndef_lang: ${defLang}\ndef_term: ${defTerm}\ndefinition: ${def}\nruling_title: ${rh}\nruling_badge: ${rb}\nruling_text: ${rt}\nnaqli: ${nq}\naqli: ${aq}\n[/TAWHEED_RULING]`;
          break;
        }

        case "tawheedDetails": {
          const t = extra.title || "";
          const exp = extra.explanation || "";
          const ih = extra.itemsHeader ? `\nitems_header: ${extra.itemsHeader}` : "";
          const items: { name: string; task: string }[] = extra.items || [];
          const itemsBlock = items
            .filter((i) => i.name || i.task)
            .map((i) => `item: ${i.name || ""} | task: ${i.task || ""}`)
            .join("\n");
          block = `[TAWHEED_DETAILS]\ntitle: ${t}\nexplanation: ${exp}${ih}${
            itemsBlock ? `\n${itemsBlock}` : ""
          }\n[/TAWHEED_DETAILS]`;
          break;
        }

        case "surahIntro": {
          const s = extra.surahName || "";
          const t = extra.type || "مكّيّة";
          const c = extra.versesCount || "";
          const ord = extra.revelationOrder ? `\nrevelation_order: ${extra.revelationOrder}` : "";
          const r = extra.revelationReason || "";
          const sum = extra.summary || card.content || "";
          block = `[SURAH_INTRO]\nsurah: ${s}\ntype: ${t}\nverses_count: ${c}\nreason: ${r}\nsummary: ${sum}${ord}\n[/SURAH_INTRO]`;
          break;
        }

        case "tafsirAnalysis": {
          const s = extra.surahName || "";
          const a = extra.ayahNumber || "";
          const v = extra.verseText || card.content || "";
          const ex = extra.generalExegesis || "";
          const words: { word: string; meaning: string; qiraat?: string; irab?: string }[] =
            extra.words || [];
          const wordsBlock = words
            .filter((w) => w.word || w.meaning)
            .map((w) => {
              let line = `word: ${w.word} | meaning: ${w.meaning}`;
              if (w.qiraat) line += ` | qiraat: ${w.qiraat}`;
              if (w.irab) line += ` | irab: ${w.irab}`;
              return line;
            })
            .join("\n");
          block = `[TAFSIR]\nsurah: ${s}\nayah_no: ${a}\nverse: ${v}\nexegesis: ${ex}${
            wordsBlock ? `\n${wordsBlock}` : ""
          }\n[/TAFSIR]`;
          break;
        }

        case "hadithText": {
          const t = extra.title ? `title: ${extra.title}\n` : "";
          const tk = extra.takhrij ? `takhrij: ${extra.takhrij}\n` : "";
          const txt = extra.hadithText || card.content || "";
          const n = extra.narrator ? `\nnarrator: ${extra.narrator}` : "";
          block = `[HADITH_TEXT]\n${t}${tk}text: ${txt}${n}\n[/HADITH_TEXT]`;
          break;
        }

        case "hadithVocab": {
          const t = extra.title ? `title: ${extra.title}\n` : "title: معاني المفردات والمباحث العربية\n";
          const items: { word: string; meaning: string; linguistic?: string }[] =
            extra.items || [];
          const itemsBlock = items
            .filter((i) => i.word || i.meaning)
            .map((i) =>
              i.linguistic
                ? `word: ${i.word} | meaning: ${i.meaning} | linguistic: ${i.linguistic}`
                : `word: ${i.word} | meaning: ${i.meaning}`
            )
            .join("\n");
          block = `[HADITH_VOCAB]\n${t}${itemsBlock}\n[/HADITH_VOCAB]`;
          break;
        }

        case "hadithExplanation": {
          const t = extra.title ? `title: ${extra.title}\n` : "title: الشرح والمباحث والفوائد\n";
          const items: { point: string; explanation: string }[] = extra.items || [];
          const itemsBlock = items
            .filter((i) => i.point || i.explanation)
            .map((i) => `point: ${i.point} | exp: ${i.explanation}`)
            .join("\n");
          block = `[HADITH_EXPLANATION]\n${t}${itemsBlock}\n[/HADITH_EXPLANATION]`;
          break;
        }

        case "hadithAnalysis": {
          const t = extra.title || "";
          const n = extra.narrator || "";
          const tk = extra.takhrij || "";
          const txt = extra.hadithText || card.content || "";
          const g = extra.guidance || "";
          const words: { word: string; meaning: string }[] = extra.words || [];
          const wordsBlock = words
            .filter((w) => w.word || w.meaning)
            .map((w) => `word: ${w.word} | meaning: ${w.meaning}`)
            .join("\n");
          block = `[HADITH]\ntitle: ${t}\nnarrator: ${n}\ntakhrij: ${tk}\ntext: ${txt}\nguidance: ${g}${
            wordsBlock ? `\n${wordsBlock}` : ""
          }\n[/HADITH]`;
          break;
        }

        case "debate": {
          const t = extra.title || card.content || "";
          const s1t = extra.side1_title || "الرأي الأول";
          const s1txt = extra.side1_text || "";
          const s2t = extra.side2_title || "الرأي الثاني";
          const s2txt = extra.side2_text || "";
          const verd = extra.verdict || "القول الراجح";
          const exp = extra.explanation || "";
          block = `[DEBATE]\ntitle: ${t}\nside1_title: ${s1t}\nside1_text: ${s1txt}\nside2_title: ${s2t}\nside2_text: ${s2txt}\nverdict: ${verd}\nexplanation: ${exp}\n[/DEBATE]`;
          break;
        }

        case "comparison": {
          const t = extra.title || "مقارنة فقهية";
          const c1t = extra.col1_title || "الطرف الأول";
          const c1txt = extra.col1_text || "";
          const c2t = extra.col2_title || "الطرف الثاني";
          const c2txt = extra.col2_text || "";
          block = `[COMPARE]\ntitle: ${t}\ncol1_title: ${c1t}\ncol1_text: ${c1txt}\ncol2_title: ${c2t}\ncol2_text: ${c2txt}\n[/COMPARE]`;
          break;
        }

        case "guessReveal": {
          const q = extra.question || card.content || "";
          const a = extra.answer || "";
          block = `[GUESS]\n${q}\n[REVEAL]\n${a}\n[/REVEAL]\n[/GUESS]`;
          break;
        }

        case "wordMeaning":
        case "flipCard": {
          const t = extra.title || "معاني مفردات وكلمات الدرس 📚🌫️";
          const items: {
            word: string;
            meaning: string;
            context?: string;
            root?: string;
            type?: string;
          }[] = extra.items || [];
          const itemsBlock = items
            .filter((i) => i.word || i.meaning)
            .map((i) => {
              let line = `word: ${i.word} | meaning: ${i.meaning}`;
              if (i.context) line += ` | context: ${i.context}`;
              if (i.root) line += ` | root: ${i.root}`;
              if (i.type) line += ` | type: ${i.type}`;
              return line;
            })
            .join("\n");
          block = `[VOCAB]\ntitle: ${t}\n${itemsBlock || "word: الْقُلَّتَيْنِ | meaning: مقدار يدفع النجاسة عن الماء"}\n[/VOCAB]`;
          break;
        }

        case "microQuiz": {
          const q = extra.question || card.content || "";
          const isTrue = extra.is_true ?? true;
          const exp = extra.explanation || "";
          block = `[QUIZ]\nmode: true_false\nquestion: ${q}\nis_true: ${isTrue}\nexplanation: ${exp}\n[/QUIZ]`;
          break;
        }

        case "standard":
        default:
          block = card.content || "";
          break;
      }

      if (extra.hasExtra && extra.extraContent) {
        const titleLine = extra.extraTitle ? `title: ${extra.extraTitle}\n` : "";
        block = `${block}\n[MORE]\n${titleLine}${extra.extraContent}\n[/MORE]`;
      }

      return block;
    })
    .join("\n\n---\n\n");
}

/* ---------------- Helper Parser Functions ---------------- */

function extractExtraDetails(rawBlock: string) {
  const moreRegex = /\[MORE\]([\s\S]*?)(?:\[\/MORE\]|$)/i;
  const match = moreRegex.exec(rawBlock);

  if (match) {
    const rawMore = (match[1] || "").trim();
    const cleanBlock = rawBlock.replace(moreRegex, "").trim();

    let extraTitle = "📜 الأدلة الشرعية وحواشي المسألة";
    let extraContent = rawMore;

    const lines = rawMore.split("\n");
    if (lines.length > 0 && lines[0].trim().startsWith("title:")) {
      extraTitle = lines[0].trim().replace(/^title:\s*/, "");
      extraContent = lines.slice(1).join("\n").trim();
    }

    return { cleanBlock, extraTitle, extraContent };
  }

  return { cleanBlock: rawBlock, extraTitle: null, extraContent: null };
}

function cleanTags(str: string): string {
  return str
    .replace(/\[\/?(REVEAL|GUESS|COMPARE|COMPARISON|QUIZ|MICRO_QUIZ|VOCAB|FLIP|DEBATE|TAFSIR|HADITH_TEXT|HADITH_VOCAB|HADITH_EXPLANATION|HADITH|SURAH_INTRO|TAWHEED_DETAILS|TAWHEED_RULING|MORE)\/?\]/gi, "")
    .trim();
}

function parseTawheedRuling(block: string): ExplanationCard {
  const extra: Record<string, any> = {
    rulingTitle: "حكم المسألة والعقيدة",
    rulingBadge: "واجب",
  };

  const lines = block.split("\n");
  for (const line of lines) {
    const t = line.trim();
    if (t.startsWith("title:")) extra.title = t.replace(/^title:\s*/, "");
    else if (t.startsWith("def_lang:") || t.startsWith("defLang:"))
      extra.defLang = t.replace(/^(def_lang:|defLang:)\s*/, "");
    else if (t.startsWith("def_term:") || t.startsWith("defTerm:"))
      extra.defTerm = t.replace(/^(def_term:|defTerm:)\s*/, "");
    else if (t.startsWith("definition:") || t.startsWith("def:"))
      extra.definition = t.replace(/^(definition:|def:)\s*/, "");
    else if (t.startsWith("ruling_title:"))
      extra.rulingTitle = t.replace(/^ruling_title:\s*/, "");
    else if (t.startsWith("ruling_badge:") || t.startsWith("badge:"))
      extra.rulingBadge = t.replace(/^(ruling_badge:|badge:)\s*/, "");
    else if (t.startsWith("ruling_text:") || t.startsWith("ruling:"))
      extra.rulingText = t.replace(/^(ruling_text:|ruling:)\s*/, "");
    else if (t.startsWith("naqli:") || t.startsWith("naqli_proof:"))
      extra.naqliProof = t.replace(/^(naqli:|naqli_proof:)\s*/, "");
    else if (t.startsWith("aqli:") || t.startsWith("aqli_proof:"))
      extra.aqliProof = t.replace(/^(aqli:|aqli_proof:)\s*/, "");
  }

  return {
    type: "tawheedRuling",
    content: extra.title || "حكم المسألة العقدية",
    extraData: extra,
  };
}

function parseTawheedDetails(block: string): ExplanationCard {
  const extra: Record<string, any> = {
    title: "",
    explanation: "",
    itemsHeader: "",
    items: [],
  };

  const lines = block.split("\n");
  for (const line of lines) {
    const t = line.trim();
    if (t.startsWith("title:")) extra.title = t.replace(/^title:\s*/, "");
    else if (t.startsWith("explanation:") || t.startsWith("exp:"))
      extra.explanation = t.replace(/^(explanation:|exp:)\s*/, "");
    else if (t.startsWith("items_header:") || t.startsWith("itemsHeader:"))
      extra.itemsHeader = t.replace(/^(items_header:|itemsHeader:)\s*/, "");
    else if (t.startsWith("item:")) {
      let name = "";
      let task = "";
      const parts = t.split("|");
      for (const p of parts) {
        const pt = p.trim();
        if (pt.startsWith("item:") || pt.startsWith("name:"))
          name = pt.replace(/^(item:|name:)\s*/, "");
        else if (pt.startsWith("task:") || pt.startsWith("desc:") || pt.startsWith("meaning:"))
          task = pt.replace(/^(task:|desc:|meaning:)\s*/, "");
      }
      if (name || task) extra.items.push({ name, task });
    }
  }

  return {
    type: "tawheedDetails",
    content: extra.title || "شرح وتفاصيل السمعيات",
    extraData: extra,
  };
}

function parseSurahIntro(block: string): ExplanationCard {
  const extra: Record<string, any> = {
    surahName: "",
    type: "مكّيّة",
    versesCount: "",
    revelationReason: "",
    summary: "",
    revelationOrder: "",
  };

  const lines = block.split("\n");
  for (const line of lines) {
    const t = line.trim();
    if (t.startsWith("surah:") || t.startsWith("surah_name:"))
      extra.surahName = t.replace(/^(surah:|surah_name:)\s*/, "");
    else if (t.startsWith("type:")) extra.type = t.replace(/^type:\s*/, "");
    else if (t.startsWith("verses_count:") || t.startsWith("count:"))
      extra.versesCount = t.replace(/^(verses_count:|count:)\s*/, "");
    else if (t.startsWith("reason:") || t.startsWith("revelation_reason:"))
      extra.revelationReason = t.replace(/^(reason:|revelation_reason:)\s*/, "");
    else if (t.startsWith("summary:"))
      extra.summary = t.replace(/^summary:\s*/, "");
    else if (t.startsWith("revelation_order:") || t.startsWith("order:"))
      extra.revelationOrder = t.replace(/^(revelation_order:|order:)\s*/, "");
  }

  return {
    type: "surahIntro",
    content: extra.surahName ? `سورة ${extra.surahName}` : "مقدمة السورة الكريمة",
    extraData: extra,
  };
}

function parseTafsirAnalysis(block: string): ExplanationCard {
  const extra: Record<string, any> = {
    surahName: "",
    ayahNumber: "",
    verseText: "",
    generalExegesis: "",
    words: [],
  };

  const lines = block.split("\n");
  for (const line of lines) {
    const t = line.trim();
    if (t.startsWith("surah:")) extra.surahName = t.replace(/^surah:\s*/, "");
    else if (t.startsWith("ayah_no:") || t.startsWith("ayah:"))
      extra.ayahNumber = t.replace(/^(ayah_no:|ayah:)\s*/, "");
    else if (t.startsWith("verse:") || t.startsWith("ayah_text:"))
      extra.verseText = t.replace(/^(verse:|ayah_text:)\s*/, "");
    else if (t.startsWith("exegesis:") || t.startsWith("tafsir:"))
      extra.generalExegesis = t.replace(/^(exegesis:|tafsir:)\s*/, "");
    else if (t.startsWith("word:")) {
      let word = "";
      let meaning = "";
      let qiraat = "";
      let irab = "";
      const parts = t.split("|");
      for (const p of parts) {
        const pt = p.trim();
        if (pt.startsWith("word:")) word = pt.replace(/^word:\s*/, "");
        else if (pt.startsWith("meaning:")) meaning = pt.replace(/^meaning:\s*/, "");
        else if (pt.startsWith("qiraat:")) qiraat = pt.replace(/^qiraat:\s*/, "");
        else if (pt.startsWith("irab:")) irab = pt.replace(/^irab:\s*/, "");
      }
      if (word || meaning) extra.words.push({ word, meaning, qiraat, irab });
    }
  }

  return {
    type: "tafsirAnalysis",
    content: extra.verseText || "تحليل الآية الكريمة",
    extraData: extra,
  };
}

function parseHadithText(block: string): ExplanationCard {
  const extra: Record<string, any> = {
    title: "",
    takhrij: "",
    hadithText: "",
    narrator: "",
  };

  const lines = block.split("\n");
  for (const line of lines) {
    const t = line.trim();
    if (t.startsWith("title:")) extra.title = t.replace(/^title:\s*/, "");
    else if (t.startsWith("takhrij:")) extra.takhrij = t.replace(/^takhrij:\s*/, "");
    else if (t.startsWith("text:") || t.startsWith("hadith:"))
      extra.hadithText = t.replace(/^(text:|hadith:)\s*/, "");
    else if (t.startsWith("narrator:"))
      extra.narrator = t.replace(/^narrator:\s*/, "");
  }

  if (!extra.hadithText) {
    extra.hadithText = cleanTags(block);
  }

  return {
    type: "hadithText",
    content: extra.hadithText,
    extraData: extra,
  };
}

function parseHadithVocab(block: string): ExplanationCard {
  const extra: Record<string, any> = {
    title: "معاني المفردات والمباحث العربية",
    items: [],
  };

  const lines = block.split("\n");
  for (const line of lines) {
    const t = line.trim();
    if (t.startsWith("title:")) extra.title = t.replace(/^title:\s*/, "");
    else if (t.startsWith("word:")) {
      let word = "";
      let meaning = "";
      let linguistic = "";
      const parts = t.split("|");
      for (const p of parts) {
        const pt = p.trim();
        if (pt.startsWith("word:")) word = pt.replace(/^word:\s*/, "");
        else if (pt.startsWith("meaning:")) meaning = pt.replace(/^meaning:\s*/, "");
        else if (pt.startsWith("linguistic:") || pt.startsWith("ling:"))
          linguistic = pt.replace(/^(linguistic:|ling:)\s*/, "");
      }
      if (word || meaning) extra.items.push({ word, meaning, linguistic });
    }
  }

  return {
    type: "hadithVocab",
    content: extra.title,
    extraData: extra,
  };
}

function parseHadithExplanation(block: string): ExplanationCard {
  const extra: Record<string, any> = {
    title: "الشرح والمباحث والفوائد",
    items: [],
  };

  const lines = block.split("\n");
  for (const line of lines) {
    const t = line.trim();
    if (t.startsWith("title:")) extra.title = t.replace(/^title:\s*/, "");
    else if (t.startsWith("point:") || t.startsWith("item:") || t.startsWith("q:")) {
      let point = "";
      let explanation = "";
      const parts = t.split("|");
      for (const p of parts) {
        const pt = p.trim();
        if (pt.startsWith("point:") || pt.startsWith("item:") || pt.startsWith("q:"))
          point = pt.replace(/^(point:|item:|q:)\s*/, "");
        else if (pt.startsWith("exp:") || pt.startsWith("explanation:") || pt.startsWith("a:"))
          explanation = pt.replace(/^(exp:|explanation:|a:)\s*/, "");
      }
      if (point || explanation) extra.items.push({ point, explanation });
    }
  }

  return {
    type: "hadithExplanation",
    content: extra.title,
    extraData: extra,
  };
}

function parseHadithAnalysis(block: string): ExplanationCard {
  const extra: Record<string, any> = {
    title: "",
    narrator: "",
    takhrij: "",
    hadithText: "",
    guidance: "",
    words: [],
  };

  const lines = block.split("\n");
  for (const line of lines) {
    const t = line.trim();
    if (t.startsWith("title:")) extra.title = t.replace(/^title:\s*/, "");
    else if (t.startsWith("narrator:")) extra.narrator = t.replace(/^narrator:\s*/, "");
    else if (t.startsWith("takhrij:")) extra.takhrij = t.replace(/^takhrij:\s*/, "");
    else if (t.startsWith("text:") || t.startsWith("hadith:"))
      extra.hadithText = t.replace(/^(text:|hadith:)\s*/, "");
    else if (t.startsWith("guidance:"))
      extra.guidance = t.replace(/^guidance:\s*/, "");
    else if (t.startsWith("word:")) {
      let word = "";
      let meaning = "";
      const parts = t.split("|");
      for (const p of parts) {
        const pt = p.trim();
        if (pt.startsWith("word:")) word = pt.replace(/^word:\s*/, "");
        else if (pt.startsWith("meaning:")) meaning = pt.replace(/^meaning:\s*/, "");
      }
      if (word || meaning) extra.words.push({ word, meaning });
    }
  }

  return {
    type: "hadithAnalysis",
    content: extra.hadithText || extra.title || "شرح الحديث",
    extraData: extra,
  };
}

function parseDebate(block: string): ExplanationCard {
  const extra: Record<string, any> = {
    title: "",
    side1_title: "الرأي الأول",
    side1_text: "",
    side2_title: "الرأي الثاني",
    side2_text: "",
    verdict: "القول الراجح",
    explanation: "",
  };

  const lines = block.split("\n");
  for (const line of lines) {
    const t = line.trim();
    if (t.startsWith("title:")) extra.title = t.replace(/^title:\s*/, "");
    else if (t.startsWith("side1_title:")) extra.side1_title = t.replace(/^side1_title:\s*/, "");
    else if (t.startsWith("side1_text:")) extra.side1_text = t.replace(/^side1_text:\s*/, "");
    else if (t.startsWith("side2_title:")) extra.side2_title = t.replace(/^side2_title:\s*/, "");
    else if (t.startsWith("side2_text:")) extra.side2_text = t.replace(/^side2_text:\s*/, "");
    else if (t.startsWith("verdict:")) extra.verdict = t.replace(/^verdict:\s*/, "");
    else if (t.startsWith("explanation:")) extra.explanation = t.replace(/^explanation:\s*/, "");
  }

  return {
    type: "debate",
    content: extra.title || "حلبة المناظرة وخريطة الفرق",
    extraData: extra,
  };
}

function parseComparison(block: string): ExplanationCard {
  const extra: Record<string, any> = {
    title: "مقارنة فقهية",
    col1_title: "الطرف الأول",
    col1_text: "",
    col2_title: "الطرف الثاني",
    col2_text: "",
  };

  const lines = block.split("\n");
  for (const line of lines) {
    const t = line.trim();
    if (t.startsWith("title:")) extra.title = t.replace(/^title:\s*/, "");
    else if (t.startsWith("col1_title:")) extra.col1_title = t.replace(/^col1_title:\s*/, "");
    else if (t.startsWith("col1_text:")) extra.col1_text = t.replace(/^col1_text:\s*/, "");
    else if (t.startsWith("col2_title:")) extra.col2_title = t.replace(/^col2_title:\s*/, "");
    else if (t.startsWith("col2_text:")) extra.col2_text = t.replace(/^col2_text:\s*/, "");
  }

  return {
    type: "comparison",
    content: extra.title,
    extraData: extra,
  };
}

function parseGuessReveal(block: string): ExplanationCard {
  let question = "";
  let answer = "";

  const match = /\[GUESS\]([\s\S]*?)\[REVEAL\]([\s\S]*?)(?:\[\/?REVEAL\/?\])*\s*(?:\[\/GUESS\]|$)/i.exec(
    block
  );
  if (match) {
    question = cleanTags(match[1] || "");
    answer = cleanTags(match[2] || "");
  } else {
    question = cleanTags(block);
    answer = "انقر للكشف عن التوضيح والمعنى.";
  }

  return {
    type: "guessReveal",
    content: question,
    extraData: { question, answer },
  };
}

function parseVocab(block: string): ExplanationCard {
  const extra: Record<string, any> = {
    title: "معاني مفردات وكلمات الدرس 📚🌫️",
    items: [],
  };

  const lines = block.split("\n");
  for (const line of lines) {
    const t = line.trim();
    if (t.startsWith("title:")) extra.title = t.replace(/^title:\s*/, "");
    else if (t.startsWith("word:")) {
      let word = "";
      let meaning = "";
      let context = "";
      let root = "";
      let type = "";
      const parts = t.split("|");
      for (const p of parts) {
        const pt = p.trim();
        if (pt.startsWith("word:")) word = pt.replace(/^word:\s*/, "");
        else if (pt.startsWith("meaning:")) meaning = pt.replace(/^meaning:\s*/, "");
        else if (pt.startsWith("context:")) context = pt.replace(/^context:\s*/, "");
        else if (pt.startsWith("root:")) root = pt.replace(/^root:\s*/, "");
        else if (pt.startsWith("type:")) type = pt.replace(/^type:\s*/, "");
      }
      if (word || meaning) extra.items.push({ word, meaning, context, root, type });
    }
  }

  return {
    type: "wordMeaning",
    content: extra.title,
    extraData: extra,
  };
}

function parseMicroQuiz(block: string): ExplanationCard {
  const extra: Record<string, any> = {
    mode: "true_false",
    question: "",
    is_true: true,
    explanation: "",
  };

  const lines = block.split("\n");
  for (const line of lines) {
    const t = line.trim();
    if (t.startsWith("question:")) extra.question = t.replace(/^question:\s*/, "");
    else if (t.startsWith("is_true:"))
      extra.is_true = t.replace(/^is_true:\s*/, "").toLowerCase().includes("true");
    else if (t.startsWith("explanation:") || t.startsWith("exp:"))
      extra.explanation = t.replace(/^(explanation:|exp:)\s*/, "");
  }

  return {
    type: "microQuiz",
    content: extra.question || "سؤال ميكرو خاطف",
    extraData: extra,
  };
}
