package com.kama.notes.service.impl;

import com.kama.notes.annotation.NeedLogin;
import com.kama.notes.model.base.ApiResponse;
import com.kama.notes.model.base.EmptyVO;
import com.kama.notes.mapper.CommentMapper;
import com.kama.notes.mapper.NoteMapper;
import com.kama.notes.mapper.UserMapper;
import com.kama.notes.mapper.CommentLikeMapper;
import com.kama.notes.model.base.Pagination;
import com.kama.notes.model.dto.message.MessageDTO;
import com.kama.notes.model.entity.Comment;
import com.kama.notes.model.entity.CommentLike;
import com.kama.notes.model.entity.Note;
import com.kama.notes.model.entity.User;
import com.kama.notes.model.dto.comment.CommentQueryParams;
import com.kama.notes.model.dto.comment.CreateCommentRequest;
import com.kama.notes.model.dto.comment.UpdateCommentRequest;
import com.kama.notes.model.enums.message.MessageTargetType;
import com.kama.notes.model.enums.message.MessageType;
import com.kama.notes.model.vo.comment.CommentVO;
import com.kama.notes.model.vo.user.UserActionVO;
import com.kama.notes.scope.RequestScopeData;
import com.kama.notes.service.CommentService;
import com.kama.notes.service.MessageService;
import com.kama.notes.utils.ApiResponseUtil;
import com.kama.notes.utils.PaginationUtils;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.http.HttpStatus;
import org.springframework.util.CollectionUtils;

import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

