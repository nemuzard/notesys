import React, { useState } from 'react'
import { NoteList, NoteQueryParams, useNotes } from '../../../../../domain/note'
import { useUser } from '../../../../../domain/user/hooks/useUser.ts'

const UserNote: React.FC = () => {
  const user = useUser()

  const [searchParams, setSearchParams] = useState<NoteQueryParams>({
    page: 1,
    pageSize: 10,
    sort: 'create',
    order: 'desc',
    authorId: user.userId,
  })

  const setSearchParamsHandle = (params: NoteQueryParams) => {
    setSearchParams((prev) => ({ ...prev, ...params }))
  }

  const {
    noteList,
    pagination,
    setNoteLikeStatusHandle,
    setNoteCollectStatusHandle,
  } = useNotes(searchParams)

  return (
    <div>
      <NoteList
        queryParams={searchParams}
        noteList={noteList}
        pagination={pagination}
        setNoteLikeStatusHandle={setNoteLikeStatusHandle}
        setNoteCollectStatusHandle={setNoteCollectStatusHandle}
        setQueryParams={setSearchParamsHandle}
        showOptions={false}
        showAuthor={false}
      ></NoteList>
    </div>
  )
}

export default UserNote
