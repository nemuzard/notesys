import React, { useEffect, useState } from 'react'
import { Empty, InputRef, Modal } from 'antd'
import { useSearchQuestion } from '../hooks/useSearchQuestion.ts'
import Search from 'antd/es/input/Search'
import SearchModalFooter from './SearchModalFooter.tsx'
import { QuestionVO } from '../types/types.ts'

interface SearchQuestionModalProps {
  isModalOpen: boolean
  toggleIsModalOpen: () => void
  onConfirm: (questionVO: QuestionVO) => void // 确认选中的回调函数
}

const scrollToSelected = (index: number) => {
  const element = document.querySelector(`.result-item-${index}`)
  if (element) {
    // 连续按住 ⬆️键或 ⬇️键 的时候，滚动到目标项并非匀速滚动，而是先暂停滚动后恢复快速滚动
    // TODO: 后续需要使用 requestAnimationFrame 优化滚动逻辑，而非使用 scrollIntoView
    element.scrollIntoView({
      behavior: 'smooth',
      block: 'center',
    })
  }
}

const SearchQuestionModal: React.FC<SearchQuestionModalProps> = ({
  isModalOpen,
  toggleIsModalOpen,
  onConfirm,
}) => {
  /**
   * 关键字和搜索框 ref
   */
  const [keyword, setKeyword] = useState('')
  const inputRef = React.createRef<InputRef>()
  const [selectedIndex, setSelectedIndex] = useState(0)

  /**
   * 搜索结果
   */
  const { questionVOList } = useSearchQuestion(keyword)

  // 关闭 modal 时清空搜索关键词并重置选中项
  useEffect(() => {
    if (!isModalOpen) {
      setKeyword('')
      setSelectedIndex(0)
    }
  }, [isModalOpen])

  // 键盘事件监听
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (!isModalOpen) return // 只有在 Modal 打开时处理键盘事件

      if (event.key === 'Enter') {
        // 确认选中
        if (questionVOList[selectedIndex]) {
          onConfirm(questionVOList[selectedIndex]) // 确保传递选中的项
          toggleIsModalOpen()
        }
      }

      if (event.key === 'ArrowUp') {
        setSelectedIndex((prevState) => {
          const newIndex = Math.max(0, prevState - 1) // 防止越界
          scrollToSelected(newIndex) // 滚动到选中项
          return newIndex
        })
      }

      if (event.key === 'ArrowDown') {
        setSelectedIndex((prevState) => {
          const newIndex = Math.min(questionVOList.length - 1, prevState + 1) // 防止越界
          scrollToSelected(newIndex) // 滚动到选中项
          return newIndex
        })
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('keydown', handleKeyDown) // 清理事件监听器
    }
  }, [isModalOpen, questionVOList, selectedIndex])

  return (
    <Modal
      open={isModalOpen}
      footer={<SearchModalFooter />}
      onCancel={toggleIsModalOpen}
      title={'搜索问题'}
      afterOpenChange={() => {
        if (inputRef.current) {
          inputRef.current.focus()
        }
      }}
      width={'40%'}
    >
      {/* 搜索框 */}
      <div className="mt-4">
        <Search
          ref={inputRef}
          value={keyword}
          onSearch={(value) => setKeyword(value)}
          onChange={(e) => setKeyword(e.target.value)}
        ></Search>
      </div>
      {/* 搜索结果列表 */}
      <div className="h-96 max-h-96 overflow-x-auto">
        <div className="test-xs my-2 font-medium text-gray-700">搜索结果</div>
        {questionVOList.map((item, index) => (
          <div
            key={item.questionId}
            className={`result-item-${index} cursor-pointer select-none border-b border-dashed p-3 transition-colors duration-200 ${index === selectedIndex ? 'bg-gray-200' : 'hover:bg-gray-50'}`}
            onClick={() => {
              setSelectedIndex(index) // 鼠标点击时高亮该项
            }}
            onDoubleClick={() => {
              onConfirm(item) // 双击时选中该项
              toggleIsModalOpen()
            }}
          >
            {item.title}
          </div>
        ))}
        {questionVOList.length === 0 && <Empty />}
      </div>
    </Modal>
  )
}

export default SearchQuestionModal
