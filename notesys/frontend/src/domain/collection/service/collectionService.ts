import { httpClient } from '../../../request'
import { collectionApiList } from '../api/collectionApiList.ts'
import {
  BatchUpdateCollectionBody,
  CollectionQueryParams,
  CollectionVO,
  CreateCollectionBody,
} from '../types/types.ts'

export const collectionService = {
  /**
   * 获取收藏夹
   */
  getCollectionListService: (query: CollectionQueryParams) => {
    return httpClient.request<CollectionVO[]>(
      collectionApiList.getCollectionList,
      {
        queryParams: query,
      },
    )
  },

  /**
   * 创建收藏夹
   */
  createCollectionService: (body: CreateCollectionBody) => {
    return httpClient.request<{
      collectionId: number
    }>(collectionApiList.createCollection, {
      body: body,
    })
  },

  /**
   * 删除收藏夹
   */
  deleteCollectionService: (collectionId: number) => {
    return httpClient.request(collectionApiList.deleteCollection, {
      pathParams: [collectionId],
    })
  },

  /**
   * 更新收藏夹
   */
  batchUpdateCollectionService: (body: BatchUpdateCollectionBody) => {
    return httpClient.request(collectionApiList.batchUpdateCollection, {
      body: body,
    })
  },
}
