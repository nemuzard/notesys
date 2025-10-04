import React, { useState, useMemo } from 'react'
import {
  Tabs,
  Badge,
  Button,
  Avatar,
  Dropdown,
  List,
  Empty,
  Spin,
  message,
} from 'antd'
import {
  MessageOutlined,
  HeartOutlined,
  BellOutlined,
  CheckOutlined,
  DeleteOutlined,
  CheckCircleOutlined,
  MoreOutlined,
  UserOutlined,
} from '@ant-design/icons'
import { useMessages } from '@/domain/message/hooks/useMessages.ts'
import TimeAgo from '@/base/components/timeAgo/TimeAgo.tsx'
import MessageStats from './components/MessageStats.tsx'
import Panel from '@/base/components/panel/Panel'
import './MessagePage.css'

// 消息类型枚举
enum MessageType {
  LIKE = 1,
  COMMENT = 2,
  SYSTEM = 3,
}

// 消息类型配置
const messageTypeConfig = {
  [MessageType.LIKE]: {
    label: '点赞消息',
    icon: HeartOutlined,
    color: '#ff4d4f',
    bgColor: '#fff2f0',
    borderColor: '#ffccc7',
  },
  [MessageType.COMMENT]: {
    label: '评论消息',
    icon: MessageOutlined,
    color: '#1890ff',
    bgColor: '#f0f9ff',
    borderColor: '#91d5ff',
  },
  [MessageType.SYSTEM]: {
    label: '系统消息',
    icon: BellOutlined,
    color: '#52c41a',
    bgColor: '#f6ffed',
    borderColor: '#b7eb8f',
  },
}

