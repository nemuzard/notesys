import { ApiList } from '../../../request'

export const noteApiList: ApiList = {
  getNoteList: ['GET', '/api/notes'],
  createNote: ['POST', '/api/notes'],
  updateNote: ['PATCH', '/api/notes/{noteId}'],
  deleteNote: ['DELETE', '/api/notes/{noteId}'],
  getNoteRankList: ['GET', '/api/notes/ranklist'],
  getHeatMap: ['GET', '/api/notes/heatmap'],
  getTop3Count: ['GET', '/api/notes/top3count'],
  downloadNote: ['GET', '/api/notes/download'],
}
