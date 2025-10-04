import { Route } from 'react-router-dom'
import { lazy, Suspense } from 'react'
import { NotFound } from '../../../base/components'
import AdminApp from '../../admin/AdminApp.tsx'
import {
  ADMIN_HOME,
  CATEGORY_MANAGE,
  QUESTION_LIST_MANAGE,
  QUESTION_MANAGE,
  USER_MANAGE,
} from './config.ts'

// 使用 React.lazy, 可显著减少打包后的 index.js 体积
const DashBroad = lazy(() => import('../pages/dashBroad/DashBroad.tsx'))
const AdminUser = lazy(() => import('../pages/adminUser/AdminUser.tsx'))
const AdminQuestion = lazy(
  () => import('../pages/adminQuestion/AdminQuestion.tsx'),
)
const AdminCategory = lazy(
  () => import('../pages/adminCategory/AdminCategory.tsx'),
)
const AdminQuestionList = lazy(
  () => import('../pages/adminQuestionList/AdminQuestionList.tsx'),
)
const AdminQuestionListDetail = lazy(
  () => import('../pages/adminQuestionListDetail/AdminQuestionListDetail.tsx'),
)

// 用 Suspense 包裹懒加载的组件，提供加载时的回退 UI
export const AdminRouteConfig = (
  <Route path={ADMIN_HOME} element={<AdminApp />}>
    <Route
      index
      element={
        <Suspense fallback={<div>Loading...</div>}>
          <DashBroad />
        </Suspense>
      }
    />
    <Route
      path={USER_MANAGE}
      element={
        <Suspense fallback={<div>Loading...</div>}>
          <AdminUser />
        </Suspense>
      }
    />
    <Route
      path={QUESTION_MANAGE}
      element={
        <Suspense fallback={<div>Loading...</div>}>
          <AdminQuestion />
        </Suspense>
      }
    />
    <Route
      path={CATEGORY_MANAGE}
      element={
        <Suspense fallback={<div>Loading...</div>}>
          <AdminCategory />
        </Suspense>
      }
    />
    <Route
      path={QUESTION_LIST_MANAGE}
      element={
        <Suspense fallback={<div>Loading...</div>}>
          <AdminQuestionList />
        </Suspense>
      }
    />
    <Route
      path={`${QUESTION_LIST_MANAGE}/:questionListId`}
      element={
        <Suspense fallback={<div>Loading...</div>}>
          <AdminQuestionListDetail />
        </Suspense>
      }
    />
    <Route path="*" element={<NotFound />} />
  </Route>
)
