import React, { useEffect, useState } from 'react'
import { Button, Drawer, Form, Input, message, Select } from 'antd'
import {
  CreateOrUpDateQuestionListBody,
  QuestionListEntity,
  QuestionListOptType,
} from '../types/types.ts'
import { useForm } from 'antd/es/form/Form'
import TextArea from 'antd/es/input/TextArea'
import { diffObject } from '../../../base/utils'

interface QuestionListOptDrawerProps {
  mode: QuestionListOptType
  isDrawerOpen: boolean
  toggleIsDrawerOpen: () => void
  updateQuestionListHandle: (
    questionListId: number,
    body: CreateOrUpDateQuestionListBody,
  ) => void
  createQuestionListHandle: (body: CreateOrUpDateQuestionListBody) => void
  selectedQuestionList: QuestionListEntity | undefined
}

const QuestionListOptDrawer: React.FC<QuestionListOptDrawerProps> = ({
  mode,
  isDrawerOpen,
  toggleIsDrawerOpen,
  createQuestionListHandle,
  updateQuestionListHandle,
  selectedQuestionList,
}) => {
  const [form] = useForm()
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    form.setFieldsValue({
      name: selectedQuestionList?.name,
      description: selectedQuestionList?.description,
      type: selectedQuestionList?.type,
    })
  })

  /**
   * 提交表单
   * @param values
   */
  const onFinishHandle = async (values: any) => {
    setLoading(true)
    try {
      if (mode === 'create') {
        // 创建操作
        createQuestionListHandle({
          name: values.name,
          description: values.description,
          type: Number(values.type),
        })
        message.success('创建题单成功')
      } else {
        // 更新操作
        if (selectedQuestionList === undefined) {
          message.error('未选中题单')
          return
        }
        const diff = diffObject(selectedQuestionList, values)
        if (Object.keys(diff).length === 0) {
          message.warning('未作任何修改')
          return
        }
        // @ts-expect-error tes expect error
        updateQuestionListHandle(selectedQuestionList.questionListId, {
          ...diff,
        })
        message.success('更新题单成功')
      }
      toggleIsDrawerOpen()
      form.resetFields()
    } catch (e: any) {
      message.error(e.message())
    } finally {
      setLoading(false)
    }
  }

  return (
    <Drawer
      open={isDrawerOpen}
      title={mode === 'create' ? '创建分类' : '编辑分类'}
      onClose={toggleIsDrawerOpen}
      width={450}
    >
      <Form
        form={form}
        autoComplete="off"
        layout="vertical"
        onFinish={onFinishHandle}
      >
        <Form.Item
          label="题单名称"
          name="name"
          rules={[
            { required: true, message: '请输入题单名称' },
            {
              min: 2,
              max: 32,
              message: '题单名称长度在 2 - 32 个字符范围内',
            },
          ]}
        >
          <Input placeholder="请输入题单名称" />
        </Form.Item>
        <Form.Item
          label="题单描述"
          name="description"
          rules={[
            {
              min: 2,
              max: 128,
              message: '分类描述长度在 2 - 255 个字符范围内',
            },
          ]}
        >
          <TextArea placeholder="请输入题单描述"></TextArea>
        </Form.Item>
        <Form.Item
          label="题单分类"
          name="type"
          rules={[{ required: true, message: '请选择题单分类' }]}
        >
          <Select>
            <Select.Option value="1">普通题单</Select.Option>
            <Select.Option value="2">专属题单</Select.Option>
          </Select>
        </Form.Item>
        <Form.Item>
          <Button htmlType="submit" type="primary" loading={loading} block>
            {mode === 'create' ? '确认创建' : '确认更新'}
          </Button>
        </Form.Item>
      </Form>
    </Drawer>
  )
}

export default QuestionListOptDrawer
