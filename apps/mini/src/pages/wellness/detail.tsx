import { View, Text } from '@tarojs/components'
import { useLoad, useRouter } from '@tarojs/taro'
import Taro from '@tarojs/taro'
import { useState } from 'react'
import { SERVICE_CATEGORY_CONFIG } from '@zhiwebing/shared'
import { serviceApi } from '../../services/api'
import './detail.scss'

interface ServiceDetail {
  id: string
  name: string
  category: string
  description: string
  benefits: string[]
  precautions: string[]
  duration: string | null
  price: string | null
  suitableFor: string[]
  contraindicatedFor: string[] | null
  isSeasonalOnly: boolean
  seasonalNote: string | null
  hospital: { name: string; address: string | null }
}

const CONSTITUTION_NAMES: Record<string, string> = {
  BALANCED: '平和质', QI_DEFICIENCY: '气虚质', YANG_DEFICIENCY: '阳虚质',
  YIN_DEFICIENCY: '阴虚质', PHLEGM_DAMPNESS: '痰湿质', DAMP_HEAT: '湿热质',
  BLOOD_STASIS: '血瘀质', QI_STAGNATION: '气郁质', SPECIAL: '特禀质',
}

export default function WellnessDetailPage() {
  const router = useRouter()
  const { id } = router.params
  const [service, setService] = useState<ServiceDetail | null>(null)

  useLoad(() => {
    if (id) {
      serviceApi.getDetail(id).then((res) => {
        if (res.data) setService(res.data)
      }).catch(() => {
        Taro.showToast({ title: '加载失败', icon: 'none' })
      })
    }
  })

  if (!service) {
    return (
      <View style={{ display: 'flex', justifyContent: 'center', padding: '80px' }}>
        <Text style={{ color: '#9ca3af' }}>加载中...</Text>
      </View>
    )
  }

  const categoryConfig = SERVICE_CATEGORY_CONFIG[service.category as keyof typeof SERVICE_CATEGORY_CONFIG]

  return (
    <View className='wellness-detail'>
      {/* 顶部标题区 */}
      <View className='service-header'>
        <View className='service-header__icon-wrap'>
          <Text className='service-header__icon'>{categoryConfig?.icon || '🌿'}</Text>
        </View>
        <Text className='service-header__name'>{service.name}</Text>
        <View className='service-header__tags'>
          <Text className='service-header__tag service-header__tag--category'>
            {categoryConfig?.label || service.category}
          </Text>
          {service.isSeasonalOnly && (
            <Text className='service-header__tag service-header__tag--seasonal'>时令限定</Text>
          )}
        </View>
      </View>

      {/* 功效列表 */}
      <View className='section-card'>
        <Text className='section-title'>主要功效</Text>
        {(service.benefits as string[]).map((benefit, idx) => (
          <View key={idx} className='benefit-item'>
            <Text className='benefit-check'>✓</Text>
            <Text className='benefit-text'>{benefit}</Text>
          </View>
        ))}
      </View>

      {/* 适合/慎用体质 */}
      <View className='section-card'>
        <Text className='section-title'>适用人群</Text>
        {service.suitableFor.length > 0 && (
          <View className='constitution-section'>
            <Text className='constitution-label'>适合体质</Text>
            <View className='constitution-tags'>
              {(service.suitableFor as string[]).map((c) => (
                <Text key={c} className='constitution-tag constitution-tag--suitable'>
                  {CONSTITUTION_NAMES[c] || c}
                </Text>
              ))}
            </View>
          </View>
        )}
        {service.contraindicatedFor && service.contraindicatedFor.length > 0 && (
          <View className='constitution-section' style={{ marginBottom: 0 }}>
            <Text className='constitution-label'>慎用体质</Text>
            <View className='constitution-tags'>
              {(service.contraindicatedFor as string[]).map((c) => (
                <Text key={c} className='constitution-tag constitution-tag--caution'>
                  {CONSTITUTION_NAMES[c] || c}
                </Text>
              ))}
            </View>
          </View>
        )}
      </View>

      {/* 疗程说明 */}
      {(service.duration || service.price || service.seasonalNote) && (
        <View className='section-card'>
          <Text className='section-title'>疗程信息</Text>
          {service.duration && (
            <View className='course-row'>
              <Text className='course-label'>疗程时长</Text>
              <Text className='course-value'>{service.duration}</Text>
            </View>
          )}
          {service.price && (
            <View className='course-row'>
              <Text className='course-label'>价格参考</Text>
              <Text className='course-value course-value--price'>{service.price}</Text>
            </View>
          )}
          {service.seasonalNote && (
            <View className='course-row'>
              <Text className='course-label'>时令说明</Text>
              <Text className='course-value'>{service.seasonalNote}</Text>
            </View>
          )}
        </View>
      )}

      {/* 注意事项 */}
      {(service.precautions as string[]).length > 0 && (
        <View className='section-card'>
          <Text className='section-title'>注意事项</Text>
          {(service.precautions as string[]).map((item, idx) => (
            <View key={idx} className='precaution-item'>
              <View className='precaution-dot' />
              <Text className='precaution-text'>{item}</Text>
            </View>
          ))}
        </View>
      )}

      {/* 底部占位，防止内容被固定栏遮挡 */}
      <View style={{ height: '160rpx' }} />

      {/* 预约 */}
      <View className='booking-bar'>
        <View className='booking-bar__info'>
          <Text className='booking-bar__price'>{service.price || '价格面议'}</Text>
          <Text className='booking-bar__duration'>{service.duration || ''}</Text>
        </View>
        <View
          className='booking-bar__btn'
          onClick={() => Taro.navigateTo({
            url: `/pages/wellness/booking?id=${service.id}&name=${encodeURIComponent(service.name)}`
          })}
        >
          <Text className='booking-bar__btn-text'>立即预约</Text>
        </View>
      </View>
    </View>
  )
}
