import React, { useState } from 'react'
import { CollectionVO, CreateCollectionBody } from '../types/types.ts'
import { Empty, Modal } from 'antd'
import CollectModalFooter from './CollectModalFooter.tsx'
import CreateCollectionModal from './CreateCollectionModal.tsx'
import CollectionList from './CollectionList.tsx'

interface CollectionModalProps {
  isModalOpen: boolean // 控制弹窗显示状态
  toggleIsModalOpen: () => void // 切换弹窗显示状态
  collectionVOList: CollectionVO[] // 收藏夹列表
  selectedNoteId: number | undefined
  createCollection: (
    body: CreateCollectionBody,
    noteId?: number, // 笔记 ID，点击某个笔记弹窗时，该笔记的 ID
  ) => Promise<void> // 创建收藏夹处理函数
  collectNote: (
    collectionId: number,
    noteId: number,
    collect: boolean,
  ) => Promise<void> // 收藏笔记
  setNoteCollectStatusHandle: (noteId: number, isCollected: boolean) => void // 设置笔记的收藏状态
}

// 用来显示收藏夹列表的 Modal 组件
const CollectionModal: React.FC<CollectionModalProps> = ({
  isModalOpen,
  toggleIsModalOpen,
  collectionVOList,
  createCollection,
  collectNote,
  setNoteCollectStatusHandle,
  selectedNoteId,
}) => {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const toggleCreateModalOpen = () => {
    setIsCreateModalOpen(!isCreateModalOpen)
  }

  return (
    <>
      <Modal
        open={isModalOpen}
        onCancel={toggleIsModalOpen}
        footer={
          <CollectModalFooter
            onConfirm={toggleIsModalOpen}
            onCreate={toggleCreateModalOpen}
          />
        }
      >
        <div className="mb-4 text-center text-lg font-medium">选择收藏夹</div>
        {collectionVOList.length === 0 && <Empty description={'暂无收藏夹'} />}
        {collectionVOList.length > 0 && (
          <CollectionList
            collectionVOList={collectionVOList}
            collectNote={collectNote}
            setNoteCollectStatusHandle={setNoteCollectStatusHandle}
          />
        )}
      </Modal>
      <CreateCollectionModal
        isModalOpen={isCreateModalOpen}
        toggleIsModalOpen={toggleCreateModalOpen}
        createCollection={createCollection}
        selectedNoteId={selectedNoteId}
      />
    </>
  )
}

export default CollectionModal
