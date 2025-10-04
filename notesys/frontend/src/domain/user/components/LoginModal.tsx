import React, { useState } from 'react'
import {
  Avatar,
  Button,
  Col,
  Form,
  Input,
  message,
  Modal,
  Row,
  Segmented,
} from 'antd'
import {
  ALPHANUMERIC_UNDERSCORE,
  ALPHANUMERIC_UNDERSCORE_CHINESE,
  PASSWORD_ALLOWABLE_CHARACTERS,
  EMAIL_PATTERN,
} from '../../../base/regex'
import { useLogin } from '../hooks/useLogin.ts'
import { useRegister } from '../hooks/useRegister.ts'
import { userService } from '../service/userService.ts'
import { useForm } from 'antd/es/form/Form'
import CountDownButton from '@/domain/user/components/CountDownButton.tsx'

const LoginModal: React.FC = () => {
  const [open, setOpen] = useState(false)
  const [value, setValue] = useState('login')
  const [loading, setLoading] = useState(false)

  const { loginHandle } = useLogin()
  const { registerHandle } = useRegister()

  const [form] = useForm()

  // 发送验证码
  const handleSendVerifyCode = async () => {
    try {
      await form.validateFields(['email'])
      const email = form.getFieldValue('email')
      if (!email) {
        message.error('请输入邮箱')
        return false
      }
      setLoading(true)
      await userService.sendVerifyCode({ email, type: 'REGISTER' })
      message.success('验证码已发送')
      return true
    } catch (e: any) {
      message.error(e.message || '发送失败')
      return false
    } finally {
      setLoading(false)
    }
  }

  async function onFinish(values: any) {
    try {
      setLoading(true)
      if (value === 'login') {
        await loginHandle(values)
        message.success('登录成功')
      } else if (value === 'register') {
        await registerHandle(values)
        message.success('注册成功')
      }
      setOpen(false)
    } catch (e: any) {
      message.error(e.message)
    } finally {
      setLoading(false)
    }
  }

  const LoginForm = () => {
    return (
      <Form
        name="loginForm"
        labelCol={{ span: 24 }}
        wrapperCol={{ span: 24 }}
        onFinish={onFinish}
        style={{ minWidth: '100%' }}
        autoComplete={'off'}
        layout={'vertical'}
        form={form}
      >
        {value === 'login' && (
          <Form.Item
            label="账号或邮箱"
            name={form.getFieldValue('email') ? 'email' : 'account'}
            rules={[
              { required: true, message: '请输入账号或邮箱' },
              {
                pattern: form.getFieldValue('email')
                  ? EMAIL_PATTERN
                  : ALPHANUMERIC_UNDERSCORE,
                message: form.getFieldValue('email')
                  ? '邮箱格式不正确'
                  : '账号只能包含字母、数字和下划线',
              },
            ]}
          >
            <Input
              autoComplete="off"
              onChange={(e) => {
                // 根据输入内容判断是邮箱还是账号
                const value = e.target.value
                if (value.includes('@')) {
                  form.setFieldsValue({ email: value, account: undefined })
                } else {
                  form.setFieldsValue({ account: value, email: undefined })
                }
              }}
            />
          </Form.Item>
        )}

        {value === 'register' && (
          <>
            <Form.Item
              label="账号"
              name="account"
              rules={[
                { required: true, message: '请输入账号' },
                {
                  pattern: ALPHANUMERIC_UNDERSCORE,
                  message: '账号只能包含字母、数字和下划线',
                },
                {
                  min: 6,
                  max: 16,
                  message: '账号长度在 6 - 16 个字符',
                },
              ]}
            >
              <Input autoComplete="off" />
            </Form.Item>
            <Form.Item
              label="昵称"
              name="username"
              rules={[
                { required: true, message: '请输入用户名' },
                {
                  pattern: ALPHANUMERIC_UNDERSCORE_CHINESE,
                  message: '昵称只能包含中文、字母、数字和下划线',
                },
                {
                  min: 1,
                  max: 16,
                  message: '昵称长度在 1 - 16 个字符之间',
                },
              ]}
            >
              <Input autoComplete={'off'} />
            </Form.Item>
            <Form.Item
              label="邮箱"
              name="email"
              rules={[
                { required: true, message: '请输入邮箱' },
                { type: 'email', message: '邮箱格式不正确' },
              ]}
            >
              <Input autoComplete="off" />
            </Form.Item>
            <Row gutter={8} align="middle">
              <Col flex="auto">
                <Form.Item
                  label="验证码"
                  name="verifyCode"
                  rules={[
                    { required: true, message: '请输入验证码' },
                    { len: 6, message: '验证码长度必须为6位' },
                  ]}
                >
                  <Input autoComplete="off" />
                </Form.Item>
              </Col>
              <Col>
                <CountDownButton handleSendVerifyCode={handleSendVerifyCode} />
              </Col>
            </Row>
          </>
        )}

        <Form.Item
          label="密码"
          name="password"
          rules={[
            { required: true, message: '请输入密码' },
            {
              pattern: PASSWORD_ALLOWABLE_CHARACTERS,
              message: '密码中包含不允许的字符',
            },
            {
              min: 8,
              max: 16,
              message: '密码长度在 8 - 16 个字符之间',
            },
          ]}
        >
          <Input.Password autoComplete="new-password" />
        </Form.Item>
        <Button type="primary" htmlType="submit" block loading={loading}>
          {value === 'register' ? '注册' : '登录'}
        </Button>
      </Form>
    )
  }

  return (
    <div className="cursor-pointer">
      <Avatar size={36} onClick={() => setOpen(true)}>
        <span className="flex items-center text-xs">登录</span>
      </Avatar>
      <Modal
        title={'注册登录'}
        open={open}
        onCancel={() => setOpen(false)}
        footer={null}
      >
        <div className="mt-4">
          <Segmented
            block
            options={[
              {
                label: '登录',
                value: 'login',
              },
              {
                label: '注册',
                value: 'register',
              },
            ]}
            value={value}
            onChange={(value) => setValue(value)}
          />
        </div>
        <div className="mt-4 flex justify-center pb-4">
          <LoginForm />
        </div>
      </Modal>
    </div>
  )
}

export default LoginModal
