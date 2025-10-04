package com.kama.notes.controller;

import com.kama.notes.annotation.NeedLogin;
import com.kama.notes.model.base.ApiResponse;
import com.kama.notes.model.base.EmptyVO;
import com.kama.notes.model.request.message.ReadMessageBatchRequest;
import com.kama.notes.model.vo.message.MessageVO;
import com.kama.notes.service.MessageService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * 消息控制器
 */
@RestController
@RequestMapping("/api/messages")
public class MessageController {

    @Autowired
    private MessageService messageService;

    /**
     * 获取消息列表
     */
    @GetMapping
    @NeedLogin
    public ApiResponse<List<MessageVO>> getMessages() {
        return messageService.getMessages();
    }

    /**
     * 标记消息为已读
     *
     * @param messageId 消息ID
     * @return 空响应
     */
    @PatchMapping("/{messageId}/read")
    public ApiResponse<EmptyVO> markAsRead(@PathVariable Integer messageId) {
        return messageService.markAsRead(messageId);
    }

    /**
     * 标记所有消息为已读
     *
     * @return 空响应
     */
    @PatchMapping("/all/read")
    public ApiResponse<EmptyVO> markAllAsRead() {
        return messageService.markAllAsRead();
    }

    /**
     * 批量标记消息为已读
     *
     * @param messageIds 消息ID列表
     * @return 空响应
     */
    @PatchMapping("/batch/read")
    public ApiResponse<EmptyVO> markAsReadBatch(@RequestBody ReadMessageBatchRequest request) {
        return messageService.markAsReadBatch(request.getMessageIds());
    }

    /**
     * 删除消息
     *
     * @param messageId 消息ID
     * @return 空响应
     */
    @DeleteMapping("/{messageId}")
    public ApiResponse<EmptyVO> deleteMessage(@PathVariable Integer messageId) {
        return messageService.deleteMessage(messageId);
    }

    /**
     * 获取未读消息数量
     *
     * @return 未读消息数量
     */
    @GetMapping("/unread/count")
    public ApiResponse<Integer> getUnreadCount() {
        return messageService.getUnreadCount();
    }
}
