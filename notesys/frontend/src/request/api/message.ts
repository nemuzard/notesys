import { http } from '../http'
import { ApiResponse } from '../types'
import { MessageQueryParams, Message } from '@/domain/message/types'

/**
 * 获取消息列表
 */
export const getMessages = (params: MessageQueryParams) => {
  return http.get<ApiResponse<Message[]>>('/api/messages', { params })
}

/**
 * 标记消息为已读
 */
export const markAsRead = (messageId: number) => {
  return http.put<ApiResponse<void>>(`/api/messages/${messageId}/read`)
}

/**
 * 标记所有消息为已读
 */
export const markAllAsRead = () => {
  return http.put<ApiResponse<void>>('/api/messages/read/all')
}

/**
 * 删除消息
 */
export const deleteMessage = (messageId: number) => {
  return http.delete<ApiResponse<void>>(`/api/messages/${messageId}`)
}

/**
 * 获取未读消息数量
 */
export const getUnreadCount = () => {
  return http.get<ApiResponse<number>>('/api/messages/unread/count')
}
