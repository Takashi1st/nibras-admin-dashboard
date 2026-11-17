import {
  collection,
  doc,
  getDocs,
  getDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  serverTimestamp,
  writeBatch,
} from "firebase/firestore";
import { db } from "./firebase";
import {
  StudentUser,
  SubjectName,
  Unit,
  Lesson,
  QuizQuestion,
  SubscriptionRequest,
  LessonStatus,
} from "@/types";

export const SUBJECTS_LIST: { name: SubjectName; path: "sharia" | "arabic"; title: string; color: string }[] = [
  { name: "فقه", path: "sharia", title: "الفقه المذهبي", color: "#10b981" },
  { name: "تفسير", path: "sharia", title: "التفسير وعلوم القرآن", color: "#06b6d4" },
  { name: "حديث", path: "sharia", title: "الحديث الشريف وعلومه", color: "#f59e0b" },
  { name: "توحيد", path: "sharia", title: "التوحيد والعقيدة", color: "#8b5cf6" },
  { name: "نحو", path: "arabic", title: "النحو وقواعد الإعراب", color: "#3b82f6" },
  { name: "صرف", path: "arabic", title: "الصرف والميزان الصرفي", color: "#ec4899" },
  { name: "بلاغة", path: "arabic", title: "البلاغة والبيان", color: "#14b8a6" },
  { name: "أدب", path: "arabic", title: "الأدب والنصوص والمطالعة", color: "#f97316" },
];

// ==========================================
// 1. STATS & OVERVIEW
// ==========================================
export async function getDashboardStats() {
  try {
    const usersSnap = await getDocs(collection(db, "users"));
    const questionsSnap = await getDocs(collection(db, "questions"));

    let totalStudents = 0;
    let activeSubscriptions = 0;
    let shariaCount = 0;
    let arabicCount = 0;
    let bothCount = 0;

    usersSnap.forEach((d) => {
      totalStudents++;
      const data = d.data();
      if (data.isPremium === true) {
        activeSubscriptions++;
        const paths = data.premiumPaths || [];
        if (paths.includes("sharia") && paths.includes("arabic")) {
          bothCount++;
        } else if (paths.includes("sharia")) {
          shariaCount++;
        } else if (paths.includes("arabic")) {
          arabicCount++;
        } else {
          bothCount++;
        }
      }
    });

    const totalQuestions = questionsSnap.size;

    return {
      totalStudents,
      activeSubscriptions,
      subscriptionBreakdown: { shariaCount, arabicCount, bothCount },
      totalQuestions,
    };
  } catch (error) {
    console.error("Error fetching dashboard stats:", error);
    return {
      totalStudents: 0,
      activeSubscriptions: 0,
      subscriptionBreakdown: { shariaCount: 0, arabicCount: 0, bothCount: 0 },
      totalQuestions: 0,
    };
  }
}

// ==========================================
// 2. CURRICULUM (SUBJECTS, UNITS, LESSONS)
// ==========================================
export async function getUnitsForSubject(subjectName: SubjectName): Promise<Unit[]> {
  try {
    const subjectDocRef = doc(db, "subjects", subjectName);
    const unitsSnap = await getDocs(collection(subjectDocRef, "units"));

    const units: Unit[] = [];

    for (const unitDoc of unitsSnap.docs) {
      const uData = unitDoc.data();
      const lessonsSnap = await getDocs(collection(unitDoc.ref, "lessons"));

      const lessons: Lesson[] = lessonsSnap.docs.map((lDoc) => {
        const lData = lDoc.data();
        return {
          id: lDoc.id,
          title: lData.title || "",
          status: (lData.status as LessonStatus) || "available",
          explanation: lData.explanation || "",
          order: lData.order ?? 0,
          subjectName,
          unitId: unitDoc.id,
        };
      });

      lessons.sort((a, b) => a.order - b.order);

      units.push({
        id: unitDoc.id,
        title: uData.title || "",
        order: uData.order ?? 0,
        lessons,
        subjectName,
      });
    }

    units.sort((a, b) => a.order - b.order);
    return units;
  } catch (e) {
    console.error(`Error loading units for ${subjectName}:`, e);
    return [];
  }
}

export async function addUnit(subjectName: SubjectName, title: string, customId?: string): Promise<string> {
  const subjectRef = doc(db, "subjects", subjectName);
  await setDoc(subjectRef, { name: subjectName }, { merge: true });

  const unitsSnap = await getDocs(collection(subjectRef, "units"));
  const count = unitsSnap.size;
  const unitId = customId || `u_${Date.now()}`;

  const unitRef = doc(subjectRef, "units", unitId);
  await setDoc(unitRef, {
    title,
    order: count,
  }, { merge: true });

  return unitId;
}

export async function updateUnit(subjectName: SubjectName, unitId: string, title: string): Promise<void> {
  const unitRef = doc(db, "subjects", subjectName, "units", unitId);
  await updateDoc(unitRef, { title });
}

