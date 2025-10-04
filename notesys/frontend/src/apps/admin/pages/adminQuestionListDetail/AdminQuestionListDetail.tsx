import React, { useState } from 'react'
import { useParams } from 'react-router-dom'
import { useQuestionListItem } from '../../../../domain/questionList'
import { useQuestionList2 } from '../../../../domain/questionList'
import { DragSortTable, ProColumns } from '@ant-design/pro-components'
import { Button, Descriptions, message, Popconfirm } from 'antd'
import { FaRegTrashAlt } from 'react-icons/fa'
import { Add } from '@icon-park/react'
import { QuestionVO, SearchQuestionModal } from '../../../../domain/question'
import { QuestionListItemVO } from '../../../../domain/questionList/types/types.ts'

const AdminQuestionListDetail: React.FC = () => {
  /**
   * 题单 ID
   */
  const { questionListId } = useParams()

  /**
   * Table 配置
   */
  const sortedColumns: ProColumns[] = [
    {
      title: '排序',
      dataIndex: 'rank',
      width: '5%',
      className: 'drag-visible',
    },
    {
      title: '标题',
      dataIndex: 'question',
      className: 'drag-visible',
      renderText: (_, record) => {
        return <div className="text-blue-500">{record.question.title}</div>
      },
      width: '80%',
    },
    {
      title: '操作',
      dataIndex: 'operation',
      renderText: (_, record) => {
        return (
          <div className="flex gap-4">
            <Popconfirm
              title="确定删除"
              onConfirm={async () => {
                await deleteQuestionListItem(
                  Number(questionListId),
                  record.question.questionId,
                )
              }}
            >
              <FaRegTrashAlt className="cursor-pointer text-neutral-500 hover:text-neutral-700" />
            </Popconfirm>
          </div>
        )
      },
      width: '15%',
    },
  ]

  /**
   * 题单详细信息
   */
  const { questionList } = useQuestionList2(Number(questionListId))

  /**
   * 题单项列表
   */
  const {
    questionListItems,
    createQuestionListItem,
    deleteQuestionListItem,
    sortListItemVO,
  } = useQuestionListItem(Number(questionListId))

  /**
   * 题单描述信息
   */
  const items = [
    {
      label: '题集描述',
      span: 3,
      children: questionList?.description,
    },
    {
      label: '题集类型',
      span: 3,
      children: questionList?.type,
    },
  ]

  const [isModalOpen, setIsModalOpen] = useState(false)

  const toggleIsModalOpen = () => {
    setIsModalOpen(!isModalOpen)
  }

  const handleDragSortEnd = async (
    _: number,
    __: number,
    newDataSource: QuestionListItemVO[],
  ) => {
    await sortListItemVO(newDataSource)
    message.success('排序成功')
  }

  return (
    <div>
      <Descriptions title={questionList?.name} items={items}></Descriptions>
      <div className="mt-4">
        <Button
          type="primary"
          icon={<Add />}
          onClick={() => {
            toggleIsModalOpen()
          }}
        >
          添加题目
        </Button>
      </div>
      <DragSortTable
        columns={sortedColumns}
        dataSource={questionListItems}
        rowKey="rank"
        search={false}
        pagination={false}
        dragSortKey="rank"
        onDragSortEnd={handleDragSortEnd}
      ></DragSortTable>
      <SearchQuestionModal
        isModalOpen={isModalOpen}
        toggleIsModalOpen={toggleIsModalOpen}
        onConfirm={async (item: QuestionVO) => {
          await createQuestionListItem(Number(questionListId), item)
        }}
      />
    </div>
  )
}

export default AdminQuestionListDetail
