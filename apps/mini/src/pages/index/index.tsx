import { View, Text, Image } from '@tarojs/components'
import Taro, { useDidShow } from '@tarojs/taro'
import { useState } from 'react'
import { useUserStore } from '../../store'
import { assessmentApi } from '../../services/api'
import type { AssessmentResult } from '../../services/api'
import './index.scss'

// 节气养生数据
const SEASONAL_TIPS = [
  { key: 'spring', season: '春', tip: '春养肝，宜疏肝理气', emoji: '🌿' },
  { key: 'summer', season: '夏', tip: '夏养心，宜清心降火', emoji: '☀️' },
  { key: 'autumn', season: '秋', tip: '秋养肺，宜润肺生津', emoji: '🍂' },
  { key: 'winter', season: '冬', tip: '冬养肾，宜温补固本', emoji: '❄️' },
]

function getCurrentSeason() {
  const month = new Date().getMonth() + 1
  if (month >= 3 && month <= 5) return 0
  if (month >= 6 && month <= 8) return 1
  if (month >= 9 && month <= 11) return 2
  return 3
}

const coreServices = [
  { title: '体质辨识', icon: '辨', desc: '九种体质测评', path: '/pages/assessment/index' },
  { title: '养生方案', icon: '方', desc: '个性化调养', path: '/pages/plan/index' },
  { title: 'AI问诊', icon: '诊', desc: '智能健康咨询', path: '/pages/chat/index', isTab: true },
  { title: '健康日记', icon: '记', desc: '每日健康打卡', path: '/pages/diary/index', isTab: true },
]

const wellnessEntries = [
  { title: '药膳食谱', icon: '膳', desc: '食疗养生', path: '/pages/content/index?type=DIET_THERAPY' },
  { title: '康养服务', icon: '灸', desc: '艾灸推拿针灸', path: '/pages/wellness/index' },
  { title: '节气养生', icon: '节', desc: '顺时调养', path: '/pages/solar-term/index' },
  { title: '义诊活动', icon: '义', desc: '免费义诊', path: '/pages/activity/index' },
]

export default function IndexPage() {
  const { userInfo, isLoggedIn } = useUserStore()
  const [result, setResult] = useState<AssessmentResult | null>(null)
  const [hasAssessment, setHasAssessment] = useState(false)
  const seasonTip = SEASONAL_TIPS[getCurrentSeason()]

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

  const handleServiceClick = (item: { path?: string; isTab?: boolean }) => {
    if (!item.path) {
      Taro.showToast({ title: '敬请期待', icon: 'none' })
      return
    }
    if (item.isTab) {
      Taro.switchTab({ url: item.path })
    } else {
      Taro.navigateTo({ url: item.path })
    }
  }

  return (
    <View className='index-page'>
      {/* 顶部问候 */}
      <View className='header'>
        <View className='header-left'>
          <Text className='greeting'>{getGreeting()}</Text>
          <Text className='nickname'>{userInfo?.nickname || '养生达人'}</Text>
        </View>
        <View className='avatar-wrap'>
          {userInfo?.avatar ? (
            <Image className='avatar' src={userInfo.avatar} mode='aspectFill' />
          ) : (
            <View className='avatar avatar-placeholder'>
              <Text className='avatar-text'>
                {(userInfo?.nickname || '养')[0]}
              </Text>
            </View>
          )}
        </View>
      </View>

      {/* 节气提示条 */}
      <View className='season-tip'>
        <Text className='season-tip__emoji'>{seasonTip.emoji}</Text>
        <Text className='season-tip__text'>
          {seasonTip.season}季 · {seasonTip.tip}
        </Text>
      </View>

      {/* 体质评估卡片 */}
      {!hasAssessment ? (
        <View
          className='assess-card assess-card--empty'
          onClick={() => Taro.navigateTo({ url: '/pages/assessment/index' })}
        >
          <View className='assess-card__left'>
            <Text className='assess-card__title'>了解你的体质</Text>
            <Text className='assess-card__desc'>
              完成中医九种体质测评，获取个性化养生建议
            </Text>
            <View className='assess-card__btn'>
              <Text className='assess-card__btn-text'>开始测评</Text>
            </View>
          </View>
          <View className='assess-card__icon-wrap'>
            <Text className='assess-card__icon-char'>辨</Text>
          </View>
        </View>
      ) : (
        <View
          className='assess-card assess-card--result'
          onClick={() => Taro.navigateTo({ url: '/pages/result/index' })}
        >
          <View className='result-top'>
            <View>
              <Text className='result-label'>我的体质</Text>
              <Text className='result-name'>{result?.primaryName || '平和质'}</Text>
            </View>
            <View className='result-score-wrap'>
              <Text className='result-score'>{result?.primaryScore || 0}</Text>
              <Text className='result-score-unit'>分</Text>
            </View>
          </View>
          <View className='result-divider' />
          <View className='result-bottom'>
            <View className='result-tags'>
              {(result?.features || []).slice(0, 3).map((feat, idx) => (
                <View key={idx} className='result-tag'>
                  <Text className='result-tag__text'>{feat}</Text>
                </View>
              ))}
            </View>
            <View className='result-more'>
              <Text className='result-more__text'>详情 ›</Text>
            </View>
          </View>
        </View>
      )}

      {/* 今日打卡 */}
      <View
        className='checkin-bar'
        onClick={() => Taro.switchTab({ url: '/pages/diary/index' })}
      >
        <View className='checkin-bar__left'>
          <Text className='checkin-bar__icon'>📝</Text>
          <Text className='checkin-bar__text'>今日健康打卡</Text>
        </View>
        <Text className='checkin-bar__arrow'>›</Text>
      </View>

      {/* 核心服务 */}
      <View className='section'>
        <Text className='section__title'>核心服务</Text>
        <View className='svc-grid'>
          {coreServices.map((svc) => (
            <View
              key={svc.title}
              className='svc-item'
              onClick={() => handleServiceClick(svc)}
            >
              <View className='svc-item__icon'>
                <Text className='svc-item__icon-char'>{svc.icon}</Text>
              </View>
              <Text className='svc-item__title'>{svc.title}</Text>
              <Text className='svc-item__desc'>{svc.desc}</Text>
            </View>
          ))}
        </View>
      </View>

      {/* 养生天地 */}
      <View className='section'>
        <Text className='section__title'>养生天地</Text>
        <View className='svc-grid'>
          {wellnessEntries.map((entry) => (
            <View
              key={entry.title}
              className='svc-item'
              onClick={() => handleServiceClick(entry)}
            >
              <View className='svc-item__icon'>
                <Text className='svc-item__icon-char'>{entry.icon}</Text>
              </View>
              <Text className='svc-item__title'>{entry.title}</Text>
              <Text className='svc-item__desc'>{entry.desc}</Text>
            </View>
          ))}
        </View>
      </View>

      <View className='footer-space' />
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
