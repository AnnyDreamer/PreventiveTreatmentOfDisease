'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Avatar } from '@/components/ui/avatar'
import { Search, Filter, ChevronRight } from 'lucide-react'
import Link from 'next/link'

// Demo 数据
const patients = [
  {
    id: '1', name: '张伟', phone: '138****1234', gender: '男', age: 45,
    constitution: '气虚质', riskLevel: 'MEDIUM' as const,
    lastVisit: '2026-02-23', diaryStreak: 12, status: '活跃',
  },
  {
    id: '2', name: '刘芳', phone: '139****5678', gender: '女', age: 38,
    constitution: '阴虚质', riskLevel: 'LOW' as const,
    lastVisit: '2026-02-22', diaryStreak: 28, status: '活跃',
  },
  {
    id: '3', name: '陈建国', phone: '137****9012', gender: '男', age: 52,
    constitution: '痰湿质', riskLevel: 'HIGH' as const,
    lastVisit: '2026-02-20', diaryStreak: 3, status: '待随访',
  },
  {
    id: '4', name: '赵雪梅', phone: '136****3456', gender: '女', age: 41,
    constitution: '血瘀质', riskLevel: 'MEDIUM' as const,
    lastVisit: '2026-02-18', diaryStreak: 7, status: '活跃',
  },
  {
    id: '5', name: '孙浩然', phone: '135****7890', gender: '男', age: 33,
    constitution: '平和质', riskLevel: 'LOW' as const,
    lastVisit: '2026-02-15', diaryStreak: 0, status: '不活跃',
  },
]

const riskConfig = {
  LOW: { label: '低风险', variant: 'success' as const },
  MEDIUM: { label: '中风险', variant: 'warning' as const },
  HIGH: { label: '高风险', variant: 'danger' as const },
  CRITICAL: { label: '极高风险', variant: 'destructive' as const },
}

const constitutionFilters = [
  '全部', '平和质', '气虚质', '阳虚质', '阴虚质',
  '痰湿质', '湿热质', '血瘀质', '气郁质', '特禀质'
]

export default function PatientsPage() {
  const [search, setSearch] = useState('')
  const [selectedConstitution, setSelectedConstitution] = useState('全部')

  const filtered = patients.filter(p => {
    const matchSearch = !search || p.name.includes(search) || p.phone.includes(search)
    const matchConstitution = selectedConstitution === '全部' || p.constitution === selectedConstitution
    return matchSearch && matchConstitution
  })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold font-display text-ink-900">患者管理</h1>
          <p className="text-muted-foreground mt-1">共 {patients.length} 名在管患者</p>
        </div>
      </div>

      {/* 搜索和筛选 */}
      <div className="space-y-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="搜索患者姓名或手机号..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          <Filter className="h-4 w-4 text-muted-foreground mt-2" />
          {constitutionFilters.map((f) => (
            <Button
              key={f}
              variant={selectedConstitution === f ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedConstitution(f)}
              className="text-xs"
            >
              {f}
            </Button>
          ))}
        </div>
      </div>

      {/* 患者列表 */}
      <div className="space-y-3">
        {filtered.map((patient) => (
          <Link key={patient.id} href={`/dashboard/patients/${patient.id}`}>
            <Card className="card-hover cursor-pointer">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <Avatar
                      fallback={patient.name}
                      size="lg"
                    />
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-medium text-ink-900">{patient.name}</h3>
                        <span className="text-xs text-muted-foreground">
                          {patient.gender} · {patient.age}岁
                        </span>
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="secondary" className="text-xs">
                          {patient.constitution}
                        </Badge>
                        <Badge variant={riskConfig[patient.riskLevel].variant} className="text-xs">
                          {riskConfig[patient.riskLevel].label}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        最近就诊: {patient.lastVisit} · 连续打卡 {patient.diaryStreak} 天
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      patient.status === '活跃' ? 'bg-celadon-100 text-celadon-700' :
                      patient.status === '待随访' ? 'bg-amber-100 text-amber-600' :
                      'bg-ink-100 text-ink-500'
                    }`}>
                      {patient.status}
                    </span>
                    <ChevronRight className="h-4 w-4 text-muted-foreground" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  )
}
