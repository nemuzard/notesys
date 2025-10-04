import { UserNote, UserQuestionStatus } from './service.ts'

/**
 * 问题难度枚举
 */
export enum QuestionDifficulty {
  Easy = 1,
  Medium = 2,
  Hard = 3,
}

/**
 * 题目表 (question)
 */
export interface QuestionEntity {
  /** 问题 ID */
  questionId: number

  /** 问题所属分类 ID */
  categoryId: number

  /** 问题标题 */
  title: string

  /** 问题难度 */
  difficulty: QuestionDifficulty

  /** 题目考点 */
  examPoint?: string | undefined

  /** 浏览量 */
  viewCount: number

  /** 记录创建时间 */
  createdAt: string // ISO datetime format

  /** 记录更新时间 */
  updatedAt: string // ISO datetime format
}

export type QuestionVO = Omit<QuestionEntity, 'createdAt' | 'updatedAt'>

/**
 * 问题摘要字段
 */
export type QuestionSummary = Pick<QuestionEntity, 'questionId' | 'title'>

/**
 * 问题详细字段
 */
export type QuestionDetail = Omit<QuestionEntity, 'createdAt' | 'updatedAt'>

/**
 * 前端的题目展示内容
 */
export type QuestionWithUserStatus = Omit<
  QuestionEntity,
  'createdAt' | 'updatedAt' | 'categoryId'
> & {
  userQuestionStatus: UserQuestionStatus
}

/**
 * 笔记内容
 */
export type QuestionWithUserNote = Omit<
  QuestionEntity,
  'questionId' | 'createdAt' | 'updatedAt' | 'categoryId'
> & {
  userNote: UserNote
}
