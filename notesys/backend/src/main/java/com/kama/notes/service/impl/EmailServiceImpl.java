package com.kama.notes.service.impl;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.kama.notes.model.enums.redisKey.RedisKey;
import com.kama.notes.service.EmailService;
import com.kama.notes.task.email.EmailTask;
import com.kama.notes.utils.RandomCodeUtil;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;

import java.util.Objects;
import java.util.concurrent.TimeUnit;

@Slf4j
@Service
public class EmailServiceImpl implements EmailService {

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private RedisTemplate<String, String> redisTemplate;

    @Value("${mail.verify-code.limit-expire-seconds}")
    private int limitExpireSeconds;

    @Override
    public String sendVerificationCode(String email) {
        // 检查发送频率
        if (isVerificationCodeRateLimited(email)) {
            throw new RuntimeException("验证码发送太频繁，请 60 秒后重试");
        }

        // 生成6位随机验证码
        String verificationCode = RandomCodeUtil.generateNumberCode(6);

        // 实现异步发送邮件的逻辑
        try {

            // 创建邮件任务
            EmailTask emailTask = new EmailTask();

            // 初始化邮件任务内容
            // 1. 邮件目的邮箱
            // 2. 验证码
            // 3. 时间戳
            emailTask.setEmail(email);
            emailTask.setCode(verificationCode);
            emailTask.setTimestamp(System.currentTimeMillis());

            // 将邮件任务存入消息队列
            // 1. 将任务对象转成 JSON 字符串
            // 2. 将 JSON 字符串保存到 Redis 模拟的消息队列中
            String emailTaskJson = objectMapper.writeValueAsString(emailTask);
            String queueKey = RedisKey.emailTaskQueue();
            redisTemplate.opsForList().leftPush(queueKey, emailTaskJson);

            // 设置 email 发送注册验证码的限制
            String emailLimitKey = RedisKey.registerVerificationLimitCode(email);
            redisTemplate.opsForValue().set(emailLimitKey, "1", limitExpireSeconds, TimeUnit.SECONDS);

            return verificationCode;
        } catch (Exception e) {
            log.error("发送验证码邮件失败", e);
            throw new RuntimeException("发送验证码失败，请稍后重试");
        }
    }

    @Override
    public boolean checkVerificationCode(String email, String code) {
        String redisKey = RedisKey.registerVerificationCode(email);
        String verificationCode = redisTemplate.opsForValue().get(redisKey);

        if (verificationCode != null && verificationCode.equals(code)) {
            redisTemplate.delete(redisKey);
            return true;
        }
        return false;
    }

    @Override
    public boolean isVerificationCodeRateLimited(String email) {
        String redisKey = RedisKey.registerVerificationLimitCode(email);
        return redisTemplate.opsForValue().get(redisKey) != null;
    }
}