export async function deleteUnit(subjectName: SubjectName, unitId: string): Promise<void> {
  const unitRef = doc(db, "subjects", subjectName, "units", unitId);
  const lessonsSnap = await getDocs(collection(unitRef, "lessons"));
  for (const l of lessonsSnap.docs) {
    await deleteDoc(l.ref);
  }
  await deleteDoc(unitRef);
}

export async function saveLesson(
  subjectName: SubjectName,
  unitId: string,
  lessonId: string,
  title: string,
  explanation: string,
  status: LessonStatus = "available"
): Promise<void> {
  const subjectRef = doc(db, "subjects", subjectName);
  await setDoc(subjectRef, { name: subjectName }, { merge: true });

  const unitRef = doc(subjectRef, "units", unitId);
  await setDoc(unitRef, { id: unitId }, { merge: true });

  const lessonRef = doc(unitRef, "lessons", lessonId);
  const existingDoc = await getDoc(lessonRef);
  const order = existingDoc.exists() ? existingDoc.data()?.order ?? 0 : (await getDocs(collection(unitRef, "lessons"))).size;

  await setDoc(
    lessonRef,
    {
      title,
      explanation,
      status,
      order,
    },
    { merge: true }
  );
}

export async function deleteLesson(subjectName: SubjectName, unitId: string, lessonId: string): Promise<void> {
  const lessonRef = doc(db, "subjects", subjectName, "units", unitId, "lessons", lessonId);
  await deleteDoc(lessonRef);
}

// ==========================================
// 3. QUESTIONS
// ==========================================

export interface LessonMetadata {
  subjectName: SubjectName;
  unitId: string;
  unitTitle: string;
  lessonTitle: string;
}

let cachedLessonMap: Map<string, LessonMetadata> | null = null;
let lastLessonMapFetch = 0;

export async function getLessonMetadataMap(forceRefresh = false): Promise<Map<string, LessonMetadata>> {
  const now = Date.now();
  if (!forceRefresh && cachedLessonMap && now - lastLessonMapFetch < 120000) {
    return cachedLessonMap;
  }

  const map = new Map<string, LessonMetadata>();
  const subjects: SubjectName[] = ["فقه", "تفسير", "حديث", "توحيد", "نحو", "صرف", "بلاغة", "أدب"];

  await Promise.all(
    subjects.map(async (sub) => {
      const units = await getUnitsForSubject(sub);
      units.forEach((u) => {
        // Map unit exam ID
        map.set(`unit_exam_${u.id}`, {
          subjectName: sub,
          unitId: u.id,
          unitTitle: u.title,
          lessonTitle: `امتحان الوحدة الشامل (${u.title})`,
        });

        // Map each lesson
        u.lessons.forEach((l) => {
          map.set(l.id, {
            subjectName: sub,
            unitId: u.id,
            unitTitle: u.title,
            lessonTitle: l.title,
          });
        });
      });
    })
  );

  cachedLessonMap = map;
  lastLessonMapFetch = now;
  return map;
}

export async function getAllQuestions(subjectName?: SubjectName): Promise<QuizQuestion[]> {
  try {
    const lessonMap = await getLessonMetadataMap();
    const questionsRef = collection(db, "questions");
    const snap = await getDocs(questionsRef);
    const questions: QuizQuestion[] = [];

    snap.forEach((d) => {
      const data = d.data();
      const lessonId = data.lessonId || "1";
      const meta = lessonMap.get(lessonId);

      // Infer subject if not stored on document
      let resolvedSubject: SubjectName | undefined =
        (data.subjectName as SubjectName) || meta?.subjectName;

      if (!resolvedSubject) {
        const idStr = (d.id || "").toLowerCase();
        const lStr = (lessonId || "").toLowerCase();
        if (idStr.includes("fiqh") || lStr.includes("fiqh") || lStr.includes("فقه") || idStr.includes("فقه")) {
          resolvedSubject = "فقه";
        } else if (idStr.includes("hadith") || lStr.includes("hadith") || lStr.includes("حديث") || idStr.includes("حديث")) {
          resolvedSubject = "حديث";
        } else if (idStr.includes("tafsir") || lStr.includes("tafsir") || lStr.includes("تفسير") || idStr.includes("تفسير")) {
          resolvedSubject = "تفسير";
        } else if (idStr.includes("tawheed") || lStr.includes("tawheed") || lStr.includes("توحيد") || idStr.includes("توحيد")) {
          resolvedSubject = "توحيد";
        } else if (idStr.includes("nahw") || lStr.includes("nahw") || lStr.includes("نحو") || idStr.includes("نحو")) {
          resolvedSubject = "نحو";
        } else if (idStr.includes("sarf") || lStr.includes("sarf") || lStr.includes("صرف") || idStr.includes("صرف")) {
          resolvedSubject = "صرف";
        } else if (idStr.includes("balagha") || lStr.includes("balagha") || lStr.includes("بلاغة") || idStr.includes("بلاغة")) {
          resolvedSubject = "بلاغة";
        } else if (idStr.includes("adab") || lStr.includes("adab") || lStr.includes("أدب") || idStr.includes("أدب")) {
          resolvedSubject = "أدب";
        }
      }

      questions.push({
        id: d.id,
        lessonId,
        type: data.type || "mcq",
        instruction: data.instruction || "",
        data: data.data || {},
        subjectName: resolvedSubject,
        unitId: data.unitId || meta?.unitId,
        unitTitle: meta?.unitTitle,
        lessonTitle: meta?.lessonTitle,
      });
    });

    if (subjectName) {
      return questions.filter((q) => q.subjectName === subjectName);
    }
    return questions;
  } catch (error) {
    console.error("Error loading questions:", error);
    return [];
  }
}

