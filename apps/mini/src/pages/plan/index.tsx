import { View, Text, ScrollView } from '@tarojs/components'
import { useDidShow } from '@tarojs/taro'
import { useState } from 'react'
import { planApi } from '../../services/api'
import type { HealthPlan } from '../../services/api'
import './index.scss'

type TabKey = 'diet' | 'exercise' | 'lifestyle' | 'acupoints' | 'herbs'

const TABS: Array<{ key: TabKey; label: string }> = [
  { key: 'diet', label: '饮食' },
  { key: 'exercise', label: '运动' },
  { key: 'lifestyle', label: '起居' },
  { key: 'acupoints', label: '穴位' },
  { key: 'herbs', label: '药膳' },
]

/** 模拟数据 */
const MOCK_PLAN: HealthPlan = {
  id: 'mock',
  constitutionType: 'qi_deficiency',
  diet: {
    recommended: ['黄芪', '党参', '山药', '大枣', '糯米', '鸡肉', '牛肉'],
    avoided: ['生冷食物', '油腻辛辣', '萝卜（不宜大量）'],
    recipes: [
      { name: '黄芪炖鸡', desc: '黄芪30g，母鸡1只，小火炖2小时' },
      { name: '山药薏仁粥', desc: '山药50g，薏仁30g，大米100g，熬粥' },
      { name: '红枣桂圆茶', desc: '红枣5颗，桂圆10g，沸水冲泡' },
    ],
  },
  exercise: [
    { name: '八段锦', duration: '20-30分钟', frequency: '每日1次' },
    { name: '太极拳', duration: '30-40分钟', frequency: '每周3-5次' },
    { name: '散步', duration: '30分钟', frequency: '每日' },
  ],
  lifestyle: [
    '早睡早起，避免熬夜',
    '注意保暖，避免风寒',
    '劳逸结合，避免过度劳累',
    '保持心情舒畅，避免忧思',
    '秋冬季节特别注意进补',
  ],
  acupoints: [
    { name: '足三里', method: '指压或艾灸，每次15分钟', benefit: '健脾益气' },
    { name: '气海穴', method: '顺时针按揉，每次5分钟', benefit: '补气养元' },
    { name: '关元穴', method: '艾灸，每次20分钟', benefit: '培元固本' },
  ],
  herbs: [
    { name: '四君子汤', usage: '人参、白术、茯苓、甘草，每周2-3次' },
    { name: '补中益气丸', usage: '遵医嘱服用' },
  ],
  seasonalTips: [
    '春季：疏肝理气，多食绿色蔬菜',
    '夏季：避免贪凉，适当进食温性食物',
    '秋季：润肺养阴，多食白色食物',
    '冬季：温补肾阳，适当进补',
  ],
}

export default function PlanPage() {
  const [activeTab, setActiveTab] = useState<TabKey>('diet')
  const [plan, setPlan] = useState<HealthPlan>(MOCK_PLAN)

  useDidShow(() => {
    fetchPlan()
  })

  const fetchPlan = async () => {
    try {
      const res = await planApi.getHealthPlan()
      setPlan(res.data)
    } catch {
      // 使用模拟数据
    }
  }

  const renderDiet = () => (
    <View className='tab-content'>
      <View className='sub-section'>
        <Text className='sub-title'>推荐食材</Text>
        <View className='food-tags'>
          {plan.diet.recommended.map((food, idx) => (
            <View key={idx} className='food-tag food-tag--good'>
              <Text className='food-tag-text'>{food}</Text>
            </View>
          ))}
        </View>
      </View>

      <View className='sub-section'>
        <Text className='sub-title'>忌口食物</Text>
        <View className='food-tags'>
          {plan.diet.avoided.map((food, idx) => (
            <View key={idx} className='food-tag food-tag--bad'>
              <Text className='food-tag-text'>{food}</Text>
            </View>
          ))}
        </View>
      </View>

      <View className='sub-section'>
        <Text className='sub-title'>推荐食谱</Text>
        {plan.diet.recipes.map((recipe, idx) => (
          <View key={idx} className='recipe-card'>
            <Text className='recipe-name'>{recipe.name}</Text>
            <Text className='recipe-desc'>{recipe.desc}</Text>
          </View>
        ))}
      </View>
    </View>
  )

  const renderExercise = () => (
    <View className='tab-content'>
      {plan.exercise.map((item, idx) => (
        <View key={idx} className='exercise-card'>
          <Text className='exercise-name'>{item.name}</Text>
          <View className='exercise-meta'>
            <View className='meta-item'>
              <Text className='meta-label'>时长</Text>
              <Text className='meta-value'>{item.duration}</Text>
            </View>
            <View className='meta-item'>
              <Text className='meta-label'>频率</Text>
              <Text className='meta-value'>{item.frequency}</Text>
            </View>
          </View>
        </View>
      ))}
    </View>
  )

  const renderLifestyle = () => (
    <View className='tab-content'>
      {plan.lifestyle.map((tip, idx) => (
        <View key={idx} className='lifestyle-item'>
          <View className='lifestyle-num'>
            <Text className='num-text'>{idx + 1}</Text>
          </View>
          <Text className='lifestyle-text'>{tip}</Text>
        </View>
      ))}
      <View className='sub-section'>
        <Text className='sub-title'>四季养生</Text>
        {plan.seasonalTips.map((tip, idx) => (
          <View key={idx} className='season-item'>
            <Text className='season-text'>{tip}</Text>
          </View>
        ))}
      </View>
    </View>
  )

  const renderAcupoints = () => (
    <View className='tab-content'>
      {plan.acupoints.map((point, idx) => (
        <View key={idx} className='acu-card'>
          <View className='acu-header'>
            <Text className='acu-name'>{point.name}</Text>
            <Text className='acu-benefit'>{point.benefit}</Text>
          </View>
          <Text className='acu-method'>{point.method}</Text>
        </View>
      ))}
    </View>
  )

  const renderHerbs = () => (
    <View className='tab-content'>
      {plan.herbs.map((herb, idx) => (
        <View key={idx} className='herb-card'>
          <Text className='herb-name'>{herb.name}</Text>
          <Text className='herb-usage'>{herb.usage}</Text>
        </View>
      ))}
      <View className='herb-notice'>
        <Text className='notice-text'>
          注意：以上药膳方仅供参考，具体用药请遵医嘱。
        </Text>
      </View>
    </View>
  )

  const renderContent = () => {
    switch (activeTab) {
      case 'diet':
        return renderDiet()
      case 'exercise':
        return renderExercise()
      case 'lifestyle':
        return renderLifestyle()
      case 'acupoints':
        return renderAcupoints()
      case 'herbs':
        return renderHerbs()
    }
  }

  return (
    <View className='plan-page'>
      {/* 标签栏 */}
      <ScrollView className='tab-bar' scrollX enableFlex>
        {TABS.map((tab) => (
          <View
            key={tab.key}
            className={`tab-item ${
              activeTab === tab.key ? 'tab-item--active' : ''
            }`}
            onClick={() => setActiveTab(tab.key)}
          >
            <Text className='tab-text'>{tab.label}</Text>
            {activeTab === tab.key && <View className='tab-indicator' />}
          </View>
        ))}
      </ScrollView>

      {/* 内容区 */}
      <ScrollView className='content-scroll' scrollY>
        {renderContent()}
      </ScrollView>
    </View>
  )
}
