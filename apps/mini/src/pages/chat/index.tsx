import { View, Text, Input, ScrollView, Button } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { useState, useRef, useCallback, useEffect } from 'react'
import { chatApi } from '../../services/api'
import type { ChatMessage } from '../../services/api'
import './index.scss'

const QUICK_QUESTIONS = [
  '我的体质适合吃什么',
  '推荐运动方式',
  '最近睡眠不好怎么办',
  '调理多久能见效',
]

export default function ChatPage() {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content:
        '您好！我是您的 AI 养生助手。我可以根据您的体质特点，为您提供个性化的养生建议。请问有什么可以帮您的吗？',
      createdAt: new Date().toISOString(),
    },
  ])
  const [inputValue, setInputValue] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [sessionId, setSessionId] = useState<string | null>(null)
  const [displayedText, setDisplayedText] = useState<string | null>(null)
  const scrollId = useRef('msg-bottom')

  const scrollToBottom = useCallback(() => {
    scrollId.current = `msg-${Date.now()}`
  }, [])

  // 打字机效果
  useEffect(() => {
    if (displayedText === null) return

    const lastMsg = messages[messages.length - 1]
    if (!lastMsg || lastMsg.role !== 'assistant') return

    const fullText = lastMsg.content
    if (displayedText.length < fullText.length) {
      const timer = setTimeout(() => {
        setDisplayedText(fullText.slice(0, displayedText.length + 1))
      }, 30)
      return () => clearTimeout(timer)
    } else {
      setDisplayedText(null)
    }
  }, [displayedText, messages])

  const sendMessage = async (content: string) => {
    if (!content.trim() || isLoading) return

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: content.trim(),
      createdAt: new Date().toISOString(),
    }

    setMessages((prev) => [...prev, userMsg])
    setInputValue('')
    setIsLoading(true)
    scrollToBottom()

    try {
      const res = await chatApi.sendMessage(sessionId, content.trim())
      const { sessionId: newSessionId, message } = res.data

      if (newSessionId) {
        setSessionId(newSessionId)
      }

      setMessages((prev) => [...prev, message])
      setDisplayedText('')
      scrollToBottom()
    } catch {
      const errorMsg: ChatMessage = {
        id: `error-${Date.now()}`,
        role: 'assistant',
        content: '抱歉，网络出现了问题，请稍后再试。',
        createdAt: new Date().toISOString(),
      }
      setMessages((prev) => [...prev, errorMsg])
      scrollToBottom()
    } finally {
      setIsLoading(false)
    }
  }

  const handleQuickQuestion = (question: string) => {
    sendMessage(question)
  }

  const renderMessage = (msg: ChatMessage, index: number) => {
    const isUser = msg.role === 'user'
    const isLastAssistant =
      !isUser && index === messages.length - 1 && displayedText !== null

    return (
      <View
        key={msg.id}
        className={`message-row ${isUser ? 'message-row--user' : 'message-row--assistant'}`}
      >
        {!isUser && (
          <View className='avatar avatar--assistant'>
            <Text className='avatar-char'>助</Text>
          </View>
        )}
        <View
          className={`bubble ${isUser ? 'bubble--user' : 'bubble--assistant'}`}
        >
          <Text className='bubble-text'>
            {isLastAssistant ? displayedText : msg.content}
          </Text>
        </View>
        {isUser && (
          <View className='avatar avatar--user'>
            <Text className='avatar-char'>我</Text>
          </View>
        )}
      </View>
    )
  }

  return (
    <View className='chat-page'>
      {/* 消息列表 */}
      <ScrollView
        className='message-list'
        scrollY
        scrollIntoView={scrollId.current}
        scrollWithAnimation
      >
        {messages.map((msg, idx) => renderMessage(msg, idx))}

        {isLoading && (
          <View className='message-row message-row--assistant'>
            <View className='avatar avatar--assistant'>
              <Text className='avatar-char'>助</Text>
            </View>
            <View className='bubble bubble--assistant'>
              <View className='loading-dots'>
                <View className='dot dot--1' />
                <View className='dot dot--2' />
                <View className='dot dot--3' />
              </View>
            </View>
          </View>
        )}

        <View id={scrollId.current} className='scroll-anchor' />
      </ScrollView>

      {/* 快捷问题 */}
      {messages.length <= 1 && (
        <View className='quick-section'>
          <Text className='quick-title'>猜你想问</Text>
          <View className='quick-list'>
            {QUICK_QUESTIONS.map((q) => (
              <View
                key={q}
                className='quick-btn'
                onClick={() => handleQuickQuestion(q)}
              >
                <Text className='quick-btn-text'>{q}</Text>
              </View>
            ))}
          </View>
        </View>
      )}

      {/* 输入区 */}
      <View className='input-bar'>
        <Input
          className='input-field'
          placeholder='请输入您的问题...'
          value={inputValue}
          onInput={(e) => setInputValue(e.detail.value)}
          confirmType='send'
          onConfirm={() => sendMessage(inputValue)}
          disabled={isLoading}
        />
        <Button
          className='send-btn'
          onClick={() => sendMessage(inputValue)}
          disabled={isLoading || !inputValue.trim()}
        >
          <Text className='send-text'>发送</Text>
        </Button>
      </View>
    </View>
  )
}
