import { useEffect, useState } from 'react'
import { QuestionWithUserNote } from '../types/types.ts'
import { questionService } from '../service/questionService.ts'

/**
 * 获取题目详情
 */
export function useQuestion(questionId: number) {
  /**
   * 题目详情 + 用户对应的笔记
   */
  const [question, setQuestion] = useState<QuestionWithUserNote | undefined>(
    undefined,
  )

  const [loading, setLoading] = useState(false)

  useEffect(() => {
    async function fetchData() {
      setLoading(true)
      const { data } = await questionService.getQuestionByIdService(questionId)
      setQuestion(data)
      setLoading(false)
    }

    fetchData().then()
  }, [questionId])

  /**
   * userFinishedQuestion
   */
  function userFinishedQuestion(noteId: number, content: string) {
    setQuestion((question) => {
      if (!question) return undefined

      return {
        ...question,
        userNote: {
          noteId,
          content,
          finished: true,
        },
      }
    })
  }

  return {
    loading,
    question,
    userFinishedQuestion,
  }
}
