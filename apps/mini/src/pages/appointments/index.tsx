import { View, Text } from '@tarojs/components'
import Taro, { useLoad } from '@tarojs/taro'
import { useState } from 'react'
import { appointmentApi, MyAppointment } from '../../services/api'
import './index.scss'

const TABS = [
  { key: '', label: '全部' },
  { key: 'PENDING', label: '待确认' },
  { key: 'CONFIRMED', label: '已确认' },
  { key: 'COMPLETED', label: '已完成' },
]

const STATUS_CONFIG: Record<string, { label: string; cls: string }> = {
  PENDING:   { label: '待确认', cls: 'status--pending' },
  CONFIRMED: { label: '已确认', cls: 'status--confirmed' },
  COMPLETED: { label: '已完成', cls: 'status--completed' },
  CANCELLED: { label: '已取消', cls: 'status--cancelled' },
  NO_SHOW:   { label: '未到诊', cls: 'status--noshow' },
}

function formatDateTime(date: string, time: string): string {
  const d = new Date(date)
  return `${d.getMonth() + 1}/${d.getDate()} ${time}`
}

export default function AppointmentsPage() {
  const [activeTab, setActiveTab] = useState('')
  const [appointments, setAppointments] = useState<MyAppointment[]>([])
  const [loading, setLoading] = useState(false)

  useLoad(() => {
    fetchAppointments('')
  })

  const fetchAppointments = async (status: string) => {
    setLoading(true)
    try {
      const res = await appointmentApi.getMine(status || undefined)
      setAppointments(res.data?.items || [])
    } catch {
      setAppointments([])
      Taro.showToast({ title: '加载失败', icon: 'none' })
    } finally {
      setLoading(false)
    }
  }

  const handleTabChange = (key: string) => {
    setActiveTab(key)
    fetchAppointments(key)
  }

  return (
    <View className='appointments-page'>
      {/* Tab 栏 */}
      <View className='tab-bar'>
        {TABS.map((tab) => (
          <View
            key={tab.key}
            className={`tab-bar__item ${activeTab === tab.key ? 'tab-bar__item--active' : ''}`}
            onClick={() => handleTabChange(tab.key)}
          >
            <Text className='tab-bar__label'>{tab.label}</Text>
          </View>
        ))}
      </View>

      {/* 列表 */}
      <View className='appt-list'>
        {loading ? (
          <View className='empty-state'>
            <Text className='empty-state__text'>加载中...</Text>
          </View>
        ) : appointments.length === 0 ? (
          <View className='empty-state'>
            <Text className='empty-state__icon'>📅</Text>
            <Text className='empty-state__text'>暂无预约记录</Text>
            <View
              className='empty-state__btn'
              onClick={() => Taro.navigateTo({ url: '/pages/wellness/index' })}
            >
              <Text className='empty-state__btn-text'>去预约</Text>
            </View>
          </View>
        ) : (
          appointments.map((appt) => {
            const statusCfg = STATUS_CONFIG[appt.status] || { label: appt.status, cls: 'status--cancelled' }
            return (
              <View key={appt.id} className='appt-card'>
                <View className='appt-card__header'>
                  <Text className='appt-card__service'>{appt.service.name}</Text>
                  <View className={`appt-status ${statusCfg.cls}`}>
                    <Text className='appt-status__text'>{statusCfg.label}</Text>
                  </View>
                </View>
                <View className='appt-card__row'>
                  <Text className='appt-card__label'>医生</Text>
                  <Text className='appt-card__value'>
                    {appt.doctor
                      ? `${appt.doctor.user.name || '—'}${appt.doctor.title ? ` · ${appt.doctor.title}` : ''}`
                      : '待分配'}
                  </Text>
                </View>
                <View className='appt-card__row'>
                  <Text className='appt-card__label'>时间</Text>
                  <Text className='appt-card__value'>
                    {formatDateTime(appt.scheduledDate, appt.scheduledTime)}
                  </Text>
                </View>
                {appt.note && (
                  <View className='appt-card__row'>
                    <Text className='appt-card__label'>备注</Text>
                    <Text className='appt-card__value appt-card__value--note'>{appt.note}</Text>
                  </View>
                )}
              </View>
            )
          })
        )}
      </View>
    </View>
  )
}
