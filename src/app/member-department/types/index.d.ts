// 获取平台用户接口请求参数类型
export interface ReqGetUserListParams {
  status?: "normal" | "forbidden"
  name?: string
  phone?: string
  mail?: string
  page?: number
  limit?: number
  role_flag?: string
  project_id: number
}

export interface UserListData {
  unionid: string
  phone: string
  name: string
  mail: string
  job: string
  company: string
  status: string
  is_first_login: boolean
  created_at: string
  updated_at: string
  roles: RolesListData[]
}

export interface UserListDataPager {
  page: number
  limit: number
  count: number
}

// 新增平台用户接口
export interface ReqPostUserParams {
  status: string
  name: string
  phone: string
  mail: string
  role_flags: string
  project_id: number
}

export interface ReqPutUserParams {
  unionid: string
  status: string
  name: string
  phone: string
  mail: string
  project_id: number
}

export interface RolesListData {
  id: number
  name: string
  desc: string
  created_at: string
  updated_at: string
  flag: string
  class: RoleClassType
  children: RolesListData[]
}

export type RoleClassType = "normal" | "special"

export interface ReqGetRolesParams {
  parent_id?: number
  id?: number
  name?: string
  desc?: string
  class?: RoleClassType
  project_id: number
}

export interface ReqPostRolesParams {
  parent_id: number
  name: string
  desc: string
  project_id: number
}

export interface ReqPutRolesParams extends ReqPostRolesParams {
  id: number
  project_id: number
}

export interface ReqGetProjectCurrentResponse {
  project: {
    id: number
    name: string
    abbreviation: string
    cost: number
    desc: string
    expired_at: string
    started_at: string
    completed_at: string
  }
  is_default: number
}
