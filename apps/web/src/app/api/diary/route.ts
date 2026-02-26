import { NextRequest } from 'next/server'
import { prisma } from '@zhiwebing/db'
import { verifyToken } from '@/lib/auth'
import { successResponse, errorResponse, unauthorizedResponse } from '@/lib/api-response'
import { z } from 'zod'

const diarySchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, '日期格式应为 YYYY-MM-DD'),
  sleepHours: z.number().min(0).max(24).optional(),
  sleepQuality: z.number().int().min(1).max(5).optional(),
  moodScore: z.number().int().min(1).max(5).optional(),
  exerciseMinutes: z.number().int().min(0).optional(),
  exerciseType: z.string().optional(),
  dietNote: z.string().optional(),
  symptoms: z.array(z.string()).optional(),
  note: z.string().optional(),
})

// POST /api/diary - 创建健康日记
export async function POST(request: NextRequest) {
  try {
    const token = request.headers.get('Authorization')?.replace('Bearer ', '')
    if (!token) return unauthorizedResponse()

    const payload = await verifyToken(token)
    if (!payload) return unauthorizedResponse()

    const body = await request.json()
    const parsed = diarySchema.safeParse(body)

    if (!parsed.success) {
      return errorResponse(parsed.error.errors[0].message)
    }

    const { date, ...rest } = parsed.data
    const dateObj = new Date(date + 'T00:00:00.000Z')

    // upsert: 同一天只能一条（userId + date 唯一约束）
    const entry = await prisma.diaryEntry.upsert({
      where: {
        userId_date: {
          userId: payload.userId,
          date: dateObj,
        },
      },
      update: {
        ...rest,
        symptoms: rest.symptoms || undefined,
      },
      create: {
        userId: payload.userId,
        date: dateObj,
        ...rest,
        symptoms: rest.symptoms || undefined,
      },
    })

    return successResponse(entry)
  } catch (error) {
    console.error('Create diary entry error:', error)
    return errorResponse('保存日记失败', 500)
  }
}

// GET /api/diary - 获取健康日记列表
export async function GET(request: NextRequest) {
  try {
    const token = request.headers.get('Authorization')?.replace('Bearer ', '')
    if (!token) return unauthorizedResponse()

    const payload = await verifyToken(token)
    if (!payload) return unauthorizedResponse()

    const { searchParams } = new URL(request.url)
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')
    const page = parseInt(searchParams.get('page') || '1')
    const pageSize = parseInt(searchParams.get('pageSize') || '20')

    const where: Record<string, unknown> = { userId: payload.userId }

    if (startDate || endDate) {
      const dateFilter: Record<string, Date> = {}
      if (startDate) dateFilter.gte = new Date(startDate + 'T00:00:00.000Z')
      if (endDate) dateFilter.lte = new Date(endDate + 'T23:59:59.999Z')
      where.date = dateFilter
    }

    const [entries, total] = await Promise.all([
      prisma.diaryEntry.findMany({
        where,
        orderBy: { date: 'desc' },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      prisma.diaryEntry.count({ where }),
    ])

    return successResponse({
      items: entries,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    })
  } catch (error) {
    console.error('Get diary entries error:', error)
    return errorResponse('获取日记列表失败', 500)
  }
}
