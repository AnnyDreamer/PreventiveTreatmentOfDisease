import { View, Text, ScrollView, Textarea } from '@tarojs/components'
import Taro, { useLoad, useRouter } from '@tarojs/taro'
import { useState } from 'react'
import { serviceApi, appointmentApi, AvailabilitySlot } from '../../services/api'
import './booking.scss'

interface DayItem {
  date: string   // YYYY-MM-DD
  month: number
  day: number
  weekday: string
}

const WEEKDAYS = ['日', '一', '二', '三', '四', '五', '六']

function buildDays(): DayItem[] {
  const days: DayItem[] = []
  for (let i = 0; i < 7; i++) {
    const d = new Date()
    d.setDate(d.getDate() + i)
    days.push({
      date: d.toISOString().slice(0, 10),
      month: d.getMonth() + 1,
      day: d.getDate(),
      weekday: i === 0 ? '今天' : `周${WEEKDAYS[d.getDay()]}`,
    })
  }
  return days
}

// Group slots by doctor
interface DoctorGroup {
  doctorId: string
  doctorName: string
  doctorTitle: string | null
  slots: AvailabilitySlot[]
}

function groupByDoctor(items: AvailabilitySlot[]): DoctorGroup[] {
  const map = new Map<string, DoctorGroup>()
  for (const slot of items) {
    if (!map.has(slot.doctorId)) {
      map.set(slot.doctorId, {
        doctorId: slot.doctorId,
        doctorName: slot.doctorName,
        doctorTitle: slot.doctorTitle,
        slots: [],
      })
    }
    map.get(slot.doctorId)!.slots.push(slot)
  }
  return Array.from(map.values())
}

