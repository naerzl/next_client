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

export const OAUTH2_TOKEN_EXPIRY = "oauth2_token_expiry"

export const OAUTH2_PROJECT_ID = "oauth2_project_id"

export const OAUTH2_PROJECT_NAME = "oauth2_project_NAME"

export const MINTE5 = 300000

// export const PROJECT_ID = getCookie(OAUTH2_PROJECT_ID) ? +getCookie(OAUTH2_PROJECT_ID)! : 0

// 邮箱正则
export const REGEXP_MAIL = /^[A-Za-z0-9\u4e00-\u9fa5]+@[a-zA-Z0-9_-]+(\.[a-zA-Z0-9_-]+)+$/

export enum DICTIONARY_CLASS_ID {
  cement = 2,
  water = 3,
  fine_aggregate = 4,
  coarse_aggregate = 12,
  mineral_admixture = 14,
  additive = 16,
  acoustic_tube = 18,
  rebar = 19,
  spacer = 22,
  concrete = 24,
}
