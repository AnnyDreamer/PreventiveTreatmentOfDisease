import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  transpilePackages: ['@zhiwebing/shared', '@zhiwebing/db'],
}

export default nextConfig
