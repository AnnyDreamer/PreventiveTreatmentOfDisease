import { View, Text, Button } from '@tarojs/components'
import Taro, { useDidShow } from '@tarojs/taro'
import { useState } from 'react'
import { assessmentApi } from '../../services/api'
import type { AssessmentResult } from '../../services/api'
import './index.scss'

/** 九种体质名称映射 */
const CONSTITUTION_LABELS: Record<string, string> = {
  balanced: '平和质',
  qi_deficiency: '气虚质',
  yang_deficiency: '阳虚质',
  yin_deficiency: '阴虚质',
  phlegm_dampness: '痰湿质',
  damp_heat: '湿热质',
  blood_stasis: '血瘀质',
  qi_stagnation: '气郁质',
  special: '特禀质',
}

/** 体质主题色映射 */
const TYPE_COLORS: Record<string, string> = {
  balanced: '#2d9a64',
  qi_deficiency: '#daa520',
  yang_deficiency: '#6a9bd8',
  yin_deficiency: '#c83232',
  phlegm_dampness: '#8b7355',
  damp_heat: '#d4763a',
  blood_stasis: '#8b3a62',
  qi_stagnation: '#6b6b8a',
  special: '#9b6bb0',
}

export default function ResultPage() {
  const [result, setResult] = useState<AssessmentResult | null>(null)
  const [loading, setLoading] = useState(true)

  useDidShow(() => {
    fetchResult()
  })

  const fetchResult = async () => {
    setLoading(true)
    try {
      const res = await assessmentApi.getAssessmentResult()
      setResult(res.data)
    } catch {
      // 使用模拟数据用于 UI 展示
      setResult({
        id: 'mock',
        primaryType: 'qi_deficiency',
        primaryName: '气虚质',
        primaryScore: 72,
        scores: {
          balanced: 45,
          qi_deficiency: 72,
          yang_deficiency: 38,
          yin_deficiency: 52,
          phlegm_dampness: 60,
          damp_heat: 30,
          blood_stasis: 25,
          qi_stagnation: 48,
          special: 15,
        },
        features: ['容易疲乏', '气短懒言', '容易感冒', '出汗偏多'],
        risks: ['反复感冒', '慢性疲劳', '胃下垂', '内脏下垂'],
        suggestions: [
          '饮食宜健脾益气',
          '适当运动，避免过度劳累',
          '保证充足睡眠',
        ],
        secondaryTypes: [
          { type: 'phlegm_dampness', name: '痰湿质', score: 60 },
          { type: 'yin_deficiency', name: '阴虚质', score: 52 },
        ],
        createdAt: new Date().toISOString(),
      })
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <View className='result-page result-page--loading'>
        <Text className='loading-text'>正在获取评估结果...</Text>
      </View>
    )
  }

  if (!result) return null

  const themeColor =
    TYPE_COLORS[result.primaryType] || TYPE_COLORS.balanced

  return (
    <View className='result-page'>
      {/* 主体质卡片 */}
      <View
        className='primary-card'
        style={{ background: `linear-gradient(135deg, ${themeColor} 0%, ${themeColor}cc 100%)` }}
      >
        <View className='primary-icon'>
          <Text className='icon-char'>
            {result.primaryName.charAt(0)}
          </Text>
        </View>
        <Text className='primary-name'>{result.primaryName}</Text>
        <View className='primary-score'>
          <Text className='score-value'>{result.primaryScore}</Text>
          <Text className='score-unit'>分</Text>
        </View>
      </View>

      {/* 九种体质柱状图 */}
      <View className='section card'>
        <Text className='section-title'>体质分布</Text>
        <View className='chart-bars'>
          {Object.entries(result.scores).map(([type, score]) => (
            <View key={type} className='bar-row'>
              <Text className='bar-label'>
                {CONSTITUTION_LABELS[type] || type}
              </Text>
              <View className='bar-track'>
                <View
                  className='bar-fill'
                  style={{
                    width: `${score}%`,
                    background:
                      type === result.primaryType
                        ? themeColor
                        : '#d4c5a9',
                  }}
                />
              </View>
              <Text className='bar-value'>{score}</Text>
            </View>
          ))}
        </View>
      </View>

      {/* 体质特征 */}
      <View className='section card'>
        <Text className='section-title'>体质特征</Text>
        <View className='tags-wrap'>
          {result.features.map((feat, idx) => (
            <View
              key={idx}
              className='tag'
              style={{ borderColor: themeColor, color: themeColor }}
            >
              <Text className='tag-text' style={{ color: themeColor }}>
                {feat}
              </Text>
            </View>
          ))}
        </View>
      </View>

      {/* 易患疾病 */}
      <View className='section card'>
        <Text className='section-title'>易患疾病提示</Text>
        <View className='risk-list'>
          {result.risks.map((risk, idx) => (
            <View key={idx} className='risk-item'>
              <View className='risk-dot' />
              <Text className='risk-text'>{risk}</Text>
            </View>
          ))}
        </View>
      </View>

      {/* 兼夹体质 */}
      {result.secondaryTypes.length > 0 && (
        <View className='section card'>
          <Text className='section-title'>兼夹体质</Text>
          <View className='secondary-list'>
            {result.secondaryTypes.map((item) => (
              <View key={item.type} className='secondary-item'>
                <Text className='secondary-name'>{item.name}</Text>
                <View className='secondary-bar-track'>
                  <View
                    className='secondary-bar-fill'
                    style={{
                      width: `${item.score}%`,
                      background: TYPE_COLORS[item.type] || '#8b5a2b',
                    }}
                  />
                </View>
                <Text className='secondary-score'>{item.score}分</Text>
              </View>
            ))}
          </View>
        </View>
      )}

      {/* 操作按钮 */}
      <View className='actions'>
        <Button
          className='btn-primary'
          onClick={() => Taro.navigateTo({ url: '/pages/plan/index' })}
        >
          查看养生方案
        </Button>
        <Button
          className='btn-secondary'
          onClick={() => Taro.navigateBack()}
        >
          返回首页
        </Button>
      </View>
    </View>
  )
}
