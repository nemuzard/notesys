import React, { useState } from 'react'
import { Button, Form, Input, Modal } from 'antd'
import TextArea from 'antd/es/input/TextArea'
import { CreateCollectionBody } from '../types/types.ts'

interface CreateCollectionModalProps {
  isModalOpen: boolean
  toggleIsModalOpen: () => void
  createCollection: (
    body: CreateCollectionBody,
    noteId?: number, // 笔记 ID，点击某个笔记弹窗时，该笔记的 ID
  ) => Promise<void> // 创建收藏夹处理函数
  selectedNoteId?: number
}

const CreateCollectionModal: React.FC<CreateCollectionModalProps> = ({
  isModalOpen,
  toggleIsModalOpen,
  createCollection,
  selectedNoteId,
}) => {
  const [form] = Form.useForm()

  const [loading, setLoading] = useState(false)

  const onFinishHandle = async (values: CreateCollectionBody) => {
    setLoading(true)
    await createCollection(values, selectedNoteId)
    setLoading(false)
    form.resetFields()
    toggleIsModalOpen()
  }

  return (
    <Modal open={isModalOpen} onCancel={toggleIsModalOpen} footer={null}>
      <div className="mb-4 text-center text-lg font-medium">创建新的收藏夹</div>
      <Form form={form} autoComplete={'off'} onFinish={onFinishHandle}>
        <Form.Item
          name={'name'}
          rules={[
            { required: true, message: '请输入收藏夹名称' },
            { min: 2, message: '最少两个字符' },
            { max: 32, message: '最多 32 个字符' },
            {
              pattern: new RegExp('^[\\u4e00-\\u9fa5a-zA-Z0-9_+\\-]+$'),
              message: '只能包含中文、字母、数字、下划线、中划线',
            },
          ]}
        >
          <Input placeholder={'请输入收藏夹名称'} />
        </Form.Item>
        <Form.Item
          name={'description'}
          rules={[
            { max: 128, message: '最多 128 个字符' },
            {
              pattern: new RegExp('^[\\u4e00-\\u9fa5a-zA-Z0-9_+\\-]+$'),
              message: '只能包含中文、字母、数字、下划线、中划线',
            },
          ]}
        >
          <TextArea placeholder={'请输入收藏夹描述'} rows={4} />
        </Form.Item>
        <Form.Item>
          <Button type="primary" htmlType="submit" block loading={loading}>
            创建
          </Button>
        </Form.Item>
      </Form>
    </Modal>
  )
}

export default CreateCollectionModal
