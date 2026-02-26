import { generateText } from 'ai'
import { defaultModel } from '../client'
import type { ConstitutionScores, ConstitutionType } from '@zhiwebing/shared'
import { CONSTITUTION_INFO } from '@zhiwebing/shared'

export async function generateConstitutionAnalysis(
  scores: ConstitutionScores,
  primaryType: ConstitutionType,
  secondaryTypes: ConstitutionType[]
): Promise<string> {
  const primaryInfo = CONSTITUTION_INFO[primaryType]

  const scoresSummary = Object.entries(scores)
    .map(([type, score]) => `${CONSTITUTION_INFO[type as ConstitutionType].name}: ${score}分`)
    .join('\n')

  const { text } = await generateText({
    model: defaultModel,
    system: `你是一位资深中医体质学专家，精通《中医体质分类与判定》标准。你的任务是根据患者的体质评估结果，提供专业但通俗易懂的体质分析报告。

注意事项：
1. 使用温和、关怀的语气
2. 不做任何疾病诊断
3. 建议均基于中医养生理论
4. 如存在兼夹体质，需说明其交互影响
5. 回复控制在500字以内`,
    prompt: `请根据以下体质评估结果，生成个性化的中医体质分析报告：

【体质评分】（转化分，0-100分）
${scoresSummary}

【判定结果】
主体质：${primaryInfo.name}
${secondaryTypes.length > 0 ? `兼夹体质：${secondaryTypes.map(t => CONSTITUTION_INFO[t].name).join('、')}` : '无明显兼夹体质'}

请从以下四个方面进行分析：
1. 【体质综合分析】简要描述该体质的核心特征和当前状态
2. 【健康风险提示】该体质容易出现的健康问题
3. 【调理方向】中医理论指导下的体质调理总体方向
4. 【生活建议】日常生活中最需要注意的2-3个要点`,
  })

  return text
}
