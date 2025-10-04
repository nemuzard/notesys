import { QuestionDetail, QuestionSummary } from '../../question'
import { UserQuestionStatus } from '../../question/types/service.ts'

export enum QuestionListType {
  COMMON_TYPE = 1, // 普通题单
  TRAINING_CAMP_TYPE = 2, // 训练营专属题单
}

export enum QuestionListParentNode {
  COMMON = -1,
  TRAINING_CAMP = -2,
}

/**
 * 题单实体
 */
export interface QuestionListEntity {
  questionListId: number
  name: string
  type: QuestionListType
  description: string
  createdAt: string
  updatedAt: string
}

/**
 * 题单项实体
 */
export interface QuestionListItemEntity {
  questionListId: number
  questionId: number
  rank: number
  createdAt: string
  updatedAt: string
}

/**
 * 题单分类实体
 */
export interface QuestionListCategory {
  key: number
  title: string
  questionListId: number | undefined
  children: QuestionListCategory[] | undefined
}

/**
 * 题单项详情 VO
 */
export interface QuestionListItemVO {
  questionListId: number
  question: QuestionSummary
  rank: number
}

export interface QuestionListItemUserVO {
  questionListId: number
  question: QuestionDetail
  rank: number
  userQuestionStatus: UserQuestionStatus
}

/**
 * 创建题单body实体
 */
export interface CreateOrUpDateQuestionListBody {
  name: string
  description: string
  type: number
}

/**
 * 题单排序服务 body 实体
 */
export interface SortQuestionListItemBody {
  questionListId: number
  questionIds: number[]
}

/**
 * 题单项查询参数
 */
export interface QuestionListItemQueryParams {
  questionListId: number | undefined
  page: number
  pageSize: number
}

/**
 * 抽屉操作类型
 */
export type QuestionListOptType = 'create' | 'update'
