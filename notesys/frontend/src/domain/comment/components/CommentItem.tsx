import React from 'react'
import { Avatar, Button, List } from 'antd'
import { LikeOutlined, LikeFilled } from '@ant-design/icons'
import { formatDistanceToNow } from 'date-fns'
import { zhCN } from 'date-fns/locale'
import { Comment } from '@/domain/comment/types.ts'

interface CommentItemProps {
  comment: Comment
  onReply: () => void
  onLike: () => void
}

const CommentItem: React.FC<CommentItemProps> = ({
  comment,
  onReply,
  onLike,
}) => {
  return (
    <List.Item
      key={comment.commentId}
      actions={[
        <Button
          key="like"
          type="text"
          icon={
            comment.userActions?.isLiked ? <LikeFilled /> : <LikeOutlined />
          }
          onClick={onLike}
        >
          {comment.likeCount || 0} 赞
        </Button>,
        <Button key="reply" type="text" onClick={onReply}>
          回复
        </Button>,
      ]}
    >
      <List.Item.Meta
        avatar={<Avatar src={comment.author?.avatarUrl} />}
        title={comment.author?.username}
        description={
          <div>
            <div>{comment.content}</div>
            <div className="text-sm text-gray-400">
              {formatDistanceToNow(new Date(comment.createdAt), {
                addSuffix: true,
                locale: zhCN,
              })}
            </div>
          </div>
        }
      />
    </List.Item>
  )
}

export default CommentItem
