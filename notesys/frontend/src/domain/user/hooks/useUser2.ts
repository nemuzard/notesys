import { userService } from '../service/userService.ts'
import { useEffect, useState } from 'react'
import { UserVO } from '../types/types.ts'

/**
 * 获取其他用户信息
 */
export function useUser2(userId: string) {
  const [userVO, setUserVO] = useState<UserVO>()

  useEffect(() => {
    async function fetchData() {
      const { data } = await userService.getUserService(userId)
      setUserVO(data)
    }

    fetchData().then()
  }, [userId])

  return {
    userVO,
  }
}
