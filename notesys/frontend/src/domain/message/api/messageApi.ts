import { ApiList } from '@/request'

export const messageApi: ApiList = {
  messages: ['GET', '/api/messages'],
  unreadCount: ['GET', '/api/messages/unread/count'],
  readMessage: ['PATCH', '/api/messages/{messageId}/read'],
  readMessageBatch: ['PATCH', '/api/messages/batch/read'],
  readAll: ['PATCH', '/api/messages/all/read'],
  deleteMessage: ['DELETE', '/api/messages/{messageId}'],
}
