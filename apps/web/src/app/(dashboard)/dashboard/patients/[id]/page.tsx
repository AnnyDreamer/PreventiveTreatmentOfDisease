'use client'

import { useState, useEffect, useCallback } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Avatar } from '@/components/ui/avatar'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from '@/components/ui/dialog'
import {
  ArrowLeft, Activity, BookOpen, MessageSquare,
  CalendarCheck, Utensils, Dumbbell, Moon, Pill, AlertTriangle,
  Stethoscope, Plus, CheckCircle2, XCircle, AlertCircle,
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
  bmi: 26.4,
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
    aiAnalysis: '张先生的体质评估结果显示以气虚质为主，兼夹阳虚质。气虚质表现为容易疲劳、气短懒言、免疫力较低等特点。结合阳虚倾向，在秋冬季节尤其需要注意保暖和补气养阳。',
  },
  // 具体康养方案（基于气虚质+阳虚质）
  healthPlan: {
    diet: {
      recommended: ['黄芪党参炖鸡汤（每周2次）', '山药薏米粥（早餐）', '红枣桂圆枸杞茶（每日1杯）', '牛肉/羊肉（每周3次，每次100g）'],
      avoid: ['生冷瓜果（西瓜、梨等）', '冷饮冰品', '油腻煎炸食物', '过量绿茶'],
      currentWeekMenu: '本周重点：黄芪30g+党参15g 炖排骨，连服3天',
    },
    exercise: {
      items: [
        { name: '八段锦', freq: '每日晨起', duration: '15-20min', note: '重点练习"两手托天理三焦"和"调理脾胃须单举"' },
        { name: '慢走', freq: '每日饭后', duration: '30min', note: '心率控制在 100-110 次/分，微微出汗即止' },
        { name: '太极拳', freq: '每周3次', duration: '30min', note: '二十四式简化太极拳，注意呼吸配合' },
      ],
      avoid: '避免高强度跑步、大量出汗的运动（气随汗脱）',
    },
    lifestyle: [
      { item: '睡眠', detail: '22:30前入睡，保证7-8小时，午休20分钟' },
      { item: '保暖', detail: '腹部、足底重点保暖，春季勿过早减衣' },
      { item: '情志', detail: '避免过度劳累和思虑，每日静坐冥想10分钟' },
    ],
    acupoints: [
      { name: '足三里', method: '每日按揉3-5分钟', effect: '补气健脾' },
      { name: '气海穴', method: '艾灸15分钟，每周3次', effect: '培补元气' },
      { name: '关元穴', method: '艾灸15分钟，每周3次', effect: '温阳补虚' },
    ],
    herbs: { current: '玉屏风散加减（黄芪15g、白术10g、防风6g）', period: '2周为1疗程，目前第1疗程', nextReview: '2026-03-09' },
  },
  recentDiary: [
    { date: '02-23', sleep: 7, quality: 3, mood: 4, exercise: 30, symptoms: [] },
    { date: '02-22', sleep: 6.5, quality: 3, mood: 3, exercise: 20, symptoms: ['乏力'] },
    { date: '02-21', sleep: 7.5, quality: 4, mood: 4, exercise: 40, symptoms: [] },
    { date: '02-20', sleep: 6, quality: 2, mood: 3, exercise: 0, symptoms: ['乏力', '气短'] },
    { date: '02-19', sleep: 7, quality: 3, mood: 3, exercise: 30, symptoms: [] },
    { date: '02-18', sleep: 7, quality: 4, mood: 4, exercise: 25, symptoms: [] },
    { date: '02-17', sleep: 6.5, quality: 3, mood: 3, exercise: 0, symptoms: ['乏力'] },
  ],
  recentChats: [
    { id: '1', date: '02-23', lastMessage: '黄芪泡水一般每次放多少克比较合适？', count: 8 },
    { id: '2', date: '02-20', lastMessage: '最近总觉得提不起劲，是气虚加重了吗？', count: 5 },
  ],
  followups: [
    { id: '1', name: '体质随访 · 气虚质', nextDate: '2026-02-28', status: '进行中', done: 3, total: 8, interval: 30 },
  ],
}

