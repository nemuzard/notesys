import { httpClient } from '../../../request'
import { StatisticEntity } from '../types/types.ts'
import { statisticApiList } from '../api'

export const statisticService = {
  getStatisticService: (queryParams: { page: number; pageSize: number }) => {
    return httpClient.request<StatisticEntity[]>(
      statisticApiList.getStatistic,
      {
        queryParams: queryParams,
      },
    )
  },
}
