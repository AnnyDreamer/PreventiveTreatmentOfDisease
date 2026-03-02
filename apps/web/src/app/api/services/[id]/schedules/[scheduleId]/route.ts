import { NextRequest } from 'next/server'
import { prisma } from '@zhiwebing/db'
import { verifyToken } from '@/lib/auth'
import { successResponse, errorResponse, unauthorizedResponse, notFoundResponse } from '@/lib/api-response'

// DELETE /api/services/[id]/schedules/[scheduleId] — 删除排班（需鉴权）
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; scheduleId: string }> },
) {
  try {
    const token = request.headers.get('Authorization')?.replace('Bearer ', '')
    if (!token) return unauthorizedResponse()

    const payload = await verifyToken(token)
    if (!payload) return unauthorizedResponse()

    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      select: { hospitalId: true, doctorProfile: { select: { id: true } } },
    })

    if (!user?.doctorProfile) {
      return errorResponse('仅医生可删除排班', 403)
    }

    const { id, scheduleId } = await params

    const schedule = await prisma.serviceSchedule.findUnique({
      where: { id: scheduleId },
      include: { service: { select: { hospitalId: true } } },
    })

    if (!schedule) return notFoundResponse('排班')
    if (schedule.serviceId !== id) return notFoundResponse('排班')
    if (schedule.service.hospitalId !== user.hospitalId) {
      return errorResponse('无权删除其他医院的排班', 403)
    }

    await prisma.serviceSchedule.delete({ where: { id: scheduleId } })

    return successResponse(null, '排班已删除')
  } catch (error) {
    console.error('Delete schedule error:', error)
    return errorResponse('删除排班失败', 500)
  }
}
