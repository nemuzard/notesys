import React, { useEffect, useState } from 'react'
import { Tree } from 'antd'
import { QuestionListCategory } from '../types/types.ts'

interface QuestionListTreeViewProps {
  treeData: QuestionListCategory[]
  selectedQuestionListId: number | undefined
  handleQuestionListSelect: (selectedQuestionListId: number | undefined) => void
}

const QuestionListTreeView: React.FC<QuestionListTreeViewProps> = ({
  treeData,
  handleQuestionListSelect,
  selectedQuestionListId,
}) => {
  const [selectedKeys, setSelectedKeys] = useState<React.Key[]>([
    selectedQuestionListId ?? '',
  ])

  const [expandedKeys, setExpandedKeys] = useState<React.Key[]>([])

  useEffect(() => {
    if (selectedQuestionListId) {
      setSelectedKeys([selectedQuestionListId ?? ''])
      const expandKeys = treeData.find((treeNode) => {
        return treeNode.children?.find((childTreeNode) => {
          if (childTreeNode.questionListId === selectedQuestionListId) {
            return true
          }
        })
      })
      if (expandKeys) {
        setExpandedKeys([expandKeys.key])
      }
    }
  }, [selectedQuestionListId, treeData])

  /**
   * 选中节点
   */
  function onSelectHandle(keys: React.Key[], { selectedNodes }: any) {
    if (
      selectedNodes &&
      selectedNodes instanceof Array &&
      selectedNodes.length === 0
    )
      return
    const key = keys[0]
    const selectedNode = selectedNodes[0] as QuestionListCategory
    setSelectedKeys([key])
    /**
     * 设置选中题单 ID
     */
    handleQuestionListSelect(selectedNode.key)
  }

  function onExpandHandle(keys: React.Key[]) {
    setExpandedKeys(keys)
  }

  return (
    <Tree
      treeData={treeData}
      blockNode={true}
      selectedKeys={selectedKeys}
      expandedKeys={expandedKeys}
      onSelect={onSelectHandle}
      onExpand={onExpandHandle}
    ></Tree>
  )
}

export default QuestionListTreeView
