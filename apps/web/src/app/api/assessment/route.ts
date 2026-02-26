import { NextRequest } from 'next/server'
import { prisma, Prisma } from '@zhiwebing/db'
import { verifyToken } from '@/lib/auth'
import { successResponse, errorResponse, unauthorizedResponse } from '@/lib/api-response'
import { calculateConstitutionScores, determineConstitutionTypes } from '@zhiwebing/shared'
import { generateConstitutionAnalysis } from '@/lib/ai/prompts/constitution-assessment'
import { z } from 'zod'

const assessmentSchema = z.object({
  answers: z.record(z.string(), z.number().min(1).max(5)),
})

// POST /api/assessment - 提交体质评估
export async function POST(request: NextRequest) {
  try {
    const token = request.headers.get('Authorization')?.replace('Bearer ', '')
    if (!token) return unauthorizedResponse()

    const payload = await verifyToken(token)
    if (!payload) return unauthorizedResponse()

    const body = await request.json()
    const parsed = assessmentSchema.safeParse(body)

    if (!parsed.success) {
      return errorResponse('问卷数据格式不正确')
    }

    const { answers } = parsed.data

    // 1. 标准化评分计算
    const scores = calculateConstitutionScores(answers)
    const { primaryType, secondaryTypes } = determineConstitutionTypes(scores)

    // 2. AI增强分析（异步，不阻塞返回）
    let aiAnalysis: string | undefined
    try {
      aiAnalysis = await generateConstitutionAnalysis(scores, primaryType, secondaryTypes)
    } catch (e) {
      console.error('AI analysis failed, continuing without it:', e)
    }

    // 3. 保存评估结果
    const assessment = await prisma.constitutionAssessment.create({
      data: {
        userId: payload.userId,
        answers: answers as unknown as Prisma.InputJsonValue,
        scores: scores as unknown as Prisma.InputJsonValue,
        primaryType,
        secondaryTypes: secondaryTypes as unknown as Prisma.InputJsonValue,
        aiAnalysis,
      },
    })

    // 4. 更新患者档案的体质信息
    await prisma.patientProfile.updateMany({
      where: { userId: payload.userId },
      data: { primaryConstitution: primaryType },
    })

    return successResponse({
      id: assessment.id,
      scores,
      primaryType,
      secondaryTypes,
      aiAnalysis,
    })
  } catch (error) {
    console.error('Assessment error:', error)
    return errorResponse('评估提交失败', 500)
  }
}

// GET /api/assessment - 获取评估历史
export async function GET(request: NextRequest) {
  try {
    const token = request.headers.get('Authorization')?.replace('Bearer ', '')
    if (!token) return unauthorizedResponse()

    const payload = await verifyToken(token)
    if (!payload) return unauthorizedResponse()

    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId') || payload.userId
    const limit = parseInt(searchParams.get('limit') || '10')

    const assessments = await prisma.constitutionAssessment.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: limit,
      include: {
        healthPlan: true,
      },
    })

    return successResponse(assessments)
  } catch (error) {
    console.error('Get assessments error:', error)
    return errorResponse('获取评估记录失败', 500)
  }
}
