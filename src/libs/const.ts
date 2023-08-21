// 大小写数字 字符串 包含两种正则
export const REGEXP_PASSWORD =
  /^(?![\d]+$)(?![a-z]+$)(?![A-Z]+$)(?![!#$%^&*]+$)[\da-zA-z!#$%^&@+_*]{6,8}$/

// 手机号正则
export const REGEXP_PHONE = /^1[3456789]\d{9}$/

// 成功状态码
export const STATUS_SUCCESS = 2000

// oauth2的token
export const OAUTH2_ACCESS_TOKEN = "oauth2_access_token"

export const OAUTH2_PATH_FROM = "oauth2_path_from"