/**
 * 评论服务实现类
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class CommentServiceImpl implements CommentService {
    private final CommentMapper commentMapper;
    private final NoteMapper noteMapper;
    private final UserMapper userMapper;
    private final CommentLikeMapper commentLikeMapper;
    private final MessageService messageService;
    private final RequestScopeData requestScopeData;

    @Override
    @NeedLogin
    @Transactional
    public ApiResponse<Integer> createComment(CreateCommentRequest request) {
        log.info("开始创建评论: request={}", request);

        try {
            Long userId = requestScopeData.getUserId();

            // 获取笔记信息
            Note note = noteMapper.findById(request.getNoteId());
            if (note == null) {
                log.error("笔记不存在: noteId={}", request.getNoteId());
                return ApiResponse.error(HttpStatus.NOT_FOUND.value(), "笔记不存在");
            }

            // 创建评论
            Comment comment = new Comment();
            comment.setNoteId(request.getNoteId());
            comment.setContent(request.getContent());
            comment.setAuthorId(userId);
            comment.setParentId(request.getParentId());
            comment.setLikeCount(0);
            comment.setReplyCount(0);
            comment.setCreatedAt(LocalDateTime.now());
            comment.setUpdatedAt(LocalDateTime.now());

            commentMapper.insert(comment);
            log.info("评论创建结果: commentId={}", comment.getCommentId());

            // 增加笔记评论数
            noteMapper.incrementCommentCount(request.getNoteId());

            // 如果是回复评论，增加父评论的回复数
            if (request.getParentId() != null) {
                commentMapper.incrementReplyCount(request.getParentId());
            }

            // 发送评论通知
            MessageDTO messageDTO = new MessageDTO();

            messageDTO.setType(MessageType.COMMENT);
            messageDTO.setTargetType(MessageTargetType.NOTE);
            messageDTO.setTargetId(request.getNoteId());
            messageDTO.setReceiverId(note.getAuthorId());
            messageDTO.setSenderId(userId);
            messageDTO.setContent(request.getContent());
            messageDTO.setIsRead(false);

            messageService.createMessage(messageDTO);

            return ApiResponse.success(comment.getCommentId());
        } catch (Exception e) {
            log.error("创建评论失败", e);
            return ApiResponse.error(HttpStatus.INTERNAL_SERVER_ERROR.value(), "创建评论失败: " + e.getMessage());
        }
    }

    @Override
    @NeedLogin
    @Transactional
    public ApiResponse<EmptyVO> updateComment(Integer commentId, UpdateCommentRequest request) {
        Long userId = requestScopeData.getUserId();

        // 查询评论
        Comment comment = commentMapper.findById(commentId);
        if (comment == null) {
            return ApiResponse.error(HttpStatus.NOT_FOUND.value(), "评论不存在");
        }

        // 检查权限
        if (!comment.getAuthorId().equals(userId)) {
            return ApiResponse.error(HttpStatus.FORBIDDEN.value(), "无权修改该评论");
        }

        try {
            // 更新评论
            comment.setContent(request.getContent());
            comment.setUpdatedAt(LocalDateTime.now());
            commentMapper.update(comment);
            return ApiResponse.success(new EmptyVO());
        } catch (Exception e) {
            log.error("更新评论失败", e);
            return ApiResponse.error(HttpStatus.INTERNAL_SERVER_ERROR.value(), "更新评论失败");
        }
    }

    @Override
    @NeedLogin
    @Transactional
    public ApiResponse<EmptyVO> deleteComment(Integer commentId) {
        Long userId = requestScopeData.getUserId();

        // 查询评论
        Comment comment = commentMapper.findById(commentId);
        if (comment == null) {
            return ApiResponse.error(HttpStatus.NOT_FOUND.value(), "评论不存在");
        }

        // 检查权限
        if (!comment.getAuthorId().equals(userId)) {
            return ApiResponse.error(HttpStatus.FORBIDDEN.value(), "无权删除该评论");
        }

        try {
            // 删除评论
            commentMapper.deleteById(commentId);
            return ApiResponse.success(new EmptyVO());
        } catch (Exception e) {
            log.error("删除评论失败", e);
            return ApiResponse.error(HttpStatus.INTERNAL_SERVER_ERROR.value(), "删除评论失败");
        }
    }

    @Override
    public ApiResponse<List<CommentVO>> getComments(CommentQueryParams params) {
        try {
            // 拉取整棵评论树（一个 note 通常也就几百条，足够了）
            List<Comment> comments = commentMapper.findByNoteId(params.getNoteId());

            System.out.println(comments);

            if (CollectionUtils.isEmpty(comments)) {
                return ApiResponse.success(Collections.emptyList());
            }

            /* ---------- 数据准备：分组 + 批量查询 ---------- */

            // 2.1 一级评论列表
            List<Comment> firstLevel = comments.stream()
                    .filter(c -> c.getParentId() == null || c.getParentId() == 0)
                    .sorted(Comparator.comparing(Comment::getCreatedAt))      // 按时间升序
                    .toList();

            int from = PaginationUtils.calculateOffset(params.getPage(), params.getPageSize());
            if (from >= firstLevel.size()) {
                return ApiResponse.success(Collections.emptyList());          // 页码溢出，直接返回空
            }

            int to = Math.min(from + params.getPageSize(), firstLevel.size());
            List<Comment> pagedFirst = firstLevel.subList(from, to);

            // 2.3 parentId  => children
            Map<Integer, List<Comment>> repliesMap = comments.stream()
                    .filter(c -> c.getParentId() != null)
                    .collect(Collectors.groupingBy(Comment::getParentId));

            // 2.4 批量获取作者信息
            List<Long> authorIds = comments.stream()
                    .map(Comment::getAuthorId)
                    .collect(Collectors.toList());

            Map<Long, User> authorMap = userMapper.findByIdBatch(authorIds)
                    .stream()
                    .collect(Collectors.toMap(User::getUserId, u -> u));

            // 2.5 当前用户一次性查点赞
            Long currentUserId = requestScopeData.getUserId();

            Set<Integer> likedSet;
            if (currentUserId != null) {
                List<Integer> allCommentIds = comments.stream()
                        .map(Comment::getCommentId)
                        .toList();
                likedSet = new HashSet<>(commentLikeMapper.findUserLikedCommentIds(currentUserId, allCommentIds));
            } else {
                likedSet = Collections.emptySet();
            }

            /* ---------- 递归装配 VO ---------- */
            List<CommentVO> result = pagedFirst.stream()
                    .map(c -> toVO(c, repliesMap, authorMap, likedSet))
                    .toList();

            Pagination pagination = new Pagination(params.getPage(), params.getPageSize(), firstLevel.size());

            return ApiResponseUtil.success("", result, pagination);
        } catch (Exception e) {
            log.error("获取评论列表失败", e);
            return ApiResponse.error(HttpStatus.INTERNAL_SERVER_ERROR.value(), "获取评论列表失败");
        }
    }

    /**
     * 把 Comment 递归转换成 CommentVO
     */
    private CommentVO toVO(Comment c,
                           Map<Integer, List<Comment>> repliesMap,
                           Map<Long, User> authorMap,
                           Set<Integer> likedSet) {
        CommentVO vo = new CommentVO();
        vo.setCommentId(c.getCommentId());
        vo.setNoteId(c.getNoteId());
        vo.setContent(c.getContent());
        vo.setLikeCount(c.getLikeCount());
        vo.setReplyCount(c.getReplyCount());
        vo.setCreatedAt(c.getCreatedAt());
        vo.setUpdatedAt(c.getUpdatedAt());

        // 作者信息
        User author = authorMap.get(c.getAuthorId());
        if (author != null) {
            CommentVO.SimpleAuthorVO a = new CommentVO.SimpleAuthorVO();
            a.setUserId(author.getUserId());
            a.setUsername(author.getUsername());
            a.setAvatarUrl(author.getAvatarUrl());
            vo.setAuthor(a);
        }

        // 当前用户动作
        if (!likedSet.isEmpty()) {
            UserActionVO actions = new UserActionVO();
            actions.setIsLiked(likedSet.contains(c.getCommentId()));
            vo.setUserActions(actions);
        } else {
            vo.setUserActions(new UserActionVO());
            vo.getUserActions().setIsLiked(false);
        }

        // 递归子评论
        List<Comment> children = repliesMap.get(c.getCommentId());
        if (children != null && !children.isEmpty()) {
            List<CommentVO> childVOs = children.stream()
                    .map(child -> toVO(child, repliesMap, authorMap, likedSet))
                    .toList();
            vo.setReplies(childVOs);
        } else {
            vo.setReplies(Collections.emptyList());
        }
        return vo;
    }

    @Override
    @NeedLogin
    @Transactional
    public ApiResponse<EmptyVO> likeComment(Integer commentId) {
        Long userId = requestScopeData.getUserId();

        System.out.println(userId + " liked " + commentId);

        // 查询评论
        Comment comment = commentMapper.findById(commentId);

        if (comment == null) {
            return ApiResponse.error(HttpStatus.NOT_FOUND.value(), "评论不存在");
        }

        try {
            // 增加评论点赞数
            commentMapper.incrementLikeCount(commentId);
            CommentLike commentLike = new CommentLike();

            commentLike.setCommentId(commentId);
            commentLike.setUserId(userId);

            commentLikeMapper.insert(commentLike);

            MessageDTO messageDTO = new MessageDTO();

            messageDTO.setType(MessageType.LIKE);
            messageDTO.setReceiverId(comment.getAuthorId());
            messageDTO.setSenderId(userId);
            messageDTO.setTargetType(MessageTargetType.NOTE);
            messageDTO.setTargetId(comment.getNoteId());
            messageDTO.setIsRead(false);

            messageService.createMessage(messageDTO);
            return ApiResponse.success(new EmptyVO());
        } catch (Exception e) {
            log.error("点赞评论失败", e);
            return ApiResponse.error(HttpStatus.INTERNAL_SERVER_ERROR.value(), "点赞评论失败");
        }
    }

    @Override
    @NeedLogin
    @Transactional
    public ApiResponse<EmptyVO> unlikeComment(Integer commentId) {
        Long userId = requestScopeData.getUserId();

        // 查询评论
        Comment comment = commentMapper.findById(commentId);
        if (comment == null) {
            return ApiResponse.error(HttpStatus.NOT_FOUND.value(), "评论不存在");
        }

        try {
            // 减少评论点赞数
            commentMapper.decrementLikeCount(commentId);
            commentLikeMapper.delete(commentId, userId);
            return ApiResponse.success(new EmptyVO());
        } catch (Exception e) {
            log.error("取消点赞评论失败", e);
            return ApiResponse.error(HttpStatus.INTERNAL_SERVER_ERROR.value(), "取消点赞评论失败");
        }
    }
}