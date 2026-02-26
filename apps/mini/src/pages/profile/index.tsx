import { View, Text, Image, Button } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { useUserStore } from '../../store'
import './index.scss'

interface MenuItem {
  key: string
  title: string
  icon: string
  path?: string
  action?: () => void
}

export default function ProfilePage() {
  const { userInfo, isLoggedIn, logout } = useUserStore()

  const menuItems: MenuItem[] = [
    {
      key: 'report',
      title: '我的体质报告',
      icon: '📋',
      path: '/pages/result/index',
    },
    {
      key: 'plan',
      title: '我的养生方案',
      icon: '🌿',
      path: '/pages/plan/index',
    },
    {
      key: 'stats',
      title: '健康数据统计',
      icon: '📊',
    },
    {
      key: 'followup',
      title: '随访提醒',
      icon: '🔔',
    },
    {
      key: 'settings',
      title: '设置',
      icon: '⚙️',
    },
  ]

  const handleMenuClick = (item: MenuItem) => {
    if (item.path) {
      Taro.navigateTo({ url: item.path })
    } else {
      Taro.showToast({ title: '功能开发中', icon: 'none' })
    }
  }

  const handleLogin = async () => {
    try {
      const { code } = await Taro.login()
      console.log('wx login code:', code)
      // TODO: 调用后端登录接口
      Taro.showToast({ title: '登录功能开发中', icon: 'none' })
    } catch {
      Taro.showToast({ title: '登录失败', icon: 'none' })
    }
  }

  const handleLogout = () => {
    Taro.showModal({
      title: '提示',
      content: '确定要退出登录吗？',
      success: (res) => {
        if (res.confirm) {
          logout()
          Taro.showToast({ title: '已退出登录', icon: 'none' })
        }
      },
    })
  }

  return (
    <View className='profile-page'>
      {/* 用户信息卡片 */}
      <View className='user-card'>
        <View className='user-avatar-wrap'>
          {userInfo?.avatar ? (
            <Image
              className='user-avatar'
              src={userInfo.avatar}
              mode='aspectFill'
            />
          ) : (
            <View className='user-avatar user-avatar--placeholder'>
              <Text className='avatar-text'>未</Text>
            </View>
          )}
        </View>

        <View className='user-info'>
          {isLoggedIn ? (
            <>
              <Text className='user-name'>
                {userInfo?.nickname || '养生达人'}
              </Text>
              {userInfo?.constitutionName && (
                <View className='constitution-badge'>
                  <Text className='badge-text'>
                    {userInfo.constitutionName}
                  </Text>
                </View>
              )}
            </>
          ) : (
            <View className='login-prompt' onClick={handleLogin}>
              <Text className='login-text'>点击登录</Text>
              <Text className='login-sub'>登录后体验更多功能</Text>
            </View>
          )}
        </View>
      </View>

      {/* 功能列表 */}
      <View className='menu-section'>
        {menuItems.map((item) => (
          <View
            key={item.key}
            className='menu-item'
            onClick={() => handleMenuClick(item)}
          >
            <View className='menu-left'>
              <Text className='menu-icon'>{item.icon}</Text>
              <Text className='menu-title'>{item.title}</Text>
            </View>
            <Text className='menu-arrow'>&gt;</Text>
          </View>
        ))}
      </View>

      {/* 退出登录 */}
      {isLoggedIn && (
        <View className='logout-section'>
          <Button className='logout-btn' onClick={handleLogout}>
            退出登录
          </Button>
        </View>
      )}

      {/* 版本信息 */}
      <View className='version-info'>
        <Text className='version-text'>治未病 v0.1.0</Text>
      </View>
    </View>
  )
}
