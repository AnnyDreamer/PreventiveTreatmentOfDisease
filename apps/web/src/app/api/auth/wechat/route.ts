import { NextRequest } from 'next/server'
import { prisma } from '@zhiwebing/db'
import { signToken } from '@/lib/auth'
import { successResponse, errorResponse } from '@/lib/api-response'
import { z } from 'zod'

const wechatLoginSchema = z.object({
  code: z.string().min(1, '缺少微信授权码'),
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const parsed = wechatLoginSchema.safeParse(body)

    if (!parsed.success) {
      return errorResponse(parsed.error.errors[0].message)
    }

    const { code } = parsed.data

    // 调用微信 code2session 接口
    const appId = process.env.WECHAT_APP_ID
    const appSecret = process.env.WECHAT_APP_SECRET

    if (!appId || !appSecret) {
      // Demo 模式：模拟微信登录
      const mockOpenid = `mock_openid_${code}`
      let user = await prisma.user.findUnique({
        where: { openid: mockOpenid },
      })

      if (!user) {
        user = await prisma.user.create({
          data: {
            openid: mockOpenid,
            role: 'PATIENT',
            name: '微信用户',
            patientProfile: {
              create: {},
            },
          },
        })
      }

      const token = await signToken({
        userId: user.id,
        role: user.role as 'PATIENT' | 'DOCTOR' | 'ADMIN',
      })

      return successResponse({ token, user: { id: user.id, name: user.name, role: user.role } })
    }

    // 正式微信登录流程
    const wxRes = await fetch(
      `https://api.weixin.qq.com/sns/jscode2session?appid=${appId}&secret=${appSecret}&js_code=${code}&grant_type=authorization_code`
    )
    const wxData = await wxRes.json()

    if (wxData.errcode) {
      return errorResponse(`微信登录失败: ${wxData.errmsg}`)
    }

    const { openid, unionid } = wxData

    let user = await prisma.user.findUnique({
      where: { openid },
    })

    if (!user) {
      user = await prisma.user.create({
        data: {
          openid,
          unionid,
          role: 'PATIENT',
          patientProfile: {
            create: {},
          },
        },
      })
    }

    const token = await signToken({
      userId: user.id,
      role: user.role as 'PATIENT' | 'DOCTOR' | 'ADMIN',
    })

    return successResponse({ token, user: { id: user.id, name: user.name, role: user.role } })
  } catch (error) {
    console.error('WeChat login error:', error)
    return errorResponse('微信登录失败', 500)
  }
}
