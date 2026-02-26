import { generateObject } from 'ai'
import { z } from 'zod'
import { defaultModel } from '../client'
import type { ConstitutionType, FollowupFeedback } from '@zhiwebing/shared'
import { CONSTITUTION_INFO } from '@zhiwebing/shared'

interface PatientContext {
  constitutionType: ConstitutionType
  secondaryTypes?: ConstitutionType[]
  previousFollowupCount?: number
  healthPlanStartDate?: string
  recentDiarySummary?: string
}

const followupSummarySchema = z.object({
  summary: z.string().describe('随访摘要，200字以内'),
  progressAssessment: z.string().describe('体质调理进展评估'),
  riskFlag: z.boolean().describe('是否存在需要关注的风险信号'),
  riskNote: z.string().optional().describe('风险信号说明，仅在riskFlag为true时提供'),
  suggestions: z.array(z.string()).describe('后续调理建议，3-5条'),
  nextFollowupRecommendation: z.string().describe('复诊建议，包含建议时间和关注重点'),
})

type FollowupSummaryResult = z.infer<typeof followupSummarySchema>

export async function generateFollowupSummary(
  feedbackData: FollowupFeedback,
  patientContext: PatientContext
): Promise<FollowupSummaryResult> {
  const constitutionInfo = CONSTITUTION_INFO[patientContext.constitutionType]
  const secondaryNames = patientContext.secondaryTypes
    ?.map(t => CONSTITUTION_INFO[t].name)
    .join('、')

  const feedbackSummary = `
整体感觉评分：${feedbackData.overallFeeling}/5
饮食依从性：${feedbackData.dietCompliance}/5
运动依从性：${feedbackData.exerciseCompliance}/5
睡眠质量：${feedbackData.sleepQuality}/5
${feedbackData.symptoms.length > 0 ? `当前症状：${feedbackData.symptoms.join('、')}` : '无明显不适症状'}
${feedbackData.note ? `患者备注：${feedbackData.note}` : ''}`

  const { object } = await generateObject({
    model: defaultModel,
    schema: followupSummarySchema,
    system: `你是一位经验丰富的中医体质管理医师，负责对患者的随访反馈进行专业分析。

你的任务：
1. 根据随访反馈数据，评估患者的体质调理进展
2. 识别潜在的健康风险信号
3. 给出针对性的调理建议和复诊建议

分析原则：
- 结合患者体质类型进行个性化分析
- 关注各项指标的变化趋势
- 低于3分的指标需重点关注
- 出现新症状或症状加重应标记风险
- 建议要具体、可执行
- 不做疾病诊断，专注于体质调理指导`,
    prompt: `请分析以下随访反馈数据：

【患者体质信息】
主体质：${constitutionInfo.name}
${secondaryNames ? `兼夹体质：${secondaryNames}` : ''}
${patientContext.previousFollowupCount !== undefined ? `已完成随访次数：${patientContext.previousFollowupCount}次` : ''}
${patientContext.healthPlanStartDate ? `养生方案开始日期：${patientContext.healthPlanStartDate}` : ''}

【随访反馈数据】
${feedbackSummary}

${patientContext.recentDiarySummary ? `【近期健康日记摘要】\n${patientContext.recentDiarySummary}` : ''}

请综合以上信息进行分析，生成随访摘要报告。需特别注意：
- 评分低于3分的项目需重点分析原因和改进建议
- 如果有新出现的症状，需评估是否与体质调理相关
- 复诊建议需明确时间和关注重点`,
  })

  return object
}
