import { generateObject } from 'ai'
import { z } from 'zod'
import { defaultModel } from '../client'
import type { ConstitutionType, HealthPlanAdvice } from '@zhiwebing/shared'
import { CONSTITUTION_INFO } from '@zhiwebing/shared'

// 中医体质调理知识库
const CONSTITUTION_KNOWLEDGE: Record<ConstitutionType, {
  principle: string
  dietFocus: string
  exerciseFocus: string
  lifestyleFocus: string
  emotionFocus: string
  keyFoods: string[]
  keyAcupoints: string[]
}> = {
  BALANCED: {
    principle: '维持平衡，顺应四时',
    dietFocus: '饮食有节，不偏食偏嗜',
    exerciseFocus: '适度运动，动静结合',
    lifestyleFocus: '起居有常，劳逸适度',
    emotionFocus: '保持心情愉悦，情志条达',
    keyFoods: ['五谷杂粮', '新鲜蔬果', '优质蛋白'],
    keyAcupoints: ['足三里', '关元', '气海'],
  },
  QI_DEFICIENCY: {
    principle: '补气健脾，益气固表',
    dietFocus: '健脾益气，忌生冷寒凉',
    exerciseFocus: '柔和运动，避免过劳',
    lifestyleFocus: '注意保暖，避免过度劳累',
    emotionFocus: '培养自信，避免过度思虑',
    keyFoods: ['山药', '黄芪', '大枣', '党参', '白术', '粳米', '鸡肉', '牛肉'],
    keyAcupoints: ['足三里', '气海', '关元', '脾俞'],
  },
  YANG_DEFICIENCY: {
    principle: '温补阳气，散寒通络',
    dietFocus: '温阳散寒，忌寒凉生冷',
    exerciseFocus: '动则生阳，适当增加运动量',
    lifestyleFocus: '注意保暖，多晒太阳',
    emotionFocus: '振奋精神，多参与社交活动',
    keyFoods: ['羊肉', '韭菜', '生姜', '肉桂', '核桃', '虾', '荔枝', '桂圆'],
    keyAcupoints: ['关元', '命门', '肾俞', '神阙'],
  },
  YIN_DEFICIENCY: {
    principle: '滋阴润燥，养阴清热',
    dietFocus: '滋阴润燥，忌辛辣温燥',
    exerciseFocus: '选择静功和柔和运动，避免大汗',
    lifestyleFocus: '保证睡眠，避免熬夜',
    emotionFocus: '安神定志，避免急躁',
    keyFoods: ['百合', '银耳', '枸杞', '麦冬', '鸭肉', '黑芝麻', '蜂蜜', '梨'],
    keyAcupoints: ['三阴交', '太溪', '照海', '涌泉'],
  },
  PHLEGM_DAMPNESS: {
    principle: '化痰祛湿，健脾利水',
    dietFocus: '健脾化湿，忌肥甘厚腻',
    exerciseFocus: '增加运动量，促进代谢',
    lifestyleFocus: '避免潮湿环境，保持居所干燥通风',
    emotionFocus: '开朗豁达，多参加户外活动',
    keyFoods: ['薏苡仁', '冬瓜', '陈皮', '赤小豆', '荷叶', '山楂', '白萝卜', '扁豆'],
    keyAcupoints: ['丰隆', '阴陵泉', '中脘', '足三里'],
  },
  DAMP_HEAT: {
    principle: '清热利湿，分消走泄',
    dietFocus: '清淡饮食，忌辛辣油腻、烟酒',
    exerciseFocus: '中高强度运动，促进排汗',
    lifestyleFocus: '保持皮肤清洁，居所通风凉爽',
    emotionFocus: '保持心态平和，避免暴怒',
    keyFoods: ['绿豆', '苦瓜', '黄瓜', '薏苡仁', '莲子', '冬瓜', '芹菜', '绿茶'],
    keyAcupoints: ['曲池', '合谷', '阴陵泉', '内庭'],
  },
  BLOOD_STASIS: {
    principle: '活血化瘀，疏通经络',
    dietFocus: '活血行气，忌寒凉冰冻',
    exerciseFocus: '促进血液循环的运动，如快走、太极',
    lifestyleFocus: '避免久坐，保持身体活动',
    emotionFocus: '培养乐观心态，避免抑郁',
    keyFoods: ['山楂', '醋', '玫瑰花', '黑木耳', '红糖', '黄酒（适量）', '桃仁', '藏红花'],
    keyAcupoints: ['血海', '膈俞', '合谷', '太冲'],
  },
  QI_STAGNATION: {
    principle: '疏肝理气，调畅气机',
    dietFocus: '理气解郁，忌收涩酸敛',
    exerciseFocus: '多做户外运动和群体运动',
    lifestyleFocus: '扩大社交，培养兴趣爱好',
    emotionFocus: '疏导情志，学会倾诉和放松',
    keyFoods: ['玫瑰花', '佛手', '陈皮', '金桔', '山楂', '麦芽', '萝卜', '茉莉花'],
    keyAcupoints: ['太冲', '期门', '膻中', '内关'],
  },
  SPECIAL: {
    principle: '益气固表，养血消风',
    dietFocus: '清淡均衡，避免已知过敏原',
    exerciseFocus: '适度运动，增强体质',
    lifestyleFocus: '远离过敏原，注意季节变化防护',
    emotionFocus: '保持心情愉快，减少精神压力',
    keyFoods: ['大枣', '蜂蜜', '山药', '糯米', '黄芪', '灵芝', '乌梅'],
    keyAcupoints: ['足三里', '肺俞', '风门', '曲池'],
  },
}

