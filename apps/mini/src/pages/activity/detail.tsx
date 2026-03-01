import { View, Text } from '@tarojs/components'
import Taro, { useLoad, useRouter } from '@tarojs/taro'
import { useState } from 'react'
import { activityApi } from '../../services/api'
import './detail.scss'

interface ActivityDetail {
  id: string
  title: string
  description: string
  location: string
  department: string | null
  startTime: string
  endTime: string
  capacity: number
  currentCount: number
  status: string
  targetConstitutions: string[] | null
  tags: string[] | null
  isRegistered: boolean
  hospital: { name: string; address: string | null }
  publisher: {
    title: string | null
    department: string | null
    user: { name: string | null }
  } | null
}

const CONSTITUTION_NAMES: Record<string, string> = {
  BALANCED: '平和质', QI_DEFICIENCY: '气虚质', YANG_DEFICIENCY: '阳虚质',
  YIN_DEFICIENCY: '阴虚质', PHLEGM_DAMPNESS: '痰湿质', DAMP_HEAT: '湿热质',
  BLOOD_STASIS: '血瘀质', QI_STAGNATION: '气郁质', SPECIAL: '特禀质',
}

const STATUS_LABELS: Record<string, string> = {
  PUBLISHED: '报名中', ONGOING: '进行中', ENDED: '已结束', CANCELLED: '已取消',
}

function formatDateTime(dateStr: string) {
  const d = new Date(dateStr)
  return `${d.getFullYear()}年${d.getMonth() + 1}月${d.getDate()}日 ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`
}

export default function ActivityDetailPage() {
  const router = useRouter()
  const { id } = router.params
  const [activity, setActivity] = useState<ActivityDetail | null>(null)
  const [loading, setLoading] = useState(false)

  useLoad(() => {
    if (id) {
      activityApi.getDetail(id).then((res) => {
        if (res.data) setActivity(res.data)
      }).catch(() => {
        Taro.showToast({ title: '加载失败', icon: 'none' })
      })
    }
  })

  const handleRegister = async () => {
    if (!activity) return
    if (loading) return

    if (activity.isRegistered) {
      const confirmed = await new Promise<boolean>((resolve) => {
        Taro.showModal({
          title: '取消报名',
          content: '确定要取消报名吗？',
          success: (res) => resolve(res.confirm),
        })
      })
      if (!confirmed) return
      setLoading(true)
      try {
        await activityApi.cancelRegister(activity.id)
        setActivity({ ...activity, isRegistered: false, currentCount: activity.currentCount - 1 })
        Taro.showToast({ title: '已取消报名', icon: 'success' })
      } catch {
        Taro.showToast({ title: '操作失败', icon: 'none' })
      } finally {
        setLoading(false)
      }
    } else {
      setLoading(true)
      try {
        await activityApi.register(activity.id)
        setActivity({ ...activity, isRegistered: true, currentCount: activity.currentCount + 1 })
        Taro.showToast({ title: '报名成功', icon: 'success' })
      } catch {
        Taro.showToast({ title: '报名失败，请重试', icon: 'none' })
      } finally {
        setLoading(false)
      }
    }
  }

  if (!activity) {
    return (
      <View style={{ display: 'flex', justifyContent: 'center', padding: '80px' }}>
        <Text style={{ color: '#9ca3af' }}>加载中...</Text>
      </View>
    )
  }

  const isFull = activity.currentCount >= activity.capacity
  const pct = Math.min(100, Math.round((activity.currentCount / activity.capacity) * 100))
  const canRegister = activity.status === 'PUBLISHED' && !isFull

  return (
    <View className='activity-detail'>
      {/* 封面 */}
      <View className='activity-cover'>
        <Text className='activity-cover__placeholder'>🏥</Text>
      </View>

      <View className='detail-body'>
        {/* 标签行 */}
        <View className='detail-tags'>
          {activity.department && (
            <Text className='detail-tag detail-tag--dept'>{activity.department}</Text>
          )}
          <Text className={`detail-tag detail-tag--status-${activity.status}`}>
            {STATUS_LABELS[activity.status] || activity.status}
          </Text>
        </View>

        {/* 标题 */}
        <Text className='detail-title'>{activity.title}</Text>

        {/* 基本信息 */}
        <View className='detail-info-card'>
          <View className='info-row'>
            <Text className='info-icon'>🕐</Text>
            <View className='info-content'>
              <Text className='info-label'>活动时间</Text>
              <Text className='info-value'>
                {formatDateTime(activity.startTime)} — {formatDateTime(activity.endTime)}
              </Text>
            </View>
          </View>
          <View className='info-row'>
            <Text className='info-icon'>📍</Text>
            <View className='info-content'>
              <Text className='info-label'>活动地点</Text>
              <Text className='info-value'>{activity.location}</Text>
            </View>
          </View>
          {activity.publisher && (
            <View className='info-row'>
              <Text className='info-icon'>👨‍⚕️</Text>
              <View className='info-content'>
                <Text className='info-label'>主办医生</Text>
                <Text className='info-value'>
                  {activity.publisher.user.name}{activity.publisher.title ? ` · ${activity.publisher.title}` : ''}
                </Text>
              </View>
            </View>
          )}
        </View>

        {/* 名额进度 */}
        <View className='section-card capacity-section'>
          <View className='capacity-bar__label'>
            <Text className='capacity-bar__text'>报名名额</Text>
            <Text className='capacity-bar__count'>
              {isFull ? '已满' : `${activity.currentCount} / ${activity.capacity}`}
            </Text>
          </View>
          <View className='capacity-bar__track'>
            <View
              className={`capacity-bar__fill ${isFull ? 'capacity-bar__fill--full' : ''}`}
              style={{ width: `${pct}%` }}
            />
          </View>
        </View>

        {/* 活动详情 */}
        <View className='section-card'>
          <Text className='section-title'>活动详情</Text>
          <Text className='detail-desc'>{activity.description}</Text>
        </View>

        {/* 适合体质 */}
        {activity.targetConstitutions && activity.targetConstitutions.length > 0 && (
          <View className='section-card'>
            <Text className='section-title'>适合人群</Text>
            <View className='constitution-tags'>
              {activity.targetConstitutions.map((c) => (
                <Text key={c} className='constitution-tag'>
                  {CONSTITUTION_NAMES[c] || c}
                </Text>
              ))}
            </View>
          </View>
        )}
      </View>

      {/* 底部报名按钮 */}
      {activity.status !== 'ENDED' && activity.status !== 'CANCELLED' && (
        <View className='bottom-bar'>
          <View
            className={`register-btn ${
              activity.isRegistered
                ? 'register-btn--registered'
                : canRegister
                  ? 'register-btn--active'
                  : 'register-btn--disabled'
            }`}
            onClick={canRegister || activity.isRegistered ? handleRegister : undefined}
          >
            <Text>
              {activity.isRegistered
                ? '✓ 已报名（点击取消）'
                : isFull
                  ? '名额已满'
                  : '立即报名'}
            </Text>
          </View>
        </View>
      )}
    </View>
  )
}
