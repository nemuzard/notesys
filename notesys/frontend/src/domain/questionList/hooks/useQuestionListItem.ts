import { useEffect, useState } from 'react'
import { QuestionListItemVO } from '../types/types.ts'
import { adminQuestionListService } from '../service/questionListService.ts'
import { QuestionSummary } from '../../question'
import { message } from 'antd'

export function useQuestionListItem(questionListId: number) {
  /**
   * 题单项列表
   */
  const [questionListItems, setQuestionListItems] = useState<
    QuestionListItemVO[]
  >([])

  const [loading, setLoading] = useState(false)

  useEffect(() => {
    async function fetchData() {
      setLoading(true)
      const { data } =
        await adminQuestionListService.getQuestionListItemService(
          questionListId,
        )
      setQuestionListItems(data)
    }

    fetchData().then(() => {
      setLoading(false)
    })
  }, [questionListId])

  /**
   * 添加题单项
   * @param questionListId 题单 ID
   * @param question QuestionSummary
   */
  async function createQuestionListItem(
    questionListId: number,
    question: QuestionSummary,
  ) {
    /**
     * 检查是否加入了重复的题目
     */
    if (
      questionListItems.some(
        (item) => item.question.questionId === question.questionId,
      )
    ) {
      message.warning('题目已存在')
      return
    }
    const { data } =
      await adminQuestionListService.createQuestionListItemService(
        questionListId,
        question.questionId,
      )
    setQuestionListItems((prev) => {
      const item = {
        questionListId,
        question,
        rank: data.rank,
      }
      return [...prev, item]
    })
    message.success('添加成功')
  }

  /**
   * 删除题单项
   */
  async function deleteQuestionListItem(
    questionListId: number,
    questionId: number,
  ) {
    await adminQuestionListService.deleteQuestionListItemService(
      questionListId,
      questionId,
    )
    setQuestionListItems(
      questionListItems.filter(
        (item) => item.question.questionId !== questionId,
      ),
    )
    message.success('删除成功')
  }

  /**
   * 排序处理函数
   */
  async function sortListItemVO(listItemVO: QuestionListItemVO[]) {
    if (listItemVO.length === 0) {
      message.warning('listItem 长度为 0')
      return
    }

    setQuestionListItems(listItemVO)

    const questionListId = listItemVO[0].questionListId
    const questionIds = listItemVO.map((item) => item.question.questionId)

    await adminQuestionListService.sortQuestionListItemService({
      questionListId,
      questionIds,
    })
  }

  return {
    loading,
    questionListItems,
    createQuestionListItem,
    deleteQuestionListItem,
    sortListItemVO,
  }
}
