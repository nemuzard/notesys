package com.kama.notes.model.vo.message;

import lombok.Data;
import java.time.LocalDateTime;

/**
 * 消息视图对象
 */
@Data
public class MessageVO {
    /**
     * 消息ID
     */
    private Integer messageId;

    /**
     * 发送者信息
     */
    private Sender sender;

    /**
     * 消息类型
     */
    private Integer type;

    /**
     * 目标ID
     */
    private Target target;

    /**
     * 消息内容
     */
    private String content;

    /**
     * 是否已读
     */
    private Boolean isRead;

    /**
     * 创建时间
     */
    private LocalDateTime createdAt;

    /**
     * 简单用户信息
     */
    @Data
    public static class Sender {
        private Long userId;
        private String username;
        private String avatarUrl;
    }

    @Data
    public static class Target {
        private Integer targetId;
        private Integer targetType;
        private QuestionSummary questionSummary;
    }

    @Data
    public static class QuestionSummary {
        private Integer questionId;
        private String title;
    }
} 