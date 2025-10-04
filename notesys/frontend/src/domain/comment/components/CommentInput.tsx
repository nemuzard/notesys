import React, { useState } from 'react'
import { Button, Input, message, Avatar } from 'antd'
import { SendOutlined } from '@ant-design/icons'
import { useUser } from '@/domain/user/hooks/useUser.ts'
import { Comment } from '@/domain/comment/types.ts'

interface CommentInputProps {
  noteId: number
  parentId?: number
  onComment: (
    noteId: number,
    parentId: number,
    content: string,
  ) => Promise<void>
  onCancel?: () => void
  replyTo?: Comment | null
}

export const CommentInput: React.FC<CommentInputProps> = ({
  noteId,
  parentId,
  onComment,
  onCancel,
  replyTo,
}) => {
  const [content, setContent] = useState('')
  const [loading, setLoading] = useState(false)
  const user = useUser()

  const handleSubmit = async () => {
    if (!content.trim()) {
      message.warning('请填写评论内容')
      return
    }
    setLoading(true)
    try {
      await onComment(noteId, parentId || 0, content)
      setContent('')
    } catch {
      message.error('评论发布失败，请重试')
    } finally {
      setLoading(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
      handleSubmit()
    }
  }

  if (!user.userId) {
    return (
      <div className="rounded-lg border-2 border-dashed border-gray-200 bg-gray-50 p-4">
        <div className="text-center text-gray-500">
          <div className="mb-2 text-lg">💬</div>
          <div>请先登录后再发表评论</div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {/* 回复提示 */}
      {replyTo && (
        <div className="flex items-center gap-2 rounded-lg border border-blue-200 bg-blue-50 p-3">
          <div className="flex items-center gap-2 text-sm text-blue-700">
            <span>回复</span>
            <Avatar size="small" src={replyTo.author?.avatarUrl} />
            <span className="font-medium">@{replyTo.author?.username}</span>
          </div>
          <Button
            type="text"
            size="small"
            onClick={onCancel}
            className="ml-auto text-blue-600 hover:text-blue-800"
          >
            取消
          </Button>
        </div>
      )}

      {/* 输入区域 */}
      <div className="flex gap-3">
        <Avatar src={user.avatarUrl} className="flex-shrink-0" />
        <div className="flex-1 space-y-3">
          <Input.TextArea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder={
              replyTo
                ? `回复 @${replyTo.author?.username}...`
                : '写下你的评论...'
            }
            autoSize={{ minRows: 2, maxRows: 6 }}
            maxLength={500}
            showCount
            className="resize-none"
          />
          <div className="flex items-center justify-between">
            <div className="text-xs text-gray-500">
              {replyTo ? 'Ctrl+Enter 发送回复' : 'Ctrl+Enter 发送评论'}
            </div>
            <div className="flex gap-2">
              {replyTo && (
                <Button onClick={onCancel} disabled={loading}>
                  取消
                </Button>
              )}
              <Button
                type="primary"
                onClick={handleSubmit}
                loading={loading}
                icon={<SendOutlined />}
              >
                {replyTo ? '回复' : '发表评论'}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default CommentInput
