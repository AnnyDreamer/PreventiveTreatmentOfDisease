import { View, Text, Image } from '@tarojs/components'
import Taro, { useDidShow } from '@tarojs/taro'
import { useState } from 'react'
import { useUserStore } from '../../store'
import { assessmentApi } from '../../services/api'
import type { AssessmentResult } from '../../services/api'
import './index.scss'

// 节气养生数据
const SEASONAL_TIPS = [
  { key: 'spring', season: '春', tip: '春养肝，宜疏肝理气', desc: '多食青色蔬菜，保持心情舒畅' },
  { key: 'summer', season: '夏', tip: '夏养心，宜清心降火', desc: '饮食清淡，适当午休养心' },
  { key: 'autumn', season: '秋', tip: '秋养肺，宜润肺生津', desc: '多食白色食物，注意保湿润燥' },
  { key: 'winter', season: '冬', tip: '冬养肾，宜温补固本', desc: '早睡晚起，温补为主' },
]

function getCurrentSeason() {
  const month = new Date().getMonth() + 1
  if (month >= 3 && month <= 5) return 0
  if (month >= 6 && month <= 8) return 1
  if (month >= 9 && month <= 11) return 2
  return 3
}

const coreServices = [
  { title: '体质辨识', icon: '辨', desc: '九种体质测评', theme: 'herb', path: '/pages/assessment/index' },
  { title: '养生方案', icon: '方', desc: '个性化调养', theme: 'celadon', path: '/pages/plan/index' },
  { title: 'AI问诊', icon: '诊', desc: '智能健康咨询', theme: 'cinnabar', path: '/pages/chat/index', isTab: true },
  { title: '健康日记', icon: '记', desc: '每日健康打卡', theme: 'blue', path: '/pages/diary/index', isTab: true },
]

const wellnessEntries = [
  { title: '药膳食谱', icon: '膳', desc: '食疗养生', theme: 'amber', path: '/pages/plan/index' },
  { title: '穴位养生', icon: '灸', desc: '经络调理', theme: 'purple', path: '/pages/plan/index' },
  { title: '四季养生', icon: '节', desc: '顺时调养', theme: 'celadon' },
  { title: '养生常识', icon: '知', desc: '健康百科', theme: 'herb' },
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
      {/* 顶部 Banner */}
      <View className='banner'>
        <View className='banner-deco' />
        <View className='banner-content'>
          <View className='banner-left'>
            <Text className='greeting'>{getGreeting()}</Text>
            <Text className='nickname'>{userInfo?.nickname || '养生达人'}</Text>
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
      </View>

      {/* 体质评估卡片 */}
      {!hasAssessment ? (
        <View
          className='assess-card assess-card--empty'
          onClick={() => Taro.navigateTo({ url: '/pages/assessment/index' })}
        >
          <View className='assess-card__badge'>
            <Text className='assess-card__badge-text'>辨</Text>
          </View>
          <View className='assess-card__body'>
            <Text className='assess-card__title'>开始体质评估</Text>
            <Text className='assess-card__desc'>
              通过中医九种体质辨识，了解您的体质特征
            </Text>
          </View>
          <Text className='assess-card__arrow'>›</Text>
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

      {/* 打卡提醒 */}
      <View
        className='checkin-bar'
        onClick={() => Taro.switchTab({ url: '/pages/diary/index' })}
      >
        <View className='checkin-bar__stamp'>
          <Text className='checkin-bar__stamp-text'>卯</Text>
        </View>
        <View className='checkin-bar__body'>
          <Text className='checkin-bar__title'>今日健康打卡</Text>
          <Text className='checkin-bar__desc'>记录身体状态，积累健康数据</Text>
        </View>
        <Text className='checkin-bar__action'>去打卡 ›</Text>
      </View>

      {/* 核心服务 */}
      <View className='section'>
        <View className='section-header'>
          <View className='section-header__line' />
          <Text className='section-header__title'>核心服务</Text>
          <View className='section-header__line' />
        </View>
        <View className='svc-grid'>
          {coreServices.map((svc) => (
            <View
              key={svc.title}
              className='svc-item'
              onClick={() => handleServiceClick(svc)}
            >
              <View className={`svc-item__icon svc-item__icon--${svc.theme}`}>
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
        <View className='section-header'>
          <View className='section-header__line' />
          <Text className='section-header__title'>养生天地</Text>
          <View className='section-header__line' />
        </View>
        <View className='svc-grid'>
          {wellnessEntries.map((entry) => (
            <View
              key={entry.title}
              className='svc-item'
              onClick={() => handleServiceClick(entry)}
            >
              <View className={`svc-item__icon svc-item__icon--${entry.theme}`}>
                <Text className='svc-item__icon-char'>{entry.icon}</Text>
              </View>
              <Text className='svc-item__title'>{entry.title}</Text>
              <Text className='svc-item__desc'>{entry.desc}</Text>
            </View>
          ))}
        </View>
      </View>

      {/* 时令养生 */}
      <View className={`seasonal-card seasonal-card--${seasonTip.key}`}>
        <View className='seasonal-card__header'>
          <View className={`seasonal-card__seal seasonal-card__seal--${seasonTip.key}`}>
            <Text className='seasonal-card__seal-text'>{seasonTip.season}</Text>
          </View>
          <View className='seasonal-card__info'>
            <Text className='seasonal-card__title'>{seasonTip.tip}</Text>
            <Text className='seasonal-card__desc'>{seasonTip.desc}</Text>
          </View>
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