const riskConfig = {
  LOW: { label: '低风险', variant: 'success' as const },
  MEDIUM: { label: '中风险', variant: 'warning' as const },
  HIGH: { label: '高风险', variant: 'danger' as const },
  CRITICAL: { label: '极高风险', variant: 'destructive' as const },
}

const qualityDot = ['', '🔴', '🟠', '🟡', '🟢', '🟢']
const moodIcon = ['', '😞', '😔', '😐', '😊', '😄']

type AppointmentStatus = 'PENDING' | 'CONFIRMED' | 'COMPLETED' | 'CANCELLED' | 'NO_SHOW'

interface ServiceAppointment {
  id: string
  scheduledDate: string
  scheduledTime: string
  status: AppointmentStatus
  note: string | null
  service: { id: string; name: string; category: string }
  doctor: { id: string; title: string | null; user: { name: string | null } } | null
}

interface ServiceOption {
  id: string
  name: string
}

interface DoctorOption {
  id: string
  title: string | null
  user: { name: string | null }
}

const APPT_STATUS_CONFIG: Record<AppointmentStatus, { label: string; icon: React.ComponentType<{ className?: string }>; className: string }> = {
  PENDING: { label: '待确认', icon: AlertCircle, className: 'text-amber-600 bg-amber-50' },
  CONFIRMED: { label: '已确认', icon: CheckCircle2, className: 'text-celadon-600 bg-celadon-50' },
  COMPLETED: { label: '已完成', icon: CheckCircle2, className: 'text-ink-500 bg-ink-50' },
  CANCELLED: { label: '已取消', icon: XCircle, className: 'text-muted-foreground bg-muted' },
  NO_SHOW: { label: '未到诊', icon: XCircle, className: 'text-cinnabar-500 bg-cinnabar-50' },
}

function getToken() {
  return document.cookie.split('; ').find((c) => c.startsWith('token='))?.split('=')[1]
}

async function apiFetch(url: string, options?: RequestInit) {
  const token = getToken()
  const res = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options?.headers,
    },
  })
  const data = await res.json()
  if (!data.success) throw new Error(data.error || '请求失败')
  return data
}

function formatDate(dateStr: string) {
  const d = new Date(dateStr)
  return `${d.getMonth() + 1}/${d.getDate()}`
}

