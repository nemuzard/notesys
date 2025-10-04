import { ApiList } from '@/request'

export const adminCategoryApiList: ApiList = {
  categories: ['GET', '/api/admin/categories'],
  createCategory: ['POST', '/api/admin/categories'],
  updateCategory: ['PATCH', '/api/admin/categories/{categoryId}'],
  deleteCategory: ['DELETE', '/api/admin/categories/{categoryId}'],
}
