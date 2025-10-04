import { httpClient } from '@/request'
import { messageApi } from '@/domain/message/api/messageApi.ts'
import { Message } from '@/domain/message/types.ts'

export const messageService = {
  /**
   * 获取消息列表
   */
  getMessages: () => {
    return httpClient.request<Message[]>(messageApi.messages, {})
  },

  /**
   * 获取未读消息数量
   */
  getUnreadCount: () => {
    return httpClient.request<number>(messageApi.unreadCount, {})
  },

  /**
   * 批量标记已读
   */
  readMessages: (messageIds: number[]) => {
    return httpClient.request<null>(messageApi.readMessageBatch, {
      body: {
        messageIds,
      },
    })
  },

  /**
   * 批量标记全部已读
   */
  readAllMessages: () => {
    return httpClient.request<null>(messageApi.readAll, {})
  },

  /**
   * 删除消息
   */
  deleteMessage: (messageId: number) => {
    return httpClient.request<null>(messageApi.deleteMessage, {
      pathParams: [messageId],
    })
  },
}
