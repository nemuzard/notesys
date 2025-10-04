import React, { useState } from 'react'
import { StatisticEntity } from '../types/types.ts'
import { Pagination, Table, TableProps } from 'antd'
import { useStatistic } from '../hooks/useStatistic.ts'

const columns: TableProps<StatisticEntity>['columns'] = [
  {
    title: '日期',
    dataIndex: 'date',
    key: 'date',
  },
  {
    title: '登录人数',
    dataIndex: 'loginCount',
    key: 'loginCount',
  },
  {
    title: '今日注册',
    dataIndex: 'registerCount',
    key: 'registerCount',
  },
  {
    title: '累计注册',
    dataIndex: 'totalRegisterCount',
    key: 'totalRegisterCount',
  },
  {
    title: '今日笔记数',
    dataIndex: 'noteCount',
    key: 'noteCount',
  },
  {
    title: '今日提交笔记人数',
    dataIndex: 'submitNoteCount',
    key: 'submitNoteCount',
  },
  {
    title: '累计笔记数',
    dataIndex: 'totalNoteCount',
    key: 'totalNoteCount',
  },
]

const StatisticTable: React.FC = () => {
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)

  const { loading, statistic, pagination } = useStatistic(page, pageSize)

  return (
    <div>
      <Table
        loading={loading}
        dataSource={statistic}
        pagination={false}
        columns={columns}
      ></Table>
      <div className="mt-4 flex justify-center">
        <Pagination
          current={page}
          pageSize={pageSize}
          total={pagination?.total}
          onChange={(page, pageSize) => {
            setPage(page)
            setPageSize(pageSize)
          }}
        ></Pagination>
      </div>
    </div>
  )
}

export default StatisticTable
