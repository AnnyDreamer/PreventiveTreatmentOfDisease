// 康养服务分类配置
export const SERVICE_CATEGORY_CONFIG = {
  MOXIBUSTION: {
    label: '艾灸',
    icon: '艾',
    description: '艾灸疗法，温通经络',
    color: '#c83232',
    isSeasonal: false,
  },
  SANFU_PATCH: {
    label: '三伏贴',
    icon: '贴',
    description: '三伏天灸，冬病夏治',
    color: '#e07020',
    isSeasonal: true,
    seasonalNote: '仅限三伏天（大暑前后）',
  },
  TUINA: {
    label: '推拿',
    icon: '推',
    description: '经络推拿，舒筋活络',
    color: '#8b5a2b',
    isSeasonal: false,
  },
  MASSAGE: {
    label: '按摩',
    icon: '摩',
    description: '中医按摩，缓解疲劳',
    color: '#7c6f64',
    isSeasonal: false,
  },
  ACUPUNCTURE: {
    label: '针灸',
    icon: '针',
    description: '针灸调理，平衡阴阳',
    color: '#2d6a4f',
    isSeasonal: false,
  },
  HERBAL_DRINK: {
    label: '中药饮',
    icon: '药',
    description: '中药代茶饮，日常调养',
    color: '#2d9a64',
    isSeasonal: false,
  },
  OTHER: {
    label: '其他',
    icon: '他',
    description: '其他康养服务',
    color: '#6b7280',
    isSeasonal: false,
  },
} as const

// 健康内容类型配置
export const CONTENT_TYPE_CONFIG = {
  SOLAR_TERM: {
    label: '节气养生',
    icon: '节',
  },
  CONSTITUTION_GUIDE: {
    label: '体质调养',
    icon: '质',
  },
  DIET_THERAPY: {
    label: '食疗药膳',
    icon: '膳',
  },
  EXERCISE_GUIDE: {
    label: '运动指导',
    icon: '动',
  },
  KNOWLEDGE: {
    label: '健康常识',
    icon: '识',
  },
} as const

// 活动状态配置
export const ACTIVITY_STATUS_CONFIG = {
  DRAFT: {
    label: '草稿',
    color: '#9ca3af',
  },
  PUBLISHED: {
    label: '报名中',
    color: '#2d9a64',
  },
  ONGOING: {
    label: '进行中',
    color: '#3b82f6',
  },
  ENDED: {
    label: '已结束',
    color: '#6b7280',
  },
  CANCELLED: {
    label: '已取消',
    color: '#ef4444',
  },
} as const
