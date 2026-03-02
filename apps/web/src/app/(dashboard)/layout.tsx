import Link from 'next/link'
import {
  LayoutDashboard,
  Users,
  CalendarCheck,
  Leaf,
  Calendar,
  FileText,
  Settings,
  Stethoscope,
  LogOut
} from 'lucide-react'

const navItems = [
  { href: '/dashboard', label: '总览', icon: LayoutDashboard },
  { href: '/dashboard/patients', label: '患者管理', icon: Users },
  { href: '/dashboard/followups', label: '随访管理', icon: CalendarCheck },
  { href: '/dashboard/services', label: '康养服务', icon: Leaf },
  { href: '/dashboard/activities', label: '义诊活动', icon: Calendar },
  { href: '/dashboard/contents', label: '健康内容', icon: FileText },
  { href: '/dashboard/settings', label: '系统设置', icon: Settings },
]

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-background ink-texture">
      {/* Sidebar */}
      <aside className="fixed inset-y-0 left-0 z-50 w-64 border-r border-border bg-sidebar">
        <div className="flex h-full flex-col">
          {/* Logo */}
          <div className="flex h-16 items-center gap-3 border-b border-border px-6">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-herb-700 text-white">
              <Stethoscope className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-lg font-bold font-display text-ink-900">智慧康养</h1>
              <p className="text-[10px] text-muted-foreground -mt-0.5">中医康养平台</p>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 space-y-1 p-4">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-ink-600 transition-colors hover:bg-sidebar-accent hover:text-ink-900"
              >
                <item.icon className="h-4.5 w-4.5" />
                {item.label}
              </Link>
            ))}
          </nav>

          {/* User section */}
          <div className="border-t border-border p-4">
            <div className="flex items-center gap-3 rounded-lg px-3 py-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-herb-200 text-herb-700 text-sm font-medium">
                医
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-ink-900 truncate">李明远</p>
                <p className="text-xs text-muted-foreground">主任医师</p>
              </div>
              <button className="text-muted-foreground hover:text-ink-900">
                <LogOut className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <main className="pl-64">
        <div className="p-8">
          {children}
        </div>
      </main>
    </div>
  )
}
