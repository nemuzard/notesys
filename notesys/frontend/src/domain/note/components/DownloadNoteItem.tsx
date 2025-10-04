import React, { useState } from 'react'
import { message } from 'antd'
import { noteService } from '../service/noteService.ts'
import { useApp } from '../../../base/hooks'

const DownloadNoteItem: React.FC = () => {
  const app = useApp()

  const [loading, setLoading] = useState(false)

  const handleDownload = async () => {
    if (!app.isLogin) {
      message.info('请先登录')
      return
    }

    if (loading) {
      message.info('正在下载中...')
      return
    }

    setLoading(true)

    const { data } = await noteService.downloadNoteService()

    const markdown = data.markdown

    try {
      const blob = new Blob([markdown], { type: 'text/markdown' })
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = '卡码笔记' + Date.now() + '.md'
      link.style.display = 'none'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    } catch (e: any) {
      message.error(e.getMessage())
    } finally {
      setLoading(false)
    }
  }

  return (
    <span
      className="text-black-88 cursor-pointer px-4 font-sans text-sm"
      onClick={handleDownload}
    >
      {loading ? '下载中...' : '下载笔记'}
    </span>
  )
}

export default DownloadNoteItem
