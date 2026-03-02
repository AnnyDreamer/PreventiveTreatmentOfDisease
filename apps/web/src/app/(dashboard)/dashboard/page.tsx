'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import {
  Users,
  Activity,
  CalendarCheck,
  AlertTriangle,
  ArrowUpRight,
  ArrowDownRight,
  Leaf,
  Wand2,
  Clock,
  MapPin,
  FileEdit,
  ArrowRight,
  Stethoscope,
  CheckCircle2,
  XCircle,
} from 'lucide-react'
import Link from 'next/link'
import { ContentGenerateDialog } from '@/components/dashboard/content-generate-dialog'

// ── Data ────────────────────────────────────────────────────────

const stats = [
  { title: '在管患者', value: '1,284', change: '+12.5%', trend: 'up' as const, icon: Users, desc: '较上月' },
  { title: '本月评估', value: '156', change: '+8.2%', trend: 'up' as const, icon: Activity, desc: '较上月' },
  { title: '待随访', value: '38', change: '-5.1%', trend: 'down' as const, icon: CalendarCheck, desc: '较上月' },
  { title: '高风险患者', value: '12', change: '+2', trend: 'up' as const, icon: AlertTriangle, desc: '需关注' },
]

type ApptStatus = 'PENDING' | 'CONFIRMED' | 'COMPLETED' | 'CANCELLED' | 'NO_SHOW'

interface PendingAppointment {
  id: string
  scheduledDate: string
  scheduledTime: string
  status: ApptStatus
  service: { name: string }
  patient: { user: { name: string | null } }
}

function getToken() {
  if (typeof document === 'undefined') return undefined
  return document.cookie.split('; ').find((c) => c.startsWith('token='))?.split('=')[1]
}

async function apiFetch(url: string) {
  const token = getToken()
  const res = await fetch(url, {
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  })
  const data = await res.json()
  if (!data.success) throw new Error(data.error || '请求失败')
  return data
}

function formatApptDate(dateStr: string) {
  const d = new Date(dateStr)
  const today = new Date()
  const tomorrow = new Date(today)
  tomorrow.setDate(tomorrow.getDate() + 1)
  if (d.toDateString() === today.toDateString()) return `今日 ${dateStr.slice(0, 10).slice(5).replace('-', '/')}`
  if (d.toDateString() === tomorrow.toDateString()) return `明日 ${dateStr.slice(0, 10).slice(5).replace('-', '/')}`
  return `${(d.getMonth() + 1)}/${d.getDate()}`
}

const followupPatients = [
  { name: '陈建国', constitution: '痰湿质', risk: 'HIGH' as const, date: '2026-02-20' },
  { name: '赵雪梅', constitution: '血瘀质', risk: 'MEDIUM' as const, date: '2026-02-18' },
  { name: '孙浩然', constitution: '平和质', risk: 'LOW' as const, date: '2026-02-15' },
  { name: '王秀英', constitution: '气虚质', risk: 'MEDIUM' as const, date: '2026-02-12' },
  { name: '李志强', constitution: '阳虚质', risk: 'LOW' as const, date: '2026-02-10' },
  { name: '周丽华', constitution: '阴虚质', risk: 'MEDIUM' as const, date: '2026-02-08' },
]

const highRiskPatients = [
  { name: '陈建国', constitution: '痰湿质', risk: 'HIGH' as const, date: '2026-02-20' },
  { name: '钱学文', constitution: '血瘀质', risk: 'HIGH' as const, date: '2026-02-19' },
  { name: '吴美玲', constitution: '气郁质', risk: 'CRITICAL' as const, date: '2026-02-17' },
  { name: '郑国栋', constitution: '阴虚质', risk: 'HIGH' as const, date: '2026-02-14' },
  { name: '黄丽娟', constitution: '痰湿质', risk: 'HIGH' as const, date: '2026-02-11' },
  { name: '林志远', constitution: '湿热质', risk: 'CRITICAL' as const, date: '2026-02-09' },
]

