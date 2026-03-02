import { NextRequest } from 'next/server'
import { prisma, AppointmentStatus } from '@zhiwebing/db'
import { verifyToken } from '@/lib/auth'
import {
  successResponse,
  errorResponse,
  unauthorizedResponse,
  notFoundResponse,
} from '@/lib/api-response'
import { z } from 'zod'

const updateAppointmentSchema = z.object({
  status: z.nativeEnum(AppointmentStatus),
  completionNote: z.string().optional(),
  cancelReason: z.string().optional(),
})

// PATCH /api/appointments/[id] — 更新状态
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const token = request.headers.get('Authorization')?.replace('Bearer ', '')
    if (!token) return unauthorizedResponse()

    const payload = await verifyToken(token)
    if (!payload) return unauthorizedResponse()

    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      select: { hospitalId: true },
    })

    if (!user?.hospitalId) {
      return errorResponse('用户未关联医院', 403)
    }

    const { id } = await params

    const existing = await prisma.serviceAppointment.findFirst({
      where: { id, service: { hospitalId: user.hospitalId } },
    })

    if (!existing) {
      return notFoundResponse('预约')
    }

    const body = await request.json()
    const parsed = updateAppointmentSchema.safeParse(body)
    if (!parsed.success) {
      return errorResponse(parsed.error.errors[0].message)
    }

    const { status, completionNote, cancelReason } = parsed.data

    const updated = await prisma.serviceAppointment.update({
      where: { id },
      data: {
        status,
        completionNote: completionNote ?? existing.completionNote,
        cancelReason: cancelReason ?? existing.cancelReason,
      },
      include: {
        service: { select: { id: true, name: true, category: true } },
        patient: { select: { id: true, user: { select: { name: true } } } },
        doctor: { select: { id: true, title: true, user: { select: { name: true } } } },
      },
    })

    return successResponse(updated, '预约状态更新成功')
  } catch (error) {
    console.error('Update appointment error:', error)
    return errorResponse('更新预约失败', 500)
  }
}

// DELETE /api/appointments/[id] — 删除预约（仅 PENDING 状态）
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const token = request.headers.get('Authorization')?.replace('Bearer ', '')
    if (!token) return unauthorizedResponse()

    const payload = await verifyToken(token)
    if (!payload) return unauthorizedResponse()

    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      select: { hospitalId: true },
    })

    if (!user?.hospitalId) {
      return errorResponse('用户未关联医院', 403)
    }

    const { id } = await params

    const existing = await prisma.serviceAppointment.findFirst({
      where: { id, service: { hospitalId: user.hospitalId } },
    })

    if (!existing) {
      return notFoundResponse('预约')
    }

    if (existing.status !== AppointmentStatus.PENDING) {
      return errorResponse('仅待确认状态的预约可以删除', 400)
    }

    await prisma.serviceAppointment.delete({ where: { id } })

    return successResponse(null, '预约删除成功')
  } catch (error) {
    console.error('Delete appointment error:', error)
    return errorResponse('删除预约失败', 500)
  }
}
