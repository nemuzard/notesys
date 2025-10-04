import { UserState } from '../types/types.ts'
import { userService } from '../service/userService.ts'
import { useDispatch } from 'react-redux'
import { setUser } from '../../../store/userSlice.ts'
import { useUser } from './useUser.ts'

/**
 * 更新个人信息 hook
 */
export function useUserForm() {
  const dispatch = useDispatch()
  const user = useUser()

  /**
   * 更新个人信息
   */
  async function updateUserInfo(newUserInfo: Partial<UserState>) {
    // 将更新的个人信息字段发送给后端
    // await userService.updateMeService(newUserInfo)
    // 将更新的内容提交到 store 中
    try {
      await userService.updateMeService(newUserInfo)
      dispatch(
        setUser({
          ...user,
          ...newUserInfo,
        }),
      )
    } catch (e: any) {
      throw new Error(e.message)
    }
  }

  /**
   * 更新用户头像
   */
  async function updateUserAvatar(newAvatarUrl: string) {
    // 更新头像字段
    try {
      await userService.updateMeService({ avatarUrl: newAvatarUrl })
      dispatch(
        setUser({
          ...user,
          avatarUrl: newAvatarUrl,
        }),
      )
    } catch (e: any) {
      throw new Error(e.message)
    }
  }
  return { updateUserInfo, updateUserAvatar }
}