const MessagePage: React.FC = () => {
  const {
    messages,
    deleteMessage,
    markMessagesAsRead,
    markAllMessagesAsRead,
    loading,
  } = useMessages()

  const [activeTab, setActiveTab] = useState<string>('all')

  // 按类型分组消息
  const groupedMessages = useMemo(() => {
    const grouped = {
      all: messages,
      like: messages.filter((msg) => msg.type === MessageType.LIKE),
      comment: messages.filter((msg) => msg.type === MessageType.COMMENT),
      system: messages.filter((msg) => msg.type === MessageType.SYSTEM),
    }
    return grouped
  }, [messages])

  // 获取未读消息数量
  const getUnreadCount = (messageList: typeof messages) => {
    return messageList.filter((msg) => !msg.isRead).length
  }

  // 处理消息点击
  const handleMessageClick = (message: any) => {
    if (!message.isRead) {
      markMessagesAsRead([message.messageId])
    }
    // 如果有目标链接，可以在这里处理导航
    if (message.target) {
      // 根据 target.type 和 targetId 进行导航
      console.log('Navigate to:', message.target)
    }
  }

  // 处理删除消息
  const handleDeleteMessage = (messageId: number) => {
    deleteMessage(messageId)
    message.success('消息已删除')
  }

  // 处理标记已读
  const handleMarkAsRead = (messageId: number) => {
    markMessagesAsRead([messageId])
    message.success('已标记为已读')
  }

  // 处理全部已读
  const handleMarkAllAsRead = () => {
    markAllMessagesAsRead()
    message.success('已全部标记为已读')
  }

  // 获取操作描述
  const getActionText = (type: number) => {
    switch (type) {
      case MessageType.LIKE:
        return '赞了你的笔记'
      case MessageType.COMMENT:
        return '评论了你的笔记'
      case MessageType.SYSTEM:
        return ''
      default:
        return ''
    }
  }

  // 渲染消息列表
  const renderMessageList = (messageList: typeof messages) => {
    if (loading) {
      return (
        <div className="flex items-center justify-center py-12">
          <Spin size="large" />
        </div>
      )
    }

    if (messageList.length === 0) {
      return (
        <Empty
          image={Empty.PRESENTED_IMAGE_SIMPLE}
          description={
            <div className="text-center">
              <p className="text-lg font-medium text-gray-900">暂无消息</p>
              <p className="text-sm text-gray-500">当有新消息时会在这里显示</p>
            </div>
          }
        />
      )
    }

    return (
      <List
        dataSource={messageList}
        renderItem={(item, idx) => renderMessageItem(item, idx)}
        className="rounded-lg bg-white"
        itemLayout="horizontal"
        split={false}
      />
    )
  }

  // 渲染消息项（带动画）
  const renderMessageItem = (message: any, idx: number) => {
    const config = messageTypeConfig[message.type as MessageType]
    const actionText = getActionText(message.type)
    const isSystem = message.type === MessageType.SYSTEM
    const postTitle = message.target?.question?.title

    // 动画参数
    const baseDelay = 80 // ms
    const baseDuration = 0.5 // s
    const durationStep = 0.06 // s
    const maxDelay = 800 // ms
    const maxDuration = 0.9 // s
    const delay = Math.min(idx * baseDelay, maxDelay)
    const duration = Math.min(baseDuration + idx * durationStep, maxDuration)

    return (
      <List.Item
        key={message.messageId}
        className={`message-item group mb-4 flex rounded-xl border-0 px-4 py-3 shadow-sm ${
          !message.isRead ? 'unread' : ''
        } message-item-animate`}
        style={{
          background: config.bgColor,
          borderLeft: !message.isRead
            ? `4px solid ${config.borderColor}`
            : '4px solid transparent',
          animationDelay: `${delay}ms`,
          animationDuration: `${duration}s`,
        }}
        onClick={() => handleMessageClick(message)}
      >
        {/* 头像 */}
        <Avatar
          src={message.sender.avatar}
          icon={<UserOutlined />}
          size={44}
          className="message-avatar mr-4 flex-shrink-0"
        >
          {message.sender.username.charAt(0).toUpperCase()}
        </Avatar>
        {/* 主体内容 */}
        <div className="min-w-0 flex-1">
          {/* 头部：发送者+操作+帖子标题+新标签 */}
          <div className="mb-1 flex flex-wrap items-center gap-2">
            {/* 发送者昵称 */}
            <span className="text-base font-semibold text-gray-900">
              {isSystem ? '系统通知' : message.sender.username}
            </span>
            {/* 操作描述 */}
            {!isSystem && <span className="text-gray-700">{actionText}</span>}
            {/* 帖子标题 */}
            {postTitle && (
              <span className="rounded bg-blue-50 px-1 font-medium text-blue-700">
                《{postTitle}》
              </span>
            )}
            {/* 新标签 */}
            {!message.isRead && (
              <span className="ml-2 rounded bg-red-500 px-2 py-0.5 text-xs text-white">
                新
              </span>
            )}
          </div>
          {/* 正文内容 */}
          <div className="message-content mb-2 text-[15px] leading-relaxed text-gray-800">
            {message.content}
          </div>
          {/* 底部：时间 */}
          <div className="message-time flex items-center gap-2 text-xs text-gray-500">
            <TimeAgo datetime={message.createdAt} />
          </div>
        </div>
        {/* 操作按钮 */}
        <Dropdown
          menu={{
            items: [
              ...(!message.isRead
                ? [
                    {
                      key: 'read',
                      icon: <CheckOutlined />,
                      label: '标记已读',
                      onClick: () => handleMarkAsRead(message.messageId),
                    },
                  ]
                : []),
              {
                key: 'delete',
                icon: <DeleteOutlined />,
                label: '删除消息',
                danger: true,
                onClick: () => handleDeleteMessage(message.messageId),
              },
            ],
          }}
          trigger={['click']}
          placement="bottomRight"
        >
          <Button
            type="text"
            icon={<MoreOutlined />}
            size="small"
            onClick={(e) => e.stopPropagation()}
            className="message-action-btn opacity-0 transition-opacity duration-200 group-hover:opacity-100"
          />
        </Dropdown>
      </List.Item>
    )
  }

  // 标签页配置
  const tabItems = [
    {
      key: 'all',
      label: (
        <span className="flex items-center gap-1">
          全部
          {getUnreadCount(groupedMessages.all) > 0 && (
            <Badge count={getUnreadCount(groupedMessages.all)} size="small" />
          )}
        </span>
      ),
      children: renderMessageList(groupedMessages.all),
    },
    {
      key: 'like',
      label: (
        <span className="flex items-center gap-1">
          点赞
          {getUnreadCount(groupedMessages.like) > 0 && (
            <Badge count={getUnreadCount(groupedMessages.like)} size="small" />
          )}
        </span>
      ),
      children: renderMessageList(groupedMessages.like),
    },
    {
      key: 'comment',
      label: (
        <span className="flex items-center gap-1">
          评论
          {getUnreadCount(groupedMessages.comment) > 0 && (
            <Badge
              count={getUnreadCount(groupedMessages.comment)}
              size="small"
            />
          )}
        </span>
      ),
      children: renderMessageList(groupedMessages.comment),
    },
    {
      key: 'system',
      label: (
        <span className="flex items-center gap-1">
          系统
          {getUnreadCount(groupedMessages.system) > 0 && (
            <Badge
              count={getUnreadCount(groupedMessages.system)}
              size="small"
            />
          )}
        </span>
      ),
      children: renderMessageList(groupedMessages.system),
    },
  ]

  return (
    <div
      className="min-h-screen w-[1000px] px-2 sm:px-0"
      style={{
        margin: '0 auto',
      }}
      id="message-page"
    >
      <Panel>
        <div className="message-header mb-4">
          <h1 className="mb-1 text-2xl font-bold">消息中心</h1>
          <p className="text-sm text-gray-500">查看你的评论、点赞和系统通知</p>
        </div>
        <div className="mb-4 flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center">
          <MessageStats
            totalMessages={messages.length}
            unreadCount={getUnreadCount(groupedMessages.all)}
            likeCount={groupedMessages.like.length}
            commentCount={groupedMessages.comment.length}
            systemCount={groupedMessages.system.length}
            unreadLikeCount={getUnreadCount(groupedMessages.like)}
            unreadCommentCount={getUnreadCount(groupedMessages.comment)}
            unreadSystemCount={getUnreadCount(groupedMessages.system)}
          />
          {getUnreadCount(groupedMessages.all) > 0 && (
            <Button
              type="default"
              icon={<CheckCircleOutlined />}
              onClick={handleMarkAllAsRead}
              size="small"
              className="flex w-full items-center gap-1 sm:w-auto"
            >
              全部标记为已读
            </Button>
          )}
        </div>
        <Tabs
          activeKey={activeTab}
          onChange={setActiveTab}
          items={tabItems.map((item) => ({
            ...item,
            children: (
              <div style={{ padding: '20px 8px 8px 8px' }}>{item.children}</div>
            ),
          }))}
          className="message-tabs rounded-lg bg-white shadow-sm"
          tabBarStyle={{ margin: 0, padding: '16px 16px 0' }}
        />
      </Panel>
    </div>
  )
}

export default MessagePage
