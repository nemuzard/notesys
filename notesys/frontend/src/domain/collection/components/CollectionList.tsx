import React from 'react'
import { CollectionVO } from '../types/types.ts'

interface CollectionListProps {
  collectionVOList: CollectionVO[] // 收藏夹列表
  collectNote: (
    collectionId: number,
    noteId: number,
    collect: boolean,
  ) => Promise<void> // 收藏笔记
  setNoteCollectStatusHandle: (noteId: number, isCollected: boolean) => void
}

// 在 Modal 中展示的收藏夹列表
const CollectionList: React.FC<CollectionListProps> = ({
  collectionVOList,
  collectNote,
  setNoteCollectStatusHandle,
}) => {
  return (
    <div>
      {collectionVOList.map((collectionVO) => (
        <label
          key={'label' + collectionVO.collectionId}
          className="mb-2 flex cursor-pointer items-center"
        >
          <div className={'flex w-full items-center justify-between'}>
            <div className={''}>
              <div className={'text-neutral-700'}>{collectionVO.name}</div>
              <div className={'mb-1 mt-1 text-xs text-gray-400'}>
                {collectionVO.description ?? '-'}
              </div>
            </div>
            <input
              type="checkbox"
              checked={collectionVO.noteStatus?.isCollected ?? false}
              onChange={async (event: React.ChangeEvent<HTMLInputElement>) => {
                const collected = event.target.checked
                if (!collectionVO.noteStatus) return

                // 获取收藏次数
                const collectCount = collectionVOList.reduce((acc, cur) => {
                  if (cur.noteStatus && cur.noteStatus.isCollected) {
                    return acc + 1
                  }
                  return acc
                }, 0)

                // 如果收藏次数为 0，并且是收藏事件
                if (collectCount === 0 && collected) {
                  setNoteCollectStatusHandle(
                    collectionVO.noteStatus.noteId,
                    collected,
                  )
                }

                // 如果收藏次数为 1，并且是取消收藏事件
                if (collectCount === 1 && !collected) {
                  setNoteCollectStatusHandle(
                    collectionVO.noteStatus.noteId,
                    collected,
                  )
                }

                await collectNote(
                  collectionVO.collectionId,
                  collectionVO.noteStatus.noteId,
                  collected,
                )
              }}
              className={
                'h-4 w-4 rounded border-gray-300 text-blue-600 ' +
                'transition-all duration-300 ease-in-out focus:ring-blue-500' +
                'checked:bg-blue-600 checked:text-opacity-70'
              }
            />
          </div>
        </label>
      ))}
    </div>
  )
}

export default CollectionList
