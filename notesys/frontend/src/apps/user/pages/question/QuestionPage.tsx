import React, { Suspense, useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { QuestionView, useQuestion } from '../../../../domain/question'
import {
  MarkdownEditor,
  MarkdownRender,
  Panel,
} from '../../../../base/components'
import { Button, message, Modal, Spin } from 'antd'
import { Upload } from '@icon-park/react'
import { EyeOutlined } from '@ant-design/icons'
import { NoteList, NoteQueryParams, useNotes } from '../../../../domain/note'
import { useApp } from '../../../../base/hooks'

const QuestionPage: React.FC = () => {
  /**
   * 地址栏参数
   */
  const { questionId } = useParams()

  /**
   * 获取问题携带用户相关笔记的问题详情
   */
  const { question, userFinishedQuestion } = useQuestion(Number(questionId))

  /**
   * 笔记内容
   */
  const [value, setValue] = useState(question?.userNote.content ?? '')
  const setValueHandle = (value: string) => {
    setValue(value)
  }

  useEffect(() => {
    if (question?.userNote) {
      if (question?.userNote.finished) {
        setValueHandle(question?.userNote.content)
      }
    }
  }, [question])

  /**
   * 控制编辑器显示隐藏功能
   */
  const [isEditorVisible, setIsEditorVisible] = useState(false)
  const toggleEditorVisible = () => {
    setIsEditorVisible(!isEditorVisible)
  }

  /**
   * 写笔记 / 编辑笔记按钮点击事件
   */
  function writeOrEditButtonHandle() {
    toggleEditorVisible()
  }

  /**
   * 获取和问题相关的笔记列表
   */
  const [noteQueryParams, setNoteQueryParams] = useState<NoteQueryParams>({
    page: 1,
    pageSize: 10,
    questionId: Number(questionId),
  })

  const {
    noteList,
    pagination,
    createNoteHandle,
    updateNoteHandle,
    setNoteLikeStatusHandle,
    setNoteCollectStatusHandle,
  } = useNotes(noteQueryParams)

  /**
   * 提交笔记处理事件
   */
  const [createBtnLoading, setCreateBtnLoading] = useState(false)

  /**
   * 用户信息
   * app 信息
   */
  const app = useApp()

  const createOrUpdateNoteClickHandle = async () => {
    if (!app.isLogin) {
      message.info('请先登录')
      return
    }

    setCreateBtnLoading(true)

    try {
      if (!question?.userNote.finished) {
        const noteId = await createNoteHandle(Number(questionId), value)
        toggleEditorVisible()
        // 校验一下 noteId
        if (noteId) {
          userFinishedQuestion(noteId, value)
        }
        message.success('笔记已提交')
      } else {
        // 修改笔记操作
        if (!question?.userNote) return
        await updateNoteHandle(question?.userNote.noteId, {
          content: value,
          questionId: Number(questionId),
        })
        message.success('笔记已修改')
        toggleEditorVisible()
      }
    } catch (e: any) {
      console.log(e.message)
      message.error(e.message)
    } finally {
      setCreateBtnLoading(false)
    }
  }

  const [isShowPreview, setIsShowPreview] = useState(false)

  return (
    <>
      <QuestionView
        question={question}
        writeOrEditButtonHandle={writeOrEditButtonHandle}
      />
      {/* 编辑器 */}
      {isEditorVisible && (
        <div className="mb-4 flex w-full justify-center">
          <div className="w-[900px]">
            <div className="h-[calc(100vh-var(--header-height)-65px)]">
              <Suspense
                fallback={
                  <Spin tip="加载编辑器中" className="mt-12">
                    {''}
                  </Spin>
                }
              >
                <MarkdownEditor
                  value={value}
                  setValue={setValueHandle}
                ></MarkdownEditor>
              </Suspense>
            </div>
            <div className="sticky bottom-0 z-20 flex justify-end gap-2 border-t border-gray-200 bg-white p-4 shadow">
              <Button
                icon={<EyeOutlined />}
                onClick={() => setIsShowPreview(true)}
              >
                预览笔记
              </Button>
              <Button
                type="primary"
                icon={<Upload />}
                loading={createBtnLoading}
                onClick={createOrUpdateNoteClickHandle}
              >
                {question?.userNote.finished ? '修改笔记' : '提交笔记'}
              </Button>
            </div>
          </div>
        </div>
      )}
      {/* 预览框 */}
      <Modal
        open={isShowPreview}
        onCancel={() => setIsShowPreview(false)}
        footer={null}
        width={1000}
      >
        <MarkdownRender markdown={value} />
      </Modal>
      <div className="flex w-full justify-center">
        <div className="w-[700px]">
          <Panel>
            <NoteList
              showQuestion={false}
              noteList={noteList}
              pagination={pagination}
              queryParams={noteQueryParams}
              setQueryParams={setNoteQueryParams}
              setNoteLikeStatusHandle={setNoteLikeStatusHandle}
              setNoteCollectStatusHandle={setNoteCollectStatusHandle}
            />
          </Panel>
        </div>
      </div>
    </>
  )
}

export default QuestionPage
