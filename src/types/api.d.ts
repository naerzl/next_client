export interface FetchParams<T> {
  arg: T
}

// 通用的分页
export interface BaseApiPager {
  page: number
  limit: number
  count: number
}

export interface PermissionData {
  id: number
  name: string
  permission: string
  action: string
}

export interface EnumType {
  label: string
  value: string | number
}

// 数据字典类型数据
export interface DictionaryClassData {
  id: number
  parent_id?: number
  name: string
  serial: number
  icon: string
  relationship: string
  children?: DictionaryClassData[]
}