export default function PatientDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const p = patient
  const [patientProfileId, setPatientProfileId] = useState<string>('')
  const [appointments, setAppointments] = useState<ServiceAppointment[]>([])
  const [apptNewOpen, setApptNewOpen] = useState(false)
  const [services, setServices] = useState<ServiceOption[]>([])
  const [doctors, setDoctors] = useState<DoctorOption[]>([])
  const [apptForm, setApptForm] = useState({
    serviceId: '', doctorId: '', scheduledDate: '', scheduledTime: '09:00', note: '',
  })
  const [apptSaving, setApptSaving] = useState(false)

  // Resolve params
  useEffect(() => {
    params.then(({ id }) => setPatientProfileId(id))
  }, [params])

  const fetchAppointments = useCallback(async () => {
    if (!patientProfileId) return
    try {
      const data = await apiFetch(`/api/appointments?patientId=${patientProfileId}&pageSize=10`)
      setAppointments(data.data.items || [])
    } catch (e) {
      console.error(e)
    }
  }, [patientProfileId])

  useEffect(() => { fetchAppointments() }, [fetchAppointments])

  const loadDialogData = async () => {
    try {
      const data = await apiFetch('/api/services?pageSize=100&isActive=true')
      setServices(data.data.items || [])
    } catch (e) { console.error(e) }
  }

  const loadDoctors = async (serviceId: string) => {
    if (!serviceId) return
    try {
      const data = await apiFetch(`/api/services/${serviceId}/schedules`)
      const uniqueDoctors = Array.from(
        new Map((data.data || []).map((s: { doctor: DoctorOption }) => [s.doctor.id, s.doctor])).values()
      ) as DoctorOption[]
      setDoctors(uniqueDoctors)
    } catch (e) { console.error(e); setDoctors([]) }
  }

  const openNewAppt = () => {
    setApptForm({ serviceId: '', doctorId: '', scheduledDate: '', scheduledTime: '09:00', note: '' })
    setDoctors([])
    loadDialogData()
    setApptNewOpen(true)
  }

  const handleCreateAppt = async () => {
    setApptSaving(true)
    try {
      await apiFetch('/api/appointments', {
        method: 'POST',
        body: JSON.stringify({
          patientId: patientProfileId,
          serviceId: apptForm.serviceId,
          doctorId: apptForm.doctorId || undefined,
          scheduledDate: apptForm.scheduledDate,
          scheduledTime: apptForm.scheduledTime,
          note: apptForm.note || undefined,
        }),
      })
      setApptNewOpen(false)
      fetchAppointments()
    } catch (e) { console.error(e) } finally { setApptSaving(false) }
  }

  return (
    <div className="space-y-4">
      {/* Header - 紧凑 */}
      <div className="flex items-center gap-3">
        <Link href="/dashboard/patients">
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <Avatar fallback={p.name} size="md" />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold font-display text-ink-900">{p.name}</h1>
            <Badge variant={riskConfig[p.riskLevel].variant} className="text-[10px]">
              {riskConfig[p.riskLevel].label}
            </Badge>
            <Badge variant="secondary" className="text-[10px]">{p.constitution.primaryType} {p.constitution.score}分</Badge>
            {p.constitution.secondaryTypes.map((t) => (
              <Badge key={t} variant="outline" className="text-[10px]">兼 {t}</Badge>
            ))}
          </div>
          <p className="text-xs text-muted-foreground">
            {p.gender} · {p.age}岁 · {p.height}cm/{p.weight}kg · BMI {p.bmi} · 最近就诊 {p.lastVisit}
          </p>
        </div>
      </div>

      {/* Row 1: 体质雷达 + 当前用药/方剂 + 关键指标趋势 */}
      <div className="grid gap-3 lg:grid-cols-3">
        {/* 体质得分 - 紧凑条形图 */}
        <Card>
          <CardHeader className="py-2.5 px-4 flex flex-row items-center gap-1.5">
            <Activity className="h-4 w-4 text-herb-500" />
            <CardTitle className="text-sm">体质得分</CardTitle>
            <span className="text-[10px] text-muted-foreground ml-auto">{p.constitution.date}</span>
          </CardHeader>
          <CardContent className="px-4 pb-3 pt-0">
            <div className="space-y-1">
              {p.constitution.scores.map((s) => {
                const isPrimary = s.type === p.constitution.primaryType
                const isSecondary = p.constitution.secondaryTypes.includes(s.type)
                return (
                  <div key={s.type} className="flex items-center gap-1.5">
                    <span className={`text-[11px] w-12 shrink-0 ${isPrimary ? 'font-bold text-herb-700' : isSecondary ? 'font-medium text-amber-600' : 'text-ink-400'}`}>
                      {s.type}
                    </span>
                    <div className="flex-1 h-3.5 bg-herb-50 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full ${isPrimary ? 'bg-herb-600' : isSecondary ? 'bg-amber-400' : 'bg-herb-200'}`}
                        style={{ width: `${s.score}%` }}
                      />
                    </div>
                    <span className={`text-[11px] w-8 text-right ${isPrimary ? 'font-bold text-herb-700' : 'text-ink-400'}`}>{s.score}</span>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>

        {/* 当前方剂 & 穴位 */}
        <Card>
          <CardHeader className="py-2.5 px-4 flex flex-row items-center gap-1.5">
            <Pill className="h-4 w-4 text-herb-500" />
            <CardTitle className="text-sm">当前方剂 & 穴位</CardTitle>
          </CardHeader>
          <CardContent className="px-4 pb-3 pt-0 space-y-2.5">
            <div className="bg-amber-50 border border-amber-100 rounded-lg p-2.5">
              <p className="text-xs font-medium text-amber-800">{p.healthPlan.herbs.current}</p>
              <p className="text-[10px] text-amber-600 mt-0.5">{p.healthPlan.herbs.period} · 下次复查 {p.healthPlan.herbs.nextReview}</p>
            </div>
            <div className="space-y-1">
              {p.healthPlan.acupoints.map((a) => (
                <div key={a.name} className="flex items-center gap-2 text-[11px]">
                  <span className="font-medium text-ink-700 w-12 shrink-0">{a.name}</span>
                  <span className="text-ink-500 flex-1">{a.method}</span>
                  <Badge variant="secondary" className="text-[9px] px-1.5 py-0">{a.effect}</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* 近7日趋势迷你表 */}
        <Card>
          <CardHeader className="py-2.5 px-4 flex flex-row items-center gap-1.5">
            <BookOpen className="h-4 w-4 text-herb-500" />
            <CardTitle className="text-sm">近7日健康日记</CardTitle>
          </CardHeader>
          <CardContent className="px-4 pb-3 pt-0">
            <table className="w-full text-[11px]">
              <thead>
                <tr className="text-muted-foreground border-b">
                  <th className="text-left py-1 font-normal">日期</th>
                  <th className="text-center py-1 font-normal">睡眠</th>
                  <th className="text-center py-1 font-normal">质量</th>
                  <th className="text-center py-1 font-normal">情绪</th>
                  <th className="text-center py-1 font-normal">运动</th>
                  <th className="text-right py-1 font-normal">症状</th>
                </tr>
              </thead>
              <tbody>
                {p.recentDiary.map((d) => (
                  <tr key={d.date} className="border-b border-border/50 last:border-0">
                    <td className="py-1 text-ink-500">{d.date}</td>
                    <td className="py-1 text-center text-ink-700">{d.sleep}h</td>
                    <td className="py-1 text-center">{qualityDot[d.quality]}</td>
                    <td className="py-1 text-center">{moodIcon[d.mood]}</td>
                    <td className="py-1 text-center text-ink-700">{d.exercise}′</td>
                    <td className="py-1 text-right">
                      {d.symptoms.length > 0
                        ? d.symptoms.map((s) => <Badge key={s} variant="danger" className="text-[9px] px-1 py-0 ml-0.5">{s}</Badge>)
                        : <span className="text-ink-300">—</span>
                      }
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>
      </div>

      {/* Row 2: 具体康养方案 - 核心内容 */}
      <div className="grid gap-3 lg:grid-cols-3">
        {/* 食疗方案 */}
        <Card>
          <CardHeader className="py-2.5 px-4 flex flex-row items-center gap-1.5">
            <Utensils className="h-4 w-4 text-herb-500" />
            <CardTitle className="text-sm">食疗方案</CardTitle>
          </CardHeader>
          <CardContent className="px-4 pb-3 pt-0 space-y-2">
            <div className="bg-emerald-50 border border-emerald-100 rounded-lg p-2.5">
              <p className="text-[10px] font-medium text-emerald-700 mb-1">📌 本周重点</p>
              <p className="text-xs text-emerald-800">{p.healthPlan.diet.currentWeekMenu}</p>
            </div>
            <div>
              <p className="text-[10px] text-ink-400 mb-1">✅ 推荐食材</p>
              <ul className="space-y-0.5">
                {p.healthPlan.diet.recommended.map((item) => (
                  <li key={item} className="text-[11px] text-ink-600 pl-2 relative before:content-['·'] before:absolute before:left-0 before:text-herb-400">{item}</li>
                ))}
              </ul>
            </div>
            <div>
              <p className="text-[10px] text-ink-400 mb-1">🚫 忌口</p>
              <ul className="space-y-0.5">
                {p.healthPlan.diet.avoid.map((item) => (
                  <li key={item} className="text-[11px] text-ink-400 pl-2 relative before:content-['·'] before:absolute before:left-0 before:text-red-300">{item}</li>
                ))}
              </ul>
            </div>
          </CardContent>
        </Card>

        {/* 运动方案 */}
        <Card>
          <CardHeader className="py-2.5 px-4 flex flex-row items-center gap-1.5">
            <Dumbbell className="h-4 w-4 text-herb-500" />
            <CardTitle className="text-sm">运动方案</CardTitle>
          </CardHeader>
          <CardContent className="px-4 pb-3 pt-0 space-y-2">
            {p.healthPlan.exercise.items.map((ex) => (
              <div key={ex.name} className="bg-herb-50 border border-herb-100 rounded-lg p-2.5">
                <div className="flex items-center justify-between mb-0.5">
                  <span className="text-xs font-medium text-ink-800">{ex.name}</span>
                  <span className="text-[10px] text-herb-600">{ex.freq} · {ex.duration}</span>
                </div>
                <p className="text-[10px] text-ink-500">{ex.note}</p>
              </div>
            ))}
            <div className="flex items-start gap-1.5 text-[10px] text-red-500 bg-red-50 rounded p-2">
              <AlertTriangle className="h-3 w-3 shrink-0 mt-0.5" />
              <span>{p.healthPlan.exercise.avoid}</span>
            </div>
          </CardContent>
        </Card>

        {/* 起居 & 情志 */}
        <Card>
          <CardHeader className="py-2.5 px-4 flex flex-row items-center gap-1.5">
            <Moon className="h-4 w-4 text-herb-500" />
            <CardTitle className="text-sm">起居调养</CardTitle>
          </CardHeader>
          <CardContent className="px-4 pb-3 pt-0 space-y-2">
            {p.healthPlan.lifestyle.map((l) => (
              <div key={l.item} className="flex gap-2 text-[11px]">
                <span className="font-medium text-ink-700 w-8 shrink-0">{l.item}</span>
                <span className="text-ink-500">{l.detail}</span>
              </div>
            ))}
            <hr className="border-border/50" />
            <div className="bg-herb-50 rounded-lg p-2.5">
              <p className="text-[10px] font-medium text-herb-700 mb-1">AI 体质小结</p>
              <p className="text-[11px] text-ink-500 leading-relaxed">{p.constitution.aiAnalysis}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Row 3: 随访 + AI对话 */}
      <div className="grid gap-3 lg:grid-cols-2">
        {/* 随访计划 */}
        <Card>
          <CardHeader className="py-2.5 px-4 flex flex-row items-center gap-1.5">
            <CalendarCheck className="h-4 w-4 text-herb-500" />
            <CardTitle className="text-sm">随访计划</CardTitle>
          </CardHeader>
          <CardContent className="px-4 pb-3 pt-0">
            {p.followups.map((f) => (
              <div key={f.id} className="flex items-center justify-between p-2.5 bg-herb-50 rounded-lg border border-herb-100">
                <div>
                  <h4 className="text-xs font-medium text-ink-900">{f.name}</h4>
                  <p className="text-[10px] text-muted-foreground mt-0.5">
                    每{f.interval}天 · 下次 <span className="text-herb-600 font-medium">{f.nextDate}</span>
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-ink-900">{f.done}/{f.total}</p>
                  <div className="w-16 h-1.5 bg-herb-100 rounded-full mt-1 overflow-hidden">
                    <div className="h-full bg-herb-500 rounded-full" style={{ width: `${(f.done / f.total) * 100}%` }} />
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* AI 对话 */}
        <Card>
          <CardHeader className="py-2.5 px-4 flex flex-row items-center gap-1.5">
            <MessageSquare className="h-4 w-4 text-herb-500" />
            <CardTitle className="text-sm">近期AI对话</CardTitle>
          </CardHeader>
          <CardContent className="px-4 pb-3 pt-0 space-y-2">
            {p.recentChats.map((c) => (
              <div key={c.id} className="flex items-center gap-2 p-2 bg-herb-50 rounded-lg border border-herb-100">
                <div className="flex-1 min-w-0">
                  <p className="text-[11px] text-ink-700 truncate">{c.lastMessage}</p>
                </div>
                <span className="text-[10px] text-muted-foreground shrink-0">{c.date}</span>
                <Badge variant="secondary" className="text-[9px] shrink-0">{c.count}条</Badge>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Row 4: 康养服务记录 */}
      <Card>
        <CardHeader className="py-2.5 px-4 flex flex-row items-center gap-1.5">
          <Stethoscope className="h-4 w-4 text-herb-500" />
          <CardTitle className="text-sm">康养服务记录</CardTitle>
          <Button
            size="sm"
            variant="outline"
            className="ml-auto h-7 text-xs gap-1"
            onClick={openNewAppt}
          >
            <Plus className="h-3 w-3" />
            新建预约
          </Button>
        </CardHeader>
        <CardContent className="px-4 pb-3 pt-0">
          {appointments.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-6 text-muted-foreground">
              <Stethoscope className="h-8 w-8 mb-2 opacity-20" />
              <p className="text-xs">暂无康养服务记录</p>
            </div>
          ) : (
            <table className="w-full text-[11px]">
              <thead>
                <tr className="border-b border-border text-muted-foreground">
                  <th className="text-left py-1.5 font-normal">服务</th>
                  <th className="text-left py-1.5 font-normal">医生</th>
                  <th className="text-left py-1.5 font-normal">日期</th>
                  <th className="text-left py-1.5 font-normal">状态</th>
                </tr>
              </thead>
              <tbody>
                {appointments.map((appt) => {
                  const sc = APPT_STATUS_CONFIG[appt.status]
                  const Icon = sc.icon
                  return (
                    <tr key={appt.id} className="border-b border-border/50 last:border-0">
                      <td className="py-1.5 text-ink-700 font-medium">{appt.service?.name || '—'}</td>
                      <td className="py-1.5 text-ink-500">
                        {appt.doctor ? `${appt.doctor.user?.name || ''}${appt.doctor.title ? ` (${appt.doctor.title})` : ''}` : '—'}
                      </td>
                      <td className="py-1.5 text-ink-400 whitespace-nowrap">
                        {formatDate(appt.scheduledDate)} {appt.scheduledTime}
                      </td>
                      <td className="py-1.5">
                        <span className={`inline-flex items-center gap-1 rounded-full px-1.5 py-0.5 text-[10px] font-medium ${sc.className}`}>
                          <Icon className="h-2.5 w-2.5" />
                          {sc.label}
                        </span>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          )}
        </CardContent>
      </Card>

      {/* New Appointment Dialog */}
      <Dialog open={apptNewOpen} onOpenChange={setApptNewOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>新建预约 — {p.name}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label>选择服务 *</Label>
              <Select
                value={apptForm.serviceId}
                onChange={(e) => {
                  const sid = e.target.value
                  setApptForm((f) => ({ ...f, serviceId: sid, doctorId: '' }))
                  loadDoctors(sid)
                }}
              >
                <option value="">— 选择服务 —</option>
                {services.map((s) => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </Select>
            </div>
            {doctors.length > 0 && (
              <div className="space-y-2">
                <Label>选择医生</Label>
                <Select
                  value={apptForm.doctorId}
                  onChange={(e) => setApptForm((f) => ({ ...f, doctorId: e.target.value }))}
                >
                  <option value="">— 不指定医生 —</option>
                  {doctors.map((d) => (
                    <option key={d.id} value={d.id}>{d.user?.name || '—'}{d.title ? ` (${d.title})` : ''}</option>
                  ))}
                </Select>
              </div>
            )}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>预约日期 *</Label>
                <Input type="date" value={apptForm.scheduledDate} onChange={(e) => setApptForm((f) => ({ ...f, scheduledDate: e.target.value }))} />
              </div>
              <div className="space-y-2">
                <Label>预约时间 *</Label>
                <Input type="time" value={apptForm.scheduledTime} onChange={(e) => setApptForm((f) => ({ ...f, scheduledTime: e.target.value }))} />
              </div>
            </div>
            <div className="space-y-2">
              <Label>备注/主诉</Label>
              <Textarea placeholder="患者主诉或备注信息（可选）" value={apptForm.note} onChange={(e) => setApptForm((f) => ({ ...f, note: e.target.value }))} rows={2} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setApptNewOpen(false)}>取消</Button>
            <Button
              onClick={handleCreateAppt}
              disabled={apptSaving || !apptForm.serviceId || !apptForm.scheduledDate}
            >
              {apptSaving ? '创建中...' : '创建预约'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
