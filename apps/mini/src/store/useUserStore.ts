import { create } from 'zustand'
import Taro from '@tarojs/taro'

interface UserInfo {
  id: string
  nickname: string
  avatar: string
  phone?: string
  constitutionType?: string
  constitutionName?: string
}

interface UserState {
  token: string | null
  userInfo: UserInfo | null
  isLoggedIn: boolean

  login: (token: string, userInfo: UserInfo) => void
  logout: () => void
  setUserInfo: (userInfo: Partial<UserInfo>) => void
  loadFromStorage: () => void
}

export const useUserStore = create<UserState>((set, get) => ({
  token: null,
  userInfo: null,
  isLoggedIn: false,

  login: (token: string, userInfo: UserInfo) => {
    Taro.setStorageSync('token', token)
    Taro.setStorageSync('userInfo', JSON.stringify(userInfo))
    set({ token, userInfo, isLoggedIn: true })
  },

  logout: () => {
    Taro.removeStorageSync('token')
    Taro.removeStorageSync('userInfo')
    set({ token: null, userInfo: null, isLoggedIn: false })
  },

  setUserInfo: (partial: Partial<UserInfo>) => {
    const current = get().userInfo
    if (current) {
      const updated = { ...current, ...partial }
      Taro.setStorageSync('userInfo', JSON.stringify(updated))
      set({ userInfo: updated })
    }
  },

  loadFromStorage: () => {
    try {
      const token = Taro.getStorageSync('token')
      const raw = Taro.getStorageSync('userInfo')
      if (token && raw) {
        const userInfo = JSON.parse(raw) as UserInfo
        set({ token, userInfo, isLoggedIn: true })
      }
    } catch {
      // storage read failed, ignore
    }
  },
}))
