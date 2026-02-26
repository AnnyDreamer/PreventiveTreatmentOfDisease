'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Avatar } from '@/components/ui/avatar'
import {
  ArrowLeft, Activity, BookOpen, MessageSquare,
  CalendarCheck, TrendingUp, AlertTriangle
} from 'lucide-react'
import Link from 'next/link'

// Demo 患者数据
const patient = {
  id: '1',
  name: '张伟',
  gender: '男',
  age: 45,
  phone: '138****1234',
  height: 172,
  weight: 78,
  riskLevel: 'MEDIUM' as const,
  lastVisit: '2026-02-23',
  constitution: {
    primaryType: '气虚质',
    score: 68.8,
    secondaryTypes: ['阳虚质'],
    date: '2026-02-23',
    scores: [
      { type: '平和质', score: 35.0 },
      { type: '气虚质', score: 68.8 },
      { type: '阳虚质', score: 42.9 },
      { type: '阴虚质', score: 18.8 },
      { type: '痰湿质', score: 25.0 },
      { type: '湿热质', score: 14.3 },
      { type: '血瘀质', score: 21.4 },
      { type: '气郁质', score: 17.9 },
      { type: '特禀质', score: 10.7 },
    ],
    aiAnalysis: '张先生的体质评估结果显示以气虚质为主，兼夹阳虚质。气虚质表现为容易疲劳、气短懒言、免疫力较低等特点。结合阳虚倾向，在秋冬季节尤其需要注意保暖和补气养阳。建议从饮食调理、适度运动和规律作息三个方面入手，循序渐进地改善体质状态。',
  },
  recentDiary: [
    { date: '2026-02-23', sleepHours: 7, sleepQuality: 3, moodScore: 4, exerciseMinutes: 30, symptoms: [] },
    { date: '2026-02-22', sleepHours: 6.5, sleepQuality: 3, moodScore: 3, exerciseMinutes: 20, symptoms: ['乏力'] },
    { date: '2026-02-21', sleepHours: 7.5, sleepQuality: 4, moodScore: 4, exerciseMinutes: 40, symptoms: [] },
    { date: '2026-02-20', sleepHours: 6, sleepQuality: 2, moodScore: 3, exerciseMinutes: 0, symptoms: ['乏力', '气短'] },
    { date: '2026-02-19', sleepHours: 7, sleepQuality: 3, moodScore: 3, exerciseMinutes: 30, symptoms: [] },
  ],
  recentChats: [
    { id: '1', date: '2026-02-23', lastMessage: '黄芪泡水一般每次放多少克比较合适？', messageCount: 8 },
    { id: '2', date: '2026-02-20', lastMessage: '最近总觉得提不起劲，是气虚加重了吗？', messageCount: 5 },
  ],
  followups: [
    { id: '1', name: '气虚质调理随访', nextDate: '2026-02-28', status: '进行中', completedCount: 3, totalCount: 8 },
  ],
}

const riskConfig = {
  LOW: { label: '低风险', variant: 'success' as const },
  MEDIUM: { label: '中风险', variant: 'warning' as const },
  HIGH: { label: '高风险', variant: 'danger' as const },
  CRITICAL: { label: '极高风险', variant: 'destructive' as const },
}

const qualityLabel = ['', '很差', '较差', '一般', '较好', '很好']
const moodLabel = ['', '😞', '😔', '😐', '😊', '😄']

