import React from 'react'
import { UserVO } from '../types/types.ts'
import { Panel } from '../../../base/components'
import { Avatar } from 'antd'
import { UserOutlined } from '@ant-design/icons'

interface UserHomeProfileProps {
  user?: UserVO
}

const UserHomeProfile: React.FC<UserHomeProfileProps> = ({ user }) => {
  return (
    <Panel>
      <div className="flex items-center justify-between">
        <div className="w-28">
          <Avatar
            size={80}
            src={user?.avatarUrl}
            className={`cursor-pointer ${!user?.avatarUrl ? 'bg-orange-300' : ''}`}
          >
            <UserOutlined />
          </Avatar>
        </div>
        <div className="flex flex-grow flex-col">
          <span className="font-medium text-black">{user?.username}</span>
          <div className="flex">
            {user?.school && (
              <span className="text-sm font-medium text-gray-600">
                {user.school}
              </span>
            )}
            {user?.school && user?.email && (
              <span className="mx-1 text-sm text-gray-600">|</span>
            )}
            {user?.email && (
              <>
                <span className="font-sans text-sm text-gray-600">
                  {user.email}
                </span>
              </>
            )}
          </div>
          {user?.signature && (
            <span className="mt-1 text-sm text-neutral-500">
              {user.signature}
            </span>
          )}
        </div>
      </div>
    </Panel>
  )
}

export default UserHomeProfile