export default function BookingPage() {
  const router = useRouter()
  const { id: serviceId, name: encodedName } = router.params
  const serviceName = encodedName ? decodeURIComponent(encodedName) : '康养服务'

  const days = buildDays()

  const [selectedDate, setSelectedDate] = useState<string>('')
  const [availabilityLoading, setAvailabilityLoading] = useState(false)
  const [doctorGroups, setDoctorGroups] = useState<DoctorGroup[]>([])
  const [noSlots, setNoSlots] = useState(false)

  const [selectedSlot, setSelectedSlot] = useState<AvailabilitySlot | null>(null)
  const [note, setNote] = useState('')
  const [submitting, setSubmitting] = useState(false)

  useLoad(() => {
    // auto-select today
    handleDateSelect(days[0].date)
  })

  const handleDateSelect = async (date: string) => {
    setSelectedDate(date)
    setSelectedSlot(null)
    setDoctorGroups([])
    setNoSlots(false)

    if (!serviceId) return
    setAvailabilityLoading(true)
    try {
      const res = await serviceApi.getAvailability(serviceId, date)
      const items = res.data?.items || []
      if (items.length === 0) {
        setNoSlots(true)
      } else {
        setDoctorGroups(groupByDoctor(items))
      }
    } catch {
      Taro.showToast({ title: '获取时间槽失败', icon: 'none' })
      setNoSlots(true)
    } finally {
      setAvailabilityLoading(false)
    }
  }

  const handleSubmit = async () => {
    if (!selectedSlot) {
      Taro.showToast({ title: '请先选择时间', icon: 'none' })
      return
    }
    if (!serviceId) return
    setSubmitting(true)
    try {
      await appointmentApi.create({
        serviceId,
        doctorId: selectedSlot.doctorId,
        scheduledDate: selectedDate,
        scheduledTime: selectedSlot.time,
        note: note.trim() || undefined,
      })
      Taro.showToast({ title: '预约成功，等待确认', icon: 'success' })
      setTimeout(() => {
        Taro.navigateBack()
      }, 1500)
    } catch {
      Taro.showToast({ title: '预约失败，请重试', icon: 'none' })
    } finally {
      setSubmitting(false)
    }
  }

  const formatDateLabel = (date: string, time: string) => {
    const d = new Date(date)
    return `${d.getMonth() + 1}/${d.getDate()} ${time}`
  }

  return (
    <View className='booking-page'>
      {/* 服务名称 */}
      <View className='booking-header'>
        <Text className='booking-header__name'>{serviceName}</Text>
        <Text className='booking-header__sub'>选择预约时间</Text>
      </View>

      {/* 日期选择 */}
      <View className='section-card'>
        <Text className='section-title'>选择日期</Text>
        <ScrollView className='date-scroll' scrollX>
          <View className='date-row'>
            {days.map((d) => (
              <View
                key={d.date}
                className={`date-item ${selectedDate === d.date ? 'date-item--active' : ''}`}
                onClick={() => handleDateSelect(d.date)}
              >
                <Text className='date-item__weekday'>{d.weekday}</Text>
                <Text className='date-item__day'>{d.day}</Text>
                <Text className='date-item__month'>{d.month}月</Text>
              </View>
            ))}
          </View>
        </ScrollView>
      </View>

      {/* 时间槽 */}
      <View className='section-card'>
        <Text className='section-title'>选择时间</Text>
        {availabilityLoading ? (
          <View className='slot-empty'>
            <Text className='slot-empty__text'>加载中...</Text>
          </View>
        ) : noSlots ? (
          <View className='slot-empty'>
            <Text className='slot-empty__icon'>📅</Text>
            <Text className='slot-empty__text'>当日暂无可用时间</Text>
          </View>
        ) : (
          doctorGroups.map((group) => (
            <View key={group.doctorId} className='doctor-group'>
              <View className='doctor-group__header'>
                <Text className='doctor-group__name'>{group.doctorName}</Text>
                {group.doctorTitle && (
                  <Text className='doctor-group__title'>{group.doctorTitle}</Text>
                )}
              </View>
              <View className='slot-grid'>
                {group.slots.map((slot) => (
                  <View
                    key={`${slot.doctorId}-${slot.time}`}
                    className={`slot-item ${!slot.available ? 'slot-item--disabled' : ''} ${selectedSlot?.doctorId === slot.doctorId && selectedSlot?.time === slot.time ? 'slot-item--active' : ''}`}
                    onClick={() => {
                      if (slot.available) setSelectedSlot(slot)
                    }}
                  >
                    <Text className='slot-item__time'>{slot.time}</Text>
                    {!slot.available && <Text className='slot-item__unavail'>已约</Text>}
                  </View>
                ))}
              </View>
            </View>
          ))
        )}
      </View>

      {/* 确认信息 & 备注 */}
      {selectedSlot && (
        <View className='section-card'>
          <Text className='section-title'>预约确认</Text>
          <View className='confirm-row'>
            <Text className='confirm-label'>服务</Text>
            <Text className='confirm-value'>{serviceName}</Text>
          </View>
          <View className='confirm-row'>
            <Text className='confirm-label'>医生</Text>
            <Text className='confirm-value'>
              {selectedSlot.doctorName}
              {selectedSlot.doctorTitle ? ` · ${selectedSlot.doctorTitle}` : ''}
            </Text>
          </View>
          <View className='confirm-row'>
            <Text className='confirm-label'>时间</Text>
            <Text className='confirm-value'>{formatDateLabel(selectedDate, selectedSlot.time)}</Text>
          </View>
          <View className='confirm-row confirm-row--note'>
            <Text className='confirm-label'>备注</Text>
            <Textarea
              className='note-input'
              value={note}
              onInput={(e) => setNote(e.detail.value)}
              placeholder='可填写症状或特殊需求（选填）'
              maxlength={200}
            />
          </View>
        </View>
      )}

      {/* 底部占位 */}
      <View style={{ height: '160rpx' }} />

      {/* 底部确认按钮 */}
      <View className='submit-bar'>
        <View
          className={`submit-bar__btn ${!selectedSlot || submitting ? 'submit-bar__btn--disabled' : ''}`}
          onClick={handleSubmit}
        >
          <Text className='submit-bar__btn-text'>
            {submitting ? '提交中...' : '确认预约'}
          </Text>
        </View>
      </View>
    </View>
  )
}
