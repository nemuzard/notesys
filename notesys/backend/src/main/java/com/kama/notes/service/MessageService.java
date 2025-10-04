package com.kama.notes.service;

import com.kama.notes.model.base.ApiResponse;
import com.kama.notes.model.base.EmptyVO;
import com.kama.notes.model.dto.message.MessageDTO;
import com.kama.notes.model.vo.message.MessageVO;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

/**
 * 消息服务接口
 */
@Transactional
public interface MessageService {
    /**
     * 创建消息
     */
    Integer createMessage(MessageDTO messageDTO);

    /**
     * 获取消息列表
     */
    ApiResponse<List<MessageVO>> getMessages();

    /**
     * 标记消息为已读
     *
     * @param messageId 消息ID
     * @return 空响应
     */
    ApiResponse<EmptyVO> markAsRead(Integer messageId);

    /**
     * 批量标记消息为已读
     *
     * @param messageIds 消息ID列表
     * @return 空响应
     */
    ApiResponse<EmptyVO> markAsReadBatch(List<Integer> messageIds);

    /**
     * 标记所有消息为已读
     *
     * @return 空响应
     */
    ApiResponse<EmptyVO> markAllAsRead();

    /**
     * 删除消息
     *
     * @param messageId 消息ID
     * @return 空响应
     */
    ApiResponse<EmptyVO> deleteMessage(Integer messageId);

    /**
     * 获取未读消息数量
     *
     * @return 未读消息数量
     */
    ApiResponse<Integer> getUnreadCount();
}
