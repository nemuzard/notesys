import { ApiList } from '../../../request'

export const collectionApiList: ApiList = {
  getCollectionList: ['GET', '/api/collections'],
  createCollection: ['POST', '/api/collections'],
  deleteCollection: ['DELETE', '/api/collections/{collectionId}'],
  batchUpdateCollection: ['POST', '/api/collections/batch'],
}
