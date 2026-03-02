import { get, post, put, del } from "./request";

/* ========== 类型定义 ========== */

export interface LoginParams {
  code: string;
}

export interface LoginResult {
  token: string;
  userInfo: {
    id: string;
    nickname: string;
    avatar: string;
    phone?: string;
    constitutionType?: string;
    constitutionName?: string;
  };
}

export interface AssessmentAnswer {
  questionId: string;
  value: number;
}

export interface TongueAnalysisResult {
  tongueColor: string;
  tongueShape: string;
  coatingColor: string;
  coatingThickness: string;
  coatingMoisture: string;
  scores: Record<string, number>;
  summary: string;
  confidence: number;
}

export interface AssessmentResult {
  id: string;
  primaryType: string;
  primaryName: string;
  primaryScore: number;
  scores: Record<string, number>;
  features: string[];
  risks: string[];
  suggestions: string[];
  secondaryTypes: Array<{
    type: string;
    name: string;
    score: number;
  }>;
  createdAt: string;
  mode?: "FULL" | "SMART";
  tongueAnalysis?: TongueAnalysisResult;
}

export interface Phase1Result {
  phase1Scores: Record<string, number>;
  weightedScores: Record<string, number>;
  top3Types: string[];
  phase2Questions: Array<{
    id: string;
    text: string;
    constitutionType: string;
    dimension: string;
  }>;
}

export interface HealthPlan {
  id: string;
  constitutionType: string;
  diet: {
    recommended: string[];
    avoided: string[];
    recipes: Array<{ name: string; desc: string }>;
  };
  exercise: Array<{ name: string; duration: string; frequency: string }>;
  lifestyle: string[];
  acupoints: Array<{ name: string; method: string; benefit: string }>;
  herbs: Array<{ name: string; usage: string }>;
  seasonalTips: string[];
}

export interface DiaryEntry {
  id?: string;
  date: string;
  sleepHours: number;
  sleepQuality: number;
  mood: number;
  exerciseMinutes: number;
  exerciseType: string;
  diet: string;
  symptoms: string[];
  notes: string;
}

export interface DiaryStats {
  totalDays: number;
  streakDays: number;
  avgSleepHours: number;
  avgMood: number;
  avgExerciseMinutes: number;
  commonSymptoms: Array<{ name: string; count: number }>;
}

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  createdAt: string;
}

export interface ChatSession {
  id: string;
  title: string;
  lastMessage: string;
  createdAt: string;
}

export interface FollowupPlan {
  id: string;
  title: string;
  nextDate: string;
  status: "pending" | "completed" | "overdue";
  items: Array<{ label: string; completed: boolean }>;
}

/* ========== Auth 认证 ========== */

export const authApi = {
  /** 微信登录 */
  login: (params: LoginParams) =>
    post<LoginResult>(
      "/api/auth/wx-login",
      params as unknown as Record<string, unknown>,
    ),

  /** 获取用户信息 */
  getUserInfo: () => get<LoginResult["userInfo"]>("/api/user/info"),
};

/* ========== Assessment 体质评估 ========== */

