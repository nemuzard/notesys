import { http } from '../http'
import { ApiResponse } from '../types'

export interface CreateCommentParams {
  noteId: number
  parentId?: number
  content: string
}

export interface CommentQueryParams {
  noteId: number
  page?: number
  pageSize?: number
}

/**
 * 创建评论
 */
export const createComment = (params: CreateCommentParams) => {
  return http.post<ApiResponse<number>>('/api/comments', params)
}

/**
 * 删除评论
 */
export const deleteComment = (commentId: number) => {
  return http.delete<ApiResponse<void>>(`/api/comments/${commentId}`)
}

/**
 * 获取笔记的评论列表
 */
export const getComments = (params: CommentQueryParams) => {
  return http.get<ApiResponse<any[]>>('/api/comments', { params })
}

/**
 * 点赞评论
 */
export const likeComment = (commentId: number) => {
  return http.post<ApiResponse<void>>(`/api/comments/${commentId}/like`)
}

/**
 * 取消点赞评论
 */
export const unlikeComment = (commentId: number) => {
  return http.delete<ApiResponse<void>>(`/api/comments/${commentId}/like`)
}
