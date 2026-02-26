import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Users,
  Activity,
  CalendarCheck,
  AlertTriangle,
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react'

const stats = [
  {
    title: '在管患者',
    value: '1,284',
    change: '+12.5%',
    trend: 'up' as const,
    icon: Users,
    description: '较上月',
  },
  {
    title: '本月评估',
    value: '156',
    change: '+8.2%',
    trend: 'up' as const,
    icon: Activity,
    description: '较上月',
  },
  {
    title: '待随访',
    value: '38',
    change: '-5.1%',
    trend: 'down' as const,
    icon: CalendarCheck,
    description: '较上月',
  },
  {
    title: '高风险患者',
    value: '12',
    change: '+2',
    trend: 'up' as const,
    icon: AlertTriangle,
    description: '需关注',
  },
]

const constitutionDistribution = [
  { type: '平和质', count: 312, percentage: 24.3, color: 'bg-celadon-500' },
  { type: '气虚质', count: 198, percentage: 15.4, color: 'bg-herb-400' },
  { type: '阳虚质', count: 167, percentage: 13.0, color: 'bg-amber-400' },
  { type: '阴虚质', count: 156, percentage: 12.1, color: 'bg-cinnabar-400' },
  { type: '痰湿质', count: 143, percentage: 11.1, color: 'bg-ink-400' },
  { type: '湿热质', count: 112, percentage: 8.7, color: 'bg-amber-600' },
  { type: '血瘀质', count: 89, percentage: 6.9, color: 'bg-cinnabar-600' },
  { type: '气郁质', count: 72, percentage: 5.6, color: 'bg-ink-500' },
  { type: '特禀质', count: 35, percentage: 2.7, color: 'bg-herb-300' },
]

const recentPatients = [
  { name: '张伟', constitution: '气虚质', risk: 'MEDIUM' as const, lastVisit: '2026-02-23', status: '活跃' },
  { name: '刘芳', constitution: '阴虚质', risk: 'LOW' as const, lastVisit: '2026-02-22', status: '活跃' },
  { name: '陈建国', constitution: '痰湿质', risk: 'HIGH' as const, lastVisit: '2026-02-20', status: '待随访' },
  { name: '赵雪梅', constitution: '血瘀质', risk: 'MEDIUM' as const, lastVisit: '2026-02-18', status: '活跃' },
  { name: '孙浩然', constitution: '平和质', risk: 'LOW' as const, lastVisit: '2026-02-15', status: '不活跃' },
]

const riskBadgeVariant = {
  LOW: 'success' as const,
  MEDIUM: 'warning' as const,
  HIGH: 'danger' as const,
  CRITICAL: 'destructive' as const,
}

const riskLabel = {
  LOW: '低风险',
  MEDIUM: '中风险',
  HIGH: '高风险',
  CRITICAL: '极高风险',
}

export default function DashboardPage() {
  return (
    <div className="space-y-8">
      {/* Page header */}
      <div>
        <h1 className="text-2xl font-bold font-display text-ink-900">工作台总览</h1>
        <p className="text-muted-foreground mt-1">欢迎回来，李明远医师。以下是您的患者管理概况。</p>
      </div>

      {/* Stats cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, i) => (
          <Card key={stat.title} className={`card-hover animate-fade-in stagger-${i + 1} opacity-0`}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-herb-100">
                  <stat.icon className="h-5 w-5 text-herb-600" />
                </div>
                <div className={`flex items-center gap-1 text-xs font-medium ${
                  stat.trend === 'up' ? 'text-celadon-600' : 'text-cinnabar-500'
                }`}>
                  {stat.change}
                  {stat.trend === 'up' ? (
                    <ArrowUpRight className="h-3 w-3" />
                  ) : (
                    <ArrowDownRight className="h-3 w-3" />
                  )}
                </div>
              </div>
              <div className="mt-4">
                <p className="text-2xl font-bold text-ink-900">{stat.value}</p>
                <p className="text-xs text-muted-foreground mt-1">{stat.title} · {stat.description}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-5">
        {/* Constitution distribution */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-lg">体质分布</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {constitutionDistribution.map((item) => (
              <div key={item.type} className="flex items-center gap-3">
                <span className="text-sm text-ink-600 w-16 shrink-0">{item.type}</span>
                <div className="flex-1 h-6 bg-herb-50 rounded-full overflow-hidden">
                  <div
                    className={`h-full ${item.color} rounded-full transition-all duration-1000`}
                    style={{ width: `${item.percentage}%` }}
                  />
                </div>
                <span className="text-xs text-muted-foreground w-16 text-right">
                  {item.count}人 ({item.percentage}%)
                </span>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Recent patients */}
        <Card className="lg:col-span-3">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg">近期患者动态</CardTitle>
            <a href="/dashboard/patients" className="text-sm text-herb-600 hover:text-herb-700 flex items-center gap-1">
              查看全部 <TrendingUp className="h-3 w-3" />
            </a>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentPatients.map((patient) => (
                <div key={patient.name} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-herb-100 text-herb-700 text-sm font-medium">
                      {patient.name.charAt(0)}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-ink-900">{patient.name}</p>
                      <p className="text-xs text-muted-foreground">{patient.constitution}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge variant={riskBadgeVariant[patient.risk]}>
                      {riskLabel[patient.risk]}
                    </Badge>
                    <span className="text-xs text-muted-foreground">{patient.lastVisit}</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
