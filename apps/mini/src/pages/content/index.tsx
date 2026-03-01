import { View, Text, ScrollView } from '@tarojs/components'
import Taro, { useLoad } from '@tarojs/taro'
import { useState } from 'react'
import { CONTENT_TYPE_CONFIG } from '@zhiwebing/shared'
import { contentApi } from '../../services/api'
import './index.scss'

interface ContentItem {
  id: string
  title: string
  summary: string
  contentType: string
  coverImage: string | null
  publishedAt: string | null
  authorName: string | null
  viewCount: number
}

const TYPE_TABS = [
  { key: 'ALL', label: '全部', icon: '📚' },
  ...Object.entries(CONTENT_TYPE_CONFIG).map(([key, cfg]) => ({
    key,
    label: cfg.label,
    icon: cfg.icon,
  })),
]

function formatDate(dateStr: string | null) {
  if (!dateStr) return ''
  const d = new Date(dateStr)
  return `${d.getMonth() + 1}月${d.getDate()}日`
}

export default function ContentListPage() {
  const [activeType, setActiveType] = useState('ALL')
  const [contents, setContents] = useState<ContentItem[]>([])
  const [loading, setLoading] = useState(false)

  useLoad(() => {
    // 支持从首页带类型参数进入
    const pages = Taro.getCurrentPages()
    const currentPage = pages[pages.length - 1]
    const typeParam = (currentPage as any)?.options?.type
    if (typeParam) {
      setActiveType(typeParam)
      fetchContents(typeParam)
    } else {
      fetchContents()
    }
  })

  const fetchContents = async (type?: string) => {
    setLoading(true)
    try {
      const res = await contentApi.getList(type && type !== 'ALL' ? type : undefined)
      setContents(res.data?.items || [])
    } catch {
      setContents([])
    } finally {
      setLoading(false)
    }
  }

  const handleTypeChange = (key: string) => {
    setActiveType(key)
    fetchContents(key)
  }

  return (
    <View className='content-page'>
      {/* 分类 Tab */}
      <ScrollView className='type-tabs' scrollX>
        <View className='type-tabs-inner'>
          {TYPE_TABS.map((tab) => (
            <View
              key={tab.key}
              className={`type-tab ${activeType === tab.key ? 'type-tab--active' : ''}`}
              onClick={() => handleTypeChange(tab.key)}
            >
              <Text className='type-tab__text'>{tab.label}</Text>
              <View className='type-tab__indicator' />
            </View>
          ))}
        </View>
      </ScrollView>

      {/* 文章列表 */}
      <View className='article-list'>
        {loading ? (
          <View className='empty-state'>
            <Text className='empty-state__text'>加载中...</Text>
          </View>
        ) : contents.length === 0 ? (
          <View className='empty-state'>
            <Text className='empty-state__icon'>📖</Text>
            <Text className='empty-state__text'>暂无内容</Text>
          </View>
        ) : (
          contents.map((item) => {
            const typeCfg = CONTENT_TYPE_CONFIG[item.contentType as keyof typeof CONTENT_TYPE_CONFIG]
            return (
              <View
                key={item.id}
                className='article-card'
                onClick={() => Taro.navigateTo({ url: `/pages/content/detail?id=${item.id}` })}
              >
                <View className='article-card__cover'>
                  <Text className='article-card__cover-icon'>{typeCfg?.icon || '📄'}</Text>
                </View>
                <View className='article-card__body'>
                  <Text className='article-card__type'>{typeCfg?.label || item.contentType}</Text>
                  <Text className='article-card__title'>{item.title}</Text>
                  <Text className='article-card__summary'>{item.summary}</Text>
                  <Text className='article-card__meta'>
                    {item.authorName || '编辑部'} · {formatDate(item.publishedAt)} · {item.viewCount} 阅读
                  </Text>
                </View>
              </View>
            )
          })
        )}
      </View>
    </View>
  )
}