export async function saveQuestion(question: QuizQuestion): Promise<void> {
  const qRef = doc(db, "questions", question.id);
  await setDoc(
    qRef,
    {
      id: question.id,
      lessonId: question.lessonId,
      type: question.type,
      instruction: question.instruction,
      data: question.data,
      ...(question.subjectName ? { subjectName: question.subjectName } : {}),
      ...(question.unitId ? { unitId: question.unitId } : {}),
    },
    { merge: true }
  );
}

export async function deleteQuestion(questionId: string): Promise<void> {
  await deleteDoc(doc(db, "questions", questionId));
}

export async function batchSaveQuestions(questions: QuizQuestion[]): Promise<{ saved: number; errors: number }> {
  let saved = 0;
  let errors = 0;

  // Firebase batches support up to 500 operations
  const chunkSize = 400;
  for (let i = 0; i < questions.length; i += chunkSize) {
    const chunk = questions.slice(i, i + chunkSize);
    const batch = writeBatch(db);

    chunk.forEach((q) => {
      const ref = doc(db, "questions", q.id);
      batch.set(
        ref,
        {
          id: q.id,
          lessonId: q.lessonId,
          type: q.type,
          instruction: q.instruction,
          data: q.data,
          ...(q.subjectName ? { subjectName: q.subjectName } : {}),
        },
        { merge: true }
      );
    });

    try {
      await batch.commit();
      saved += chunk.length;
    } catch (e) {
      console.error("Batch save error:", e);
      errors += chunk.length;
    }
  }

  return { saved, errors };
}

// ==========================================
// 4. STUDENTS & MANUAL SUBSCRIPTIONS
// ==========================================
export async function getStudentsList(): Promise<StudentUser[]> {
  try {
    const snap = await getDocs(collection(db, "users"));
    const students: StudentUser[] = [];

    snap.forEach((d) => {
      const data = d.data();
      students.push({
        uid: d.id,
        displayName: data.displayName || "طالب أزهري",
        email: data.email || "",
        role: data.role || "student",
        hearts: data.hearts ?? 6,
        xp: data.xp ?? 0,
        weeklyXp: data.weeklyXp ?? 0,
        streak: data.streak ?? 0,
        selectedPath: data.selectedPath || "none",
        isPremium: data.isPremium || false,
        premiumPaths: data.premiumPaths || [],
        avatarId: data.avatarId || "student_azhar",
        mistakeQuestionIds: data.mistakeQuestionIds || [],
        completedLessonIds: data.completedLessonIds || [],
        subjectProgress: data.subjectProgress || {},
        createdAt: data.createdAt,
        lastLoginAt: data.lastLoginAt,
        subscriptionExpiresAt: data.subscriptionExpiresAt,
      });
    });

    students.sort((a, b) => (b.xp || 0) - (a.xp || 0));
    return students;
  } catch (error) {
    console.error("Error loading students:", error);
    return [];
  }
}

export async function activateStudentSubscription(
  uid: string,
  paths: ("sharia" | "arabic")[],
  durationDays: number = 120
): Promise<void> {
  const userRef = doc(db, "users", uid);
  const expires = new Date();
  expires.setDate(expires.getDate() + durationDays);

  const isFull = paths.includes("sharia") && paths.includes("arabic");

  await updateDoc(userRef, {
    isPremium: true,
    premiumPaths: paths,
    subscriptionExpiresAt: expires.toISOString(),
    subscriptionUpdatedAt: serverTimestamp(),
  });
}

export async function deactivateStudentSubscription(uid: string): Promise<void> {
  const userRef = doc(db, "users", uid);
  await updateDoc(userRef, {
    isPremium: false,
    premiumPaths: [],
    subscriptionExpiresAt: null,
  });
}

export async function refillHearts(uid: string): Promise<void> {
  const userRef = doc(db, "users", uid);
  await updateDoc(userRef, {
    hearts: 6,
    lastHeartDepletedTime: "",
  });
}

export async function resetStudentMistakes(uid: string): Promise<void> {
  const userRef = doc(db, "users", uid);
  await updateDoc(userRef, {
    mistakeQuestionIds: [],
  });
}
