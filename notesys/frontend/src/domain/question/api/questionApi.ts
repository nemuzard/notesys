import { ApiList } from '../../../request'

/**
 * 管理员问题接口
 */
export const adminQuestionApiList: ApiList = {
  getQuestionList: ['GET', '/api/admin/questions'],
  createQuestion: ['POST', '/api/admin/questions'],
  createQuestionBatch: ['POST', '/api/admin/questions/batch'],
  updateQuestion: ['PATCH', '/api/admin/questions/{questionId}'],
  deleteQuestion: ['DELETE', '/api/admin/questions/{questionId}'],
}

/**
 * 普通用户问题接口
 */
export const questionApiList: ApiList = {
  getQuestionList: ['GET', '/api/questions'],
  getQuestionById: ['GET', '/api/questions/{questionId}'],
  searchQuestion: ['POST', '/api/questions/search'],
}
