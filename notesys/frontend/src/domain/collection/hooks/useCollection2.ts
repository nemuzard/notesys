import {
  CollectionQueryParams,
  CollectionVO,
  CreateCollectionBody,
} from '../types/types.ts'
import { useEffect, useState } from 'react'
import { collectionService } from '../service/collectionService.ts'

export function useCollection2(queryParams: CollectionQueryParams) {
  /**
   * 收藏夹列表
   */
  const [collectionVOList, setCollectionVOList] = useState<CollectionVO[]>([])

  /**
   * loading status
   */
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!queryParams.creatorId) {
      return
    }

    async function fetchData() {
      setLoading(true)
      const { data } =
        await collectionService.getCollectionListService(queryParams)
      setCollectionVOList(data)
      setLoading(false)
    }

    fetchData().then()
  }, [queryParams, queryParams.noteId, queryParams.creatorId])

  /**
   * 创建收藏夹
   * @param body 收藏夹信息
   * @param noteId 笔记 Id
   */
  async function createCollection(body: CreateCollectionBody, noteId?: number) {
    const { data } = await collectionService.createCollectionService(body)
    setCollectionVOList([
      ...collectionVOList,
      {
        collectionId: data.collectionId,
        name: body.name,
        description: body.description ?? '-',
        noteStatus: noteId
          ? {
              noteId: noteId,
              isCollected: false,
            }
          : undefined,
      },
    ])
  }

  /**
   * 收藏夹收藏笔记处理事件
   * @param collectionId 收藏夹id
   * @param noteId 笔记id
   * @param collect 收藏状态
   */
  async function collectNote(
    collectionId: number,
    noteId: number,
    collect: boolean,
  ) {
    // 先更新状态，避免出现卡顿
    setCollectionVOList(
      collectionVOList.map((collectionVO) => {
        if (collectionVO.collectionId === collectionId) {
          return {
            ...collectionVO,
            noteStatus: {
              noteId: noteId,
              isCollected: collect,
            },
          }
        }
        return collectionVO
      }),
    )
    // 更新服务器状态
    await collectionService.batchUpdateCollectionService({
      noteId: noteId,
      collections: [
        {
          collectionId: collectionId,
          action: collect ? 'create' : 'delete',
        },
      ],
    })
  }

  return { loading, collectionVOList, createCollection, collectNote }
}
