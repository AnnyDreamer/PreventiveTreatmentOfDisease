import { View, Text } from '@tarojs/components'
import Taro, { useLoad } from '@tarojs/taro'
import { useState } from 'react'
import { activityApi } from '../../services/api'
import './index.scss'

interface Activity {
  id: string
  title: string
  department: string | null
  startTime: string
  endTime: string
  capacity: number
  currentCount: number
  status: string
  coverImage: string | null
  location: string
}

const STATUS_TABS = [
  { key: 'PUBLISHED', label: '报名中' },
  { key: 'ONGOING', label: '进行中' },
  { key: 'ENDED', label: '已结束' },
]

function formatDate(dateStr: string) {
  const d = new Date(dateStr)
  return `${d.getMonth() + 1}月${d.getDate()}日 ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`
}

export default function ActivityListPage() {
  const [activeTab, setActiveTab] = useState('PUBLISHED')
  const [activities, setActivities] = useState<Activity[]>([])
  const [loading, setLoading] = useState(false)

  useLoad(() => {
    fetchActivities('PUBLISHED')
  })

  const fetchActivities = async (status: string) => {
    setLoading(true)
    try {
      const res = await activityApi.getList(status)
      setActivities(res.data?.items || [])
    } catch {
      setActivities([])
    } finally {
      setLoading(false)
    }
  }

  const handleTabChange = (key: string) => {
    setActiveTab(key)
    fetchActivities(key)
  }

  const getCapacityPercent = (current: number, capacity: number) =>
    Math.min(100, Math.round((current / capacity) * 100))

  return (
    <View className='activity-page'>
      {/* 状态 Tab */}
      <View className='status-tabs'>
        {STATUS_TABS.map((tab) => (
          <View
            key={tab.key}
            className={`status-tab ${activeTab === tab.key ? 'status-tab--active' : ''}`}
            onClick={() => handleTabChange(tab.key)}
          >
            <Text className='status-tab__text'>{tab.label}</Text>
            <View className='status-tab__indicator' />
          </View>
        ))}
      </View>

      {/* 活动列表 */}
      <View className='activity-list'>
        {loading ? (
          <View className='empty-state'>
            <Text className='empty-state__text'>加载中...</Text>
          </View>
        ) : activities.length === 0 ? (
          <View className='empty-state'>
            <Text className='empty-state__icon'>🏥</Text>
            <Text className='empty-state__text'>暂无活动</Text>
          </View>
        ) : (
          activities.map((act) => {
            const pct = getCapacityPercent(act.currentCount, act.capacity)
            const isFull = act.currentCount >= act.capacity
            return (
              <View
                key={act.id}
                className='activity-card'
                onClick={() => Taro.navigateTo({ url: `/pages/activity/detail?id=${act.id}` })}
              >
                <View className='activity-card__cover'>
                  <Text className='activity-card__cover-placeholder'>🏥</Text>
                </View>
                <View className='activity-card__body'>
                  <View className='activity-card__tags'>
                    {act.department && (
                      <Text className='activity-card__dept'>{act.department}</Text>
                    )}
                  </View>
                  <Text className='activity-card__title'>{act.title}</Text>
                  <View className='activity-card__meta'>
                    <View className='activity-card__meta-row'>
                      <Text className='activity-card__meta-icon'>🕐</Text>
                      <Text className='activity-card__meta-text'>{formatDate(act.startTime)}</Text>
                    </View>
                    <View className='activity-card__meta-row'>
                      <Text className='activity-card__meta-icon'>📍</Text>
                      <Text className='activity-card__meta-text'>{act.location}</Text>
                    </View>
                  </View>
                  <View className='capacity-bar'>
                    <View className='capacity-bar__label'>
                      <Text className='capacity-bar__text'>剩余名额</Text>
                      <Text className='capacity-bar__count'>
                        {isFull ? '已满' : `${act.capacity - act.currentCount}/${act.capacity}`}
                      </Text>
                    </View>
                    <View className='capacity-bar__track'>
                      <View
                        className={`capacity-bar__fill ${isFull ? 'capacity-bar__fill--full' : ''}`}
                        style={{ width: `${pct}%` }}
                      />
                    </View>
                  </View>
                </View>
              </View>
            )
          })
        )}
      </View>
    </View>
  )
}
