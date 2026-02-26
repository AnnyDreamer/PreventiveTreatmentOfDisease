import { NextRequest } from 'next/server'
import { prisma } from '@zhiwebing/db'
import { verifyToken } from '@/lib/auth'
import { successResponse, errorResponse, unauthorizedResponse, notFoundResponse } from '@/lib/api-response'
import { generateHealthPlan } from '@/lib/ai/prompts/health-plan-generation'
import type { ConstitutionType } from '@zhiwebing/shared'

// POST /api/plan - 基于最新评估生成养生方案
export async function POST(request: NextRequest) {
  try {
    const token = request.headers.get('Authorization')?.replace('Bearer ', '')
    if (!token) return unauthorizedResponse()

    const payload = await verifyToken(token)
    if (!payload) return unauthorizedResponse()

    // 1. 读取用户最新的 ConstitutionAssessment
    const latestAssessment = await prisma.constitutionAssessment.findFirst({
      where: { userId: payload.userId },
      orderBy: { createdAt: 'desc' },
    })

    if (!latestAssessment) {
      return errorResponse('请先完成体质评估', 400)
    }

    // 检查是否已经为该评估生成过方案
    const existingPlan = await prisma.healthPlan.findUnique({
      where: { assessmentId: latestAssessment.id },
    })

    if (existingPlan) {
      return errorResponse('该评估已生成过养生方案', 400)
    }

    // 2. 调用 AI 生成养生方案
    const planResult = await generateHealthPlan(
      latestAssessment.primaryType as ConstitutionType,
      (latestAssessment.secondaryTypes as ConstitutionType[]) || [],
    )

    // 3. 将之前的方案 isActive 设为 false
    await prisma.healthPlan.updateMany({
      where: { userId: payload.userId, isActive: true },
      data: { isActive: false },
    })

    // 4. 创建 HealthPlan 记录
    const healthPlan = await prisma.healthPlan.create({
      data: {
        userId: payload.userId,
        assessmentId: latestAssessment.id,
        dietAdvice: planResult.dietAdvice as any,
        exerciseAdvice: planResult.exerciseAdvice as any,
        lifestyleAdvice: planResult.lifestyleAdvice as any,
        emotionAdvice: planResult.emotionAdvice as any,
        acupointAdvice: planResult.acupointAdvice as any,
        isActive: true,
      },
      include: {
        assessment: true,
      },
    })

    return successResponse(healthPlan)
  } catch (error) {
    console.error('Generate health plan error:', error)
    return errorResponse('生成养生方案失败', 500)
  }
}

// GET /api/plan - 获取当前激活的养生方案
export async function GET(request: NextRequest) {
  try {
    const token = request.headers.get('Authorization')?.replace('Bearer ', '')
    if (!token) return unauthorizedResponse()

    const payload = await verifyToken(token)
    if (!payload) return unauthorizedResponse()

    const plan = await prisma.healthPlan.findFirst({
      where: {
        userId: payload.userId,
        isActive: true,
      },
      orderBy: { createdAt: 'desc' },
      include: {
        assessment: true,
      },
    })

    if (!plan) {
      return notFoundResponse('养生方案')
    }

    return successResponse(plan)
  } catch (error) {
    console.error('Get health plan error:', error)
    return errorResponse('获取养生方案失败', 500)
  }
}