export const assessmentApi = {
  /** 提交评估问卷（FULL 模式） */
  submitAssessment: (answers: AssessmentAnswer[]) =>
    post<AssessmentResult>(
      "/api/assessment/submit",
      answers as unknown as Record<string, unknown>[],
      {
        showLoading: true,
      },
    ),

  /** 获取最新评估结果 */
  getAssessmentResult: () => get<AssessmentResult>("/api/assessment/latest"),

  /** 获取评估历史 */
  getHistory: (page = 1, pageSize = 10) =>
    get<{ list: AssessmentResult[]; total: number }>(
      "/api/assessment/history",
      {
        page,
        pageSize,
      } as unknown as Record<string, unknown>,
    ),

  /** 提交评估问卷（FULL 模式 — 新格式） */
  submitFullAssessment: (answers: Record<string, number>) =>
    post<AssessmentResult>(
      "/api/assessment",
      { mode: "FULL", answers },
      { showLoading: true },
    ),

  /** AI 舌诊分析 */
  analyzeTongue: (image: string) =>
    post<{ tongueAnalysis: TongueAnalysisResult; rawResponse: string }>(
      "/api/assessment/tongue",
      { image },
    ),

  /** Phase1 核心筛查分析 */
  analyzePhase1: (
    phase1Answers: Record<string, number>,
    tongueResult?: TongueAnalysisResult,
  ) =>
    post<Phase1Result>("/api/assessment/phase1", {
      phase1Answers,
      tongueResult,
    }),

  /** 提交智能评估（SMART 模式） */
  submitSmartAssessment: (data: {
    phase1Answers: Record<string, number>;
    phase2Answers: Record<string, number>;
    phase2Types: string[];
    tongueResult?: TongueAnalysisResult;
    tongueRawResponse?: string;
  }) =>
    post<AssessmentResult>(
      "/api/assessment",
      { mode: "SMART", ...data },
      { showLoading: true },
    ),
};

/* ========== Plan 养生方案 ========== */

export const planApi = {
  /** 获取养生方案 */
  getHealthPlan: (constitutionType?: string) =>
    get<HealthPlan>(
      "/api/plan/health",
      constitutionType ? { type: constitutionType } : {},
    ),
};

/* ========== Diary 健康日记 ========== */

export const diaryApi = {
  /** 创建日记记录 */
  createEntry: (entry: Omit<DiaryEntry, "id">) =>
    post<DiaryEntry>(
      "/api/diary/entry",
      entry as unknown as Record<string, unknown>,
      {
        showLoading: true,
      },
    ),

  /** 获取日记列表 */
  getEntries: (month: string) =>
    get<DiaryEntry[]>("/api/diary/entries", { month }),

  /** 获取统计数据 */
  getStats: () => get<DiaryStats>("/api/diary/stats"),
};

/* ========== Chat AI助手 ========== */

export const chatApi = {
  /** 发送消息 */
  sendMessage: (sessionId: string | null, content: string) =>
    post<{ sessionId: string; message: ChatMessage }>("/api/chat/send", {
      sessionId,
      content,
    }),

  /** 获取会话列表 */
  getSessions: () => get<ChatSession[]>("/api/chat/sessions"),
};

/* ========== Followup 随访 ========== */

export const followupApi = {
  /** 获取随访计划 */
  getPlans: () => get<FollowupPlan[]>("/api/followup/plans"),

  /** 提交随访反馈 */
  submitFeedback: (planId: string, feedback: Record<string, unknown>) =>
    put<void>(`/api/followup/plans/${planId}/feedback`, feedback),
};

/* ========== 节气 API ========== */

export interface SolarTermResponse {
  key: string
  name: string
  season: string
  organ: string
  nature: string
  wellnessFocus: string
  diet: string[]
  avoid: string[]
  exercise: string[]
  precautions: string[]
  benefitConstitutions: string[]
  cautionConstitutions: string[]
  relatedContents: Array<{
    id: string
    title: string
    summary: string
    publishedAt: string
    authorName: string | null
    viewCount: number
  }>
}

export const solarTermApi = {
  /** 获取当前节气信息 */
  getCurrentTerm: () => get<SolarTermResponse>("/api/solar-terms/current"),

  /** 获取指定节气信息 */
  getTermByKey: (key: string) =>
    get<SolarTermResponse>(`/api/solar-terms/${key.toLowerCase()}`),
};

/* ========== 健康内容 API ========== */

export interface ContentItem {
  id: string
  title: string
  summary: string
  contentType: string
  coverImage: string | null
  solarTermKey: string | null
  publishedAt: string | null
  authorName: string | null
  viewCount: number
}

export interface ContentDetail extends ContentItem {
  body: string
  constitutions: string[]
  source: string | null
}

