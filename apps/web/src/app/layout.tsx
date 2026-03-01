import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: '智慧中医康养平台',
  description: '基于中医体质辨识的AI智能健康管理系统',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="zh-CN">
      <body>{children}</body>
    </html>
  )
}
