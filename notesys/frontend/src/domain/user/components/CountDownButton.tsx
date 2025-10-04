import React, { useEffect, useState } from 'react'
import { Button } from 'antd'

interface CountDownButtonProps {
  handleSendVerifyCode: () => Promise<boolean>
}

const CountDownButton: React.FC<CountDownButtonProps> = ({
  handleSendVerifyCode,
}) => {
  const [countdown, setCountdown] = useState(0)

  useEffect(() => {
    if (countdown === 0) return
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer)
          return 0
        }
        return prev - 1
      })
    }, 1000)
    return () => clearInterval(timer)
  }, [countdown])

  const handleClick = async () => {
    const success = await handleSendVerifyCode()
    console.log(success)
    if (success) setCountdown(60)
  }

  return (
    <Button
      type="link"
      size="small"
      disabled={countdown > 0}
      onClick={handleClick}
    >
      {countdown > 0 ? `${countdown}s后重试` : '发送验证码'}
    </Button>
  )
}

export default CountDownButton
