import React, { useEffect, useState } from 'react'
import { Avatar } from 'antd'
import { UserOutlined } from '@ant-design/icons'
import { useNavigate } from 'react-router-dom'
import { NoteRankListItem } from '../types/serviceTypes.ts'
import { BronzeTrophy, GoldTrophy, SliverTrophy } from '../../../base/icon'
import { noteService } from '../service/noteService.ts'
import { USER_HOME } from '@/apps/user/router/config.ts'

const NoteRankList: React.FC = () => {
  const [rankList, setRankList] = useState<NoteRankListItem[]>([])

  useEffect(() => {
    const fetchData = async () => {
      const { data } = await noteService.getNoteRankListService()
      setRankList(data)
    }
    fetchData().then()
  }, [])

  const rankMap = (rank: number) => {
    switch (rank) {
      case 1:
        return (
          <div className="flex justify-center">
            <GoldTrophy />
          </div>
        )
      case 2:
        return (
          <div className="flex justify-center">
            <SliverTrophy />
          </div>
        )
      case 3:
        return (
          <div className="flex justify-center">
            <BronzeTrophy />
          </div>
        )
      default:
        return (
          <div className="flex justify-center text-sm font-medium text-neutral-700">
            {rank}
          </div>
        )
    }
  }

  const navigate = useNavigate()

  return (
    <div className="gay-x-2 grid grid-cols-12 gap-y-3">
      <div className="col-span-2 flex justify-center text-sm font-medium text-neutral-600">
        排名
      </div>
      <div className="col-span-7 text-sm font-medium text-neutral-600">
        姓名
      </div>
      <div className="col-span-3 flex justify-center text-sm font-medium text-neutral-600">
        提交数
      </div>
      {rankList.map((item, index) => (
        <div
          key={index}
          className="col-span-12 grid grid-cols-12 items-center gap-2"
        >
          <div className="col-span-2">{rankMap(item.rank)}</div>
          <div className="col-span-7 flex items-center gap-1 overflow-x-hidden text-sm font-medium text-neutral-600">
            <Avatar
              src={item.avatarUrl}
              size={26}
              className={
                'flex-shrink-0 cursor-pointer ' +
                (item.avatarUrl === null ? 'bg-orange-300' : '')
              }
              onClick={() => {
                navigate(`${USER_HOME}/${item.userId}`)
              }}
            >
              <UserOutlined />
            </Avatar>
            <div
              className="cursor-pointer truncate hover:text-neutral-800"
              onClick={() => {
                navigate(`${USER_HOME}/${item.userId}`)
              }}
            >
              {item.username}
            </div>
          </div>
          <div className="col-span-3 flex justify-center text-sm text-neutral-600">
            {item.noteCount}
          </div>
        </div>
      ))}
      {rankList.length === 0 && (
        <div className="col-span-12 text-center text-sm font-medium text-neutral-800">
          今日暂无提交
        </div>
      )}
    </div>
  )
}

export default NoteRankList
