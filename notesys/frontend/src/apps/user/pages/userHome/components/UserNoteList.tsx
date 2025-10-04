import React, { useState } from 'react'
import { NoteList, NoteQueryParams, useNotes } from '../../../../../domain/note'
import { Empty, Skeleton } from 'antd'

interface UserNoteListProps {
  userId?: string
}

const UserNoteList: React.FC<UserNoteListProps> = ({ userId }) => {
  const [queryParams, setQueryParams] = useState<NoteQueryParams>({
    page: 1,
    pageSize: 10,
    sort: 'create',
    order: 'desc',
    authorId: userId,
  })

  const {
    noteList,
    pagination,
    setNoteLikeStatusHandle,
    setNoteCollectStatusHandle,
  } = useNotes(queryParams)

  function handleQueryParams(params: NoteQueryParams) {
    setQueryParams((prev) => ({ ...prev, ...params }))
  }

  return (
    <div>
      {userId === undefined ? (
        <Skeleton />
      ) : (
        <>
          <NoteList
            noteList={noteList}
            pagination={pagination}
            queryParams={queryParams}
            setQueryParams={handleQueryParams}
            setNoteLikeStatusHandle={setNoteLikeStatusHandle}
            setNoteCollectStatusHandle={setNoteCollectStatusHandle}
            showOptions={false}
          ></NoteList>
          {noteList.length === 0 && <Empty description={'暂无笔记'} />}
        </>
      )}
    </div>
  )
}

export default UserNoteList
