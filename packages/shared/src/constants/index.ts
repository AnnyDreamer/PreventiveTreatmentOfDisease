export * from './solar-terms'
export * from './wellness'

export const RISK_LEVEL_CONFIG = {
  LOW: { label: '低风险', color: '#22c55e', bgColor: '#f0fdf4' },
  MEDIUM: { label: '中风险', color: '#eab308', bgColor: '#fefce8' },
  HIGH: { label: '高风险', color: '#f97316', bgColor: '#fff7ed' },
  CRITICAL: { label: '极高风险', color: '#ef4444', bgColor: '#fef2f2' },
} as const

export const FOLLOWUP_STATUS_CONFIG = {
  PENDING: { label: '待完成', color: '#3b82f6' },
  COMPLETED: { label: '已完成', color: '#22c55e' },
  MISSED: { label: '已错过', color: '#ef4444' },
  CANCELLED: { label: '已取消', color: '#6b7280' },
} as const

export const SLEEP_QUALITY_LABELS = ['', '很差', '较差', '一般', '较好', '很好'] as const
export const MOOD_LABELS = ['', '很差', '低落', '平静', '愉快', '非常好'] as const

// 紧急关键词 - AI助手需要拦截并引导就医
export const EMERGENCY_KEYWORDS = [
  '胸痛', '胸闷', '心绞痛', '心梗', '心肌梗塞',
  '中风', '脑卒中', '脑出血', '脑梗',
  '呼吸困难', '窒息', '喘不上气',
  '大出血', '吐血', '便血', '咯血',
  '昏迷', '意识不清', '休克',
  '高烧不退', '持续高热',
  '自杀', '自残', '不想活',
  '剧烈头痛', '突然头痛',
  '严重过敏', '过敏性休克',
  '骨折', '外伤大出血',
] as const

export const EMERGENCY_RESPONSE = '⚠️ 您描述的情况可能需要紧急医疗处理，请立即前往最近的医院急诊科就医，或拨打120急救电话。本AI助手不能替代专业医疗诊断和急救处理。'
