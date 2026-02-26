import { get, post, put } from './request'

/* ========== 类型定义 ========== */

export interface LoginParams {
  code: string
}

export interface LoginResult {
  token: string
  userInfo: {
    id: string
    nickname: string
    avatar: string
    phone?: string
    constitutionType?: string
    constitutionName?: string
  }
}

export interface AssessmentAnswer {
  questionId: string
  value: number
}

export interface AssessmentResult {
  id: string
  primaryType: string
  primaryName: string
  primaryScore: number
  scores: Record<string, number>
  features: string[]
  risks: string[]
  suggestions: string[]
  secondaryTypes: Array<{
    type: string
    name: string
    score: number
  }>
  createdAt: string
}

export interface HealthPlan {
  id: string
  constitutionType: string
  diet: {
    recommended: string[]
    avoided: string[]
    recipes: Array<{ name: string; desc: string }>
  }
  exercise: Array<{ name: string; duration: string; frequency: string }>
  lifestyle: string[]
  acupoints: Array<{ name: string; method: string; benefit: string }>
  herbs: Array<{ name: string; usage: string }>
  seasonalTips: string[]
}

export interface DiaryEntry {
  id?: string
  date: string
  sleepHours: number
  sleepQuality: number
  mood: number
  exerciseMinutes: number
  exerciseType: string
  diet: string
  symptoms: string[]
  notes: string
}

export interface DiaryStats {
  totalDays: number
  streakDays: number
  avgSleepHours: number
  avgMood: number
  avgExerciseMinutes: number
  commonSymptoms: Array<{ name: string; count: number }>
}

export interface ChatMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  createdAt: string
}

export interface ChatSession {
  id: string
  title: string
  lastMessage: string
  createdAt: string
}

export interface FollowupPlan {
  id: string
  title: string
  nextDate: string
  status: 'pending' | 'completed' | 'overdue'
  items: Array<{ label: string; completed: boolean }>
}

/* ========== Auth 认证 ========== */

export const authApi = {
  /** 微信登录 */
  login: (params: LoginParams) =>
    post<LoginResult>('/api/auth/wx-login', params as unknown as Record<string, unknown>),

  /** 获取用户信息 */
  getUserInfo: () => get<LoginResult['userInfo']>('/api/user/info'),
}

/* ========== Assessment 体质评估 ========== */

export const assessmentApi = {
  /** 提交评估问卷 */
  submitAssessment: (answers: AssessmentAnswer[]) =>
    post<AssessmentResult>('/api/assessment/submit', answers as unknown as Record<string, unknown>[], {
      showLoading: true,
    }),

  /** 获取最新评估结果 */
  getAssessmentResult: () =>
    get<AssessmentResult>('/api/assessment/latest'),

  /** 获取评估历史 */
  getHistory: (page = 1, pageSize = 10) =>
    get<{ list: AssessmentResult[]; total: number }>('/api/assessment/history', {
      page,
      pageSize,
    } as unknown as Record<string, unknown>),
}

/* ========== Plan 养生方案 ========== */

export const planApi = {
  /** 获取养生方案 */
  getHealthPlan: (constitutionType?: string) =>
    get<HealthPlan>('/api/plan/health', constitutionType ? { type: constitutionType } : {}),
}

/* ========== Diary 健康日记 ========== */

export const diaryApi = {
  /** 创建日记记录 */
  createEntry: (entry: Omit<DiaryEntry, 'id'>) =>
    post<DiaryEntry>('/api/diary/entry', entry as unknown as Record<string, unknown>, {
      showLoading: true,
    }),

  /** 获取日记列表 */
  getEntries: (month: string) =>
    get<DiaryEntry[]>('/api/diary/entries', { month }),

  /** 获取统计数据 */
  getStats: () => get<DiaryStats>('/api/diary/stats'),
}

/* ========== Chat AI助手 ========== */

export const chatApi = {
  /** 发送消息 */
  sendMessage: (sessionId: string | null, content: string) =>
    post<{ sessionId: string; message: ChatMessage }>(
      '/api/chat/send',
      { sessionId, content }
    ),

  /** 获取会话列表 */
  getSessions: () => get<ChatSession[]>('/api/chat/sessions'),
}

/* ========== Followup 随访 ========== */

export const followupApi = {
  /** 获取随访计划 */
  getPlans: () => get<FollowupPlan[]>('/api/followup/plans'),

  /** 提交随访反馈 */
  submitFeedback: (planId: string, feedback: Record<string, unknown>) =>
    put<void>(`/api/followup/plans/${planId}/feedback`, feedback),
}
