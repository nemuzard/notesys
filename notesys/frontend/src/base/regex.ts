// 字母数字下划线
export const ALPHANUMERIC_UNDERSCORE = /^[a-zA-Z0-9_]+$/

// 字母数字下划线中文
export const ALPHANUMERIC_UNDERSCORE_CHINESE =
  /^[\u4e00-\u9fa5_a-zA-Z0-9\-\.]+$/

// 密码允许的字符
export const PASSWORD_ALLOWABLE_CHARACTERS =
  /^[a-zA-Z0-9!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]+$/

// 邮箱正则表达式
export const EMAIL_PATTERN = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/
