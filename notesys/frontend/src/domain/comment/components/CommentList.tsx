import React, { useState } from 'react'
import { Avatar, Button, Pagination } from 'antd'
import { LikeOutlined, LikeFilled, MessageOutlined } from '@ant-design/icons'
import { formatDistanceToNow } from 'date-fns'
import { zhCN } from 'date-fns/locale'
import CommentInput from './CommentInput.tsx'
import { Comment } from '@/domain/comment/types.ts'
import { useComment } from '@/domain/comment/hooks/useComment.ts'
import './CommentList.css'

interface CommentListProps {
  noteId: number
  onCommentCountChange?: () => void
}

const CommentList: React.FC<CommentListProps> = ({ noteId }) => {
  /**
   * 查询评论参数
   */
  const [commentQueryParams, setCommentQueryParams] = useState({
    noteId,
    page: 1,
    pageSize: 10,
  })

  const { comments, loading, createComment, likeComment, pagination } =
    useComment(commentQueryParams)

  const [replyTo, setReplyTo] = useState<Comment | null>(null)
  const [showReplies, setShowReplies] = useState<Set<number>>(new Set())

  const handleReply = (comment: Comment) => {
    setReplyTo(comment)
  }

  const toggleReplies = (commentId: number) => {
    const newShowReplies = new Set(showReplies)
    if (newShowReplies.has(commentId)) {
      newShowReplies.delete(commentId)
    } else {
      newShowReplies.add(commentId)
    }
    setShowReplies(newShowReplies)
  }

  // 收集所有属于该主评论的回复（扁平化）
  //
  function flattenReplies(
    comment: Comment,
  ): Array<{ reply: Comment; parent: Comment }> {
    const result: Array<{ reply: Comment; parent: Comment }> = []

    function dfs(replies: Comment[], parent: Comment) {
      for (const reply of replies || []) {
        result.push({ reply, parent })
        if (reply.replies && reply.replies.length > 0) {
          dfs(reply.replies, reply)
        }
      }
    }

    if (comment.replies && comment.replies.length > 0) {
      dfs(comment.replies, comment)
    }
    return result
  }

  // 渲染单个回复项
  const renderReplyItem = (reply: Comment, parentComment: Comment) => {
    return (
      <div
        key={reply.commentId}
        className="comment-reply mb-3 ml-8 rounded-lg p-2 transition-all duration-200 hover:bg-gray-50"
      >
        <div className="flex items-start gap-3">
          <Avatar
            size="small"
            src={reply.author?.avatarUrl}
            className="comment-avatar mt-1 flex-shrink-0"
          />
          <div className="min-w-0 flex-1">
            <div className="mb-1 flex items-center gap-2">
              <span className="comment-username text-sm text-gray-900">
                {reply.author?.username}
              </span>
              <span className="text-sm text-blue-500">回复</span>
              <span className="text-sm font-medium text-blue-500">
                @{parentComment.author?.username}
              </span>
            </div>
            <div className="comment-content mb-2 text-sm text-gray-700">
              {reply.content}
            </div>
            <div className="comment-actions flex items-center gap-4 text-xs text-gray-500">
              <span className="comment-time">
                {formatDistanceToNow(new Date(reply.createdAt), {
                  addSuffix: true,
                  locale: zhCN,
                })}
              </span>
              <Button
                type="text"
                size="small"
                icon={
                  reply.userActions?.isLiked ? (
                    <LikeFilled className="text-red-500" />
                  ) : (
                    <LikeOutlined />
                  )
                }
                onClick={() => likeComment(reply.commentId)}
                className="comment-action-btn comment-like-btn h-auto p-0 text-xs"
              >
                {reply.likeCount || 0}
              </Button>
              <Button
                type="text"
                size="small"
                onClick={() => handleReply(reply)}
                className="comment-action-btn comment-reply-btn h-auto p-0 text-xs"
              >
                回复
              </Button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // 渲染一级评论
  const renderMainComment = (comment: Comment) => {
    // 扁平化所有属于一级评论的回复
    const flatReplies = flattenReplies(comment)
    const hasReplies = flatReplies.length > 0
    const isRepliesVisible = showReplies.has(comment.commentId)

    return (
      <div
        key={comment.commentId}
        className="comment-item rounded-lg border-b border-gray-100 p-3 transition-all duration-200 last:border-b-0 hover:bg-gray-50"
      >
        {/* 主评论 */}
        <div className="flex items-start gap-3">
          <Avatar
            src={comment.author?.avatarUrl}
            className="comment-avatar flex-shrink-0"
          />
          <div className="min-w-0 flex-1">
            <div className="mb-2 flex items-center gap-2">
              <span className="comment-username font-medium text-gray-900">
                {comment.author?.username}
              </span>
              <span className="comment-time text-xs text-gray-500">
                {formatDistanceToNow(new Date(comment.createdAt), {
                  addSuffix: true,
                  locale: zhCN,
                })}
              </span>
            </div>
            <div className="comment-content mb-3 text-gray-700">
              {comment.content}
            </div>
            <div className="comment-actions flex items-center gap-4">
              <Button
                type="text"
                icon={
                  comment.userActions?.isLiked ? (
                    <LikeFilled className="text-red-500" />
                  ) : (
                    <LikeOutlined />
                  )
                }
                onClick={() => likeComment(comment.commentId)}
                className="comment-action-btn comment-like-btn flex items-center gap-1"
              >
                {comment.likeCount || 0}
              </Button>
              <Button
                type="text"
                icon={<MessageOutlined />}
                onClick={() => handleReply(comment)}
                className="comment-action-btn comment-reply-btn flex items-center gap-1"
              >
                回复
              </Button>
              {hasReplies && (
                <Button
                  type="text"
                  onClick={() => toggleReplies(comment.commentId)}
                  className="text-blue-500 hover:text-blue-600"
                >
                  {isRepliesVisible
                    ? '收起回复'
                    : `查看回复 (${flatReplies.length})`}
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* 回复区域 */}
        {hasReplies && isRepliesVisible && (
          <div className="mt-4">
            <div className="space-y-2">
              {flatReplies.map(({ reply, parent }) =>
                renderReplyItem(reply, parent),
              )}
            </div>
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="comment-list space-y-8">
      {/* 评论输入框 */}
      <div className="mb-4">
        <h3 className="mb-2 text-lg font-medium text-gray-900">发表评论</h3>
        <CommentInput
          noteId={noteId}
          parentId={replyTo?.commentId}
          replyTo={replyTo}
          onComment={async (noteId, parentId, content) => {
            await createComment({ noteId, parentId, content })
            setReplyTo(null)
          }}
          onCancel={() => setReplyTo(null)}
        />
      </div>

      {/* 评论列表 */}
      <div>
        <h3 className="mb-4 text-lg font-medium text-gray-900">
          评论 ({comments?.length || 0})
        </h3>
        {loading ? (
          <div className="comment-loading">加载中...</div>
        ) : comments && comments.length > 0 ? (
          <div className="space-y-1">{comments.map(renderMainComment)}</div>
        ) : (
          <div className="comment-empty">
            <div className="mb-4 text-4xl">💬</div>
            <div>暂无评论，快来发表第一条评论吧！</div>
          </div>
        )}
      </div>

      <div className="mt-4 flex justify-center">
        <Pagination
          total={pagination?.total}
          current={commentQueryParams.page}
          pageSize={commentQueryParams.pageSize}
          onChange={(page, pageSize) => {
            setCommentQueryParams((prev) => {
              return {
                ...prev,
                page,
                pageSize,
              }
            })
          }}
          showSizeChanger={false}
          showTotal={(total) => `共 ${total} 条评论`}
        />
      </div>
    </div>
  )
}

export default CommentList
