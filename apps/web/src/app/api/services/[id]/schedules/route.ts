import { NextRequest } from 'next/server'
import { prisma } from '@zhiwebing/db'
import { verifyToken } from '@/lib/auth'
import { successResponse, errorResponse, unauthorizedResponse, notFoundResponse } from '@/lib/api-response'
import { z } from 'zod'

const createScheduleSchema = z.object({
  doctorId: z.string().min(1, '请选择医生'),
  dayOfWeek: z.array(z.number().int().min(1).max(7)).min(1, '请选择至少一天'),
  startTime: z.string().regex(/^\d{2}:\d{2}$/, '时间格式应为 HH:MM'),
  endTime: z.string().regex(/^\d{2}:\d{2}$/, '时间格式应为 HH:MM'),
  slotDuration: z.number().int().min(15).max(480).default(60),
  note: z.string().optional(),
})

async function getDoctorHospitalId(request: NextRequest) {
  const token = request.headers.get('Authorization')?.replace('Bearer ', '')
  if (!token) return null
  const payload = await verifyToken(token)
  if (!payload) return null
  const user = await prisma.user.findUnique({
    where: { id: payload.userId },
    select: { hospitalId: true, doctorProfile: { select: { id: true } } },
  })
  if (!user?.doctorProfile) return null
  return user.hospitalId
}

// GET /api/services/[id]/schedules — 获取排班列表
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params

    const schedules = await prisma.serviceSchedule.findMany({
      where: { serviceId: id, isActive: true },
      include: {
        doctor: {
          include: {
            user: { select: { name: true } },
          },
        },
      },
      orderBy: { createdAt: 'asc' },
    })

    return successResponse(schedules)
  } catch (error) {
    console.error('Get schedules error:', error)
    return errorResponse('获取排班列表失败', 500)
  }
}

// POST /api/services/[id]/schedules — 创建排班（需鉴权）
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
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
      return errorResponse('仅医生可创建排班', 403)
    }

    const { id } = await params

    // 验证服务存在且属于同一医院
    const service = await prisma.wellnessService.findUnique({ where: { id } })
    if (!service) return notFoundResponse('康养服务')
    if (service.hospitalId !== user.hospitalId) {
      return errorResponse('无权为其他医院的服务创建排班', 403)
    }

    const body = await request.json()
    const parsed = createScheduleSchema.safeParse(body)
    if (!parsed.success) {
      return errorResponse(parsed.error.errors[0].message)
    }

    // 验证医生属于同一医院
    const doctor = await prisma.doctorProfile.findUnique({
      where: { id: parsed.data.doctorId },
      include: { user: { select: { hospitalId: true } } },
    })
    if (!doctor) return notFoundResponse('医生')
    if (doctor.user.hospitalId !== user.hospitalId) {
      return errorResponse('所选医生不属于本医院', 403)
    }

    const schedule = await prisma.serviceSchedule.create({
      data: {
        serviceId: id,
        doctorId: parsed.data.doctorId,
        dayOfWeek: parsed.data.dayOfWeek,
        startTime: parsed.data.startTime,
        endTime: parsed.data.endTime,
        slotDuration: parsed.data.slotDuration,
        note: parsed.data.note,
      },
      include: {
        doctor: {
          include: {
            user: { select: { name: true } },
          },
        },
      },
    })

    return successResponse(schedule, '排班创建成功')
  } catch (error) {
    console.error('Create schedule error:', error)
    return errorResponse('创建排班失败', 500)
  }
}
