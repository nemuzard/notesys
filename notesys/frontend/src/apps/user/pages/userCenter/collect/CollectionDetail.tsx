import React, { useState } from 'react'
import { NoteList, NoteQueryParams, useNotes } from '../../../../../domain/note'
import { Button } from 'antd'
import { ArrowLeftOutlined } from '@ant-design/icons'

interface CollectionDetailProps {
  selectedCollectionId?: number
  toggleShowCollectionDetail: () => void
}

const CollectionDetail: React.FC<CollectionDetailProps> = ({
  selectedCollectionId,
  toggleShowCollectionDetail,
}) => {
  const [noteQueryParams, setNoteQueryParams] = useState<NoteQueryParams>({
    page: 1,
    pageSize: 10,
    collectionId: selectedCollectionId,
  })

  const handleQueryParams = (params: NoteQueryParams) => {
    setNoteQueryParams((prev) => {
      return {
        ...prev,
        ...params,
      }
    })
  }

  const {
    noteList,
    pagination,
    setNoteLikeStatusHandle,
    setNoteCollectStatusHandle,
  } = useNotes(noteQueryParams)

  return (
    <div>
      <div className="mb-4">
        <Button
          onClick={toggleShowCollectionDetail}
          type="text"
          icon={<ArrowLeftOutlined />}
        >
          返回
        </Button>
      </div>
      <NoteList
        noteList={noteList}
        showOptions={false}
        pagination={pagination}
        queryParams={noteQueryParams}
        setQueryParams={handleQueryParams}
        setNoteLikeStatusHandle={setNoteLikeStatusHandle}
        setNoteCollectStatusHandle={setNoteCollectStatusHandle}
      />
    </div>
  )
}

export default CollectionDetail
