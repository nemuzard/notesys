import React from 'react'
import { MessageOutlined, HeartOutlined, BellOutlined } from '@ant-design/icons'

interface MessageTypeIconProps {
  type: number
  size?: number
  className?: string
}

const MessageTypeIcon: React.FC<MessageTypeIconProps> = ({
  type,
  size = 16,
  className = '',
}) => {
  const getIcon = () => {
    switch (type) {
      case 1: // LIKE
        return <HeartOutlined style={{ color: '#ff4d4f' }} />
      case 2: // COMMENT
        return <MessageOutlined style={{ color: '#1890ff' }} />
      case 3: // SYSTEM
        return <BellOutlined style={{ color: '#52c41a' }} />
      default:
        return <BellOutlined style={{ color: '#8c8c8c' }} />
    }
  }

  return (
    <span
      className={`inline-flex items-center justify-center ${className}`}
      style={{ fontSize: size }}
    >
      {getIcon()}
    </span>
  )
}

export default MessageTypeIcon
