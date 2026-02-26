import Taro from '@tarojs/taro'

const BASE_URL = TARO_APP_API_BASE_URL

interface RequestOptions {
  url: string
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH'
  data?: Record<string, unknown> | unknown[]
  header?: Record<string, string>
  showLoading?: boolean
  showError?: boolean
}

interface ApiResponse<T = unknown> {
  code: number
  message: string
  data: T
}

function getToken(): string | null {
  try {
    return Taro.getStorageSync('token') || null
  } catch {
    return null
  }
}

export async function request<T = unknown>(
  options: RequestOptions
): Promise<ApiResponse<T>> {
  const {
    url,
    method = 'GET',
    data,
    header = {},
    showLoading = false,
    showError = true,
  } = options

  if (showLoading) {
    Taro.showLoading({ title: '加载中...', mask: true })
  }

  const token = getToken()
  const requestHeader: Record<string, string> = {
    'Content-Type': 'application/json',
    ...header,
  }

  if (token) {
    requestHeader['Authorization'] = `Bearer ${token}`
  }

  try {
    const response = await Taro.request<ApiResponse<T>>({
      url: `${BASE_URL}${url}`,
      method,
      data,
      header: requestHeader,
      timeout: 15000,
    })

    if (showLoading) {
      Taro.hideLoading()
    }

    const { statusCode } = response
    const result = response.data

    // 401 未授权 -> 清除 token 并跳转登录
    if (statusCode === 401) {
      Taro.removeStorageSync('token')
      Taro.removeStorageSync('userInfo')
      Taro.showToast({ title: '登录已过期，请重新登录', icon: 'none' })
      return Promise.reject(new Error('Unauthorized'))
    }

    // 非 2xx 状态码
    if (statusCode < 200 || statusCode >= 300) {
      if (showError) {
        Taro.showToast({
          title: result?.message || '请求失败',
          icon: 'none',
        })
      }
      return Promise.reject(new Error(result?.message || `HTTP ${statusCode}`))
    }

    // 业务错误码
    if (result.code !== 0 && result.code !== 200) {
      if (showError) {
        Taro.showToast({ title: result.message || '操作失败', icon: 'none' })
      }
      return Promise.reject(new Error(result.message))
    }

    return result
  } catch (err) {
    if (showLoading) {
      Taro.hideLoading()
    }

    if (showError) {
      Taro.showToast({ title: '网络异常，请稍后重试', icon: 'none' })
    }

    return Promise.reject(err)
  }
}

/** GET 请求 */
export function get<T = unknown>(
  url: string,
  data?: Record<string, unknown>,
  options?: Partial<RequestOptions>
) {
  return request<T>({ url, method: 'GET', data, ...options })
}

/** POST 请求 */
export function post<T = unknown>(
  url: string,
  data?: Record<string, unknown> | unknown[],
  options?: Partial<RequestOptions>
) {
  return request<T>({ url, method: 'POST', data, ...options })
}

/** PUT 请求 */
export function put<T = unknown>(
  url: string,
  data?: Record<string, unknown>,
  options?: Partial<RequestOptions>
) {
  return request<T>({ url, method: 'PUT', data, ...options })
}

/** DELETE 请求 */
export function del<T = unknown>(
  url: string,
  data?: Record<string, unknown>,
  options?: Partial<RequestOptions>
) {
  return request<T>({ url, method: 'DELETE', data, ...options })
}
