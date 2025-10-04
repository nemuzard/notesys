/**
 * 评论作者信息
 */
export interface CommentAuthor {
  userId: string
  username: string
  avatarUrl: string
}

/**
 * 用户操作状态
 */
export interface CommentUserActions {
  isLiked: boolean
}

/**
 * 评论数据
 */
export interface Comment {
  commentId: number
  noteId: number
  content: string
  likeCount: number
  replyCount: number
  createdAt: string
  author: CommentAuthor
  userActions?: CommentUserActions
  replies?: Comment[]
}

export interface CommentQueryParams {
  noteId: number
  page?: number
  pageSize?: number
}

export interface CreateCommentRequest {
  noteId: number
  parentId?: number
  content: string
}
