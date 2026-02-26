import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Hospital, User, Bell, Shield } from 'lucide-react'

export default function SettingsPage() {
  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="text-2xl font-bold font-display text-ink-900">系统设置</h1>
        <p className="text-muted-foreground mt-1">管理平台配置和个人信息</p>
      </div>

      {/* 机构信息 */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Hospital className="h-5 w-5 text-herb-500" />
            <CardTitle className="text-lg">机构信息</CardTitle>
          </div>
          <CardDescription>当前关联的医院信息</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-ink-700">医院名称</label>
              <Input value="北京中医药大学附属医院" disabled className="mt-1" />
            </div>
            <div>
              <label className="text-sm font-medium text-ink-700">医院等级</label>
              <Input value="三级甲等" disabled className="mt-1" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 个人信息 */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <User className="h-5 w-5 text-herb-500" />
            <CardTitle className="text-lg">个人信息</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-ink-700">姓名</label>
              <Input value="李明远" className="mt-1" />
            </div>
            <div>
              <label className="text-sm font-medium text-ink-700">职称</label>
              <Input value="主任医师" className="mt-1" />
            </div>
            <div>
              <label className="text-sm font-medium text-ink-700">科室</label>
              <Input value="治未病科" className="mt-1" />
            </div>
            <div>
              <label className="text-sm font-medium text-ink-700">手机号</label>
              <Input value="13800000001" className="mt-1" />
            </div>
          </div>
          <Button>保存修改</Button>
        </CardContent>
      </Card>

      {/* 通知设置 */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Bell className="h-5 w-5 text-herb-500" />
            <CardTitle className="text-lg">通知设置</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {[
            { label: '患者完成体质评估通知', desc: '当患者完成新的体质评估时通知' },
            { label: '高风险预警通知', desc: '当患者出现高风险标记时立即通知' },
            { label: '随访到期提醒', desc: '随访计划到期前1天发送提醒' },
            { label: '患者日记异常提醒', desc: '当患者日记记录出现异常指标时通知' },
          ].map((item) => (
            <div key={item.label} className="flex items-center justify-between py-2">
              <div>
                <p className="text-sm font-medium text-ink-900">{item.label}</p>
                <p className="text-xs text-muted-foreground">{item.desc}</p>
              </div>
              <label className="relative inline-flex cursor-pointer items-center">
                <input type="checkbox" defaultChecked className="sr-only peer" />
                <div className="h-6 w-11 rounded-full bg-ink-200 peer-checked:bg-celadon-500 after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:h-5 after:w-5 after:rounded-full after:bg-white after:transition-all peer-checked:after:translate-x-full" />
              </label>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* AI 设置 */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-herb-500" />
            <CardTitle className="text-lg">AI 功能配置</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-sm font-medium text-ink-700">AI 模型</label>
            <Input value="通义千问 (qwen-plus)" disabled className="mt-1" />
            <p className="text-xs text-muted-foreground mt-1">当前使用的大语言模型</p>
          </div>
          <div>
            <label className="text-sm font-medium text-ink-700">API 状态</label>
            <div className="flex items-center gap-2 mt-1">
              <div className="h-2 w-2 rounded-full bg-celadon-500" />
              <span className="text-sm text-celadon-600">正常连接</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
