import { View, Text, ScrollView } from '@tarojs/components'
import Taro, { useLoad } from '@tarojs/taro'
import { useState } from 'react'
import {
  getCurrentSolarTermKey,
  SOLAR_TERM_INFO,
  type SolarTermInfo,
} from '@zhiwebing/shared'
import { useUserStore } from '../../store'
import { solarTermApi } from '../../services/api'
import './index.scss'

interface RelatedContent {
  id: string
  title: string
  summary: string
  publishedAt: string
  authorName: string | null
  viewCount: number
}

const CONSTITUTION_NAMES: Record<string, string> = {
  BALANCED: '平和质', QI_DEFICIENCY: '气虚质', YANG_DEFICIENCY: '阳虚质',
  YIN_DEFICIENCY: '阴虚质', PHLEGM_DAMPNESS: '痰湿质', DAMP_HEAT: '湿热质',
  BLOOD_STASIS: '血瘀质', QI_STAGNATION: '气郁质', SPECIAL: '特禀质',
}

export default function SolarTermPage() {
  const { userInfo } = useUserStore()
  const constitution = userInfo?.constitutionType
  const currentKey = getCurrentSolarTermKey()
  const termInfo: SolarTermInfo = SOLAR_TERM_INFO[currentKey]
  const [relatedContents, setRelatedContents] = useState<RelatedContent[]>([])

  useLoad(() => {
    solarTermApi.getCurrentTerm().then((res) => {
      if (res.data?.relatedContents) {
        setRelatedContents(res.data.relatedContents)
      }
    }).catch(() => {})
  })

  // 判断体质适配类型
  const matchType = constitution
    ? termInfo.benefitConstitutions.includes(constitution as never)
      ? 'benefit'
      : termInfo.cautionConstitutions.includes(constitution as never)
        ? 'caution'
        : 'neutral'
    : 'neutral'

  const matchTexts = {
    benefit: `您的${CONSTITUTION_NAMES[constitution!] || ''}体质与本节气高度契合，是重点调养的好时机！`,
    caution: `您的${CONSTITUTION_NAMES[constitution!] || ''}体质在本节气需特别注意，建议参考上方注意事项。`,
    neutral: constitution
      ? `您的${CONSTITUTION_NAMES[constitution] || ''}体质在本节气保持日常养生即可。`
      : '登录后可查看个人体质与节气的匹配建议。',
  }

  const matchIcons = { benefit: '✨', caution: '⚠️', neutral: '💡' }

  return (
    <View className='solar-term-page'>
      {/* 顶部节气标题卡片 */}
      <View className='term-header'>
        <View className='term-season-badge'>
          <Text className='term-season-text'>{termInfo.season}季 · {termInfo.organ}</Text>
        </View>
        <Text className='term-name'>{termInfo.name}</Text>
        <Text className='term-nature'>{termInfo.nature}</Text>
        <View className='term-organ-row'>
          <View className='term-organ-tag'>
            <Text className='term-organ-text'>对应脏腑：{termInfo.organ}</Text>
          </View>
        </View>
      </View>

      {/* 养生要点 */}
      <View className='section-card'>
        <Text className='section-title'>养生要点</Text>
        <Text className='wellness-focus'>{termInfo.wellnessFocus}</Text>
      </View>

      {/* 饮食推荐 */}
      <View className='section-card'>
        <Text className='section-title'>饮食建议</Text>
        <ScrollView className='tags-scroll' scrollX>
          <View className='tags-row'>
            {termInfo.diet.map((item) => (
              <View key={item} className='diet-tag diet-tag--recommend'>
                <Text className='diet-tag__text diet-tag__text--recommend'>{item}</Text>
              </View>
            ))}
          </View>
        </ScrollView>
        {termInfo.avoid.length > 0 && (
          <>
            <Text style={{ display: 'block', fontSize: '24rpx', color: '#9ca3af', margin: '12px 0 8px' }}>
              宜少食
            </Text>
            <ScrollView className='tags-scroll' scrollX>
              <View className='tags-row'>
                {termInfo.avoid.map((item) => (
                  <View key={item} className='diet-tag diet-tag--avoid'>
                    <Text className='diet-tag__text diet-tag__text--avoid'>{item}</Text>
                  </View>
                ))}
              </View>
            </ScrollView>
          </>
        )}
      </View>

      {/* 推荐运动 */}
      <View className='section-card'>
        <Text className='section-title'>推荐运动</Text>
        <View className='exercise-list'>
          {termInfo.exercise.map((item) => (
            <View key={item} className='exercise-tag'>
              <Text className='exercise-tag__text'>{item}</Text>
            </View>
          ))}
        </View>
      </View>

      {/* 注意事项 */}
      <View className='section-card'>
        <Text className='section-title'>注意事项</Text>
        {termInfo.precautions.map((item, idx) => (
          <View key={idx} className='precaution-item'>
            <View className='precaution-dot' />
            <Text className='precaution-text'>{item}</Text>
          </View>
        ))}
      </View>

      {/* 我的体质适配 */}
      <View className='section-card'>
        <Text className='section-title'>我的体质适配</Text>
        <View className={`constitution-match constitution-match--${matchType}`}>
          <Text className='constitution-match__icon'>{matchIcons[matchType]}</Text>
          <Text className={`constitution-match__text constitution-match__text--${matchType}`}>
            {matchTexts[matchType]}
          </Text>
        </View>
      </View>

      {/* 相关文章 */}
      {relatedContents.length > 0 && (
        <View className='section-card'>
          <Text className='section-title'>相关文章</Text>
          {relatedContents.map((article) => (
            <View
              key={article.id}
              className='article-item'
              onClick={() => Taro.navigateTo({ url: `/pages/content/detail?id=${article.id}` })}
            >
              <View className='article-item__content'>
                <Text className='article-item__title'>{article.title}</Text>
                <Text className='article-item__meta'>
                  {article.authorName || '编辑部'} · {article.viewCount} 阅读
                </Text>
              </View>
              <Text className='article-item__arrow'>›</Text>
            </View>
          ))}
        </View>
      )}
    </View>
  )
}
