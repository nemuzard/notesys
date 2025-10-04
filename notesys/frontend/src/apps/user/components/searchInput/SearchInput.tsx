import React, { useState } from 'react'
import Search from 'antd/es/input/Search'
import { InputRef } from 'antd'
import { QuestionVO, SearchQuestionModal } from '../../../../domain/question'
import { useNavigate } from 'react-router-dom'
import { QUESTION } from '../../router/config.ts'

const SearchInput: React.FC = () => {
  const [keyword, setKeyword] = useState<string>('')
  const searchInputRef = React.createRef<InputRef>()

  const [isModalOpen, setIsModalOpen] = useState(false)

  const toggleIsModalOpen = () => {
    setIsModalOpen(!isModalOpen)
  }

  const navigate = useNavigate()

  return (
    <>
      <Search
        ref={searchInputRef}
        value={keyword}
        onSearch={(value) => setKeyword(value)}
        onChange={(e) => setKeyword(e.target.value)}
        onFocus={() => {
          toggleIsModalOpen()
          searchInputRef.current?.blur()
        }}
        width={450}
      ></Search>
      <SearchQuestionModal
        isModalOpen={isModalOpen}
        toggleIsModalOpen={toggleIsModalOpen}
        onConfirm={(item: QuestionVO) => {
          navigate(`${QUESTION}/${item.questionId}`)
        }}
      />
    </>
  )
}

export default SearchInput
