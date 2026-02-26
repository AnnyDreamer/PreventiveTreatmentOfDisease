import { View, Text } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { useState, useEffect } from 'react'
import './index.scss'

interface TabItem {
  pagePath: string
  text: string
  icon: string
  activeIcon: string
}

const TAB_LIST: TabItem[] = [
  {
    pagePath: '/pages/index/index',
    text: '首页',
    icon: '首',
    activeIcon: '首',
  },
  {
    pagePath: '/pages/diary/index',
    text: '日记',
    icon: '记',
    activeIcon: '记',
  },
  {
    pagePath: '/pages/chat/index',
    text: '助手',
    icon: '助',
    activeIcon: '助',
  },
  {
    pagePath: '/pages/profile/index',
    text: '我的',
    icon: '我',
    activeIcon: '我',
  },
]

interface TabBarProps {
  current?: number
}

export default function TabBar({ current = 0 }: TabBarProps) {
  const [activeIndex, setActiveIndex] = useState(current)

  useEffect(() => {
    setActiveIndex(current)
  }, [current])

  const handleTabClick = (index: number) => {
    if (index === activeIndex) return
    setActiveIndex(index)
    Taro.switchTab({ url: TAB_LIST[index].pagePath })
  }

  return (
    <View className='custom-tab-bar'>
      {TAB_LIST.map((tab, index) => {
        const isActive = index === activeIndex
        return (
          <View
            key={tab.pagePath}
            className={`tab-bar-item ${isActive ? 'tab-bar-item--active' : ''}`}
            onClick={() => handleTabClick(index)}
          >
            <View className={`tab-icon ${isActive ? 'tab-icon--active' : ''}`}>
              <Text className='tab-icon-text'>
                {isActive ? tab.activeIcon : tab.icon}
              </Text>
            </View>
            <Text className={`tab-label ${isActive ? 'tab-label--active' : ''}`}>
              {tab.text}
            </Text>
          </View>
        )
      })}
    </View>
  )
}
