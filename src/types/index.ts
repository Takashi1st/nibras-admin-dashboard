export type UserRole = "admin" | "student" | "teacher";

export type LearningPathType = "none" | "sharia" | "arabic" | "all";

export interface StudentUser {
  uid: string;
  displayName: string;
  email: string;
  role: UserRole;
  hearts: number;
  xp: number;
  weeklyXp: number;
  streak: number;
  selectedPath: LearningPathType;
  isPremium: boolean;
  premiumPaths: string[];
  avatarId?: string;
  mistakeQuestionIds?: string[];
  completedLessonIds?: string[];
  subjectProgress?: Record<string, number>;
  createdAt?: any;
  lastLoginAt?: any;
  subscriptionExpiresAt?: string;
}

export type SubjectName =
  | "فقه"
  | "تفسير"
  | "حديث"
  | "توحيد"
  | "نحو"
  | "صرف"
  | "بلاغة"
  | "أدب";

export type PathType = "sharia" | "arabic";

export interface SubjectMeta {
  name: SubjectName;
  path: PathType;
  title: string;
  description: string;
  icon: string;
}

export type LessonStatus = "locked" | "available" | "completed";

export interface Lesson {
  id: string;
  title: string;
  status: LessonStatus;
  explanation: string;
  order: number;
  subjectName?: SubjectName;
  unitId?: string;
}

export interface Unit {
  id: string;
  title: string;
  order: number;
  lessons: Lesson[];
  subjectName?: SubjectName;
}

export type ExplanationCardType =
  | "standard"
  | "guessReveal"
  | "comparison"
  | "microQuiz"
  | "flipCard"
  | "debate"
  | "wordMeaning"
  | "tafsirAnalysis"
  | "hadithAnalysis"
  | "hadithText"
  | "hadithVocab"
  | "hadithExplanation"
  | "surahIntro"
  | "tawheedDetails"
  | "tawheedRuling";

export interface ExplanationCard {
  type: ExplanationCardType;
  content: string;
  extraData?: Record<string, any>;
}

export type QuestionType =
  | "mcq"
  | "true_false"
  | "matching"
  | "rearrangement"
  | "fill_blank"
  | "spot_error"
  | "sorting"
  | "scenario"
  | "word_meaning"
  | "short_answer";

export interface QuizQuestion {
  id: string;
  lessonId: string;
  type: QuestionType;
  instruction: string;
  data: Record<string, any>;
  subjectName?: SubjectName;
  unitId?: string;
  unitTitle?: string;
  lessonTitle?: string;
}

export interface SubscriptionRequest {
  id: string;
  uid: string;
  studentName: string;
  studentEmail: string;
  senderPhone: string;
  paymentMethod: "vodafone_cash" | "instapay" | "other";
  selectedPlan: string;
  amount: number;
  status: "pending" | "approved" | "rejected";
  adminNotes?: string;
  createdAt: any;
  updatedAt?: any;
}
