import React, { useEffect, useState } from 'react'
import { QuestionQueryParams } from '../types/service.ts'
import { useQuestionTable } from '../hooks/useQuestionTable.ts'
import { Pagination, Table, TableProps } from 'antd'
import { QuestionWithUserStatus } from '../types/types.ts'
import { Link } from 'react-router-dom'
import { QUESTION } from '../../../apps/user/router/config.ts'
import { BsCheck2Circle } from 'react-icons/bs'
import { DifficultyTag } from '../index.ts'

interface QuestionTableProps {
  categoryId: number | undefined
}

/**
 * 用户端的问题列表
 */
const QuestionTable: React.FC<QuestionTableProps> = ({ categoryId }) => {
  /**
   * 分页受控
   */
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)

  /**
   * 初始化查询参数对象
   */
  const [queryParams, setQueryParams] = useState<QuestionQueryParams>({
    categoryId: categoryId,
    page: 1,
    pageSize: 10,
  })

  /**
   * 监听 categoryId 变化，动态更新 queryParams
   */
  useEffect(() => {
    if (categoryId) {
      setQueryParams((prev) => {
        return {
          ...prev,
          categoryId: categoryId,
        }
      })
      setPage(1)
    }
  }, [categoryId])

  /**
   * 获取问题列表
   */
  const { questionList, loading, pagination } = useQuestionTable(queryParams)

  /**
   * pagination change handle
   */
  const handlePaginationChange = (page: number, pageSize: number) => {
    setQueryParams((prev) => {
      return {
        ...prev,
        page: page,
        pageSize: pageSize,
      }
    })
    setPage(page)
    setPageSize(pageSize)
  }

  /**
   * table change handle
   */
  const handleTableChange: TableProps<QuestionWithUserStatus>['onChange'] = (
    _,
    __,
    sorter: any,
  ) => {
    if (sorter.column) {
      setQueryParams((prev) => {
        return {
          ...prev,
          sort: sorter.columnKey === 'difficulty' ? 'difficulty' : 'view',
          order: sorter.order === 'ascend' ? 'asc' : 'desc',
        }
      })
    } else {
      // 清空 查询参数中的 sort 和 order
      setQueryParams((prev) => {
        delete prev.sort
        delete prev.order
        return {
          ...prev,
        }
      })
    }
  }

  const columns: TableProps<QuestionWithUserStatus>['columns'] = [
    {
      title: '状态',
      dataIndex: 'userQuestionStatus',
      render: (userQuestionStatus) => {
        return userQuestionStatus.finished ? (
          <BsCheck2Circle className="text-base text-green-500" />
        ) : (
          ''
        )
      },
      width: '10%',
    },
    {
      title: '问题 ID',
      dataIndex: 'questionId',
      key: 'questionId',
      width: '15%',
    },
    {
      title: '标题',
      dataIndex: 'title',
      key: 'title',
      width: '35%',
      render: (_, questionWithUserStatus: QuestionWithUserStatus) => (
        <Link
          to={`${QUESTION}/${questionWithUserStatus.questionId}`}
          className="text-blue-500"
        >
          {questionWithUserStatus.title}
        </Link>
      ),
    },
    { title: '考点', dataIndex: 'examPoint', key: 'examPoint', width: '20%' },
    {
      title: '难度',
      dataIndex: 'difficulty',
      key: 'difficulty',
      sorter: true,
      width: '10%',
      render: (difficulty) => {
        return <DifficultyTag difficulty={difficulty} />
      },
    },
    {
      title: '浏览量',
      dataIndex: 'viewCount',
      key: 'viewCount',
      sorter: true,
      width: '10%',
    },
  ]

  return (
    <>
      <Table
        columns={columns}
        dataSource={questionList}
        pagination={false}
        loading={loading}
        rowKey="questionId"
        onChange={handleTableChange}
      ></Table>
      <div className="mt-4 flex justify-center">
        <Pagination
          current={page}
          pageSize={pageSize}
          total={pagination?.total}
          onChange={handlePaginationChange}
        ></Pagination>
      </div>
    </>
  )
}

export default QuestionTable
