import { NextRequest } from 'next/server'
import { prisma } from '@zhiwebing/db'
import { verifyToken } from '@/lib/auth'
import { successResponse, errorResponse, unauthorizedResponse, notFoundResponse } from '@/lib/api-response'

// GET /api/chat/[sessionId] - 获取某个会话的所有消息
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ sessionId: string }> }
) {
  try {
    const token = request.headers.get('Authorization')?.replace('Bearer ', '')
    if (!token) return unauthorizedResponse()

    const payload = await verifyToken(token)
    if (!payload) return unauthorizedResponse()

    const { sessionId } = await params

    // 验证 session 属于当前用户
    const session = await prisma.chatSession.findFirst({
      where: {
        id: sessionId,
        userId: payload.userId,
      },
    })

    if (!session) {
      return notFoundResponse('会话')
    }

    const messages = await prisma.chatMessage.findMany({
      where: { sessionId },
      orderBy: { createdAt: 'asc' },
    })

    return successResponse({
      session: {
        id: session.id,
        title: session.title,
        createdAt: session.createdAt,
        updatedAt: session.updatedAt,
      },
      messages,
    })
  } catch (error) {
    console.error('Get chat messages error:', error)
    return errorResponse('获取会话消息失败', 500)
  }
}