export const contentApi = {
  /** 获取内容列表 */
  getList: (type?: string, constitution?: string, limit = 10) =>
    get<{ items: ContentItem[]; total: number; page: number; pageSize: number }>(
      "/api/contents",
      {
        ...(type ? { type } : {}),
        ...(constitution ? { constitution } : {}),
        limit,
      } as Record<string, unknown>
    ),

  /** 获取内容详情 */
  getDetail: (id: string) => get<ContentDetail>(`/api/contents/${id}`),

  /** 获取个性化内容推荐（需登录） */
  getPersonalized: () =>
    get<{ constitution: string | null; currentSolarTerm: string; contents: ContentItem[] }>(
      "/api/contents/personalized"
    ),
};

/* ========== 康养服务 API ========== */

export interface WellnessService {
  id: string
  name: string
  category: string
  description: string
  benefits: string[]
  duration: string | null
  price: string | null
  suitableFor: string[]
  isSeasonalOnly: boolean
  seasonalNote: string | null
  coverImage: string | null
}

export interface WellnessServiceDetail extends WellnessService {
  precautions: string[]
  contraindicatedFor: string[] | null
  hospital: { id: string; name: string; address: string | null }
}

export interface AvailabilitySlot {
  doctorId: string
  doctorName: string
  doctorTitle: string | null
  time: string
  available: boolean
}

export interface MyAppointment {
  id: string
  scheduledDate: string
  scheduledTime: string
  status: string
  note: string | null
  service: { id: string; name: string; category: string }
  doctor: { id: string; title: string | null; user: { name: string | null } } | null
}

export const serviceApi = {
  /** 获取康养服务列表 */
  getList: (category?: string, hospitalId?: string) =>
    get<WellnessService[]>(
      "/api/services",
      {
        ...(category ? { category } : {}),
        ...(hospitalId ? { hospitalId } : {}),
      } as Record<string, unknown>
    ),

  /** 获取服务详情 */
  getDetail: (id: string) => get<WellnessServiceDetail>(`/api/services/${id}`),

  /** 获取可用时间槽 */
  getAvailability: (id: string, date: string) =>
    get<{ date: string; items: AvailabilitySlot[] }>(`/api/services/${id}/availability`, { date }),
};

/* ========== 预约 Appointment API ========== */

export const appointmentApi = {
  /** 创建预约 */
  create: (data: { serviceId: string; doctorId?: string; scheduledDate: string; scheduledTime: string; note?: string }) =>
    post<{ id: string }>('/api/appointments', data as unknown as Record<string, unknown>, { showLoading: true }),

  /** 获取我的预约列表 */
  getMine: (status?: string) =>
    get<{ items: MyAppointment[]; total: number }>('/api/appointments/mine', status ? { status } as Record<string, unknown> : {}),
};

/* ========== 义诊活动 API ========== */

export interface WellnessActivity {
  id: string
  title: string
  description: string
  location: string
  department: string | null
  startTime: string
  endTime: string
  capacity: number
  currentCount: number
  status: string
  targetConstitutions: string[] | null
  coverImage: string | null
  tags: string[] | null
}

export interface WellnessActivityDetail extends WellnessActivity {
  isRegistered: boolean
  hospital: { id: string; name: string; address: string | null }
  publisher: {
    id: string
    title: string | null
    department: string | null
    user: { name: string | null; avatar: string | null }
  } | null
}

export const activityApi = {
  /** 获取活动列表 */
  getList: (status = "PUBLISHED", page = 1) =>
    get<{ items: WellnessActivity[]; total: number; page: number; pageSize: number }>(
      "/api/activities",
      { status, page } as Record<string, unknown>
    ),

  /** 获取活动详情 */
  getDetail: (id: string) =>
    get<WellnessActivityDetail>(`/api/activities/${id}`),

  /** 报名活动（需登录） */
  register: (id: string) =>
    post<{ message: string }>(`/api/activities/${id}/register`, {}),

  /** 取消报名（需登录） */
  cancelRegister: (id: string) =>
    del<{ message: string }>(`/api/activities/${id}/register`),
};
