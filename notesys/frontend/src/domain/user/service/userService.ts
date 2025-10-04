import { httpClient } from '../../../request'
import { adminUserApiList, userApiList } from '../api/userApi.ts'
import {
  LoginBody,
  RegisterBody,
  RegisterData,
  SendVerifyCodeBody,
  UploadImageData,
  UserListQueryParams,
} from '../types/serviceTypes.ts'
import { UserEntity, UserState, UserVO } from '../types/types.ts'

/**
 * userService
 */
export const userService = {
  /**
   * 用户注册接口
   */
  registerService: (body: RegisterBody) => {
    return httpClient.request<RegisterData>(userApiList.register, {
      body: body,
    })
  },

  /**
   * 用户登录接口
   */
  loginService: (body: LoginBody) => {
    return httpClient.request<UserState>(userApiList.login, {
      body: body,
    })
  },

  /**
   * 自动登录接口
   */
  whoamiService: () => {
    return httpClient.request<UserState>(userApiList.whoami)
  },

  /**
   * 更新用户个人信息
   */
  updateMeService: (body: Partial<UserState>) => {
    return httpClient.request<null>(userApiList.updateMe, {
      body: body,
    })
  },

  /**
   * 获取用户信息
   */
  getUserService: (userId: string) => {
    return httpClient.request<UserVO>(userApiList.getUser, {
      pathParams: [userId],
    })
  },

  /**
   * 上传图片接口
   */
  uploadImageService: (body: FormData) => {
    return httpClient.request<UploadImageData>(userApiList.uploadImage, {
      body: body,
    })
  },

  /**
   * 发送验证码
   */
  sendVerifyCode: (body: SendVerifyCodeBody) => {
    return httpClient.request<void>(userApiList.sendVerifyCode, {
      queryParams: body,
    })
  },
}

/**
 * adminUserService
 */
export const adminUserService = {
  /**
   * 批量查询用户
   */
  getUserListService: (params: UserListQueryParams) => {
    return httpClient.request<UserEntity[]>(adminUserApiList.getUserList, {
      queryParams: params,
    })
  },
}
