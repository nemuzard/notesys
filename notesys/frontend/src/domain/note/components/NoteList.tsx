import React, { useEffect, useState } from 'react'
import { NoteItem, NoteQueryParams } from '../index.ts'
import { CollectionQueryParams } from '../../collection/types/types.ts'
import { useCollection2 } from '../../collection'
import { useApp } from '@/base/hooks'
import { useUser } from '../../user/hooks/useUser.ts'
import CollectionModal from '../../collection/components/CollectionModal.tsx'
import { NoteWithRelations } from '../types/serviceTypes.ts'
import { Pagination as PaginationType } from '../../../request'
import { Empty, Pagination } from 'antd'

interface NoteListProps {
  noteList: NoteWithRelations[] // 笔记列表
  pagination: PaginationType | undefined // 分页数据
  setNoteLikeStatusHandle: (noteId: number, isLiked: boolean) => void // 设置笔记的点赞状态
  setNoteCollectStatusHandle: (noteId: number, isCollected: boolean) => void // 设置笔记的收藏状态
  queryParams: NoteQueryParams // 查询参数
  setQueryParams: (queryParams: NoteQueryParams) => void // 设置查询参数的函数
  showAuthor?: boolean // 是否展示作者信息
  showQuestion?: boolean // 是否展示题目信息
  showOptions?: boolean // 是否展示点赞/收藏/评论等按钮
}

const NoteList: React.FC<NoteListProps> = ({
  noteList,
  pagination,
  setNoteLikeStatusHandle,
  setNoteCollectStatusHandle,
  queryParams,
  setQueryParams,
  showOptions = true,
  showAuthor = true,
  showQuestion = true,
}) => {
  /**
   * 处理 分页变化
   * @param page 当前页码
   * @param pageSize 每页显示的条数
   */
  function handlePageChange(page: number, pageSize: number) {
    setQueryParams({
      ...queryParams,
      page,
      pageSize,
    })
  }

  /**
   * 控制收藏夹 Modal 的打开与关闭
   */
  const [isModalOpen, setIsModalOpen] = useState(false)
  const toggleIsModalOpen = () => {
    setIsModalOpen(!isModalOpen)
  }

  const [selectedNoteId, setSelectedNoteId] = useState<number | undefined>(
    undefined,
  )
  const handleSelectedNoteId = (noteId: number) => {
    setSelectedNoteId(noteId)
  }

  /**
   * 收藏夹查询参数设置
   */
  const app = useApp()
  const user = useUser()

  const [collectionQueryParams, setCollectionQueryParams] =
    useState<CollectionQueryParams>({
      noteId: undefined,
      creatorId: undefined,
    })

  useEffect(() => {
    setCollectionQueryParams((prev) => {
      return {
        ...prev,
        creatorId: app.isLogin ? user.userId : undefined,
      }
    })
  }, [app, user])

  function handleCollectionQueryParams(noteId: number) {
    setCollectionQueryParams((prev) => {
      return {
        ...prev,
        noteId,
      }
    })
  }

  const { collectionVOList, createCollection, collectNote } = useCollection2(
    collectionQueryParams,
  )

  return (
    <div>
      {noteList.map((note) => (
        <NoteItem
          key={note.noteId}
          note={note}
          setNoteLikeStatus={setNoteLikeStatusHandle}
          toggleIsModalOpen={toggleIsModalOpen}
          handleCollectionQueryParams={handleCollectionQueryParams}
          handleSelectedNoteId={handleSelectedNoteId}
          showOptions={showOptions}
          showAuthor={showAuthor}
          showQuestion={showQuestion}
        />
      ))}
      {noteList.length > 0 && (
        <div className="flex justify-center">
          <Pagination total={pagination?.total} onChange={handlePageChange} />
        </div>
      )}
      {noteList.length === 0 && <Empty description={'暂无笔记'} />}
      <CollectionModal
        isModalOpen={isModalOpen}
        collectNote={collectNote}
        selectedNoteId={selectedNoteId}
        toggleIsModalOpen={toggleIsModalOpen}
        collectionVOList={collectionVOList}
        createCollection={createCollection}
        setNoteCollectStatusHandle={setNoteCollectStatusHandle}
      />
    </div>
  )
}

export default NoteList
