import { useEffect, useState } from 'react'
import {
  CommentQueryParams,
  Comment,
  CreateCommentRequest,
} from '@/domain/comment/types.ts'
import { commentService } from '@/domain/comment/service/commentService.ts'
import { useUser } from '@/domain/user/hooks/useUser.ts'
import { Pagination } from '@/request'

export function useComment(commentQueryParams: CommentQueryParams) {
  const [comments, setComments] = useState<Comment[]>([])
  const [loading, setLoading] = useState(false)

  const [pagination, setPagination] = useState<Pagination | undefined>({
    total: 0,
    page: 1,
    pageSize: 10,
  })

  const user = useUser()

  /**
   * 获取评论列表
   */
  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true)
        const res = await commentService.getCommentsService(commentQueryParams)
        setComments(res.data)
        setPagination(res.pagination)
        setLoading(false)
      } catch (error: unknown) {
        if (error instanceof Error) {
          console.log(error.message)
        }
      }
    }

    fetchData().then()
  }, [
    commentQueryParams,
    commentQueryParams.page,
    commentQueryParams.noteId,
    commentQueryParams.pageSize,
  ])

  /**
   * 递归插入回复到对应的主评论
   */
  function insertReplyToTree(
    tree: Comment[],
    parentId: number,
    reply: Comment,
  ): Comment[] {
    return tree.map((comment) => {
      if (comment.commentId === parentId) {
        return {
          ...comment,
          replies: comment.replies ? [...comment.replies, reply] : [reply],
        }
      } else if (comment.replies && comment.replies.length > 0) {
        return {
          ...comment,
          replies: insertReplyToTree(comment.replies, parentId, reply),
        }
      } else {
        return comment
      }
    })
  }

  /**
   * 创建评论
   */
  async function createComment(params: CreateCommentRequest) {
    const newComment: Comment = {
      commentId: -1, // 占位
      noteId: params.noteId,
      content: params.content,
      likeCount: 0,
      replyCount: 0,
      createdAt: new Date().toISOString(),
      author: {
        userId: user.userId,
        username: user.username,
        avatarUrl: user.avatarUrl,
      },
      userActions: {
        isLiked: false,
      },
    }
    setComments((prev) => {
      if (params.parentId !== undefined && params.parentId !== 0) {
        // 递归加入到对应一级评论的 replies
        return insertReplyToTree(prev, params.parentId, newComment)
      } else {
        // 一级评论直接加入数组
        return [newComment, ...prev]
      }
    })
    const resp = await commentService.createCommentService(params)
    const commentId = resp.data
    setComments((prev) => {
      function updateIdInTree(tree: Comment[]): Comment[] {
        return tree.map((comment) => {
          if (comment.commentId === -1) {
            return { ...comment, commentId }
          } else if (comment.replies && comment.replies.length > 0) {
            return { ...comment, replies: updateIdInTree(comment.replies) }
          } else {
            return comment
          }
        })
      }

      return updateIdInTree(prev)
    })
  }

  /**
   * 递归更新任意层级评论的点赞状态
   */
  function updateLikeInTree(
    tree: Comment[],
    commentId: number,
    isLiked: boolean,
  ): Comment[] {
    return tree.map((comment) => {
      if (comment.commentId === commentId) {
        return {
          ...comment,
          likeCount: comment.likeCount + (isLiked ? 1 : -1),
          userActions: {
            ...comment.userActions,
            isLiked: isLiked,
          },
        }
      } else if (comment.replies && comment.replies.length > 0) {
        return {
          ...comment,
          replies: updateLikeInTree(comment.replies, commentId, isLiked),
        }
      } else {
        return comment
      }
    })
  }

  /**
   * 点赞 / 取消点赞
   */
  async function likeComment(commentId: number) {
    // 递归查找当前点赞状态
    function findComment(tree: Comment[]): Comment | undefined {
      for (const comment of tree) {
        if (comment.commentId === commentId) return comment
        if (comment.replies && comment.replies.length > 0) {
          const found = findComment(comment.replies)
          if (found) return found
        }
      }
      return undefined
    }
    const comment = findComment(comments)
    if (comment) {
      if (comment.userActions?.isLiked) {
        setComments((prev) => updateLikeInTree(prev, commentId, false))
        await commentService.unlikeCommentService(commentId)
      } else {
        setComments((prev) => updateLikeInTree(prev, commentId, true))
        await commentService.likeCommentService(commentId)
      }
    }
  }

  return {
    loading,
    comments,
    pagination,
    createComment,
    likeComment,
  }
}
