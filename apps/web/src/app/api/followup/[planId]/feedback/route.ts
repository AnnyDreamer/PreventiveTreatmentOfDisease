import { NextRequest } from 'next/server'
import { prisma, Prisma } from '@zhiwebing/db'
import { verifyToken } from '@/lib/auth'
import { successResponse, errorResponse, unauthorizedResponse, notFoundResponse } from '@/lib/api-response'
import { generateFollowupSummary } from '@/lib/ai/prompts/followup-analysis'
import { z } from 'zod'

const feedbackSchema = z.object({
  recordId: z.string().min(1, '记录ID不能为空'),
  feedback: z.record(z.unknown()),
})

// POST /api/followup/[planId]/feedback - 患者提交随访反馈
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ planId: string }> }
) {
  try {
    const token = request.headers.get('Authorization')?.replace('Bearer ', '')
    if (!token) return unauthorizedResponse()

    const payload = await verifyToken(token)
    if (!payload) return unauthorizedResponse()

    const { planId } = await params

    // 验证患者身份和计划归属
    const patientProfile = await prisma.patientProfile.findUnique({
      where: { userId: payload.userId },
    })

    if (!patientProfile) {
      return errorResponse('仅患者可提交随访反馈', 403)
    }

    const plan = await prisma.followupPlan.findFirst({
      where: {
        id: planId,
        patientId: patientProfile.id,
      },
    })

    if (!plan) {
      return notFoundResponse('随访计划')
    }

    const body = await request.json()
    const parsed = feedbackSchema.safeParse(body)

    if (!parsed.success) {
      return errorResponse(parsed.error.errors[0].message)
    }

    const { recordId, feedback } = parsed.data

    // 验证记录属于该计划
    const record = await prisma.followupRecord.findFirst({
      where: {
        id: recordId,
        planId,
      },
    })

    if (!record) {
      return notFoundResponse('随访记录')
    }

    if (record.status === 'COMPLETED') {
      return errorResponse('该随访记录已完成')
    }

    // 1. 更新 FollowupRecord 的 feedback 和 status
    let updatedRecord = await prisma.followupRecord.update({
      where: { id: recordId },
      data: {
        feedback: feedback as unknown as Prisma.InputJsonValue,
        status: 'COMPLETED',
        completedDate: new Date(),
      },
    })

    // 2. 调用 AI 生成摘要
    try {
      const patientContext = {
        primaryType: patientProfile.primaryConstitution || undefined,
        recentSymptoms: [] as string[],
      }

      // 获取最近的日记症状
      const recentDiary = await prisma.diaryEntry.findMany({
        where: {
          userId: payload.userId,
          date: { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
        },
        orderBy: { date: 'desc' },
        take: 7,
      })

      for (const entry of recentDiary) {
        const symptoms = entry.symptoms as string[] | null
        if (symptoms && Array.isArray(symptoms)) {
          patientContext.recentSymptoms.push(...symptoms)
        }
      }
      patientContext.recentSymptoms = [...new Set(patientContext.recentSymptoms)]

      const summaryResult = await generateFollowupSummary(
        feedback as any,
        patientContext as any
      )

      // 3. 更新 aiSummary 和 riskFlag
      updatedRecord = await prisma.followupRecord.update({
        where: { id: recordId },
        data: {
          aiSummary: summaryResult.summary,
          riskFlag: summaryResult.riskFlag,
          riskNote: summaryResult.riskNote,
        },
      })
    } catch (e) {
      console.error('AI followup summary failed, continuing without it:', e)
    }

    return successResponse(updatedRecord)
  } catch (error) {
    console.error('Submit followup feedback error:', error)
    return errorResponse('提交随访反馈失败', 500)
  }
}
