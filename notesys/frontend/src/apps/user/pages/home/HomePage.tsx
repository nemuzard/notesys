import React, { useState } from 'react'
import { NoteList, NoteQueryParams, useNotes } from '../../../../domain/note'
import { Panel } from '../../../../base/components'
import { Divider, Skeleton } from 'antd'
import RankList from './components/RankList.tsx'
import { NoteHeatMap } from '../../../../domain/note'
import { Top3Count } from '../../../../domain/note'
import { useApp } from '@/base/hooks'

const HomePage: React.FC = () => {
  const [searchParams, setSearchParams] = useState<NoteQueryParams>({
    page: 1,
    pageSize: 10,
    sort: 'create',
    order: 'desc',
  })

  const setSearchParamsHandle = (params: NoteQueryParams) => {
    setSearchParams((prev) => ({ ...prev, ...params }))
  }

  const {
    noteList,
    pagination,
    setNoteLikeStatusHandle,
    setNoteCollectStatusHandle,
    loading,
  } = useNotes(searchParams)

  const app = useApp()

  return (
    <div className="flex justify-center">
      <div className="w-[700px]">
        <Panel>
          <div className="text-sm font-semibold text-neutral-800">近期笔记</div>
          <Divider />
          <Skeleton loading={loading}>
            <NoteList
              noteList={noteList}
              pagination={pagination}
              queryParams={searchParams}
              setQueryParams={setSearchParamsHandle}
              setNoteLikeStatusHandle={setNoteLikeStatusHandle}
              setNoteCollectStatusHandle={setNoteCollectStatusHandle}
            />
          </Skeleton>
        </Panel>
      </div>
      <div className="ml-4 hidden w-[320px] sm:block">
        <RankList />
        {app.isLogin && (
          <Panel>
            <Top3Count />
            <NoteHeatMap />
          </Panel>
        )}
      </div>
    </div>
  )
}

export default HomePage
