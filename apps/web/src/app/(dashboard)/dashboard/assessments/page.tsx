'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

const assessments = [
  {
    id: '1', patientName: '张伟', date: '2026-02-23',
    primaryType: '气虚质', score: 68.8,
    secondaryTypes: ['阳虚质'],
    riskLevel: 'MEDIUM' as const,
  },
  {
    id: '2', patientName: '刘芳', date: '2026-02-22',
    primaryType: '阴虚质', score: 62.5,
    secondaryTypes: [],
    riskLevel: 'LOW' as const,
  },
  {
    id: '3', patientName: '陈建国', date: '2026-02-20',
    primaryType: '痰湿质', score: 75.0,
    secondaryTypes: ['湿热质', '气虚质'],
    riskLevel: 'HIGH' as const,
  },
  {
    id: '4', patientName: '赵雪梅', date: '2026-02-18',
    primaryType: '血瘀质', score: 58.9,
    secondaryTypes: ['气郁质'],
    riskLevel: 'MEDIUM' as const,
  },
  {
    id: '5', patientName: '孙浩然', date: '2026-02-15',
    primaryType: '平和质', score: 72.5,
    secondaryTypes: [],
    riskLevel: 'LOW' as const,
  },
]

const typeColor: Record<string, string> = {
  '平和质': 'bg-celadon-100 text-celadon-700',
  '气虚质': 'bg-herb-100 text-herb-700',
  '阳虚质': 'bg-amber-100 text-amber-600',
  '阴虚质': 'bg-cinnabar-100 text-cinnabar-600',
  '痰湿质': 'bg-ink-100 text-ink-600',
  '湿热质': 'bg-amber-100 text-amber-600',
  '血瘀质': 'bg-cinnabar-100 text-cinnabar-700',
  '气郁质': 'bg-ink-100 text-ink-500',
  '特禀质': 'bg-herb-100 text-herb-600',
}

const riskBadge = {
  LOW: { label: '低风险', variant: 'success' as const },
  MEDIUM: { label: '中风险', variant: 'warning' as const },
  HIGH: { label: '高风险', variant: 'danger' as const },
  CRITICAL: { label: '极高风险', variant: 'destructive' as const },
}

export default function AssessmentsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold font-display text-ink-900">体质评估记录</h1>
        <p className="text-muted-foreground mt-1">查看所有患者的中医体质辨识结果</p>
      </div>

      <div className="grid gap-4">
        {assessments.map((a) => (
          <Card key={a.id} className="card-hover cursor-pointer">
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-herb-100 text-herb-700 font-display text-lg font-bold">
                    {a.primaryType.charAt(0)}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-medium text-ink-900">{a.patientName}</h3>
                      <span className="text-xs text-muted-foreground">{a.date}</span>
                    </div>
                    <div className="flex items-center gap-2 mt-1.5">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${typeColor[a.primaryType] || 'bg-ink-100 text-ink-600'}`}>
                        {a.primaryType}
                      </span>
                      {a.secondaryTypes.map((t) => (
                        <span key={t} className={`text-xs px-2 py-0.5 rounded-full ${typeColor[t] || 'bg-ink-100 text-ink-600'}`}>
                          {t}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="text-right flex items-center gap-4">
                  <div>
                    <p className="text-2xl font-bold text-ink-900">{a.score}</p>
                    <p className="text-xs text-muted-foreground">转化分</p>
                  </div>
                  <Badge variant={riskBadge[a.riskLevel].variant}>
                    {riskBadge[a.riskLevel].label}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
