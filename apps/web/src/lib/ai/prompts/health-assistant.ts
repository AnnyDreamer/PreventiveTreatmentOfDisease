import { generateText } from 'ai'
import { defaultModel } from '../client'
import type { ConstitutionType, ChatMessageData } from '@zhiwebing/shared'
import { CONSTITUTION_INFO, EMERGENCY_RESPONSE, containsEmergencyKeyword } from '@zhiwebing/shared'

interface HealthAssistantContext {
  constitutionType?: ConstitutionType
  secondaryTypes?: ConstitutionType[]
  recentDiarySummary?: string
  healthPlanSummary?: string
}

export function buildHealthAssistantMessages(
  userMessage: string,
  context: HealthAssistantContext
): ChatMessageData[] {
  const constitutionContext = context.constitutionType
    ? `该用户的中医体质辨识结果为：主体质 - ${CONSTITUTION_INFO[context.constitutionType].name}。${
        context.secondaryTypes?.length
          ? `兼夹体质：${context.secondaryTypes.map(t => CONSTITUTION_INFO[t].name).join('、')}。`
          : ''
      }`
    : '该用户尚未完成体质辨识。'

  const diaryContext = context.recentDiarySummary
    ? `\n\n【近期健康日记摘要】\n${context.recentDiarySummary}`
    : ''

  const planContext = context.healthPlanSummary
    ? `\n\n【当前养生方案摘要】\n${context.healthPlanSummary}`
    : ''

  const systemPrompt = `你是"智微"中医养生AI助手，基于中医体质学理论为用户提供个性化的养生指导和健康咨询。

【角色设定】
- 你是一位温和、专业的中医养生顾问
- 你熟悉《中医体质分类与判定》标准和九种体质的调理方法
- 你善于用通俗易懂的语言解释中医养生知识

【能力边界】
- 你可以：提供中医养生建议、解答体质相关问题、给出饮食/运动/起居建议、介绍穴位保健方法
- 你不可以：做疾病诊断、开具处方、替代医生的专业诊疗
- 当用户问及疾病诊治时，应温和地引导其就医

【用户上下文】
${constitutionContext}${diaryContext}${planContext}

【安全规则】
- 如果检测到用户描述紧急症状（如胸痛、呼吸困难、大出血、昏迷、中风症状等），必须立即停止养生建议，优先引导用户拨打120或前往急诊
- 不提供任何可能有害的建议
- 遇到超出能力范围的问题，诚实告知并建议就医

【回复要求】
- 语气温和亲切，像一位关心你的中医朋友
- 回复简洁实用，控制在300字以内
- 适当引用中医经典理论，但要通俗解释
- 给出的建议要具体可操作`

  const messages: ChatMessageData[] = [
    {
      role: 'system',
      content: systemPrompt,
    },
    {
      role: 'user',
      content: userMessage,
    },
  ]

  return messages
}

export async function generateHealthAssistantResponse(
  userMessage: string,
  context: HealthAssistantContext,
  history?: Array<{ role: string; content: string }>
): Promise<string> {
  // 优先检查紧急关键词
  if (containsEmergencyKeyword(userMessage)) {
    return EMERGENCY_RESPONSE
  }

  const messages = buildHealthAssistantMessages(userMessage, context)

  // 如果有对话历史，在 system 和 user 消息之间插入
  const allMessages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }> = []
  allMessages.push({ role: 'system', content: messages[0].content })
  if (history) {
    for (const msg of history) {
      allMessages.push({ role: msg.role as 'user' | 'assistant', content: msg.content })
    }
  }
  allMessages.push({ role: 'user', content: userMessage })

  const { text } = await generateText({
    model: defaultModel,
    messages: allMessages,
  })

  return text
}
