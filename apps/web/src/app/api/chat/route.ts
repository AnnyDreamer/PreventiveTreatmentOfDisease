import { NextRequest } from 'next/server'
import { prisma } from '@zhiwebing/db'
import { verifyToken } from '@/lib/auth'
import { successResponse, errorResponse, unauthorizedResponse } from '@/lib/api-response'
import { generateHealthAssistantResponse } from '@/lib/ai/prompts/health-assistant'
import { z } from 'zod'
import type { ConstitutionType } from '@zhiwebing/shared'

const chatSchema = z.object({
  sessionId: z.string().optional(),
  message: z.string().min(1, '消息不能为空').max(2000, '消息过长'),
})

// POST /api/chat - 发送消息并获取AI回复
export async function POST(request: NextRequest) {
  try {
    const token = request.headers.get('Authorization')?.replace('Bearer ', '')
    if (!token) return unauthorizedResponse()

    const payload = await verifyToken(token)
    if (!payload) return unauthorizedResponse()

    const body = await request.json()
    const parsed = chatSchema.safeParse(body)

    if (!parsed.success) {
      return errorResponse(parsed.error.errors[0].message)
    }

    const { sessionId, message } = parsed.data

    // 1. 获取或创建 ChatSession
    let session
    if (sessionId) {
      session = await prisma.chatSession.findFirst({
        where: { id: sessionId, userId: payload.userId },
      })
      if (!session) {
        return errorResponse('会话不存在', 404)
      }
    } else {
      session = await prisma.chatSession.create({
        data: {
          userId: payload.userId,
          title: message.slice(0, 50),
        },
      })
    }

    // 2. 保存用户消息
    await prisma.chatMessage.create({
      data: {
        sessionId: session.id,
        role: 'user',
        content: message,
      },
    })

    // 3. 构建上下文
    const [latestAssessment, recentDiary, activePlan, chatHistory] = await Promise.all([
      // 最新体质评估
      prisma.constitutionAssessment.findFirst({
        where: { userId: payload.userId },
        orderBy: { createdAt: 'desc' },
      }),
      // 最近7天日记
      prisma.diaryEntry.findMany({
        where: {
          userId: payload.userId,
          date: {
            gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
          },
        },
        orderBy: { date: 'desc' },
      }),
      // 当前养生方案
      prisma.healthPlan.findFirst({
        where: { userId: payload.userId, isActive: true },
        orderBy: { createdAt: 'desc' },
      }),
      // 会话历史消息（最近20条）
      prisma.chatMessage.findMany({
        where: { sessionId: session.id },
        orderBy: { createdAt: 'asc' },
        take: 20,
      }),
    ])

    // 4. 调用 AI 生成回复
    const context = {
      primaryType: latestAssessment?.primaryType,
      secondaryTypes: (latestAssessment?.secondaryTypes as ConstitutionType[]) || [],
      aiAnalysis: latestAssessment?.aiAnalysis,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      recentDiary: recentDiary.map((d: any) => ({
        date: d.date,
        sleepHours: d.sleepHours,
        sleepQuality: d.sleepQuality,
        moodScore: d.moodScore,
        symptoms: d.symptoms,
        note: d.note,
      })),
      healthPlan: activePlan ? {
        dietAdvice: activePlan.dietAdvice,
        exerciseAdvice: activePlan.exerciseAdvice,
        lifestyleAdvice: activePlan.lifestyleAdvice,
        emotionAdvice: activePlan.emotionAdvice,
      } : null,
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const history = chatHistory
      .filter((m: any) => m.role !== 'system')
      .map((m: any) => ({ role: m.role as string, content: m.content as string }))

    const aiReply = await generateHealthAssistantResponse(message, context, history)

    // 5. 保存 AI 回复消息
    const aiMessage = await prisma.chatMessage.create({
      data: {
        sessionId: session.id,
        role: 'assistant',
        content: aiReply,
      },
    })

    // 6. 更新 session 的 updatedAt
    await prisma.chatSession.update({
      where: { id: session.id },
      data: { updatedAt: new Date() },
    })

    return successResponse({
      sessionId: session.id,
      message: {
        id: aiMessage.id,
        role: aiMessage.role,
        content: aiMessage.content,
        createdAt: aiMessage.createdAt,
      },
    })
  } catch (error) {
    console.error('Chat error:', error)
    return errorResponse('发送消息失败', 500)
  }
}

// GET /api/chat - 获取对话列表
export async function GET(request: NextRequest) {
  try {
    const token = request.headers.get('Authorization')?.replace('Bearer ', '')
    if (!token) return unauthorizedResponse()

    const payload = await verifyToken(token)
    if (!payload) return unauthorizedResponse()

    const sessions = await prisma.chatSession.findMany({
      where: { userId: payload.userId },
      orderBy: { updatedAt: 'desc' },
      include: {
        messages: {
          orderBy: { createdAt: 'desc' },
          take: 1,
        },
      },
    })

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const result = sessions.map((session: any) => ({
      id: session.id,
      title: session.title,
      createdAt: session.createdAt,
      updatedAt: session.updatedAt,
      lastMessage: session.messages[0] || null,
    }))

    return successResponse(result)
  } catch (error) {
    console.error('Get chat sessions error:', error)
    return errorResponse('获取对话列表失败', 500)
  }
}
