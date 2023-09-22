/*获取EBS结构列表 请求参数*/
export interface TypeApiGetEBSParams {
  project_id: number
  code?: string
  level?: number
  is_hidde?: 0 | 1
  project_sp_id?: string
  project_si_id?: string
  is_system?: "system" | "platform" | "userdefined"
  project_subpart_Id?: string
  subpart_class?: "field" | "subpart" | "subitem" | "examination"
  scheduled_start_at_duration?: string
  has_scheduled_start_at?: 0 | 1
  status?: "standing" | "progressing" | "completed"
}

/*获取EBS结构列表 响应数据*/

/*ebs 列表类型*/
export interface TypeEBSDataList {
  key?: string
  id: number
  parent_id: number
  code: string
  define_code: string
  name: string
  level: number
  unit: string
  is_examination: 0 | 1
  is_loop: string
  h_subpart_code: string
  n_subpart_code: string
  h_subpart_code_class: string
  n_subpart_code_class: string
  is_system: "platform" | "system" | "userdefined" | "null"
  has_structure: string
  structure_status: string
  has_children: string
  children?: TypeEBSDataList[]
  isCloseChildren?: boolean
  childrenCount?: {
    platform: number
    system: number
    userdefined: number
    none: number
  }
  extend: {
    id: number
    project_sp_id: number
    project_si_id: number
    serial: number
    ebs_id: number
    name: string
    period: string
    scheduled_start_at: string
    status: string
  }
}

/*创建EBS结构 请求参数*/
export interface TypeApiPostEBSParams {
  is_copy: 0 | 1
  ebs_id: number
  name?: string
  project_id: number
  project_sp_id?: number
  project_si_id?: number
  next_ebs_id?: number
  is_system: "platform" | "system" | "userdefined" | "null"
}

/*创建EBS结构 响应结果*/
export interface TypeApiPostEBSResponse {
  id: number
  structure_id: number
  ebs_id: number
  project_id: number
  value: string
  code: string
}

/*修改EBS结构 请求参数*/
export interface TypeApiPutEBSParams {
  id: number
  name: string
  project_id: number
  project_sp_id?: number
  project_si_id?: number
  serial?: string
  period?: number
  scheduled_start_at?: string
}

/*获取EBS指定code 接口的相应数据*/
export interface TypeApiGetCodeCountResponse {
  platform: number
  system: number
  userdefined: number
  none: number
}

// 获取EBS指定code请求参数
export interface TypeApiGEtCodeCountParams {
  code: string
  is_hidden: 0 | 1
  level: number
  project_id?: number
  project_subpart_id?: number
  is_system?: "platform" | "system" | "userdefined" | "null"
}
