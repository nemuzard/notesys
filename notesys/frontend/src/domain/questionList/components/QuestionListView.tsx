import React from 'react'
import { QuestionListItemUserVO } from '../types/types.ts'
import { List } from 'antd'
import { BsCheck2Circle } from 'react-icons/bs'
import { NavLink } from 'react-router-dom'
import { QUESTION } from '../../../apps/user/router/config.ts'

interface QuestionListViewProps {
  questionList: QuestionListItemUserVO[]
}

const QuestionListView: React.FC<QuestionListViewProps> = ({
  questionList,
}) => {
  return (
    <div>
      <List
        dataSource={questionList}
        renderItem={(item) => (
          <List.Item>
            <div className="flex items-center justify-start gap-4">
              <div className="w-20 px-4">
                {item.userQuestionStatus.finished ? (
                  <BsCheck2Circle className="text-base text-green-500" />
                ) : (
                  ''
                )}
              </div>
              <div>
                <NavLink
                  to={`${QUESTION}/${item.question.questionId}`}
                  className="text-blue-500"
                >
                  {item.question.title}
                </NavLink>
              </div>
            </div>
          </List.Item>
        )}
      />
    </div>
  )
}

export default QuestionListView
