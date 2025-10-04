import React from 'react'
import { CollectionVO } from '../types/types.ts'
import { Button, Dropdown, List, message } from 'antd'
import {
  DeleteOutlined,
  EditOutlined,
  EllipsisOutlined,
} from '@ant-design/icons'
import type { MenuProps } from 'antd'

interface CollectionList2Props {
  collectionVOList: CollectionVO[]
  handleSelectedCollectionId: (collectionId: number) => void
  toggleShowCollectionDetail: () => void
}

// 用户后台的收藏夹列表
const CollectionList2: React.FC<CollectionList2Props> = ({
  collectionVOList,
  handleSelectedCollectionId,
  toggleShowCollectionDetail,
}) => {
  return (
    <List
      grid={{ gutter: 16, column: 2 }}
      dataSource={collectionVOList}
      renderItem={(item) => {
        // TODO: 实现删除和修改收藏夹的功能
        const items: MenuProps['items'] = [
          {
            key: item.collectionId + 'ic2',
            label: <div className="text-gray-500">编辑收藏夹</div>,
            icon: <EditOutlined className="text-gray-500" />,
            onClick: () => {
              message.info('todo...')
            },
          },
          {
            key: item.collectionId + 'ic',
            label: <div className="text-gray-500">删除收藏夹</div>,
            icon: <DeleteOutlined className="text-gray-500" />,
            onClick: () => {
              message.info('todo...')
            },
          },
        ]
        /**
         * 点击收藏夹事件处理
         * 需要将 Dropdown 的点击事件屏蔽
         */
        const clickHandle = (e: any) => {
          if (
            !e.target.closest('.ant-dropdown-trigger') &&
            !e.target.closest('.ant-dropdown')
          ) {
            handleSelectedCollectionId(item.collectionId)
            toggleShowCollectionDetail()
          }
        }

        return (
          <List.Item key={item.collectionId}>
            <div
              className="my-2 cursor-pointer rounded border border-gray-100 p-4 hover:shadow"
              onClick={clickHandle}
            >
              <div className="flex justify-between">
                <div className="text-base font-medium text-gray-700">
                  {item.name}
                </div>
                <Dropdown trigger={['click']} menu={{ items }}>
                  <Button type="text" icon={<EllipsisOutlined />} />
                </Dropdown>
              </div>
              <div className="font-sans text-xs text-gray-500">
                {item.description ?? '-'}
              </div>
            </div>
          </List.Item>
        )
      }}
    />
  )
}

export default CollectionList2