const constitutionTop5 = [
  { type: '平和质', count: 312, percentage: 24.3, color: 'bg-celadon-500' },
  { type: '气虚质', count: 198, percentage: 15.4, color: 'bg-herb-400' },
  { type: '阳虚质', count: 167, percentage: 13.0, color: 'bg-amber-400' },
  { type: '阴虚质', count: 156, percentage: 12.1, color: 'bg-cinnabar-400' },
  { type: '痰湿质', count: 143, percentage: 11.1, color: 'bg-ink-400' },
]
const constitutionOtherCount = 89 + 72 + 35 + 112 // 血瘀+气郁+特禀+湿热 = 308
const constitutionOtherPct = 24.1

const recentAssessments = [
  { name: '张伟', constitution: '气虚质', date: '02-28' },
  { name: '刘芳', constitution: '阴虚质', date: '02-27' },
  { name: '王建华', constitution: '平和质', date: '02-26' },
]

const currentSolarTerm = { name: '雨水', season: '春季', focus: '养肝健脾、祛湿防寒' }

const demoActivities = [
  {
    id: '1', title: '春季社区义诊', time: '03-01 09:00-17:00',
    location: '阳光社区卫生服务中心', registered: 45, capacity: 60, status: 'ongoing' as const,
  },
  {
    id: '2', title: '惊蛰养生讲座', time: '03-06 14:00-16:00',
    location: '中医院三楼报告厅', registered: 28, capacity: 50, status: 'upcoming' as const,
  },
]

const demoRecommendations = [
  { id: '1', type: 'SOLAR_TERM', typeLabel: '节气养生', topic: '雨水养肝护肝指南', keywords: ['春季养肝', '雨水节气', '疏肝理气'] },
  { id: '2', type: 'CONSTITUTION_GUIDE', typeLabel: '体质调养', topic: '气虚阳虚体质春季调养方案', keywords: ['气虚体质', '阳虚体质', '补气温阳'] },
]

const demoDraft = { id: 'd1', title: '立春养生：万物复苏话养肝', contentType: 'SOLAR_TERM' }

const riskBadgeVariant = {
  LOW: 'success' as const,
  MEDIUM: 'warning' as const,
  HIGH: 'danger' as const,
  CRITICAL: 'destructive' as const,
}
const riskLabel = { LOW: '低', MEDIUM: '中', HIGH: '高', CRITICAL: '极高' }

const typeBadgeColor: Record<string, string> = {
  SOLAR_TERM: 'bg-amber-100 text-amber-700',
  CONSTITUTION_GUIDE: 'bg-celadon-100 text-celadon-700',
  DIET_THERAPY: 'bg-herb-100 text-herb-700',
}

// ── Component ───────────────────────────────────────────────────

