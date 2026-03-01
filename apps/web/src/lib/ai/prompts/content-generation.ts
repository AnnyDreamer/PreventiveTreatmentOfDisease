import { generateObject } from 'ai'
import { z } from 'zod'
import { defaultModel } from '../client'
import { CONSTITUTION_INFO, SOLAR_TERM_INFO } from '@zhiwebing/shared'
import type { ConstitutionType } from '@zhiwebing/shared'

// Type for solar term keys
type SolarTermKey = keyof typeof SOLAR_TERM_INFO

interface ContentGenerationParams {
  contentType: string // one of ContentType enum values
  solarTermKey?: string
  targetConstitutions?: ConstitutionType[]
  topic?: string
  style?: 'professional' | 'popular' | 'storytelling'
  wordCount?: number
}

const contentSchema = z.object({
  title: z.string().describe('文章标题，吸引读者，20字以内'),
  summary: z.string().describe('文章摘要，100字以内'),
  body: z.string().describe('正文内容，使用Markdown格式，包含小标题、段落、列表等结构'),
  suggestedConstitutions: z.array(z.string()).describe('建议关联的体质类型'),
  suggestedSolarTermKey: z.string().nullable().describe('建议关联的节气key，不相关则为null'),
})

export async function generateHealthContent(params: ContentGenerationParams) {
  const { contentType, solarTermKey, targetConstitutions, topic, style = 'popular', wordCount = 800 } = params

  // Build solar term context
  let solarTermContext = ''
  if (solarTermKey && SOLAR_TERM_INFO[solarTermKey as SolarTermKey]) {
    const st = SOLAR_TERM_INFO[solarTermKey as SolarTermKey]
    solarTermContext = `\n【节气背景】\n节气：${st.name}（${st.season}）\n自然特点：${st.nature}\n养生重点：${st.wellnessFocus}\n推荐饮食：${st.diet.join('、')}\n忌口：${st.avoid.join('、')}\n推荐运动：${st.exercise.join('、')}\n注意事项：${st.precautions.join('、')}`
  }

  // Build constitution context
  let constitutionContext = ''
  if (targetConstitutions && targetConstitutions.length > 0) {
    const parts = targetConstitutions.map(ct => {
      const info = CONSTITUTION_INFO[ct]
      return info ? `- ${info.name}：${info.description}` : ''
    }).filter(Boolean)
    constitutionContext = `\n【目标体质】\n${parts.join('\n')}`
  }

  // Content type label
  const typeLabels: Record<string, string> = {
    SOLAR_TERM: '节气养生',
    CONSTITUTION_GUIDE: '体质调养指南',
    DIET_THERAPY: '食疗药膳',
    EXERCISE_GUIDE: '运动指导',
    KNOWLEDGE: '健康常识科普',
  }

  const styleLabels: Record<string, string> = {
    professional: '专业严谨，适合医学从业者阅读',
    popular: '通俗易懂，适合普通大众阅读',
    storytelling: '故事叙述，引人入胜，寓教于乐',
  }

  const topicInstruction = topic ? `\n围绕主题：${topic}` : ''

  const { object } = await generateObject({
    model: defaultModel,
    schema: contentSchema,
    system: `你是一位资深中医养生内容编辑，擅长撰写高质量的中医健康科普文章。你的文章需要做到：
1. 内容准确，符合中医理论
2. 结构清晰，层次分明
3. 实用性强，读者可以直接参照执行
4. 语言风格：${styleLabels[style] || styleLabels.popular}`,
    prompt: `请撰写一篇${typeLabels[contentType] || '健康科普'}类文章，目标字数约${wordCount}字。${topicInstruction}${solarTermContext}${constitutionContext}

要求：
1. 标题精炼吸引人
2. 正文使用Markdown格式，包含## 小标题、有序/无序列表、**加粗**重点
3. 内容要结合中医理论（如阴阳五行、经络穴位、药食同源等）
4. 提供具体可操作的建议（食谱、穴位按摩手法、运动方法等）
5. 在suggestedConstitutions中推荐最相关的体质类型（使用英文枚举值如QI_DEFICIENCY）
6. 如果内容与某个节气相关，在suggestedSolarTermKey中填写节气key（如LICHUN、YUSHUI等）`,
  })

  return object
}
