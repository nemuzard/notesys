import { useEffect, useState } from 'react'
import { QuestionListEntity } from '../types/types.ts'
import { adminQuestionListService } from '../service/questionListService.ts'

// 获取题单
export function useQuestionList2(questionListId: number) {
  /**
   * 获取题单
   */
  const [questionList, setQuestionList] = useState<QuestionListEntity>()
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    async function fetchData() {
      setLoading(true)
      const { data } =
        await adminQuestionListService.getQuestionListByIdService(
          questionListId,
        )
      setQuestionList(data)
    }

    fetchData().then(() => {
      setLoading(false)
    })
  }, [questionListId])

  return {
    loading,
    questionList,
  }
}
