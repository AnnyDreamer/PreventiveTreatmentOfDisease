// API 响应类型
export interface ApiResponse<T = unknown> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  total: number
  page: number
  pageSize: number
}

// 用户相关类型
export type UserRole = 'PATIENT' | 'DOCTOR' | 'ADMIN'

export interface UserInfo {
  id: string
  name: string | null
  avatar: string | null
  role: UserRole
  phone: string | null
}

// 体质类型
export type ConstitutionType =
  | 'BALANCED'
  | 'QI_DEFICIENCY'
  | 'YANG_DEFICIENCY'
  | 'YIN_DEFICIENCY'
  | 'PHLEGM_DAMPNESS'
  | 'DAMP_HEAT'
  | 'BLOOD_STASIS'
  | 'QI_STAGNATION'
  | 'SPECIAL'

export type RiskLevel = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'

export type FollowupStatus = 'PENDING' | 'COMPLETED' | 'MISSED' | 'CANCELLED'

// 体质评估相关
export interface ConstitutionScores {
  BALANCED: number
  QI_DEFICIENCY: number
  YANG_DEFICIENCY: number
  YIN_DEFICIENCY: number
  PHLEGM_DAMPNESS: number
  DAMP_HEAT: number
  BLOOD_STASIS: number
  QI_STAGNATION: number
  SPECIAL: number
}

export interface AssessmentResult {
  scores: ConstitutionScores
  primaryType: ConstitutionType
  secondaryTypes: ConstitutionType[]
  aiAnalysis?: string
}

// 养生方案
export interface HealthPlanAdvice {
  dietAdvice: DietAdvice
  exerciseAdvice: ExerciseAdvice
  lifestyleAdvice: LifestyleAdvice
  emotionAdvice: EmotionAdvice
  acupointAdvice?: AcupointAdvice
}

export interface DietAdvice {
  recommended: string[]
  avoid: string[]
  recipes: string[]
  teaRecommendation?: string[]
}

export interface ExerciseAdvice {
  recommended: string[]
  frequency: string
  duration: string
  precautions: string[]
}

export interface LifestyleAdvice {
  sleepSuggestion: string
  dailyRoutine: string[]
  seasonalTips: string[]
  precautions: string[]
}

export interface EmotionAdvice {
  suggestions: string[]
  musicTherapy?: string[]
  meditationTips?: string[]
}

export interface AcupointAdvice {
  points: Array<{
    name: string
    location: string
    method: string
    benefit: string
  }>
}

// 健康日记
export interface DiaryEntryData {
  date: string
  sleepHours?: number
  sleepQuality?: number  // 1-5
  moodScore?: number     // 1-5
  exerciseMinutes?: number
  exerciseType?: string
  dietNote?: string
  symptoms?: string[]
  note?: string
}

// AI对话
export interface ChatMessageData {
  role: 'user' | 'assistant' | 'system'
  content: string
  metadata?: {
    intent?: string
    safetyFlag?: boolean
    constitutionContext?: boolean
  }
}

// 随访
export interface FollowupFeedback {
  overallFeeling: number  // 1-5
  symptoms: string[]
  dietCompliance: number  // 1-5
  exerciseCompliance: number  // 1-5
  sleepQuality: number  // 1-5
  note?: string
}
