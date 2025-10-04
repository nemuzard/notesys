export interface CollectionEntity {
  collectionId: number
  name: string
  description: string
  creatorId: string
  createdAt: string
  updatedAt: string
}

interface NoteStatus {
  noteId: number
  isCollected: boolean
}

export type CollectionVO = Omit<
  CollectionEntity,
  'createdAt' | 'updatedAt' | 'creatorId'
> & {
  noteStatus?: NoteStatus
}

// 查询收藏夹的查询参数
export interface CollectionQueryParams {
  noteId: number | undefined
  creatorId: string | undefined
}

// 创建收藏夹的请求体
export interface CreateCollectionBody {
  name: string
  description?: string
}

// 批量收藏的请求体
export interface UpdateItem {
  collectionId: number
  action: 'delete' | 'create'
}

export interface BatchUpdateCollectionBody {
  noteId: number
  collections: UpdateItem[]
}
