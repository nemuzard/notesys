import { useEffect, useState } from 'react'
import { Message } from '@/domain/message/types.ts'
import { messageService } from '@/domain/message/service/messageService.ts'

export function useMessages() {
  const [messages, setMessages] = useState<Message[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    // messages
    async function fetchData() {
      try {
        setLoading(true)
        const response = await messageService.getMessages()
        setMessages(response.data)
      } catch (error) {
        console.log(error)
      } finally {
        setLoading(false)
      }
    }

    fetchData().then()
  }, [])

  async function markMessagesAsRead(messageIds: number[]) {
    setMessages(
      messages.map((message) =>
        messageIds.includes(message.messageId)
          ? { ...message, isRead: true }
          : message,
      ),
    )
    await messageService.readMessages(messageIds)
  }

  async function deleteMessage(messageId: number) {
    setMessages(messages.filter((message) => message.messageId !== messageId))
    await messageService.deleteMessage(messageId)
  }

  async function markAllMessagesAsRead() {
    setMessages(messages.map((message) => ({ ...message, isRead: true })))
    await messageService.readAllMessages()
  }

  return {
    loading,
    messages,
    deleteMessage,
    markMessagesAsRead,
    markAllMessagesAsRead,
  }
}
