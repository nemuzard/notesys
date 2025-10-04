import React, { useEffect, useState } from 'react'
import { Panel } from '../../../../base/components'
import {
  convertQuestionListToTreeStruct,
  QuestionListTreeView,
} from '../../../../domain/questionList'
import { QuestionListParentNode } from '../../../../domain/questionList'
import { useQuestionLists } from '../../../../domain/questionList'
import { useSearchParams } from 'react-router-dom'
import TrainingCampListInfo from './components/TrainingCampListInfo.tsx'
import { useQuestionListItem2 } from '../../../../domain/questionList'
import { QuestionListItemQueryParams } from '../../../../domain/questionList/types/types.ts'
import { Empty, Pagination } from 'antd'
import QuestionListView from '../../../../domain/questionList/components/QuestionListView.tsx'
import TrainingCampListHeader from './components/TrainingCampListHeader.tsx'

const QuestionListPage: React.FC = () => {
  /**
   * 获取题单分类，并根据分类，将其转化为树形结构
   */
  const { questionLists } = useQuestionLists()
  const treeData = convertQuestionListToTreeStruct(questionLists)

  /**
   * 监听选中的题单 ID，可用来获取该题单对应的题单项
   */
  const [selectedQuestionListId, setSelectedQuestionListId] = useState<
    number | undefined
  >()
  const handleQuestionListSelect = (questionListId: number | undefined) => {
    setSelectedQuestionListId(questionListId)
  }

  /**
   * 题单项查询参数
   */
  const [queryParams, setQueryParams] = useState<QuestionListItemQueryParams>({
    page: 1,
    pageSize: 10,
    questionListId: 0,
  })

  // region 地址栏参数处理
  /**
   * 用来动态获取查询参数
   */
  const [searchParams, setSearchParams] = useSearchParams()
  const questionListId = searchParams.get('questionListId') || ''

  useEffect(() => {
    if (questionListId) {
      setSelectedQuestionListId(Number(questionListId))
    }
  }, [questionListId])

  /**
   * 监听 selectedCategoryId 变化，更新地址栏参数
   */
  useEffect(() => {
    // > 0 防止选中模拟的分类
    if (selectedQuestionListId && selectedQuestionListId > 0) {
      setSearchParams({ questionListId: selectedQuestionListId.toString() })
      setQueryParams({
        ...queryParams,
        questionListId: selectedQuestionListId,
      })
    } else {
      setSearchParams({})
      setQueryParams({
        ...queryParams,
        questionListId: 0,
      })
    }
  }, [selectedQuestionListId, setSearchParams])
  // endregion

  const { questionListItems, pagination } = useQuestionListItem2(queryParams)

  return (
    <div className="flex justify-center gap-3">
      <div className="w-[300px]">
        <Panel>
          <QuestionListTreeView
            treeData={treeData}
            selectedQuestionListId={selectedQuestionListId}
            handleQuestionListSelect={handleQuestionListSelect}
          />
        </Panel>
      </div>
      {/* 根据 selectedQuestionList 挂载不同的组件 */}
      <div className="w-[950px]">
        <Panel>
          {selectedQuestionListId === QuestionListParentNode.TRAINING_CAMP && (
            <TrainingCampListInfo />
          )}
          {selectedQuestionListId === undefined && (
            <Empty description={'请选择题单'}></Empty>
          )}
          {selectedQuestionListId !== undefined &&
            questionListItems.length > 0 && (
              <>
                <TrainingCampListHeader />
                <QuestionListView questionList={questionListItems} />
              </>
            )}
          {selectedQuestionListId !== undefined &&
            questionListItems.length > 0 && (
              <div className="mt-2 flex justify-center">
                <Pagination
                  total={pagination?.total}
                  onChange={(page, pageSize) => {
                    setQueryParams({
                      ...queryParams,
                      page,
                      pageSize,
                    })
                  }}
                  current={queryParams.page}
                  pageSize={queryParams.pageSize}
                />
              </div>
            )}
        </Panel>
      </div>
    </div>
  )
}

export default QuestionListPage
