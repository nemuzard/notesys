/**
 * 笔记评论
 */
export interface NoteComment {
  id: number
  noteId: number
  userId: number
  content: string
  createdAt: string
  updatedAt: string
  isDeleted: boolean
}
