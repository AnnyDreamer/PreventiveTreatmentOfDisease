import { NextRequest } from 'next/server'
import { prisma, AppointmentStatus } from '@zhiwebing/db'
import { verifyToken } from '@/lib/auth'
import {
  successResponse,
  errorResponse,
  unauthorizedResponse,
} from '@/lib/api-response'
import { z } from 'zod'

const createAppointmentSchema = z.object({
  serviceId: z.string().min(1, '服务不能为空'),
  patientId: z.string().min(1, '患者不能为空'),
  doctorId: z.string().optional(),
  scheduledDate: z.string().min(1, '预约日期不能为空'),
  scheduledTime: z.string().regex(/^\d{2}:\d{2}$/, '时间格式应为 HH:MM'),
  note: z.string().optional(),
})

// GET /api/appointments — 预约列表（需鉴权）
export async function GET(request: NextRequest) {
  try {
    const token = request.headers.get('Authorization')?.replace('Bearer ', '')
    if (!token) return unauthorizedResponse()

    const payload = await verifyToken(token)
    if (!payload) return unauthorizedResponse()

    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      select: { hospitalId: true, doctorProfile: { select: { id: true } } },
    })

    if (!user?.hospitalId) {
      return errorResponse('用户未关联医院', 403)
    }

    const { searchParams } = request.nextUrl
    const status = searchParams.get('status') as AppointmentStatus | null
    const serviceId = searchParams.get('serviceId')
    const patientId = searchParams.get('patientId')
    const doctorId = searchParams.get('doctorId')
    const date = searchParams.get('date') // YYYY-MM-DD
    const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10))
    const pageSize = Math.min(50, Math.max(1, parseInt(searchParams.get('pageSize') || '20', 10)))

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const where: Record<string, any> = {
      service: { hospitalId: user.hospitalId },
    }

    if (status && Object.values(AppointmentStatus).includes(status)) {
      where.status = status
    }
    if (serviceId) where.serviceId = serviceId
    if (patientId) where.patientId = patientId
    if (doctorId) where.doctorId = doctorId
    if (date) {
      const start = new Date(date)
      const end = new Date(date)
      end.setDate(end.getDate() + 1)
      where.scheduledDate = { gte: start, lt: end }
    }

    const [items, total] = await Promise.all([
      prisma.serviceAppointment.findMany({
        where,
        include: {
          service: { select: { id: true, name: true, category: true } },
          patient: { select: { id: true, user: { select: { name: true } } } },
          doctor: { select: { id: true, title: true, user: { select: { name: true } } } },
        },
        orderBy: [{ scheduledDate: 'asc' }, { scheduledTime: 'asc' }],
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      prisma.serviceAppointment.count({ where }),
    ])

    return successResponse({ items, total, page, pageSize })
  } catch (error) {
    console.error('Get appointments error:', error)
    return errorResponse('获取预约列表失败', 500)
  }
}

// POST /api/appointments — 创建预约（需鉴权）
export async function POST(request: NextRequest) {
  try {
    const token = request.headers.get('Authorization')?.replace('Bearer ', '')
    if (!token) return unauthorizedResponse()

    const payload = await verifyToken(token)
    if (!payload) return unauthorizedResponse()

    const body = await request.json()
    const parsed = createAppointmentSchema.safeParse(body)
    if (!parsed.success) {
      return errorResponse(parsed.error.errors[0].message)
    }

    const { serviceId, patientId, doctorId, scheduledDate, scheduledTime, note } = parsed.data

    // 通过 serviceId 查询服务，获取 hospitalId（不再要求 user.hospitalId）
    const service = await prisma.wellnessService.findUnique({
      where: { id: serviceId },
      select: { id: true, name: true, category: true, hospitalId: true, isActive: true },
    })
    if (!service) {
      return errorResponse('服务不存在', 404)
    }
    if (!service.isActive) {
      return errorResponse('该服务当前不可预约', 400)
    }

    // 验证 patient 存在即可（不强制同医院，小程序患者可能跨院预约）
    const patient = await prisma.patientProfile.findUnique({
      where: { id: patientId },
    })
    if (!patient) {
      return errorResponse('患者不存在', 404)
    }

    // 冲突检查：同医生+同日期+同时间 已有 PENDING/CONFIRMED 预约则拒绝
    if (doctorId) {
      const start = new Date(scheduledDate)
      const end = new Date(scheduledDate)
      end.setDate(end.getDate() + 1)
      const conflict = await prisma.serviceAppointment.findFirst({
        where: {
          doctorId,
          scheduledTime,
          scheduledDate: { gte: start, lt: end },
          status: { in: [AppointmentStatus.PENDING, AppointmentStatus.CONFIRMED] },
        },
      })
      if (conflict) return errorResponse('该时段已被预约，请选择其他时间', 409)
    }

    const appointment = await prisma.serviceAppointment.create({
      data: {
        serviceId,
        patientId,
        doctorId: doctorId || null,
        scheduledDate: new Date(scheduledDate),
        scheduledTime,
        note: note || null,
        status: AppointmentStatus.PENDING,
      },
      include: {
        service: { select: { id: true, name: true, category: true } },
        patient: { select: { id: true, user: { select: { name: true } } } },
        doctor: { select: { id: true, title: true, user: { select: { name: true } } } },
      },
    })

    return successResponse(appointment, '预约创建成功')
  } catch (error) {
    console.error('Create appointment error:', error)
    return errorResponse('创建预约失败', 500)
  }
}