// generateObject 返回结果的 zod schema
const healthPlanSchema = z.object({
  dietAdvice: z.object({
    recommended: z.array(z.string()).describe('推荐食物列表'),
    avoid: z.array(z.string()).describe('忌口食物列表'),
    recipes: z.array(z.string()).describe('推荐食疗方/药膳'),
    teaRecommendation: z.array(z.string()).optional().describe('推荐代茶饮'),
  }),
  exerciseAdvice: z.object({
    recommended: z.array(z.string()).describe('推荐运动项目'),
    frequency: z.string().describe('建议运动频率'),
    duration: z.string().describe('建议每次运动时长'),
    precautions: z.array(z.string()).describe('运动注意事项'),
  }),
  lifestyleAdvice: z.object({
    sleepSuggestion: z.string().describe('睡眠建议'),
    dailyRoutine: z.array(z.string()).describe('日常起居建议'),
    seasonalTips: z.array(z.string()).describe('四季养生要点'),
    precautions: z.array(z.string()).describe('日常注意事项'),
  }),
  emotionAdvice: z.object({
    suggestions: z.array(z.string()).describe('情志调养建议'),
    musicTherapy: z.array(z.string()).optional().describe('音乐疗法推荐'),
    meditationTips: z.array(z.string()).optional().describe('冥想/静功建议'),
  }),
  acupointAdvice: z.object({
    points: z.array(z.object({
      name: z.string().describe('穴位名称'),
      location: z.string().describe('穴位位置描述'),
      method: z.string().describe('按摩/艾灸方法'),
      benefit: z.string().describe('功效说明'),
    })),
  }).optional().describe('穴位保健建议'),
})

interface PatientInfo {
  age?: number
  gender?: string
  occupation?: string
  existingConditions?: string[]
}

export async function generateHealthPlan(
  primaryType: ConstitutionType,
  secondaryTypes: ConstitutionType[],
  patientInfo?: PatientInfo
): Promise<HealthPlanAdvice> {
  const primaryInfo = CONSTITUTION_INFO[primaryType]
  const primaryKnowledge = CONSTITUTION_KNOWLEDGE[primaryType]

  const secondaryKnowledgeParts = secondaryTypes.map(t => {
    const info = CONSTITUTION_INFO[t]
    const knowledge = CONSTITUTION_KNOWLEDGE[t]
    return `- ${info.name}：${knowledge.principle}，推荐食材：${knowledge.keyFoods.join('、')}`
  })

  const patientContext = patientInfo
    ? `
【患者信息】
${patientInfo.age ? `年龄：${patientInfo.age}岁` : ''}
${patientInfo.gender ? `性别：${patientInfo.gender}` : ''}
${patientInfo.occupation ? `职业：${patientInfo.occupation}` : ''}
${patientInfo.existingConditions?.length ? `既往情况：${patientInfo.existingConditions.join('、')}` : ''}`
    : ''

  const { object } = await generateObject({
    model: defaultModel,
    schema: healthPlanSchema,
    system: `你是一位经验丰富的中医养生专家，擅长根据体质辨识结果制定个性化的五维养生方案（饮食、运动、起居、情志、穴位）。

核心原则：
1. 方案必须基于中医体质学理论
2. 建议应具体可执行，避免空泛
3. 考虑兼夹体质的综合调理
4. 不做疾病诊断和治疗，只提供养生保健建议
5. 所有建议需适合日常自我调理`,
    prompt: `请根据以下体质信息，生成完整的五维养生方案：

【主体质】${primaryInfo.name}
调理原则：${primaryKnowledge.principle}
饮食方向：${primaryKnowledge.dietFocus}
运动方向：${primaryKnowledge.exerciseFocus}
起居方向：${primaryKnowledge.lifestyleFocus}
情志方向：${primaryKnowledge.emotionFocus}
推荐食材：${primaryKnowledge.keyFoods.join('、')}
推荐穴位：${primaryKnowledge.keyAcupoints.join('、')}

${secondaryTypes.length > 0 ? `【兼夹体质参考】\n${secondaryKnowledgeParts.join('\n')}` : ''}
${patientContext}

请生成详细的个性化养生方案，每个维度至少包含3-5条具体建议。穴位建议需要包含准确的位置描述和操作方法。`,
  })

  return object as HealthPlanAdvice
}
