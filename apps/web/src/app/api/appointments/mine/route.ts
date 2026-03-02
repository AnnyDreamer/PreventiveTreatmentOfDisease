import { NextRequest } from 'next/server'
import { prisma, AppointmentStatus } from '@zhiwebing/db'
import { verifyToken } from '@/lib/auth'
import {
  successResponse,
  errorResponse,
  unauthorizedResponse,
} from '@/lib/api-response'

// GET /api/appointments/mine — 当前患者自己的预约列表（需鉴权）
export async function GET(request: NextRequest) {
  try {
    const token = request.headers.get('Authorization')?.replace('Bearer ', '')
    if (!token) return unauthorizedResponse()

    const payload = await verifyToken(token)
    if (!payload) return unauthorizedResponse()

    // 查找该用户的 patientProfile
    const patientProfile = await prisma.patientProfile.findUnique({
      where: { userId: payload.userId },
      select: { id: true },
    })

    // 没有 patientProfile 则返回空列表
    if (!patientProfile) {
      return successResponse({ items: [], total: 0 })
    }

    const { searchParams } = request.nextUrl
    const statusParam = searchParams.get('status') as AppointmentStatus | null

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const where: Record<string, any> = {
      patientId: patientProfile.id,
    }

    if (statusParam && Object.values(AppointmentStatus).includes(statusParam)) {
      where.status = statusParam
    }

    const items = await prisma.serviceAppointment.findMany({
      where,
      include: {
        service: { select: { id: true, name: true, category: true } },
        doctor: {
          select: {
            id: true,
            title: true,
            user: { select: { name: true } },
          },
        },
      },
      orderBy: { scheduledDate: 'desc' },
      take: 20,
    })

    return successResponse({ items, total: items.length })
  } catch (error) {
    console.error('Get my appointments error:', error)
    return errorResponse('获取我的预约列表失败', 500)
  }
}
