package com.kama.notes.service;

public interface EmailService {
    /**
     * 发送验证码邮件
     *
     * @param email 目标邮箱
     * @return 发送的code
     * @throws RuntimeException 如果发送邮件失败，将抛出异常
     */
    String sendVerificationCode(String email);

    /**
     * 校验验证码是否正确
     *
     * @param email 邮箱地址
     * @param code 用户输入的验证码
     * @return true 表示校验通过
     */
    boolean checkVerificationCode(String email, String code);

    /**
     * 判断邮箱当前是否处于验证码限流状态
     *
     * @param email 邮箱地址
     * @return true 表示当前已限流，不可发送
     */
    boolean isVerificationCodeRateLimited(String email);
}