export default function PatientDetailPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/dashboard/patients">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div className="flex items-center gap-4 flex-1">
          <Avatar fallback={patient.name} size="lg" />
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold font-display text-ink-900">{patient.name}</h1>
              <Badge variant={riskConfig[patient.riskLevel].variant}>
                {riskConfig[patient.riskLevel].label}
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground mt-0.5">
              {patient.gender} · {patient.age}岁 · {patient.height}cm / {patient.weight}kg · 最近就诊: {patient.lastVisit}
            </p>
          </div>
        </div>
      </div>

      {/* 体质评估 */}
      <Card>
        <CardHeader className="flex flex-row items-center gap-2">
          <Activity className="h-5 w-5 text-herb-500" />
          <CardTitle className="text-lg">体质评估</CardTitle>
          <span className="text-xs text-muted-foreground ml-auto">评估日期: {patient.constitution.date}</span>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-6">
            {/* 体质得分柱状图 */}
            <div className="space-y-2.5">
              <div className="flex items-center gap-2 mb-4">
                <span className="text-2xl font-bold text-ink-900 font-display">{patient.constitution.primaryType}</span>
                {patient.constitution.secondaryTypes.map((t) => (
                  <Badge key={t} variant="secondary" className="text-xs">{t}</Badge>
                ))}
              </div>
              {patient.constitution.scores.map((s) => (
                <div key={s.type} className="flex items-center gap-2">
                  <span className={`text-xs w-14 shrink-0 ${s.type === patient.constitution.primaryType ? 'font-bold text-herb-700' : 'text-ink-500'}`}>
                    {s.type}
                  </span>
                  <div className="flex-1 h-5 bg-herb-50 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-700 ${
                        s.type === patient.constitution.primaryType ? 'bg-herb-600' : 'bg-herb-300'
                      }`}
                      style={{ width: `${s.score}%` }}
                    />
                  </div>
                  <span className="text-xs text-ink-500 w-12 text-right">{s.score}分</span>
                </div>
              ))}
            </div>
            {/* AI 分析 */}
            <div className="bg-herb-50 rounded-xl p-5 border border-herb-100">
              <h4 className="text-sm font-semibold text-herb-700 mb-2 font-display">AI 体质分析</h4>
              <p className="text-sm text-ink-600 leading-relaxed">
                {patient.constitution.aiAnalysis}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* 近期健康日记 */}
        <Card>
          <CardHeader className="flex flex-row items-center gap-2">
            <BookOpen className="h-5 w-5 text-herb-500" />
            <CardTitle className="text-lg">近期健康日记</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {patient.recentDiary.map((d) => (
                <div key={d.date} className="flex items-center gap-4 py-2 border-b border-border last:border-0">
                  <span className="text-xs text-muted-foreground w-20 shrink-0">{d.date}</span>
                  <div className="flex items-center gap-4 text-sm flex-1">
                    <span title="睡眠">🛏️ {d.sleepHours}h ({qualityLabel[d.sleepQuality]})</span>
                    <span title="情绪">{moodLabel[d.moodScore]}</span>
                    <span title="运动">🏃 {d.exerciseMinutes}min</span>
                  </div>
                  <div className="flex gap-1">
                    {d.symptoms.map((s) => (
                      <Badge key={s} variant="danger" className="text-[10px]">{s}</Badge>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* AI 对话记录 */}
        <Card>
          <CardHeader className="flex flex-row items-center gap-2">
            <MessageSquare className="h-5 w-5 text-herb-500" />
            <CardTitle className="text-lg">AI 对话记录</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {patient.recentChats.map((c) => (
                <div key={c.id} className="p-3 bg-herb-50 rounded-lg border border-herb-100">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs text-muted-foreground">{c.date}</span>
                    <span className="text-xs text-herb-500">{c.messageCount} 条对话</span>
                  </div>
                  <p className="text-sm text-ink-700 line-clamp-2">{c.lastMessage}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* 随访计划 */}
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center gap-2">
            <CalendarCheck className="h-5 w-5 text-herb-500" />
            <CardTitle className="text-lg">随访计划</CardTitle>
          </CardHeader>
          <CardContent>
            {patient.followups.map((f) => (
              <div key={f.id} className="flex items-center justify-between p-4 bg-herb-50 rounded-lg border border-herb-100">
                <div>
                  <h4 className="font-medium text-ink-900">{f.name}</h4>
                  <p className="text-sm text-muted-foreground mt-0.5">
                    下次随访: <span className="text-herb-600 font-medium">{f.nextDate}</span> · {f.status}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold text-ink-900">{f.completedCount}/{f.totalCount}</p>
                  <p className="text-xs text-muted-foreground">已完成</p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
