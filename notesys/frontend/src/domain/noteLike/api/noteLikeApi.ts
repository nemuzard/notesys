import { ApiList } from '../../../request'

export const noteLikeApiList: ApiList = {
  like: ['POST', '/api/like/note/{noteId}'],
  unLike: ['DELETE', '/api/like/note/{noteId}'],
}
