import { Route } from 'react-router-dom'
import UserApp from '../UserApp.tsx'
import {
  HOME,
  HOME_PAGE,
  QUESTION,
  QUESTION_LIST,
  QUESTION_SET,
  USER_CENTER,
  USER_COLLECT,
  USER_HOME,
  USER_INFO,
  USER_NOTE,
  MESSAGE_CENTER,
} from './config.ts'
import { NotFound } from '../../../base/components'
import HomePage from '../pages/home/HomePage.tsx'
import UserCenterPage from '../pages/userCenter/UserCenterPage.tsx'
import UserInfo from '../pages/userCenter/info/UserInfo.tsx'
import UserCollect from '../pages/userCenter/collect/UserCollect.tsx'
import UserNote from '../pages/userCenter/note/UserNote.tsx'
import QuestionSetPage from '../pages/questionSet/QuestionSetPage.tsx'
import QuestionPage from '../pages/question/QuestionPage.tsx'
import UserHomePage from '../pages/userHome/UserHomePage.tsx'
import QuestionListPage from '../pages/questionList/QuestionListPage.tsx'
import MessagePage from '@/apps/user/pages/message/MessagePage.tsx'

export const UserRouteConfig = (
  <Route path={HOME} element={<UserApp />}>
    <Route index element={<HomePage />} />
    <Route path={HOME_PAGE} element={<HomePage />} />
    <Route path={USER_CENTER} element={<UserCenterPage />}>
      <Route index element={<UserInfo />} />
      <Route path={USER_INFO} element={<UserInfo />} />
      <Route path={USER_COLLECT} element={<UserCollect />} />
      <Route path={USER_NOTE} element={<UserNote />} />
    </Route>
    <Route path={QUESTION_SET} element={<QuestionSetPage />} />
    <Route path={`${QUESTION}/:questionId`} element={<QuestionPage />} />
    <Route path={`${USER_HOME}/:userId`} element={<UserHomePage />} />
    <Route path={`${QUESTION_LIST}`} element={<QuestionListPage />} />
    <Route path={MESSAGE_CENTER} element={<MessagePage />} />
    <Route path="/*" element={<NotFound />} />
  </Route>
)
