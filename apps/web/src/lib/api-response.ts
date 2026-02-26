import { NextResponse } from 'next/server'
import type { ApiResponse } from '@zhiwebing/shared'

export function successResponse<T>(data: T, message?: string): NextResponse<ApiResponse<T>> {
  return NextResponse.json({
    success: true,
    data,
    message,
  })
}

export function errorResponse(error: string, status: number = 400): NextResponse<ApiResponse> {
  return NextResponse.json(
    {
      success: false,
      error,
    },
    { status }
  )
}

export function unauthorizedResponse(): NextResponse<ApiResponse> {
  return errorResponse('未授权访问', 401)
}

export function forbiddenResponse(): NextResponse<ApiResponse> {
  return errorResponse('无权限执行此操作', 403)
}

export function notFoundResponse(resource: string = '资源'): NextResponse<ApiResponse> {
  return errorResponse(`${resource}不存在`, 404)
}
