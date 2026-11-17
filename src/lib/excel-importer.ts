import * as XLSX from "xlsx";
import { QuizQuestion, QuestionType, SubjectName, Lesson, Unit } from "@/types";

export interface ParseResult {
  units: {
    unitId: string;
    unitTitle: string;
    lessonId: string;
    lessonTitle: string;
    status: string;
  }[];
  questions: QuizQuestion[];
  cards: {
    lessonId: string;
    cardType: string;
    content: string;
    extraData: string;
  }[];
  errors: string[];
  warnings: string[];
}

export function parseExcelFile(fileBuffer: ArrayBuffer, defaultSubject?: SubjectName): ParseResult {
  const result: ParseResult = {
    units: [],
    questions: [],
    cards: [],
    errors: [],
    warnings: [],
  };

  try {
    const workbook = XLSX.read(fileBuffer, { type: "array" });

    // 1. Parse Units & Lessons
    const unitsSheetName = workbook.SheetNames.find((s) => s.includes("الوحدات") || s.includes("الدروس"));
    if (unitsSheetName) {
      const sheet = workbook.Sheets[unitsSheetName];
      const rows: any[] = XLSX.utils.sheet_to_json(sheet);
      rows.forEach((r, idx) => {
        const unitId = r["رقم الوحدة (معرف)"] || r["unitId"];
        const unitTitle = r["عنوان الوحدة"] || r["unitTitle"];
        const lessonId = r["كود الدرس (معرف)"] || r["lessonId"];
        const lessonTitle = r["عنوان الدرس"] || r["lessonTitle"];
        const status = r["الحالة (available/locked)"] || r["status"] || "available";

        if (unitTitle && lessonTitle) {
          result.units.push({
            unitId: String(unitId || `u_${idx + 1}`),
            unitTitle: String(unitTitle),
            lessonId: String(lessonId || `l_${idx + 1}`),
            lessonTitle: String(lessonTitle),
            status: String(status),
          });
        }
      });
    }

    // 2. Parse Questions
    const questionsSheetName = workbook.SheetNames.find((s) => s.includes("الأسئلة") || s.includes("Questions"));
    if (questionsSheetName) {
      const sheet = workbook.Sheets[questionsSheetName];
      const rows: any[] = XLSX.utils.sheet_to_json(sheet);

      rows.forEach((r, idx) => {
        const id = r["كود السؤال"] || r["id"] || `q_imported_${Date.now()}_${idx}`;
        const lessonId = String(r["كود الدرس"] || r["lessonId"] || "1");
        const subject = (r["المادة"] || r["subject"] || defaultSubject) as SubjectName | undefined;
        const rawType = (r["نوع السؤال"] || r["type"] || "mcq").toString().toLowerCase().trim();
        const instruction = (r["نص السؤال / المطلب"] || r["instruction"] || r["question"] || "").toString().trim();
        const rawOptions = (r["الخيارات (مفصولة بشرطة مائلة /)"] || r["options"] || "").toString();
        const correctAnswer = (r["الإجابة الصحيحة"] || r["answer"] || "").toString().trim();
        const extraNote = (r["بيانات توضيحية"] || r["note"] || "").toString();

        if (!instruction) {
          result.warnings.push(`تخطي الصف ${idx + 2} في شيت الأسئلة: نص السؤال فارغ.`);
          return;
        }

        let type: QuestionType = "mcq";
        if (["true_false", "صح_خطأ", "صح او خطا"].includes(rawType)) type = "true_false";
        else if (["matching", "توصيل", "مطابقة"].includes(rawType)) type = "matching";
        else if (["rearrangement", "ترتيب"].includes(rawType)) type = "rearrangement";
        else if (["fill_blank", "اكمل", "فراغات"].includes(rawType)) type = "fill_blank";
        else if (["scenario", "مسألة", "فتوى"].includes(rawType)) type = "scenario";
        else if (["word_meaning", "معاني"].includes(rawType)) type = "word_meaning";

        // Build question data format according to type
        const data: Record<string, any> = {};

        if (type === "mcq" || type === "scenario") {
          const options = rawOptions
            ? rawOptions.split("/").map((o: string) => o.trim()).filter(Boolean)
            : ["الخيار الأول", "الخيار الثاني", "الخيار الثالث", "الخيار الرابع"];

          let correctIndex = options.findIndex(
            (o: string) => o.toLowerCase() === correctAnswer.toLowerCase()
          );
          if (correctIndex === -1) {
            const parsedNum = parseInt(correctAnswer, 10);
            correctIndex = !isNaN(parsedNum) && parsedNum >= 0 && parsedNum < options.length ? parsedNum : 0;
          }

          data.question = instruction;
          data.options = options;
          data.correctIndex = correctIndex;
          data.explanation = extraNote;
        } else if (type === "true_false") {
          const isCorrect = ["صواب", "صح", "true", "نعم"].includes(correctAnswer.toLowerCase());
          data.question = instruction;
          data.options = ["صواب", "خطأ"];
          data.correctIndex = isCorrect ? 0 : 1;
          data.explanation = extraNote;
        } else if (type === "fill_blank") {
          const options = rawOptions
            ? rawOptions.split("/").map((o: string) => o.trim()).filter(Boolean)
            : [correctAnswer];
          data.sentence = instruction;
          data.options = options;
          data.correctAnswer = correctAnswer;
          data.explanation = extraNote;
        } else if (type === "rearrangement") {
          const words = correctAnswer ? correctAnswer.split(" ").filter(Boolean) : instruction.split(" ").filter(Boolean);
          data.targetSentence = correctAnswer || instruction;
          data.pool = [...words].sort(() => Math.random() - 0.5);
        } else {
          data.instruction = instruction;
          data.answer = correctAnswer;
          data.note = extraNote;
        }

        result.questions.push({
          id: String(id),
          lessonId,
          type,
          instruction,
          data,
          subjectName: subject,
        });
      });
    }

    // 3. Parse Cards
    const cardsSheetName = workbook.SheetNames.find((s) => s.includes("بطاقات") || s.includes("Cards"));
    if (cardsSheetName) {
      const sheet = workbook.Sheets[cardsSheetName];
      const rows: any[] = XLSX.utils.sheet_to_json(sheet);
      rows.forEach((r) => {
        const lessonId = r["كود الدرس"] || r["lessonId"];
        const cardType = r["نوع البطاقة"] || r["cardType"] || "standard";
        const content = r["محتوى البطاقة الأساسي"] || r["content"];
        const extraData = r["بيانات إضافية (JSON أو نص)"] || r["extraData"] || "";

        if (lessonId && content) {
          result.cards.push({
            lessonId: String(lessonId),
            cardType: String(cardType),
            content: String(content),
            extraData: String(extraData),
          });
        }
      });
    }
  } catch (err: any) {
    result.errors.push(`فشل قراءة ملف الإكسل: ${err.message || err}`);
  }

  return result;
}
