import React from 'react'
import CommentList from './CommentList.tsx'

/**
 * 评论区演示组件
 * 用于展示新的评论区设计效果
 */
const CommentDemo: React.FC = () => {
  // 模拟的笔记ID
  const mockNoteId = 1

  return (
    <div className="mx-auto max-w-4xl p-6">
      <div className="mb-8">
        <h1 className="mb-2 text-2xl font-bold text-gray-900">
          评论区设计演示
        </h1>
        <p className="text-gray-600">
          这是一个重新设计的评论区，采用两层结构：主评论和扁平化回复布局。
        </p>
      </div>

      <CommentList noteId={mockNoteId} />
    </div>
  )
}

export default CommentDemo
