import { NextRequest } from 'next/server'
import { prisma } from '@zhiwebing/db'
import { verifyToken } from '@/lib/auth'
import { successResponse, errorResponse, unauthorizedResponse } from '@/lib/api-response'

// GET /api/patients - 获取患者列表（医生端）
export async function GET(request: NextRequest) {
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
      return errorResponse('仅医生可查看患者列表', 403)
    }

    const { searchParams } = new URL(request.url)
    const search = searchParams.get('search')
    const constitutionType = searchParams.get('constitutionType')
    const riskLevel = searchParams.get('riskLevel')
    const page = parseInt(searchParams.get('page') || '1')
    const pageSize = parseInt(searchParams.get('pageSize') || '20')

    // 构建查询条件
    const where: Record<string, unknown> = {}

    if (search) {
      where.user = {
        OR: [
          { name: { contains: search, mode: 'insensitive' } },
          { phone: { contains: search } },
        ],
      }
    }

    if (constitutionType) {
      where.primaryConstitution = constitutionType
    }

    if (riskLevel) {
      where.riskLevel = riskLevel
    }

    const [patients, total] = await Promise.all([
      prisma.patientProfile.findMany({
        where,
        orderBy: [
          { riskLevel: 'desc' },
          { lastVisitDate: 'desc' },
        ],
        skip: (page - 1) * pageSize,
        take: pageSize,
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
      }),
      prisma.patientProfile.count({ where }),
    ])

    // 获取每个患者的最新体质评估
    const patientUserIds = patients.map(p => p.userId)
    const latestAssessments = await prisma.constitutionAssessment.findMany({
      where: { userId: { in: patientUserIds } },
      orderBy: { createdAt: 'desc' },
      distinct: ['userId'],
    })

    const assessmentMap = new Map(
      latestAssessments.map(a => [a.userId, a])
    )

    // 计算活跃度标记（最近7天有日记记录的为活跃）
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
    const activeDiary = await prisma.diaryEntry.findMany({
      where: {
        userId: { in: patientUserIds },
        date: { gte: sevenDaysAgo },
      },
      distinct: ['userId'],
      select: { userId: true },
    })

    const activeUserIds = new Set(activeDiary.map(d => d.userId))

    const result = patients.map(patient => ({
      ...patient,
      latestAssessment: assessmentMap.get(patient.userId) || null,
      isActive: activeUserIds.has(patient.userId),
    }))

    return successResponse({
      items: result,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    })
  } catch (error) {
    console.error('Get patients error:', error)
    return errorResponse('获取患者列表失败', 500)
  }
}
