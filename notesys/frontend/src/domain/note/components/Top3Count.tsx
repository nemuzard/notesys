import React from 'react'
import { useTop3Count } from '../index.ts'

const Top3Count: React.FC = () => {
  const { top3Count } = useTop3Count()

  return (
    <div className="mb-4 flex items-center justify-between text-sm font-medium text-neutral-500">
      {/* 上月排名前三次数 */}
      <div className="flex flex-col items-center">
        <div className="mb-1 text-xs text-neutral-400">上月排名前三次数</div>
        <div className="text-base font-bold text-neutral-700">
          {top3Count?.lastMonthTop3Count ?? 0} 次
        </div>
      </div>
      {/* 本月排名前三次数 */}
      <div className="flex flex-col items-center">
        <div className="mb-1 text-xs text-neutral-400">本月排名前三次数</div>
        <div className="text-base font-bold text-neutral-700">
          {top3Count?.thisMonthTop3Count ?? 0} 次
        </div>
      </div>
    </div>
  )
}

export default Top3Count
