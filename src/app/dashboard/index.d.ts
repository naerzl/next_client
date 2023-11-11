export interface UserCurrentData {
  unionid: string
  phone: string
  name: string
  job: string
  company: string
  mail: string
  status: string
  is_first_login: boolean
  created_at: string
  updated_at: string
  roles: RolesListData[]
}

export interface RolesListData {
  id: number
  parent_id: string
  class: string
  flag: string
  name: string
  desc: string
  created_at: string
  updated_at: string
}
