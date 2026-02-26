import { View, Text, Image } from '@tarojs/components'
import Taro, { useDidShow } from '@tarojs/taro'
import { useState } from 'react'
import { useUserStore } from '../../store'
import { assessmentApi } from '../../services/api'
import type { AssessmentResult } from '../../services/api'
import './index.scss'

export default function IndexPage() {
  const { userInfo, isLoggedIn } = useUserStore()
  const [result, setResult] = useState<AssessmentResult | null>(null)
  const [hasAssessment, setHasAssessment] = useState(false)

  useDidShow(() => {
    if (isLoggedIn) {
      fetchLatestResult()
    }
  })

  const fetchLatestResult = async () => {
    try {
      const res = await assessmentApi.getAssessmentResult()
      setResult(res.data)
      setHasAssessment(true)
    } catch {
      setHasAssessment(false)
    }
  }

  const navigateTo = (url: string) => {
    Taro.navigateTo({ url })
  }

  const quickEntries = [
    { title: '养生方案', icon: '🌿', path: '/pages/plan/index' },
    { title: '健康日记', icon: '📖', path: '/pages/diary/index', isTab: true },
    { title: 'AI 助手', icon: '🤖', path: '/pages/chat/index', isTab: true },
  ]

  return (
    <View className='index-page'>
      {/* 顶部欢迎区 */}
      <View className='header'>
        <View className='header-info'>
          <Text className='greeting'>
            {getGreeting()}，{userInfo?.nickname || '养生达人'}
          </Text>
          <Text className='sub-text'>愿您身心康泰</Text>
        </View>
        <View className='avatar-wrap'>
          {userInfo?.avatar ? (
            <Image className='avatar' src={userInfo.avatar} mode='aspectFill' />
          ) : (
            <View className='avatar avatar-placeholder'>
              <Text className='avatar-text'>未</Text>
            </View>
          )}
        </View>
      </View>

      {/* 体质评估卡片 */}
      {!hasAssessment ? (
        <View
          className='assessment-card assessment-card--empty'
          onClick={() => navigateTo('/pages/assessment/index')}
        >
          <View className='assessment-card__icon'>
            <Text className='icon-text'>辨</Text>
          </View>
          <View className='assessment-card__content'>
            <Text className='assessment-card__title'>开始体质评估</Text>
            <Text className='assessment-card__desc'>
              通过中医九种体质辨识，了解您的体质特征，获取个性化养生方案
            </Text>
          </View>
          <View className='assessment-card__arrow'>
            <Text className='arrow'>&gt;</Text>
          </View>
        </View>
      ) : (
        <View
          className='assessment-card assessment-card--result'
          onClick={() => navigateTo('/pages/result/index')}
        >
          <View className='result-header'>
            <View className='result-type'>
              <Text className='result-type__name'>
                {result?.primaryName || '平和质'}
              </Text>
              <Text className='result-type__score'>
                {result?.primaryScore || 0}分
              </Text>
            </View>
            <View className='result-badge'>
              <Text className='badge-text'>查看详情</Text>
            </View>
          </View>
          <View className='result-features'>
            {(result?.features || []).slice(0, 3).map((feat, idx) => (
              <View key={idx} className='feature-tag'>
                <Text className='feature-text'>{feat}</Text>
              </View>
            ))}
          </View>
        </View>
      )}

      {/* 今日打卡提醒 */}
      <View className='reminder-bar'>
        <View className='reminder-dot' />
        <Text className='reminder-text'>今日健康打卡尚未完成</Text>
        <Text
          className='reminder-action'
          onClick={() =>
            Taro.switchTab({ url: '/pages/diary/index' })
          }
        >
          去打卡
        </Text>
      </View>

      {/* 快捷入口 */}
      <View className='section'>
        <Text className='section-title'>快捷服务</Text>
        <View className='quick-grid'>
          {quickEntries.map((entry) => (
            <View
              key={entry.title}
              className='quick-item'
              onClick={() =>
                entry.isTab
                  ? Taro.switchTab({ url: entry.path })
                  : navigateTo(entry.path)
              }
            >
              <View className='quick-icon'>
                <Text>{entry.icon}</Text>
              </View>
              <Text className='quick-title'>{entry.title}</Text>
            </View>
          ))}
        </View>
      </View>
    </View>
  )
}

function getGreeting(): string {
  const hour = new Date().getHours()
  if (hour < 6) return '夜深了'
  if (hour < 9) return '早安'
  if (hour < 12) return '上午好'
  if (hour < 14) return '中午好'
  if (hour < 18) return '下午好'
  return '晚上好'
}
