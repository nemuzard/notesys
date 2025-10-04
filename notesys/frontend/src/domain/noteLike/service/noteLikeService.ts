import { httpClient } from '../../../request'
import { noteLikeApiList } from '../api/noteLikeApi.ts'

export const noteLikeService = {
  /**
   * 点赞
   */
  likeService: (noteId: number) => {
    return httpClient.request(noteLikeApiList.like, {
      pathParams: [noteId],
    })
  },

  /**
   * 取消点赞
   */
  unLikeService: (noteId: number) => {
    return httpClient.request(noteLikeApiList.unLike, {
      pathParams: [noteId],
    })
  },
}
