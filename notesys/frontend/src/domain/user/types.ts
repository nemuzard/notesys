/**
 * 用户类型
 */
export interface User {
  userId: number
  username: string
  avatarUrl: string
  email: string
  isAdmin: boolean
}

/**
 * 用户登录请求参数
 */
export interface LoginParams {
  username: string
  password: string
}

/**
 * 用户注册请求参数
 */
export interface RegisterParams {
  username: string
  password: string
  email: string
}

/**
 * 用户API响应
 */
export interface UserResponse {
  code: number
  message: string
  data: User
}

/**
 * 管理员枚举
 */
export enum Admin {
  ADMIN = 1,
  USER = 0,
}