export default function DashboardPage() {
  const [todoTab, setTodoTab] = useState('followup')
  const [bottomTab, setBottomTab] = useState('activities')
  const [dialogOpen, setDialogOpen] = useState(false)
  const [dialogContentType, setDialogContentType] = useState('KNOWLEDGE')
  const [dialogTopic, setDialogTopic] = useState('')
  const [dialogKeywords, setDialogKeywords] = useState<string[]>([])
  const [pendingAppts, setPendingAppts] = useState<PendingAppointment[]>([])
  const [todayApptCount, setTodayApptCount] = useState<number | null>(null)
  const [apptUpdating, setApptUpdating] = useState<string | null>(null)

  useEffect(() => {
    const fetchAppts = async () => {
      try {
        const [pendingData, todayData] = await Promise.all([
          apiFetch('/api/appointments?status=PENDING&pageSize=10'),
          apiFetch(`/api/appointments?status=CONFIRMED&date=${new Date().toISOString().slice(0, 10)}&pageSize=1`),
        ])
        setPendingAppts(pendingData.data.items || [])
        setTodayApptCount(todayData.data.total ?? 0)
      } catch (e) {
        console.error(e)
      }
    }
    fetchAppts()
  }, [])

  const handleApptAction = async (id: string, status: 'CONFIRMED' | 'CANCELLED') => {
    setApptUpdating(id)
    try {
      const token = getToken()
      await fetch(`/api/appointments/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
        body: JSON.stringify({ status }),
      })
      setPendingAppts((prev) => prev.filter((a) => a.id !== id))
      if (status === 'CONFIRMED') setTodayApptCount((c) => (c ?? 0) + 1)
    } catch (e) { console.error(e) } finally { setApptUpdating(null) }
  }

  const handleQuickGenerate = (rec: { type: string; topic: string; keywords: string[] }) => {
    setDialogContentType(rec.type)
    setDialogTopic(rec.topic)
    setDialogKeywords(rec.keywords)
    setDialogOpen(true)
  }

  const todoPatients = todoTab === 'followup' ? followupPatients : highRiskPatients

  return (
    <>
      <div className="space-y-5">
        {/* ── Row 1: Top bar + Stats ── */}
        <div className="space-y-3">
          <p className="text-sm text-muted-foreground">
            工作台 · {currentSolarTerm.name} · 2026年3月1日
          </p>
          <div className="grid gap-3 grid-cols-2 lg:grid-cols-4">
            {stats.map((s) => (
              <Card key={s.title}>
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-herb-100 shrink-0">
                      <s.icon className="h-4 w-4 text-herb-600" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xl font-bold text-ink-900 leading-tight">{s.value}</p>
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs text-muted-foreground">{s.title}</span>
                        <span className={`flex items-center text-[11px] font-medium ${
                          s.trend === 'up' ? 'text-celadon-600' : 'text-cinnabar-500'
                        }`}>
                          {s.change}
                          {s.trend === 'up' ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
                        </span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* ── Row 1b: 今日预约统计卡（小行） ── */}
        {todayApptCount !== null && (
          <div className="flex items-center gap-2 px-1">
            <Stethoscope className="h-3.5 w-3.5 text-herb-500" />
            <span className="text-xs text-ink-600">今日已确认预约</span>
            <span className="text-sm font-bold text-herb-700">{todayApptCount}</span>
            <span className="text-xs text-muted-foreground">次</span>
            {pendingAppts.length > 0 && (
              <Badge variant="warning" className="text-[10px] px-1.5 py-0 ml-1">
                {pendingAppts.length} 条待确认
              </Badge>
            )}
            <Link href="/dashboard/services" className="text-xs text-herb-600 hover:text-herb-700 ml-auto flex items-center gap-1">
              预约管理 <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
        )}

        {/* ── Row 2: 今日待办 + 体质概览 ── */}
        <div className="grid gap-5 lg:grid-cols-12">
          {/* Left: 今日待办 */}
          <Card className="lg:col-span-7">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-3">
                <Tabs value={todoTab} onValueChange={setTodoTab}>
                  <TabsList className="h-8">
                    <TabsTrigger value="followup" className="text-xs px-2.5 py-1">待随访</TabsTrigger>
                    <TabsTrigger value="risk" className="text-xs px-2.5 py-1">高风险</TabsTrigger>
                    <TabsTrigger value="appointments" className="text-xs px-2.5 py-1 relative">
                      待确认预约
                      {pendingAppts.length > 0 && (
                        <span className="absolute -top-1 -right-1 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-cinnabar-500 text-[9px] text-white">
                          {pendingAppts.length}
                        </span>
                      )}
                    </TabsTrigger>
                  </TabsList>
                </Tabs>
                <Link href="/dashboard/patients" className="text-xs text-herb-600 hover:text-herb-700 flex items-center gap-1">
                  查看全部 <ArrowRight className="h-3 w-3" />
                </Link>
              </div>
              {todoTab !== 'appointments' ? (
                <div className="space-y-0">
                  {todoPatients.map((p) => (
                    <div key={p.name + p.date} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                      <div className="flex items-center gap-2.5">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-herb-100 text-herb-700 text-xs font-medium">
                          {p.name.charAt(0)}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-ink-900 leading-tight">{p.name}</p>
                          <p className="text-xs text-muted-foreground">{p.constitution}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant={riskBadgeVariant[p.risk]} className="text-[10px] px-1.5 py-0">
                          {riskLabel[p.risk]}
                        </Badge>
                        <span className="text-xs text-muted-foreground">{p.date}</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="space-y-0">
                  {pendingAppts.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-6 text-muted-foreground">
                      <CheckCircle2 className="h-8 w-8 mb-2 opacity-20" />
                      <p className="text-xs">暂无待确认预约</p>
                    </div>
                  ) : (
                    pendingAppts.map((appt) => (
                      <div key={appt.id} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                        <div className="flex items-center gap-2.5">
                          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-amber-100 text-amber-700 text-xs font-medium">
                            {(appt.patient?.user?.name || '?').charAt(0)}
                          </div>
                          <div>
                            <p className="text-sm font-medium text-ink-900 leading-tight">{appt.patient?.user?.name || '—'}</p>
                            <p className="text-xs text-muted-foreground">{appt.service?.name} · {formatApptDate(appt.scheduledDate)} {appt.scheduledTime}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-1">
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-6 text-[10px] px-2 text-celadon-600 hover:text-celadon-700 hover:bg-celadon-50"
                            disabled={apptUpdating === appt.id}
                            onClick={() => handleApptAction(appt.id, 'CONFIRMED')}
                          >
                            <CheckCircle2 className="h-3 w-3" />
                            确认
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 text-[10px] px-2 text-cinnabar-500"
                            disabled={apptUpdating === appt.id}
                            onClick={() => handleApptAction(appt.id, 'CANCELLED')}
                          >
                            <XCircle className="h-3 w-3" />
                            取消
                          </Button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Right: 体质概览 */}
          <Card className="lg:col-span-5">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold text-ink-900">体质分布</h3>
                <Link href="/dashboard/assessments" className="text-xs text-herb-600 hover:text-herb-700 flex items-center gap-1">
                  查看详情 <ArrowRight className="h-3 w-3" />
                </Link>
              </div>
              <div className="space-y-2">
                {constitutionTop5.map((item) => (
                  <div key={item.type} className="flex items-center gap-2.5">
                    <span className="text-xs text-ink-600 w-14 shrink-0">{item.type}</span>
                    <div className="flex-1 h-4 bg-herb-50 rounded-full overflow-hidden">
                      <div
                        className={`h-full ${item.color} rounded-full`}
                        style={{ width: `${item.percentage}%` }}
                      />
                    </div>
                    <span className="text-[11px] text-muted-foreground w-14 text-right">
                      {item.count} ({item.percentage}%)
                    </span>
                  </div>
                ))}
                <div className="flex items-center gap-2.5">
                  <span className="text-xs text-ink-400 w-14 shrink-0">其他4种</span>
                  <div className="flex-1 h-4 bg-herb-50 rounded-full overflow-hidden">
                    <div className="h-full bg-ink-200 rounded-full" style={{ width: `${constitutionOtherPct}%` }} />
                  </div>
                  <span className="text-[11px] text-muted-foreground w-14 text-right">
                    {constitutionOtherCount} ({constitutionOtherPct}%)
                  </span>
                </div>
              </div>

              {/* 近期评估摘要 */}
              <div className="border-t border-border mt-3 pt-3">
                <p className="text-xs font-medium text-ink-500 mb-1.5">近期评估</p>
                {recentAssessments.map((a) => (
                  <div key={a.name} className="flex items-center justify-between py-0.5">
                    <span className="text-xs text-ink-700">{a.name} — {a.constitution}</span>
                    <span className="text-[11px] text-muted-foreground">{a.date}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* ── Row 3: 节气卡片 + 活动/内容 Tab ── */}
        <div className="grid gap-5 lg:grid-cols-12">
          {/* Left: 节气卡片 */}
          <Card className="lg:col-span-4">
            <CardContent className="p-4 space-y-3">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-herb-100">
                  <Leaf className="h-5 w-5 text-herb-600" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-ink-900">{currentSolarTerm.name}</span>
                    <Badge className="bg-herb-100 text-herb-700 text-[10px] px-1.5 py-0">{currentSolarTerm.season}</Badge>
                  </div>
                  <p className="text-xs text-ink-600">{currentSolarTerm.focus}</p>
                </div>
              </div>
              <Button
                className="w-full"
                size="sm"
                onClick={() => {
                  setDialogContentType('SOLAR_TERM')
                  setDialogTopic(`${currentSolarTerm.name}养生指南`)
                  setDialogKeywords([`${currentSolarTerm.name}节气`, currentSolarTerm.focus])
                  setDialogOpen(true)
                }}
              >
                <Wand2 className="h-3.5 w-3.5" />
                AI 生成健康内容
              </Button>
              <Link
                href="/dashboard/wellness"
                className="flex items-center justify-center gap-1 text-xs text-herb-600 hover:text-herb-700"
              >
                <Stethoscope className="h-3 w-3" />
                康养服务管理
              </Link>
            </CardContent>
          </Card>

          {/* Right: 活动 / 内容 Tab */}
          <Card className="lg:col-span-8">
            <CardContent className="p-4">
              <Tabs value={bottomTab} onValueChange={setBottomTab}>
                <div className="flex items-center justify-between mb-3">
                  <TabsList className="h-8">
                    <TabsTrigger value="activities" className="text-xs px-2.5 py-1">义诊活动</TabsTrigger>
                    <TabsTrigger value="content" className="text-xs px-2.5 py-1">内容创作</TabsTrigger>
                  </TabsList>
                  <Link
                    href={bottomTab === 'activities' ? '/dashboard/activities' : '/dashboard/contents'}
                    className="text-xs text-herb-600 hover:text-herb-700 flex items-center gap-1"
                  >
                    查看全部 <ArrowRight className="h-3 w-3" />
                  </Link>
                </div>

                {/* 义诊活动 */}
                <TabsContent value="activities" className="mt-0">
                  <div className="space-y-3">
                    {demoActivities.map((act) => (
                      <div key={act.id} className="flex items-start justify-between gap-3 py-1.5 border-b border-border last:border-0">
                        <div className="min-w-0 space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium text-ink-900">{act.title}</span>
                            <Badge
                              variant={act.status === 'ongoing' ? 'success' : 'warning'}
                              className="text-[10px] px-1.5 py-0"
                            >
                              {act.status === 'ongoing' ? '进行中' : '即将开始'}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-3 text-xs text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />{act.time}
                            </span>
                            <span className="flex items-center gap-1">
                              <MapPin className="h-3 w-3" />{act.location}
                            </span>
                            <span>{act.registered}/{act.capacity}人</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </TabsContent>

                {/* 内容创作 */}
                <TabsContent value="content" className="mt-0">
                  <div className="space-y-2">
                    {demoRecommendations.map((rec) => (
                      <div key={rec.id} className="flex items-center justify-between py-1.5 border-b border-border last:border-0">
                        <div className="flex items-center gap-2 min-w-0">
                          <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium ${typeBadgeColor[rec.type] || ''}`}>
                            {rec.typeLabel}
                          </span>
                          <span className="text-sm text-ink-800 truncate">{rec.topic}</span>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          className="shrink-0 text-xs text-herb-600 hover:text-herb-700 hover:bg-herb-50 h-7"
                          onClick={() => handleQuickGenerate(rec)}
                        >
                          <Wand2 className="h-3 w-3" />
                          生成
                        </Button>
                      </div>
                    ))}
                    {/* 草稿 */}
                    <div className="flex items-center justify-between py-1.5">
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium bg-ink-100 text-ink-600">
                          草稿
                        </span>
                        <span className="text-sm text-ink-800 truncate">{demoDraft.title}</span>
                      </div>
                      <Link href="/dashboard/contents">
                        <Button variant="ghost" size="sm" className="text-xs h-7">
                          <FileEdit className="h-3 w-3" />
                          编辑
                        </Button>
                      </Link>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      </div>

      <ContentGenerateDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        initialContentType={dialogContentType}
        initialTopic={dialogTopic}
        initialKeywords={dialogKeywords}
      />
    </>
  )
}
