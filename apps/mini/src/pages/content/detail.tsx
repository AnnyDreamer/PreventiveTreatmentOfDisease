import { View, Text } from '@tarojs/components'
import Taro, { useLoad, useRouter } from '@tarojs/taro'
import { useState } from 'react'
import { CONTENT_TYPE_CONFIG } from '@zhiwebing/shared'
import { contentApi } from '../../services/api'
import './detail.scss'

interface ContentDetail {
  id: string
  title: string
  summary: string
  body: string
  contentType: string
  coverImage: string | null
  solarTermKey: string | null
  constitutions: string[]
  publishedAt: string | null
  authorName: string | null
  source: string | null
  viewCount: number
}

function formatDate(dateStr: string | null) {
  if (!dateStr) return ''
  const d = new Date(dateStr)
  return `${d.getFullYear()}.${d.getMonth() + 1}.${d.getDate()}`
}

export default function ContentDetailPage() {
  const router = useRouter()
  const { id } = router.params
  const [content, setContent] = useState<ContentDetail | null>(null)
  const [related, setRelated] = useState<Array<{ id: string; title: string }>>([])

  useLoad(() => {
    if (id) {
      contentApi.getDetail(id).then(async (res) => {
        if (res.data) {
          setContent(res.data)
          // 加载同类型推荐
          const relRes = await contentApi.getList(res.data.contentType, undefined, 3)
            .catch(() => null)
          const items = (relRes?.data?.items || []).filter((item: { id: string }) => item.id !== id)
          setRelated(items.slice(0, 3))
        }
      }).catch(() => {
        Taro.showToast({ title: '加载失败', icon: 'none' })
      })
    }
  })

  if (!content) {
    return (
      <View style={{ display: 'flex', justifyContent: 'center', padding: '80px' }}>
        <Text style={{ color: '#9ca3af' }}>加载中...</Text>
      </View>
    )
  }

  const typeCfg = CONTENT_TYPE_CONFIG[content.contentType as keyof typeof CONTENT_TYPE_CONFIG]

  return (
    <View className='content-detail'>
      {/* 文章头部 */}
      <View className='article-header'>
        <Text className='article-type-badge'>{typeCfg?.label || content.contentType}</Text>
        <Text className='article-title'>{content.title}</Text>
        <View className='article-meta'>
          {content.authorName && (
            <Text className='article-meta__item'>✍️ {content.authorName}</Text>
          )}
          {content.source && (
            <Text className='article-meta__item'>🏥 {content.source}</Text>
          )}
          <Text className='article-meta__item'>📅 {formatDate(content.publishedAt)}</Text>
          <Text className='article-meta__item'>👁 {content.viewCount}</Text>
        </View>
      </View>

      {/* 封面 */}
      <View className='article-cover'>
        <Text className='article-cover__icon'>{typeCfg?.icon || '📄'}</Text>
      </View>

      {/* 正文 */}
      <View className='article-body'>
        <Text className='article-content'>{content.body}</Text>
      </View>

      {/* 相关推荐 */}
      {related.length > 0 && (
        <View className='related-section'>
          <Text className='related-title'>相关推荐</Text>
          {related.map((item) => (
            <View
              key={item.id}
              className='related-item'
              onClick={() => {
                Taro.redirectTo({ url: `/pages/content/detail?id=${item.id}` })
              }}
            >
              <Text className='related-item__title'>{item.title}</Text>
              <Text className='related-item__arrow'>›</Text>
            </View>
          ))}
        </View>
      )}
    </View>
  )
}
