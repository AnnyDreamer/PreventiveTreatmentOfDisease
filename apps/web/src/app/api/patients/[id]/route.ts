import { NextRequest } from 'next/server'
import { prisma } from '@zhiwebing/db'
import { verifyToken } from '@/lib/auth'
import { successResponse, errorResponse, unauthorizedResponse, notFoundResponse } from '@/lib/api-response'

// GET /api/patients/[id] - 获取患者详情（医生端）
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const token = request.headers.get('Authorization')?.replace('Bearer ', '')
    if (!token) return unauthorizedResponse()

    const payload = await verifyToken(token)
    if (!payload) return unauthorizedResponse()

    // 验证是医生角色
    const doctor = await prisma.doctorProfile.findUnique({
      where: { userId: payload.userId },
    })

    if (!doctor) {
      return errorResponse('仅医生可查看患者详情', 403)
    }

    const { id } = await params

    // 查询患者档案
    const patientProfile = await prisma.patientProfile.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            phone: true,
            avatar: true,
            createdAt: true,
          },
        },
      },
    })

    if (!patientProfile) {
      return notFoundResponse('患者')
    }

    const patientUserId = patientProfile.userId

    // 并行查询所有关联数据
    const [
      latestAssessment,
      recentDiary,
      recentChatSessions,
      followupPlans,
    ] = await Promise.all([
      // 最新 ConstitutionAssessment（带 healthPlan）
      prisma.constitutionAssessment.findFirst({
        where: { userId: patientUserId },
        orderBy: { createdAt: 'desc' },
        include: {
          healthPlan: true,
        },
      }),

      // 最近30条 DiaryEntry
      prisma.diaryEntry.findMany({
        where: { userId: patientUserId },
        orderBy: { date: 'desc' },
        take: 30,
      }),

      // 最近5条 ChatSession（带最后一条消息）
      prisma.chatSession.findMany({
        where: { userId: patientUserId },
        orderBy: { updatedAt: 'desc' },
        take: 5,
        include: {
          messages: {
            orderBy: { createdAt: 'desc' },
            take: 1,
          },
        },
      }),

      // FollowupPlan 列表（带 records）
      prisma.followupPlan.findMany({
        where: { patientId: patientProfile.id },
        orderBy: { createdAt: 'desc' },
        include: {
          doctor: {
            include: { user: { select: { name: true } } },
          },
          records: {
            orderBy: { scheduledDate: 'desc' },
          },
        },
      }),
    ])

    return successResponse({
      profile: patientProfile,
      latestAssessment,
      recentDiary,
      recentChatSessions: recentChatSessions.map(session => ({
        id: session.id,
        title: session.title,
        createdAt: session.createdAt,
        updatedAt: session.updatedAt,
        lastMessage: session.messages[0] || null,
      })),
      followupPlans,
    })
  } catch (error) {
    console.error('Get patient detail error:', error)
    return errorResponse('获取患者详情失败', 500)
  }
}
