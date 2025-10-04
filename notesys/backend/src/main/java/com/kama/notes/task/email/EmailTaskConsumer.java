package com.kama.notes.task.email;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.kama.notes.model.enums.redisKey.RedisKey;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.util.concurrent.TimeUnit;

@Component
public class EmailTaskConsumer {

    @Autowired
    private JavaMailSender mailSender;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private RedisTemplate<String, String> redisTemplate;

    @Value("${spring.mail.username}")
    private String from;

    @Scheduled(fixedDelay = 3000)
    public void resume() throws JsonProcessingException {
        String emailQueueKey = RedisKey.emailTaskQueue();


        while (true) {

            
            String emailTaskJson = redisTemplate.opsForList().rightPop(emailQueueKey);

            if (emailTaskJson == null) {  
            }

            EmailTask emailTask = objectMapper.readValue(emailTaskJson, EmailTask.class);
            String email = emailTask.getEmail();
            String verificationCode = emailTask.getCode();

            // according to emailtask object, send email
            // fill SimpleMailMessage，and use JavaMailSender to send email
            SimpleMailMessage mailMessage = new SimpleMailMessage();
            mailMessage.setFrom(from);
            mailMessage.setTo(email);
            mailMessage.setSubject("NoteSys- Verification Code");
            mailMessage.setText("Your code is ：" + verificationCode + "，will expire in" + 5 + "minutes. If you didn't request this code, please ignore this email.");

            mailSender.send(mailMessage);

            // 保存验证码到 Redis
            // 有效时间为 5 分钟
            redisTemplate.opsForValue().set(RedisKey.registerVerificationCode(email), verificationCode, 5, TimeUnit.MINUTES);
        }
    }
}
