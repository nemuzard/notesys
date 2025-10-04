import React, { useState, useEffect } from 'react'
import { NoteWithRelations } from '../types/serviceTypes.ts'
import { Button, Drawer, message } from 'antd'
import {
  LikeOutlined,
  LikeFilled,
  StarOutlined,
  StarFilled,
  MessageOutlined,
} from '@ant-design/icons'
import { useNoteLike } from '../../noteLike'
import { useApp } from '@/base/hooks'
import CommentList from '@/domain/comment/components/CommentList'

interface OptionsCardProps {
  note?: NoteWithRelations
  setNoteLikeStatus?: (noteId: number, isLiked: boolean) => void
  toggleIsModalOpen: () => void
  handleCollectionQueryParams: (noteId: number) => void
  handleSelectedNoteId: (noteId: number) => void
  onRefresh?: () => void
}

const OptionsCard: React.FC<OptionsCardProps> = ({
  note,
  setNoteLikeStatus,
  toggleIsModalOpen,
  handleCollectionQueryParams,
  handleSelectedNoteId,
  onRefresh,
}) => {
  const { like, unLike } = useNoteLike()
  const [commentDrawerVisible, setCommentDrawerVisible] = useState(false)
  const [localCommentCount, setLocalCommentCount] = useState(0)
  const app = useApp()
  let likeLoading = false

  useEffect(() => {
    if (note?.commentCount !== undefined) {
      setLocalCommentCount(note.commentCount)
    }
  }, [note?.commentCount])

  /**
   * 点赞按钮点击处理函数
   */
  async function likeButtonClickHandle() {
    if (!app.isLogin) {
      message.info('请先登录')
      return
    }

    if (!setNoteLikeStatus || !note || !note.userActions) return

    if (likeLoading) return

    likeLoading = true
    setNoteLikeStatus(note.noteId, !note.userActions.isLiked)

    if (note.userActions.isLiked) {
      await unLike(note.noteId)
    } else {
      await like(note.noteId)
    }

    likeLoading = false
  }

  /**
   * 收藏按钮点击处理函数
   */
  async function collectButtonClickHandle() {
    if (!app.isLogin) {
      message.info('请先登录')
      return
    }
    if (!note || !note.userActions) return

    toggleIsModalOpen()
    handleCollectionQueryParams(note.noteId)
    handleSelectedNoteId(note.noteId)
  }

  /**
   * 评论按钮点击处理函数
   */
  const handleCommentClick = async () => {
    if (!app.isLogin) {
      message.info('请先登录')
      return
    }
    setCommentDrawerVisible(true)
  }

  // 评论成功后刷新笔记数据
  const handleCommentSuccess = () => {
    onRefresh?.()
  }

  return (
    <>
      <div className="flex items-center space-x-4">
        <Button
          type="text"
          className="flex items-center"
          icon={note?.userActions?.isLiked ? <LikeFilled /> : <LikeOutlined />}
          onClick={likeButtonClickHandle}
        >
          {note?.likeCount || 0} 次点赞
        </Button>
        <Button
          type="text"
          className="flex items-center"
          icon={
            note?.userActions?.isCollected ? <StarFilled /> : <StarOutlined />
          }
          onClick={collectButtonClickHandle}
        >
          {note?.collectCount || 0} 次收藏
        </Button>
        <Button
          type="text"
          className="flex items-center"
          icon={<MessageOutlined />}
          onClick={handleCommentClick}
        >
          {localCommentCount} 条评论
        </Button>
      </div>

      <Drawer
        title="评论"
        placement="right"
        width={500}
        onClose={() => setCommentDrawerVisible(false)}
        open={commentDrawerVisible}
      >
        {note && (
          <CommentList
            noteId={note.noteId}
            onCommentCountChange={handleCommentSuccess}
          />
        )}
      </Drawer>
    </>
  )
}

export default OptionsCard
