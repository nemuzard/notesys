import React, { useEffect, useState } from 'react'
import { useCollection2 } from '../../../../../domain/collection'
import { CollectionQueryParams } from '../../../../../domain/collection/types/types.ts'
import { useUser } from '../../../../../domain/user/hooks/useUser.ts'
import CollectionList2 from '../../../../../domain/collection/components/CollectionList2.tsx'
import CollectionDetail from './CollectionDetail.tsx'

// 收藏夹
const UserCollect: React.FC = () => {
  const [queryParams, setQueryParams] = useState<CollectionQueryParams>({
    noteId: undefined,
    creatorId: undefined,
  })

  const user = useUser()

  useEffect(() => {
    setQueryParams({
      noteId: undefined,
      creatorId: user?.userId,
    })
  }, [user])

  /**
   * 用于控制当前显示的是具体的收藏夹内容还是收藏夹列表
   */
  const [showCollectionDetail, setShowCollectionDetail] = useState(false)
  const toggleShowCollectionDetail = () => {
    setShowCollectionDetail(!showCollectionDetail)
  }

  /**
   * 选中的收藏夹 ID
   */
  const [selectedCollectionId, setSelectedCollectionId] = useState<number>()
  const handleSelectedCollectionId = (collectionId: number) => {
    setSelectedCollectionId(collectionId)
  }

  const { collectionVOList } = useCollection2(queryParams)

  return (
    <>
      {showCollectionDetail ? (
        <CollectionDetail
          selectedCollectionId={selectedCollectionId}
          toggleShowCollectionDetail={toggleShowCollectionDetail}
        />
      ) : (
        <div>
          <div className="mb-4 text-lg font-medium">我的收藏夹</div>
          <CollectionList2
            collectionVOList={collectionVOList}
            toggleShowCollectionDetail={toggleShowCollectionDetail}
            handleSelectedCollectionId={handleSelectedCollectionId}
          />
        </div>
      )}
    </>
  )
}

export default UserCollect
