import React from 'react'
import { Divider } from 'antd'
import { NoteRankList } from '../../../../../domain/note'
import { Panel } from '../../../../../base/components'

const RankList: React.FC = () => {
  return (
    <Panel>
      <div className="text-sm font-semibold text-neutral-800">
        今日笔记排行榜
      </div>
      <Divider />
      <NoteRankList />
    </Panel>
  )
}

export default RankList
