import { useEffect, useState } from 'react'
import {
  CreateOrUpDateQuestionListBody,
  QuestionListEntity,
} from '../types/types.ts'
import { adminQuestionListService } from '../service/questionListService.ts'

export function useQuestionLists() {
  /**
   * 题单列表
   */
  const [questionLists, setQuestionLists] = useState<QuestionListEntity[]>()
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    async function fetchData() {
      setLoading(true)
      const resp = await adminQuestionListService.getQuestionListService()
      setQuestionLists(resp.data)
      setLoading(false)
    }

    fetchData().then()
  }, [])

  /**
   * 删除题单处理函数
   */
  async function deleteQuestionListHandle(questionListId: number) {
    await adminQuestionListService.deleteQuestionListService(questionListId)
    setQuestionLists(
      questionLists?.filter((item) => item.questionListId !== questionListId),
    )
  }

  /**
   * 创建题单处理函数
   */
  async function createQuestionListHandle(
    params: CreateOrUpDateQuestionListBody,
  ) {
    const resp =
      await adminQuestionListService.createQuestionListService(params)
    const questionListId = resp.data.questionListId

    setQuestionLists([
      ...(questionLists || []),
      {
        questionListId,
        ...params,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ])
  }

  /**
   * 更新题单处理函数
   */
  async function updateQuestionListHandle(
    questionListId: number,
    params: CreateOrUpDateQuestionListBody,
  ) {
    await adminQuestionListService.updateQuestionListService(
      questionListId,
      params,
    )
    setQuestionLists((prev) => {
      return prev?.map((item) => {
        if (item.questionListId === questionListId) {
          return {
            ...item,
            ...params,
            updatedAt: new Date().toISOString(),
          }
        }
        return item
      })
    })
  }

  return {
    questionLists,
    loading,
    deleteQuestionListHandle,
    createQuestionListHandle,
    updateQuestionListHandle,
  }
}
