import {
  CommentQueryParams,
  Comment,
  CreateCommentRequest,
} from '@/domain/comment/types.ts'
import { commentApiList } from '@/domain/comment/api/commentApi.ts'
import { httpClient } from '@/request'

export const commentService = {
  /**
   * 获取评论服务
   */
  getCommentsService: (params: CommentQueryParams) => {
    return httpClient.request<Comment[]>(commentApiList.comments, {
      queryParams: params,
    })
  },

  /**
   * 创建评论服务
   *
   * 返回 commentId
   */
  createCommentService: (request: CreateCommentRequest) => {
    return httpClient.request<number>(commentApiList.createComment, {
      body: request,
    })
  },

  /**
   * 点赞评论
   */
  likeCommentService: (commentId: number) => {
    return httpClient.request(commentApiList.likeComment, {
      pathParams: [commentId],
    })
  },

  /**
   * 取消点赞
   */
  unlikeCommentService: (commentId: number) => {
    return httpClient.request(commentApiList.unlikeComment, {
      pathParams: [commentId],
    })
  },
}
