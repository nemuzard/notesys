package com.kama.notes.model.enums.redisKey;

/**
 * Redis 键名管理类
 * 用于统一管理和生成 Redis 中使用的各种键名
 * 遵循 Redis 键名命名规范 : 使用冒号分隔的层级结构
 */
public class RedisKey {
    /**
     * 生成注册验证码的 Redis 键名
     * 
     * @param email 用户邮箱地址
     * @return 格式为 "verification_code:register:{email}" 的 Redis 键名
     */
    public static String registerVerificationCode(String email) {
        return "email:register_verification_code:" + email;
    }

    /**
     * 生成注册验证码限制的 Redis 键名 <br/>
     * 用于记录用户发送验证码的频率限制
     * 
     * @param email 用户邮箱地址
     * @return 格式为 "email:register_verification_code:limit:{email}" 的 Redis 键名
     */
    public static String registerVerificationLimitCode(String email) {
        return "email:register_verification_code:limit:" + email;
    }

    /**
     * 生成邮件任务队列的 Redis 键名
     * 
     * @return 格式为 "queue:email:task" 的 Redis 键名
     */
    public static String emailTaskQueue() {
        return "queue:email:task";
    }
}
