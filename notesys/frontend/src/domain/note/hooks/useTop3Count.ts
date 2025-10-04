import { useEffect, useState } from 'react'
import { NoteTop3Count } from '../types/serviceTypes.ts'
import { noteService } from '../service/noteService.ts'
import { useApp } from '../../../base/hooks'

export function useTop3Count() {
  const [top3Count, setTop3Count] = useState<NoteTop3Count>()

  const [loading, setLoading] = useState(false)

  const app = useApp()

  useEffect(() => {
    if (!app.isLogin) {
      return
    }

    async function fetchData() {
      setLoading(true)
      const { data } = await noteService.getTop3CountService()
      setTop3Count(data)
    }

    fetchData().then()
    setLoading(false)
  }, [app])

  return { top3Count, loading }
}
