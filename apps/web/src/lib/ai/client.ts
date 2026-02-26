import { createOpenAICompatible } from '@ai-sdk/openai-compatible'

// 通义千问兼容 OpenAI 接口
export const qwen = createOpenAICompatible({
  name: 'dashscope',
  baseURL: 'https://dashscope.aliyuncs.com/compatible-mode/v1',
  apiKey: process.env.DASHSCOPE_API_KEY || '',
})

// 默认模型
export const defaultModel = qwen('qwen-plus')

// 长文本模型
export const longModel = qwen('qwen-long')
