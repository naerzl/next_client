declare module "react-file-viewer"

export interface FetchParams<T> {
  arg: T
}

// 通用的分页
export interface BaseApiPager {
  page: number
  limit: number
  count: number
}
