import { View, Text, ScrollView } from '@tarojs/components'
import Taro, { useLoad } from '@tarojs/taro'
import { useState } from 'react'
import { SERVICE_CATEGORY_CONFIG } from '@zhiwebing/shared'
import { serviceApi } from '../../services/api'
import './index.scss'

interface WellnessService {
  id: string
  name: string
  category: string
  description: string
  benefits: string[]
  suitableFor: string[]
  isSeasonalOnly: boolean
  seasonalNote: string | null
  duration: string | null
  price: string | null
  coverImage: string | null
}

const CONSTITUTION_NAMES: Record<string, string> = {
  BALANCED: '平和质', QI_DEFICIENCY: '气虚质', YANG_DEFICIENCY: '阳虚质',
  YIN_DEFICIENCY: '阴虚质', PHLEGM_DAMPNESS: '痰湿质', DAMP_HEAT: '湿热质',
  BLOOD_STASIS: '血瘀质', QI_STAGNATION: '气郁质', SPECIAL: '特禀质',
}

const CATEGORY_COLORS: Record<string, string> = {
  MOXIBUSTION: 'linear-gradient(135deg, #c83232 0%, #8b1a1a 100%)',
  SANFU_PATCH: 'linear-gradient(135deg, #e07020 0%, #b85010 100%)',
  TUINA: 'linear-gradient(135deg, #8b5a2b 0%, #5c3a1a 100%)',
  MASSAGE: 'linear-gradient(135deg, #7c6f64 0%, #5a4f45 100%)',
  ACUPUNCTURE: 'linear-gradient(135deg, #2d6a4f 0%, #1a4030 100%)',
  HERBAL_DRINK: 'linear-gradient(135deg, #2d9a64 0%, #1a6b40 100%)',
  OTHER: 'linear-gradient(135deg, #6b7280 0%, #4b5563 100%)',
}

const ALL_CATEGORIES = [
  { key: 'ALL', label: '全部', icon: '全' },
  ...Object.entries(SERVICE_CATEGORY_CONFIG).map(([key, cfg]) => ({
    key,
    label: cfg.label,
    icon: cfg.icon,
  })),
]

export default function WellnessPage() {
  const [activeCategory, setActiveCategory] = useState('ALL')
  const [services, setServices] = useState<WellnessService[]>([])
  const [loading, setLoading] = useState(false)

  useLoad(() => {
    fetchServices()
  })

  const fetchServices = async (category?: string) => {
    setLoading(true)
    try {
      const res = await serviceApi.getList(category && category !== 'ALL' ? category : undefined)
      setServices(res.data || [])
    } catch {
      setServices([])
    } finally {
      setLoading(false)
    }
  }

  const handleCategoryChange = (key: string) => {
    setActiveCategory(key)
    fetchServices(key)
  }

  return (
    <View className='wellness-page'>
      {/* 分类横向 Tab */}
      <ScrollView className='category-tabs' scrollX>
        <View className='category-tabs-inner'>
          {ALL_CATEGORIES.map((cat) => (
            <View
              key={cat.key}
              className={`category-tab ${activeCategory === cat.key ? 'category-tab--active' : ''}`}
              onClick={() => handleCategoryChange(cat.key)}
            >
              <View className='category-tab__icon'>
                <Text className='category-tab__icon-text'>{cat.icon}</Text>
              </View>
              <Text className='category-tab__label'>{cat.label}</Text>
            </View>
          ))}
        </View>
      </ScrollView>

      {/* 服务卡片列表 */}
      <View className='service-list'>
        {loading ? (
          <View className='empty-state'>
            <Text className='empty-state__text'>加载中...</Text>
          </View>
        ) : services.length === 0 ? (
          <View className='empty-state'>
            <Text className='empty-state__icon'>🌿</Text>
            <Text className='empty-state__text'>暂无康养服务</Text>
          </View>
        ) : (
          services.map((svc) => (
            <View
              key={svc.id}
              className='service-card'
              onClick={() => Taro.navigateTo({ url: `/pages/wellness/detail?id=${svc.id}` })}
            >
              <View
                className='service-card__cover'
                style={{ background: CATEGORY_COLORS[svc.category] || CATEGORY_COLORS.OTHER }}
              >
                <Text className='service-card__cover-icon'>
                  {SERVICE_CATEGORY_CONFIG[svc.category as keyof typeof SERVICE_CATEGORY_CONFIG]?.icon || '🌿'}
                </Text>
                {svc.isSeasonalOnly && (
                  <Text className='service-card__seasonal-badge'>时令限定</Text>
                )}
              </View>
              <View className='service-card__body'>
                <Text className='service-card__name'>{svc.name}</Text>
                <Text className='service-card__desc'>{svc.description}</Text>
                <View className='service-card__footer'>
                  <View className='service-card__tags'>
                    {(svc.suitableFor as string[]).slice(0, 3).map((c) => (
                      <Text key={c} className='service-card__tag'>
                        {CONSTITUTION_NAMES[c] || c}
                      </Text>
                    ))}
                  </View>
                  <Text className='service-card__arrow'>›</Text>
                </View>
              </View>
            </View>
          ))
        )}
      </View>
    </View>
  )
}
