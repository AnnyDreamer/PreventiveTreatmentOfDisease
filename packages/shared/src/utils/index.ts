import type { ConstitutionScores, ConstitutionType } from '../types'
import { CONSTITUTION_QUESTIONS } from '../constants/constitution'
import { EMERGENCY_KEYWORDS } from '../constants'

/**
 * 根据问卷答案计算各体质原始分和转化分
 *
 * 转化分公式：转化分 = (原始分 - 条目数) / (条目数 * 4) * 100
 * 平和质：转化分 >= 60 判为"是"
 * 偏颇体质：转化分 >= 40 判为"倾向是"，>= 30 判为"是"
 */
export function calculateConstitutionScores(answers: Record<string, number>): ConstitutionScores {
  const constitutionTypes: ConstitutionType[] = [
    'BALANCED', 'QI_DEFICIENCY', 'YANG_DEFICIENCY', 'YIN_DEFICIENCY',
    'PHLEGM_DAMPNESS', 'DAMP_HEAT', 'BLOOD_STASIS', 'QI_STAGNATION', 'SPECIAL',
  ]

  const scores = {} as ConstitutionScores

  for (const type of constitutionTypes) {
    const questions = CONSTITUTION_QUESTIONS.filter(q => q.constitutionType === type)
    const itemCount = questions.length
    if (itemCount === 0) {
      scores[type] = 0
      continue
    }

    let rawScore = 0
    for (const q of questions) {
      rawScore += answers[q.id] ?? 3
    }

    // 平和质反向计分已在题目设计中处理
    const transformedScore = ((rawScore - itemCount) / (itemCount * 4)) * 100
    scores[type] = Math.round(transformedScore * 10) / 10
  }

  return scores
}

/**
 * 根据得分确定主体质和兼夹体质
 */
export function determineConstitutionTypes(scores: ConstitutionScores): {
  primaryType: ConstitutionType
  secondaryTypes: ConstitutionType[]
} {
  const entries = Object.entries(scores) as [ConstitutionType, number][]

  // 平和质判定：平和质 >= 60 且其他所有偏颇体质 < 30
  const balancedScore = scores.BALANCED
  const biasTypes = entries.filter(([type]) => type !== 'BALANCED')
  const allBiasLow = biasTypes.every(([, score]) => score < 30)

  if (balancedScore >= 60 && allBiasLow) {
    return { primaryType: 'BALANCED', secondaryTypes: [] }
  }

  // 偏颇体质判定
  const biasScores = biasTypes.sort((a, b) => b[1] - a[1])
  const primaryType = biasScores[0][0]
  const secondaryTypes = biasScores
    .slice(1)
    .filter(([, score]) => score >= 30)
    .map(([type]) => type)

  return { primaryType, secondaryTypes }
}

/**
 * 格式化日期为 YYYY-MM-DD
 */
export function formatDate(date: Date): string {
  return date.toISOString().split('T')[0]
}

/**
 * 检查文本是否包含紧急关键词
 */
export function containsEmergencyKeyword(text: string): boolean {
  return EMERGENCY_KEYWORDS.some((keyword) => text.includes(keyword))
}
