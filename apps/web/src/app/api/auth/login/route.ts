import { NextRequest } from 'next/server'
import { prisma } from '@zhiwebing/db'
import { signToken } from '@/lib/auth'
import { successResponse, errorResponse } from '@/lib/api-response'
import { z } from 'zod'

const loginSchema = z.object({
  phone: z.string().regex(/^1\d{10}$/, '手机号格式不正确'),
  password: z.string().min(6, '密码至少6位'),
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const parsed = loginSchema.safeParse(body)

    if (!parsed.success) {
      return errorResponse(parsed.error.errors[0].message)
    }

    const { phone } = parsed.data

    // Demo 阶段：简化认证，只要手机号存在即可登录
    const user = await prisma.user.findUnique({
      where: { phone },
      include: {
        doctorProfile: true,
        patientProfile: true,
      },
    })

    if (!user) {
      return errorResponse('用户不存在', 404)
    }

    const token = await signToken({
      userId: user.id,
      role: user.role as 'PATIENT' | 'DOCTOR' | 'ADMIN',
    })

    const response = successResponse({
      token,
      user: {
        id: user.id,
        name: user.name,
        avatar: user.avatar,
        role: user.role,
        phone: user.phone,
      },
    })

    response.cookies.set('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: '/',
    })

    return response
  } catch (error) {
    console.error('Login error:', error)
    return errorResponse('登录失败，请稍后重试', 500)
  }
}
