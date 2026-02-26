import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: '治未病 · 慢病管理平台',
  description: '基于中医体质辨识的智能慢病管理系统',
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
