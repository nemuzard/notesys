import {
  QuestionListItemQueryParams,
  QuestionListItemUserVO,
} from '../types/types.ts'
import { useEffect, useState } from 'react'
import { userQuestionListService } from '../service/questionListService.ts'
import { Pagination } from '../../../request'

export function useQuestionListItem2(query: QuestionListItemQueryParams) {
  /**
   * 题单项目列表
   */
  const [questionListItems, setQuestionListItems] = useState<
    QuestionListItemUserVO[]
  >([])

  /**
   * 分页信息
   */
  const [pagination, setPagination] = useState<Pagination>()

  /**
   *
   */
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (query.questionListId === undefined || query.questionListId === 0) {
      setQuestionListItems([])
      return
    }

    async function fetchQuestionListItems() {
      setLoading(true)
      const res =
        await userQuestionListService.getQuestionListByIdService(query)
      setPagination(res.pagination)
      setQuestionListItems(res.data)
    }

    fetchQuestionListItems().then(() => {
      setLoading(false)
    })
  }, [query.page, query.pageSize, query.questionListId])

  return {
    loading,
    pagination,
    questionListItems,
  }
}
