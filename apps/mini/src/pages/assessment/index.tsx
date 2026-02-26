import { View, Text, Button } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { useEffect, useMemo } from 'react'
import { useAssessmentStore } from '../../store'
import { assessmentApi } from '../../services/api'
import './index.scss'

/** 示例题目数据（实际应从接口获取） */
const MOCK_QUESTIONS = [
  {
    id: 'q1',
    text: '您精力充沛吗？',
    options: [
      { label: '没有', value: 1 },
      { label: '很少', value: 2 },
      { label: '有时', value: 3 },
      { label: '经常', value: 4 },
      { label: '总是', value: 5 },
    ],
  },
  {
    id: 'q2',
    text: '您容易疲乏吗？',
    options: [
      { label: '没有', value: 1 },
      { label: '很少', value: 2 },
      { label: '有时', value: 3 },
      { label: '经常', value: 4 },
      { label: '总是', value: 5 },
    ],
  },
  {
    id: 'q3',
    text: '您容易气短（比别人呼吸短促）吗？',
    options: [
      { label: '没有', value: 1 },
      { label: '很少', value: 2 },
      { label: '有时', value: 3 },
      { label: '经常', value: 4 },
      { label: '总是', value: 5 },
    ],
  },
  {
    id: 'q4',
    text: '您说话声音低弱无力吗？',
    options: [
      { label: '没有', value: 1 },
      { label: '很少', value: 2 },
      { label: '有时', value: 3 },
      { label: '经常', value: 4 },
      { label: '总是', value: 5 },
    ],
  },
  {
    id: 'q5',
    text: '您感到闷闷不乐、情绪低沉吗？',
    options: [
      { label: '没有', value: 1 },
      { label: '很少', value: 2 },
      { label: '有时', value: 3 },
      { label: '经常', value: 4 },
      { label: '总是', value: 5 },
    ],
  },
  {
    id: 'q6',
    text: '您容易紧张、焦虑不安吗？',
    options: [
      { label: '没有', value: 1 },
      { label: '很少', value: 2 },
      { label: '有时', value: 3 },
      { label: '经常', value: 4 },
      { label: '总是', value: 5 },
    ],
  },
  {
    id: 'q7',
    text: '您感到孤独、寂寞吗？',
    options: [
      { label: '没有', value: 1 },
      { label: '很少', value: 2 },
      { label: '有时', value: 3 },
      { label: '经常', value: 4 },
      { label: '总是', value: 5 },
    ],
  },
  {
    id: 'q8',
    text: '您容易感到害怕或受到惊吓吗？',
    options: [
      { label: '没有', value: 1 },
      { label: '很少', value: 2 },
      { label: '有时', value: 3 },
      { label: '经常', value: 4 },
      { label: '总是', value: 5 },
    ],
  },
  {
    id: 'q9',
    text: '您身体超重吗？（BMI >= 24）',
    options: [
      { label: '没有', value: 1 },
      { label: '很少', value: 2 },
      { label: '有时', value: 3 },
      { label: '经常', value: 4 },
      { label: '总是', value: 5 },
    ],
  },
]

export default function AssessmentPage() {
  const {
    answers,
    currentQuestionIndex,
    totalQuestions,
    setAnswer,
    nextQuestion,
    prevQuestion,
    setTotalQuestions,
    getProgress,
    reset,
  } = useAssessmentStore()

  useEffect(() => {
    reset()
    setTotalQuestions(MOCK_QUESTIONS.length)
  }, [])

  const currentQuestion = MOCK_QUESTIONS[currentQuestionIndex]
  const selectedValue = currentQuestion ? answers[currentQuestion.id] : undefined
  const isLast = currentQuestionIndex === totalQuestions - 1
  const isFirst = currentQuestionIndex === 0
  const progress = getProgress()

  const answeredCount = useMemo(
    () => Object.keys(answers).length,
    [answers]
  )

  const handleSelect = (value: number) => {
    if (currentQuestion) {
      setAnswer(currentQuestion.id, value)
    }
  }

  const handleNext = () => {
    if (selectedValue === undefined) {
      Taro.showToast({ title: '请选择一个选项', icon: 'none' })
      return
    }
    nextQuestion()
  }

  const handleSubmit = async () => {
    if (selectedValue === undefined) {
      Taro.showToast({ title: '请选择一个选项', icon: 'none' })
      return
    }

    // 检查是否所有题目都已回答
    if (answeredCount < totalQuestions) {
      Taro.showToast({ title: '还有题目未作答', icon: 'none' })
      return
    }

    try {
      const answerList = Object.entries(answers).map(([questionId, value]) => ({
        questionId,
        value,
      }))
      await assessmentApi.submitAssessment(answerList)
      Taro.redirectTo({ url: '/pages/result/index' })
    } catch {
      // 错误已在 request 中处理
    }
  }

  if (!currentQuestion) return null

  return (
    <View className='assessment-page'>
      {/* 进度条 */}
      <View className='progress-section'>
        <View className='progress-info'>
          <Text className='progress-current'>
            第 {currentQuestionIndex + 1} 题
          </Text>
          <Text className='progress-total'>共 {totalQuestions} 题</Text>
        </View>
        <View className='progress-bar'>
          <View
            className='progress-fill'
            style={{ width: `${progress}%` }}
          />
        </View>
      </View>

      {/* 题目 */}
      <View className='question-section'>
        <Text className='question-text'>{currentQuestion.text}</Text>
      </View>

      {/* 选项 */}
      <View className='options-section'>
        {currentQuestion.options.map((opt) => (
          <View
            key={opt.value}
            className={`option-item ${
              selectedValue === opt.value ? 'option-item--active' : ''
            }`}
            onClick={() => handleSelect(opt.value)}
          >
            <View className='option-radio'>
              {selectedValue === opt.value && (
                <View className='option-radio__inner' />
              )}
            </View>
            <Text className='option-label'>{opt.label}</Text>
          </View>
        ))}
      </View>

      {/* 底部按钮 */}
      <View className='action-section'>
        {!isFirst && (
          <Button className='btn-prev' onClick={prevQuestion}>
            上一题
          </Button>
        )}
        {isLast ? (
          <Button className='btn-submit' onClick={handleSubmit}>
            提交评估
          </Button>
        ) : (
          <Button className='btn-next' onClick={handleNext}>
            下一题
          </Button>
        )}
      </View>
    </View>
  )
}
