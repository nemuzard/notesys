package com.kama.notes.service;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

@SpringBootTest
public class EmailServiceTest {

    @Autowired
    private EmailService emailService;

    @Test
    public void testSendVerifyCode() {
        String email = "example@qq.com";
        
        String verifyCode = emailService.sendVerificationCode(email);
        System.out.println("Generated verify code: " + verifyCode);
        
        // 验证验证码
        boolean verified = emailService.checkVerificationCode(email, verifyCode);
        assert verified : "Verification should succeed with correct code";
    }

    @Test
    public void testSendFrequencyLimit() {
        String email = "example@qq.com";
        
        // 第一次发送应该成功
        assert emailService.isVerificationCodeRateLimited(email) : "Should be able to send first code";
        emailService.sendVerificationCode(email);

        // 第二次发送应该被限制
        assert !emailService.isVerificationCodeRateLimited(email) : "Should not be able to send second code immediately";
    }
}
