import { http } from '../http'
import { LoginParams, RegisterParams, UserResponse } from '@/domain/user/types'

/**
 * 用户登录
 */
export function login(params: LoginParams) {
  return http.post<UserResponse>('/api/auth/login', params)
}

/**
 * 用户注册
 */
export function register(params: RegisterParams) {
  return http.post<UserResponse>('/api/auth/register', params)
}

/**
 * 获取当前用户信息
 */
export function getCurrentUser() {
  return http.get<UserResponse>('/api/users/current')
}

/**
 * 获取用户信息
 */
export function getUser(userId: number) {
  return http.get<UserResponse>(`/api/users/${userId}`)
}

/**
 * 更新用户信息
 */
export function updateUser(userId: number, params: Partial<UserResponse>) {
  return http.put<UserResponse>(`/api/users/${userId}`, params)
}

/**
 * 更新用户头像
 */
export function updateAvatar(formData: FormData) {
  return http.post<UserResponse>('/api/users/avatar', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  })
}
