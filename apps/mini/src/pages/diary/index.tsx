import { View, Text, Slider, Input, Textarea, Button } from '@tarojs/components'
import Taro, { useDidShow } from '@tarojs/taro'
import { useState, useCallback } from 'react'
import { diaryApi } from '../../services/api'
import './index.scss'

const WEEKDAYS = ['日', '一', '二', '三', '四', '五', '六']

const MOOD_OPTIONS = [
  { value: 1, emoji: '😞', label: '很差' },
  { value: 2, emoji: '😕', label: '较差' },
  { value: 3, emoji: '😐', label: '一般' },
  { value: 4, emoji: '🙂', label: '较好' },
  { value: 5, emoji: '😄', label: '很好' },
]

const EXERCISE_TYPES = ['散步', '跑步', '太极拳', '八段锦', '瑜伽', '游泳', '骑行', '其他']

const COMMON_SYMPTOMS = [
  '头痛', '头晕', '失眠', '疲乏', '腰酸', '胃胀',
  '便秘', '腹泻', '口干', '盗汗', '心悸', '食欲差',
  '咳嗽', '鼻塞', '眼干', '耳鸣',
]

export default function DiaryPage() {
  const today = new Date()
  const [currentYear, setCurrentYear] = useState(today.getFullYear())
  const [currentMonth, setCurrentMonth] = useState(today.getMonth() + 1)
  const [checkedDates, setCheckedDates] = useState<number[]>([])
  const [streakDays, setStreakDays] = useState(0)

  // 表单状态
  const [sleepHours, setSleepHours] = useState(7)
  const [sleepQuality, setSleepQuality] = useState(3)
  const [mood, setMood] = useState(3)
  const [exerciseMinutes, setExerciseMinutes] = useState(30)
  const [exerciseType, setExerciseType] = useState('')
  const [diet, setDiet] = useState('')
  const [symptoms, setSymptoms] = useState<string[]>([])
  const [notes, setNotes] = useState('')

  useDidShow(() => {
    fetchEntries()
  })

  const fetchEntries = async () => {
    try {
      const monthStr = `${currentYear}-${String(currentMonth).padStart(2, '0')}`
      const res = await diaryApi.getEntries(monthStr)
      const dates = res.data.map((e) => new Date(e.date).getDate())
      setCheckedDates(dates)

      const statsRes = await diaryApi.getStats()
      setStreakDays(statsRes.data.streakDays)
    } catch {
      // ignore
    }
  }

  const toggleSymptom = useCallback(
    (symptom: string) => {
      setSymptoms((prev) =>
        prev.includes(symptom)
          ? prev.filter((s) => s !== symptom)
          : [...prev, symptom]
      )
    },
    []
  )

  const handleSubmit = async () => {
    const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`

    try {
      await diaryApi.createEntry({
        date: todayStr,
        sleepHours,
        sleepQuality,
        mood,
        exerciseMinutes,
        exerciseType,
        diet,
        symptoms,
        notes,
      })
      Taro.showToast({ title: '打卡成功！', icon: 'success' })
      fetchEntries()
    } catch {
      // 错误已在 request 中处理
    }
  }

  const changeMonth = (delta: number) => {
    let newMonth = currentMonth + delta
    let newYear = currentYear
    if (newMonth > 12) {
      newMonth = 1
      newYear += 1
    } else if (newMonth < 1) {
      newMonth = 12
      newYear -= 1
    }
    setCurrentMonth(newMonth)
    setCurrentYear(newYear)
  }

  // 日历网格
  const daysInMonth = new Date(currentYear, currentMonth, 0).getDate()
  const firstDayOfWeek = new Date(currentYear, currentMonth - 1, 1).getDay()
  const calendarDays: Array<number | null> = []
  for (let i = 0; i < firstDayOfWeek; i++) {
    calendarDays.push(null)
  }
  for (let d = 1; d <= daysInMonth; d++) {
    calendarDays.push(d)
  }

  return (
    <View className='diary-page'>
      {/* 月份选择 + 日历 */}
      <View className='calendar-section card'>
        <View className='month-header'>
          <Text className='month-arrow' onClick={() => changeMonth(-1)}>
            &lt;
          </Text>
          <Text className='month-title'>
            {currentYear}年{currentMonth}月
          </Text>
          <Text className='month-arrow' onClick={() => changeMonth(1)}>
            &gt;
          </Text>
        </View>

        <View className='weekday-row'>
          {WEEKDAYS.map((d) => (
            <View key={d} className='weekday-cell'>
              <Text className='weekday-text'>{d}</Text>
            </View>
          ))}
        </View>

        <View className='days-grid'>
          {calendarDays.map((day, idx) => (
            <View
              key={idx}
              className={`day-cell ${
                day && checkedDates.includes(day) ? 'day-cell--checked' : ''
              } ${
                day === today.getDate() &&
                currentMonth === today.getMonth() + 1 &&
                currentYear === today.getFullYear()
                  ? 'day-cell--today'
                  : ''
              }`}
            >
              <Text className='day-text'>{day || ''}</Text>
              {day && checkedDates.includes(day) && (
                <View className='check-dot' />
              )}
            </View>
          ))}
        </View>
      </View>

      {/* 今日记录表单 */}
      <View className='form-section'>
        <Text className='form-title'>今日记录</Text>

        {/* 睡眠 */}
        <View className='form-group card'>
          <Text className='group-label'>睡眠时长</Text>
          <View className='slider-row'>
            <Slider
              className='slider'
              min={0}
              max={12}
              step={0.5}
              value={sleepHours}
              activeColor='#8b5a2b'
              backgroundColor='#ede0cc'
              onChange={(e) => setSleepHours(e.detail.value)}
            />
            <Text className='slider-value'>{sleepHours}h</Text>
          </View>

          <Text className='group-label'>睡眠质量</Text>
          <View className='star-row'>
            {[1, 2, 3, 4, 5].map((s) => (
              <Text
                key={s}
                className={`star ${s <= sleepQuality ? 'star--active' : ''}`}
                onClick={() => setSleepQuality(s)}
              >
                ★
              </Text>
            ))}
          </View>
        </View>

        {/* 情绪 */}
        <View className='form-group card'>
          <Text className='group-label'>今日情绪</Text>
          <View className='mood-row'>
            {MOOD_OPTIONS.map((m) => (
              <View
                key={m.value}
                className={`mood-item ${
                  mood === m.value ? 'mood-item--active' : ''
                }`}
                onClick={() => setMood(m.value)}
              >
                <Text className='mood-emoji'>{m.emoji}</Text>
                <Text className='mood-label'>{m.label}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* 运动 */}
        <View className='form-group card'>
          <Text className='group-label'>运动时长</Text>
          <View className='slider-row'>
            <Slider
              className='slider'
              min={0}
              max={180}
              step={5}
              value={exerciseMinutes}
              activeColor='#2d9a64'
              backgroundColor='#ede0cc'
              onChange={(e) => setExerciseMinutes(e.detail.value)}
            />
            <Text className='slider-value'>{exerciseMinutes}分钟</Text>
          </View>

          <Text className='group-label'>运动类型</Text>
          <View className='type-tags'>
            {EXERCISE_TYPES.map((t) => (
              <View
                key={t}
                className={`type-tag ${
                  exerciseType === t ? 'type-tag--active' : ''
                }`}
                onClick={() => setExerciseType(t)}
              >
                <Text className='type-tag-text'>{t}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* 饮食 */}
        <View className='form-group card'>
          <Text className='group-label'>饮食记录</Text>
          <Textarea
            className='textarea'
            placeholder='记录今日饮食情况...'
            value={diet}
            onInput={(e) => setDiet(e.detail.value)}
            maxlength={500}
            autoHeight
          />
        </View>

        {/* 症状 */}
        <View className='form-group card'>
          <Text className='group-label'>身体症状</Text>
          <View className='symptom-tags'>
            {COMMON_SYMPTOMS.map((s) => (
              <View
                key={s}
                className={`symptom-tag ${
                  symptoms.includes(s) ? 'symptom-tag--active' : ''
                }`}
                onClick={() => toggleSymptom(s)}
              >
                <Text className='symptom-tag-text'>{s}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* 备注 */}
        <View className='form-group card'>
          <Text className='group-label'>备注</Text>
          <Input
            className='input'
            placeholder='其他需要记录的...'
            value={notes}
            onInput={(e) => setNotes(e.detail.value)}
          />
        </View>

        {/* 提交 */}
        <Button className='btn-primary submit-btn' onClick={handleSubmit}>
          完成今日打卡
        </Button>
      </View>

      {/* 连续打卡 */}
      <View className='streak-bar'>
        <Text className='streak-text'>
          已连续打卡 <Text className='streak-num'>{streakDays}</Text> 天
        </Text>
      </View>
    </View>
  )
}
