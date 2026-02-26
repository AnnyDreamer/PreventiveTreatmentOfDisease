import { NextRequest } from 'next/server'
import { prisma } from '@zhiwebing/db'
import { verifyToken } from '@/lib/auth'
import { successResponse, errorResponse, unauthorizedResponse } from '@/lib/api-response'

// GET /api/diary/stats - 获取日记统计数据
export async function GET(request: NextRequest) {
  try {
    const token = request.headers.get('Authorization')?.replace('Bearer ', '')
    if (!token) return unauthorizedResponse()

    const payload = await verifyToken(token)
    if (!payload) return unauthorizedResponse()

    const { searchParams } = new URL(request.url)
    const days = parseInt(searchParams.get('days') || '30')

    const sinceDate = new Date()
    sinceDate.setDate(sinceDate.getDate() - days)
    sinceDate.setHours(0, 0, 0, 0)

    // 查询指定天数内的所有日记
    const entries = await prisma.diaryEntry.findMany({
      where: {
        userId: payload.userId,
        date: { gte: sinceDate },
      },
      orderBy: { date: 'desc' },
    })

    // totalEntries: 记录天数
    const totalEntries = entries.length

    // streakDays: 连续打卡天数（从今天往前数）
    const streakDays = calculateStreakDays(entries)

    // avgSleepHours: 平均睡眠时长
    const sleepEntries = entries.filter(e => e.sleepHours != null)
    const avgSleepHours = sleepEntries.length > 0
      ? Math.round((sleepEntries.reduce((sum, e) => sum + (e.sleepHours || 0), 0) / sleepEntries.length) * 10) / 10
      : null

    // avgMoodScore: 平均情绪评分
    const moodEntries = entries.filter(e => e.moodScore != null)
    const avgMoodScore = moodEntries.length > 0
      ? Math.round((moodEntries.reduce((sum, e) => sum + (e.moodScore || 0), 0) / moodEntries.length) * 10) / 10
      : null

    // avgSleepQuality: 平均睡眠质量
    const sleepQualityEntries = entries.filter(e => e.sleepQuality != null)
    const avgSleepQuality = sleepQualityEntries.length > 0
      ? Math.round((sleepQualityEntries.reduce((sum, e) => sum + (e.sleepQuality || 0), 0) / sleepQualityEntries.length) * 10) / 10
      : null

    // topSymptoms: 最常见症状 top 5
    const symptomCounts: Record<string, number> = {}
    for (const entry of entries) {
      const symptoms = entry.symptoms as string[] | null
      if (symptoms && Array.isArray(symptoms)) {
        for (const symptom of symptoms) {
          symptomCounts[symptom] = (symptomCounts[symptom] || 0) + 1
        }
      }
    }

    const topSymptoms = Object.entries(symptomCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([symptom, count]) => ({ symptom, count }))

    return successResponse({
      totalEntries,
      streakDays,
      avgSleepHours,
      avgMoodScore,
      avgSleepQuality,
      topSymptoms,
    })
  } catch (error) {
    console.error('Get diary stats error:', error)
    return errorResponse('获取统计数据失败', 500)
  }
}

function calculateStreakDays(entries: Array<{ date: Date }>): number {
  if (entries.length === 0) return 0

  // 按日期降序排列（已经是降序的）
  const dates = entries.map(e => {
    const d = new Date(e.date)
    d.setHours(0, 0, 0, 0)
    return d.getTime()
  })

  // 去重
  const uniqueDates = [...new Set(dates)].sort((a, b) => b - a)

  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const todayTime = today.getTime()
  const oneDayMs = 24 * 60 * 60 * 1000

  // 检查今天或昨天是否有记录（允许今天还没打卡的情况）
  const firstDate = uniqueDates[0]
  if (firstDate !== todayTime && firstDate !== todayTime - oneDayMs) {
    return 0
  }

  let streak = 1
  for (let i = 1; i < uniqueDates.length; i++) {
    if (uniqueDates[i - 1] - uniqueDates[i] === oneDayMs) {
      streak++
    } else {
      break
    }
  }

  return streak
}
