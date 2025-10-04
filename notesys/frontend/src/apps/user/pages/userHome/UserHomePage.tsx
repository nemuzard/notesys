import React from 'react'
import { UserHomeProfile, useUser2 } from '../../../../domain/user'
import { useParams } from 'react-router-dom'
import { Panel } from '../../../../base/components'
import { Tabs } from 'antd'
import UserNoteList from './components/UserNoteList.tsx'
import UserCollectList from './components/UserCollectList.tsx'

const UserHomePage: React.FC = () => {
  const { userId } = useParams()
  const { userVO } = useUser2(userId ?? '')

  // Tabs Items
  const items = [
    {
      key: '1',
      label: `笔记`,
      children: <UserNoteList userId={userId} />,
    },
    {
      key: '2',
      label: `收藏`,
      children: <UserCollectList userId={userId} />,
    },
  ]

  return (
    <div className="mx-auto w-[700px]">
      <UserHomeProfile user={userVO} />
      <div className="mt-2">
        <Panel>
          <Tabs items={items}></Tabs>
        </Panel>
      </div>
    </div>
  )
}

export default UserHomePage
