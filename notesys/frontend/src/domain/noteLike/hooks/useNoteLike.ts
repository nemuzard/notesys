import { noteLikeService } from '../service/noteLikeService.ts'

export function useNoteLike() {
  function like(noteId: number) {
    return noteLikeService.likeService(noteId)
  }

  function unLike(noteId: number) {
    return noteLikeService.unLikeService(noteId)
  }

  return {
    like,
    unLike,
  }
}
