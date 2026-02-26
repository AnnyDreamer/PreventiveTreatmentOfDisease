import { create } from 'zustand'

interface AssessmentState {
  /** 问卷答案：题目ID -> 选项分值 */
  answers: Record<string, number>
  /** 当前题目索引 */
  currentQuestionIndex: number
  /** 总题目数 */
  totalQuestions: number
  /** 是否已提交 */
  isSubmitted: boolean

  setAnswer: (questionId: string, value: number) => void
  nextQuestion: () => void
  prevQuestion: () => void
  setTotalQuestions: (total: number) => void
  getProgress: () => number
  reset: () => void
}

export const useAssessmentStore = create<AssessmentState>((set, get) => ({
  answers: {},
  currentQuestionIndex: 0,
  totalQuestions: 0,
  isSubmitted: false,

  setAnswer: (questionId: string, value: number) => {
    set((state) => ({
      answers: { ...state.answers, [questionId]: value },
    }))
  },

  nextQuestion: () => {
    const { currentQuestionIndex, totalQuestions } = get()
    if (currentQuestionIndex < totalQuestions - 1) {
      set({ currentQuestionIndex: currentQuestionIndex + 1 })
    }
  },

  prevQuestion: () => {
    const { currentQuestionIndex } = get()
    if (currentQuestionIndex > 0) {
      set({ currentQuestionIndex: currentQuestionIndex - 1 })
    }
  },

  setTotalQuestions: (total: number) => {
    set({ totalQuestions: total })
  },

  getProgress: () => {
    const { currentQuestionIndex, totalQuestions } = get()
    if (totalQuestions === 0) return 0
    return ((currentQuestionIndex + 1) / totalQuestions) * 100
  },

  reset: () => {
    set({
      answers: {},
      currentQuestionIndex: 0,
      isSubmitted: false,
    })
  },
}))
