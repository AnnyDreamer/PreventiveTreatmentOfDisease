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

    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      select: { hospitalId: true, doctorProfile: { select: { id: true } } },
    })

    if (!user?.hospitalId) {
      return errorResponse('用户未关联医院', 403)
    }

    const body = await request.json()
    const parsed = createAppointmentSchema.safeParse(body)
    if (!parsed.success) {
      return errorResponse(parsed.error.errors[0].message)
    }

    const { serviceId, patientId, doctorId, scheduledDate, scheduledTime, note } = parsed.data

    // 验证 service 属于同一医院
    const service = await prisma.wellnessService.findFirst({
      where: { id: serviceId, hospitalId: user.hospitalId },
    })
    if (!service) {
      return errorResponse('服务不存在或不属于本院', 404)
    }

    // 验证 patient 属于同一医院
    const patient = await prisma.patientProfile.findFirst({
      where: { id: patientId, user: { hospitalId: user.hospitalId } },
    })
    if (!patient) {
      return errorResponse('患者不存在或不属于本院', 404)
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
