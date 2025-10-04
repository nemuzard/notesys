package com.kama.notes.model.dto.message;

import lombok.Data;


@Data
public class MessageDTO {
    /**
     * 消息ID
     */
    private Integer messageId;

    /**
     * 接收者ID
     */
    private Long receiverId;

    /**
     * 发送者ID
     */
    private Long senderId;

    /**
     * 消息类型
     */
    private Integer type;

    /**
     * 目标ID
     */
    private Integer targetId;

    /**
     * 目标类型
     */
    private Integer targetType;

    /**
     * 消息内容
     */
    private String content;

    /**
     * 是否已读
     */
    private Boolean isRead;
}
