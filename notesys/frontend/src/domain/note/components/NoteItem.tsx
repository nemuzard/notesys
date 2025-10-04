import React, { useEffect, useState } from 'react'
import { NoteWithRelations } from '../types/serviceTypes.ts'

import AuthorCard from './AuthorCard.tsx'
import { QuestionCard } from '../../question'
import NoteContent from './NoteContent.tsx'
import DisplayContent from './DisplayContent.tsx'
import ExpandButton from './ExpandButton.tsx'
import { Divider } from 'antd'
import OptionsCard from './OptionsCard.tsx'

interface NoteItemProps {
  note?: NoteWithRelations
  setNoteLikeStatus?: (noteId: number, isLiked: boolean) => void
  /** 控制模态框的展示 */
  toggleIsModalOpen: () => void
  /** 设置查询收藏夹参数和设置被选中的笔记 ID */
  handleCollectionQueryParams: (noteId: number) => void
  handleSelectedNoteId: (noteId: number) => void
  /** 控制组件信息展示 */
  showAuthor?: boolean // 是否展示作者信息
  showQuestion?: boolean // 是否展示题目信息
  showOptions?: boolean // 是否展示点赞/收藏/评论等按钮
  onRefresh?: () => void
}

const NoteItem: React.FC<NoteItemProps> = ({
  note,
  setNoteLikeStatus,
  showAuthor = true,
  showQuestion = true,
  showOptions = true,
  toggleIsModalOpen,
  handleCollectionQueryParams,
  handleSelectedNoteId,
  onRefresh,
}) => {
  const [isCollapsed, setIsCollapsed] = useState(false)

  const toggleCollapsed = () => {
    setIsCollapsed(!isCollapsed)
  }

  useEffect(() => {
    if (note?.needCollapsed) {
      setIsCollapsed(true)
    }
  }, [])

  return (
    <>
      <div className="flex w-full flex-col gap-4">
        {showQuestion && <QuestionCard question={note?.question} />}
        {showAuthor && <AuthorCard note={note} />}
        {isCollapsed ? (
          <DisplayContent displayContent={note?.displayContent ?? ''} />
        ) : (
          <NoteContent note={note} />
        )}
        {note?.needCollapsed && (
          <ExpandButton
            toggleCollapsed={toggleCollapsed}
            isCollapsed={isCollapsed}
            key={note?.noteId}
          />
        )}
        {showOptions && (
          <OptionsCard
            note={note}
            setNoteLikeStatus={setNoteLikeStatus}
            toggleIsModalOpen={toggleIsModalOpen}
            handleCollectionQueryParams={handleCollectionQueryParams}
            handleSelectedNoteId={handleSelectedNoteId}
            onRefresh={onRefresh}
          />
        )}
      </div>
      <Divider />
    </>
  )
}

export default NoteItem
