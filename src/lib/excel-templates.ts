import * as XLSX from "xlsx";
import { SubjectName } from "@/types";

export function generateSubjectExcelTemplate(subjectName: SubjectName) {
  const wb = XLSX.utils.book_new();

  // Sheet 1: Instructions
  const instructionsData = [
    ["منصة نبراس الأزهرية - قالب إدخال المناهج والأسئلة المعتمد"],
    [`المادة المستهدفة: ${subjectName}`],
    [""],
    ["إرشادات هامة لإدخال البيانات:"],
    ["1. شيت 'الوحدات والدروس': يُستخدم لتنظيم شجرة المنهج (الوحدات، وعناوين الدروس)."],
    ["2. شيت 'بنك الأسئلة': يُستخدم لإضافة أسئلة الدروس أو الاختبارات الشاملة للوحدة."],
    ["3. شيت 'بطاقات الشرح': مخصص لكتابة بطاقات المحتوى التفاعلي (متون، تفاسير، أحاديث، مقارنات)."],
    ["4. يرجى عدم تغيير أسماء الأعمدة في الصف الأول لضمان قراءة الملف بصورة صحيحة."],
    ["5. أنواع الأسئلة المدعومة: mcq (اختياري)، true_false (صح/خطأ)، matching (توصيل)، rearrangement (ترتيب)، fill_blank (أكمل)، spot_error (صوّب الخطأ)، scenario (مسألة فقهية)."],
  ];
  const wsInstructions = XLSX.utils.aoa_to_sheet(instructionsData);
  XLSX.utils.book_append_sheet(wb, wsInstructions, "إرشادات الاستخدام");

  // Sheet 2: Units & Lessons
  const unitsData = [
    ["رقم الوحدة (معرف)", "عنوان الوحدة", "كود الدرس (معرف)", "عنوان الدرس", "الحالة (available/locked)"],
    [`u_${subjectName}_01`, "الوحدة الأولى: الباب التمهيدي", `l_${subjectName}_01`, "الدرس الأول: مقدمة ومبادئ المادة", "available"],
    [`u_${subjectName}_01`, "الوحدة الأولى: الباب التمهيدي", `l_${subjectName}_02`, "الدرس الثاني: التطبيقات والمسائل", "available"],
    [`u_${subjectName}_02`, "الوحدة الثانية: القواعد الكلية", `l_${subjectName}_03`, "الدرس الثالث: الضوابط والأحكام", "locked"],
  ];
  const wsUnits = XLSX.utils.aoa_to_sheet(unitsData);
  XLSX.utils.book_append_sheet(wb, wsUnits, "الوحدات والدروس");

  // Sheet 3: Questions
  const questionsData = [
    ["كود السؤال", "كود الدرس", "المادة", "نوع السؤال", "نص السؤال / المطلب", "الخيارات (مفصولة بشرطة مائلة /)", "الإجابة الصحيحة", "بيانات توضيحية"],
    [
      `q_${subjectName}_101`,
      `l_${subjectName}_01`,
      subjectName,
      "mcq",
      "ما هو الحكم الأزهري المعتمد في المسألة المذكورة؟",
      "واجب / مندوب / مكروه / مباح",
      "واجب",
      "التعليل: استناداً إلى ظاهر النص القطعي",
    ],
    [
      `q_${subjectName}_102`,
      `l_${subjectName}_01`,
      subjectName,
      "true_false",
      "يشترط استحضار النية باللسان في كافة العبادات.",
      "صواب / خطأ",
      "خطأ",
      "محل النية القلب واللسان مستحب عند الجمهور",
    ],
    [
      `q_${subjectName}_103`,
      `l_${subjectName}_02`,
      subjectName,
      "fill_blank",
      "المراد بالأصل في لغة العرب هو ما ___ عليه غيره.",
      "يبنى / يزول / ينقص",
      "يبنى",
      "تعريف الأصل في علم الأصول",
    ],
  ];
  const wsQuestions = XLSX.utils.aoa_to_sheet(questionsData);
  XLSX.utils.book_append_sheet(wb, wsQuestions, "بنك الأسئلة");

  // Sheet 4: Explanations Cards
  const cardsData = [
    ["كود الدرس", "نوع البطاقة", "محتوى البطاقة الأساسي", "بيانات إضافية (JSON أو نص)"],
    [
      `l_${subjectName}_01`,
      subjectName === "حديث" ? "hadithText" : "standard",
      "عن عمر بن الخطاب رضي الله عنه قال: سمعت رسول الله صلى الله عليه وسلم يقول...",
      "تخريج: متفق عليه، رواه البخاري ومسلم",
    ],
    [
      `l_${subjectName}_01`,
      subjectName === "حديث" ? "hadithVocab" : "wordMeaning",
      "الأعمال: جمع عمل / النيات: جمع نية وقصد",
      "قاموس المفردات واللغويات الأزهرية",
    ],
  ];
  const wsCards = XLSX.utils.aoa_to_sheet(cardsData);
  XLSX.utils.book_append_sheet(wb, wsCards, "بطاقات الشرح");

  // Generate buffer
  const excelBuffer = XLSX.write(wb, { bookType: "xlsx", type: "array" });
  return excelBuffer;
}
