import { useEffect, useState } from 'react'
import { statisticService } from '../service/statisticService.ts'
import { Pagination } from '../../../request'
import { StatisticEntity } from '../types/types.ts'

export function useStatistic(page: number, pageSize: number) {
  /**
   * 统计数据
   */
  const [statistic, setStatistic] = useState<StatisticEntity[]>()

  /**
   * 分页数据
   */
  const [pagination, setPagination] = useState<Pagination>()

  const [loading, setLoading] = useState(false)

  useEffect(() => {
    async function fetchData() {
      setLoading(true)
      const { data, pagination } = await statisticService.getStatisticService({
        page,
        pageSize,
      })
      setLoading(false)
      setStatistic(data)
      setPagination(pagination)
    }

    fetchData().then()
  }, [page, pageSize])

  return {
    loading,
    statistic,
    pagination,
  }
}
