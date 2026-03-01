"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  CalendarCheck,
  Clock,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Plus,
} from "lucide-react";

const followupPlans = [
  {
    id: "1",
    patientName: "张伟",
    constitution: "气虚质",
    name: "气虚质调理随访计划",
    startDate: "2026-02-01",
    endDate: "2026-04-01",
    intervalDays: 7,
    totalRecords: 8,
    completedRecords: 3,
    nextDate: "2026-02-28",
    hasRisk: false,
  },
  {
    id: "2",
    patientName: "陈建国",
    constitution: "痰湿质",
    name: "痰湿体质重点随访",
    startDate: "2026-02-10",
    endDate: "2026-05-10",
    intervalDays: 14,
    totalRecords: 6,
    completedRecords: 1,
    nextDate: "2026-02-24",
    hasRisk: true,
  },
];

const recentRecords = [
  {
    id: "1",
    patientName: "张伟",
    date: "2026-02-21",
    status: "COMPLETED" as const,
    riskFlag: false,
    summary:
      "患者睡眠质量较前改善，但仍感乏力。饮食调理依从性良好，建议继续黄芪泡水。",
  },
  {
    id: "2",
    patientName: "陈建国",
    date: "2026-02-24",
    status: "PENDING" as const,
    riskFlag: false,
    summary: null,
  },
  {
    id: "3",
    patientName: "张伟",
    date: "2026-02-14",
    status: "COMPLETED" as const,
    riskFlag: false,
    summary:
      "气虚症状有所缓解，精力较初诊时明显改善。运动方面开始规律散步，每日30分钟。",
  },
  {
    id: "4",
    patientName: "陈建国",
    date: "2026-02-10",
    status: "COMPLETED" as const,
    riskFlag: true,
    summary:
      "体重未见下降，血脂指标偏高。痰湿较重，口中黏腻感明显，建议加强祛湿调理，需关注代谢综合征风险。",
  },
];

const statusConfig = {
  PENDING: {
    label: "待完成",
    icon: Clock,
    color: "text-herb-500",
    bg: "bg-herb-100",
  },
  COMPLETED: {
    label: "已完成",
    icon: CheckCircle2,
    color: "text-celadon-600",
    bg: "bg-celadon-100",
  },
  MISSED: {
    label: "已错过",
    icon: XCircle,
    color: "text-cinnabar-500",
    bg: "bg-cinnabar-100",
  },
  CANCELLED: {
    label: "已取消",
    icon: XCircle,
    color: "text-ink-400",
    bg: "bg-ink-100",
  },
};

export default function FollowupsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold font-display text-ink-900">
            随访管理
          </h1>
          <p className="text-muted-foreground mt-1">管理患者随访计划与记录</p>
        </div>
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          新建随访计划
        </Button>
      </div>

      {/* 随访计划卡片 */}
      <div className="grid gap-4 md:grid-cols-2">
        {followupPlans.map((plan) => (
          <Card key={plan.id} className="card-hover">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CalendarCheck className="h-4 w-4 text-herb-500" />
                  <CardTitle className="text-base">{plan.name}</CardTitle>
                </div>
                {plan.hasRisk && (
                  <Badge variant="danger" className="gap-1">
                    <AlertTriangle className="h-3 w-3" />
                    有风险
                  </Badge>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">患者</span>
                <span className="font-medium text-ink-900">
                  {plan.patientName}（{plan.constitution}）
                </span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">周期</span>
                <span>
                  {plan.startDate} ~ {plan.endDate}
                </span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">频率</span>
                <span>每 {plan.intervalDays} 天</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">下次随访</span>
                <span className="text-herb-600 font-medium">
                  {plan.nextDate}
                </span>
              </div>
              {/* 进度条 */}
              <div>
                <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
                  <span>完成进度</span>
                  <span>
                    {plan.completedRecords}/{plan.totalRecords}
                  </span>
                </div>
                <div className="h-2 bg-herb-50 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-celadon-500 rounded-full transition-all"
                    style={{
                      width: `${(plan.completedRecords / plan.totalRecords) * 100}%`,
                    }}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* 近期随访记录 */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">随访记录</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {recentRecords.map((record) => {
            const config = statusConfig[record.status];
            const StatusIcon = config.icon;
            return (
              <div
                key={record.id}
                className="flex gap-4 py-3 border-b border-border last:border-0"
              >
                <div
                  className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${config.bg}`}
                >
                  <StatusIcon className={`h-5 w-5 ${config.color}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-sm text-ink-900">
                      {record.patientName}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {record.date}
                    </span>
                    <Badge
                      variant={
                        record.status === "COMPLETED" ? "success" : "secondary"
                      }
                      className="text-xs"
                    >
                      {config.label}
                    </Badge>
                    {record.riskFlag && (
                      <Badge variant="danger" className="text-xs gap-1">
                        <AlertTriangle className="h-2.5 w-2.5" />
                        风险
                      </Badge>
                    )}
                  </div>
                  {record.summary && (
                    <p className="text-sm text-ink-500 mt-1 line-clamp-2">
                      {record.summary}
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </CardContent>
      </Card>
    </div>
  );
}
