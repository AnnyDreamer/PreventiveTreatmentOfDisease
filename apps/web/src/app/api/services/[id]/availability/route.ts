import { NextRequest } from 'next/server'
import { prisma, AppointmentStatus } from '@zhiwebing/db'
import { successResponse, errorResponse } from '@/lib/api-response'

// GET /api/services/[id]/availability?date=YYYY-MM-DD — 查询可用时间槽（无需鉴权）
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params
    const { searchParams } = request.nextUrl
    const date = searchParams.get('date')

    if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      return errorResponse('请提供有效的日期参数，格式为 YYYY-MM-DD')
    }

    // 计算星期几：JS getDay() 返回 0=周日,1=周一,...,6=周六
    // 映射为：1=周一,...,6=周六,7=周日
    const jsDay = new Date(date).getDay()
    const dayOfWeek = jsDay === 0 ? 7 : jsDay

    // 查询该服务所有 isActive 的排班，并 include 医生信息
    const schedules = await prisma.serviceSchedule.findMany({
      where: { serviceId: id, isActive: true },
      include: {
        doctor: {
          select: {
            id: true,
            title: true,
            user: { select: { name: true } },
          },
        },
      },
    })

    // 过滤包含该星期的排班
    const matchedSchedules = schedules.filter((s) => {
      const days = s.dayOfWeek as number[]
      return Array.isArray(days) && days.includes(dayOfWeek)
    })

    if (matchedSchedules.length === 0) {
      return successResponse({ date, items: [] })
    }

    // 查询当天该服务已有的 PENDING/CONFIRMED 预约
    const dayStart = new Date(date)
    const dayEnd = new Date(date)
    dayEnd.setDate(dayEnd.getDate() + 1)

    const existingAppointments = await prisma.serviceAppointment.findMany({
      where: {
        serviceId: id,
        scheduledDate: { gte: dayStart, lt: dayEnd },
        status: { in: [AppointmentStatus.PENDING, AppointmentStatus.CONFIRMED] },
      },
      select: { doctorId: true, scheduledTime: true },
    })

    // 构建已占用的 Set，key = "doctorId|time"
    const occupiedSet = new Set(
      existingAppointments
        .filter((a) => a.doctorId !== null)
        .map((a) => `${a.doctorId}|${a.scheduledTime}`),
    )

    // 时间字符串转分钟数
    function timeToMinutes(t: string): number {
      const [h, m] = t.split(':').map(Number)
      return h * 60 + m
    }

    // 分钟数转 "HH:MM"
    function minutesToTime(mins: number): string {
      const h = Math.floor(mins / 60)
      const m = mins % 60
      return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`
    }

    // 为每个排班生成时间槽
    const items: {
      doctorId: string
      doctorName: string
      doctorTitle: string
      time: string
      available: boolean
    }[] = []

    for (const schedule of matchedSchedules) {
      const startMins = timeToMinutes(schedule.startTime)
      const endMins = timeToMinutes(schedule.endTime)
      const duration = schedule.slotDuration

      for (let t = startMins; t + duration <= endMins; t += duration) {
        const time = minutesToTime(t)
        const key = `${schedule.doctorId}|${time}`
        items.push({
          doctorId: schedule.doctorId,
          doctorName: schedule.doctor.user.name ?? '未知医生',
          doctorTitle: schedule.doctor.title ?? '',
          time,
          available: !occupiedSet.has(key),
        })
      }
    }

    return successResponse({ date, items })
  } catch (error) {
    console.error('Get availability error:', error)
    return errorResponse('查询可用时间槽失败', 500)
  }
}
