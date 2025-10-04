import { useEffect, useState } from 'react'
import { QuestionVO } from '../types/types.ts'
import debounce from 'lodash.debounce'
import { questionService } from '../service/questionService.ts'

/**
 * 根据关键字搜索问题，添加 debounce 处理
 *
 * @param keyword 关键字
 */
export function useSearchQuestion(keyword: string) {
  /**
   * 问题列表
   */
  const [questionVOList, setQuestionVOList] = useState<QuestionVO[]>([])

  const [loading, setLoading] = useState(false)

  useEffect(() => {
    // 处理关键字为空的情况
    if (keyword === undefined || keyword.trim() === '') {
      setQuestionVOList([])
      return
    }

    const searchQuestion = debounce(async () => {
      setLoading(true)
      const { data } = await questionService.searchQuestionService({ keyword })
      setQuestionVOList(data)
    }, 300) // 延迟 300 ms

    searchQuestion()
    setLoading(false)

    return () => {
      searchQuestion.cancel()
    }
  }, [keyword])

  return {
    loading,
    questionVOList,
  }
}
