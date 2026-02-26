import Link from 'next/link'

export default function HomePage() {
  return (
    <div className="min-h-screen ink-texture flex flex-col items-center justify-center p-8">
      <div className="max-w-2xl text-center space-y-8 animate-fade-in">
        <div className="space-y-3">
          <h1 className="text-5xl font-bold tracking-tight text-ink-900">
            治未病
          </h1>
          <p className="text-lg text-herb-600 font-display">
            上工治未病，中工治欲病，下工治已病
          </p>
        </div>

        <p className="text-ink-500 text-lg leading-relaxed">
          基于中医体质辨识的智能慢病管理平台，融合传统中医智慧与现代AI技术，
          为患者提供个性化健康管理方案。
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
          <Link
            href="/dashboard"
            className="inline-flex items-center justify-center px-8 py-3 rounded-lg bg-herb-700 text-white font-medium hover:bg-herb-800 transition-colors"
          >
            进入医生工作台
          </Link>
          <Link
            href="/login"
            className="inline-flex items-center justify-center px-8 py-3 rounded-lg border border-herb-300 text-herb-700 font-medium hover:bg-herb-50 transition-colors"
          >
            登录
          </Link>
        </div>
      </div>
    </div>
  )
}
