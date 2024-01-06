/*获取EBS结构列表 请求参数*/
export interface TypeApiGetEBSParams {
  id?: number
  project_id?: number
  code?: string
  level?: number
  is_hidden?: 0 | 1
  is_hidden_bind?: 0 | 1
  project_sp_id?: string
  project_si_id?: string
  class?: "system" | "platform" | "userdefined"
  project_subpart_Id?: string
  subpart_class?: "field" | "subpart" | "subitem" | "examination"
  scheduled_start_at_duration?: string
  has_scheduled_start_at?: 0 | 1
  status?: "standing" | "progressing" | "completed"
  engineering_listing_id?: number
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
  is_loop: number
  h_subpart_code: string
  n_subpart_code: string
  h_subpart_code_class: string
  n_subpart_code_class: string
  class: "platform" | "system" | "userdefined" | "none"
  has_structure: string
  structure_status: string
  has_children: string
  is_can_select: number
  children?: TypeEBSDataList[]
  isCloseChildren?: boolean
  childrenCount?: {
    platform: number
    system: number
    userdefined: number
    none: number
  }
  isLeaf?: boolean
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
  engineering_listing_id?: number
  parent_is_loop?: boolean
  is_loop_id: number
  is_corporeal: number
  tags: string
}

/*创建EBS结构 请求参数*/
export interface TypeApiPostEBSParams {
  ebs_id: number
  name?: string
  project_id: number
  engineering_listing_id: number
  end_position: number
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
  engineering_listing_id?: number
}

export interface TypeApiPutEBSNameParams {
  project_id: number
  engineering_listing_id: number
  ebs_id: number
  name: string
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
  class?: "platform" | "system" | "userdefined" | "none"
}

export interface TypeApiPostBridgeBoredBasicDataParams {
  project_id: number
  ebs_id: number
  engineering_listing_id: number
  project_sp_id?: number
  project_si_id?: number
  pile_diameter: number
  pile_length: number
  pile_top_elevation: number
  pile_type: string
  rebar_cage_length: number
  drill_mode: string
}

export interface TypeApiPutBridgeBoredBasicDataParams {
  id: number
  project_id: number
  pile_diameter: number
  pile_length: number
  pile_top_elevation: number
  pile_type: string
  rebar_cage_length: number
  drill_mode: string
}

export interface BridgeBoredBasicData {
  id: number
  project_id: number
  ebs_id: number
  project_sp_id: number
  project_si_id: number
  pile_diameter: number
  pile_length: number
  pile_top_elevation: number
  pile_type: string
  rebar_cage_length: number
  liner_dictionary_id: number
  liner_number: number
  creator: string
  created_at: string
  updated_at: string
  drill_mode: string
}

export interface RebarData {
  id: number
  project_id: number
  ebs_id: number
  project_sp_id: number
  project_si_id: number
  rebar_no: string
  dictionary_id: number
  dictionary: {
    name: string
    properties: string
  }
  unit_length: number
  unit_weight: number
  number: number
  connect_method: string
  creator: string
  created_at: string
  updated_at: string
}

export interface TypePostRebarParams {
  project_id: number
  ebs_id: number
  engineering_listing_id: number
  project_sp_id?: number
  project_si_id?: number
  rebar_no: string
  dictionary_id: number
  dictionary: {
    name: string
    properties: string
  }
  unit_length: number
  unit_weight: number
  number: number
  connect_method: string
}

export interface TypePutRebarParams {
  id: number
  project_id: number
  rebar_no: string
  dictionary_id: number
  dictionary: {
    name: string
    properties: string
  }
  unit_length: number
  unit_weight: number
  number: number
  connect_method: string
}

export interface ConcreteData {
  id: number
  project_id: number
  ebs_id: number
  project_sp_id: number
  project_si_id: number
  dictionary_id: number
  dictionary: {
    name: string
    properties: string
  }
  creator: string
  created_at: string
  updated_at: string
  quantity: number
}

export interface TypePostConcreteParams {
  project_id: number
  ebs_id: number
  engineering_listing_id: number
  project_sp_id?: number
  project_si_id?: number
  dictionary_id: number
  quantity: number
}

export interface TypePutConcreteParams {
  id: number
  project_id: number
  dictionary_id: number
  quantity: number
}

export interface DictionaryData {
  id: number
  name: string
  properties: string
}

export interface ProcessRoleData {
  flag: string
  flag_name: string
}

export interface ProcessFormListData {
  id: number
  process_id: number
  form_no: string
  name: string
  desc: string
  is_loop: number
  created_at: string
  updated_at: string
  roles: ProcessRoleData[]
}

export interface ProjectProcess {
  id: number
  is_disabled: number
  percentage: number
  process_id: number
  stage: number
}

export interface ProcessListData {
  id: number
  name: string
  desc: string
  created_at: string
  updated_at: string
  percentage: number | null
  stage: number
  roles: ProcessRoleData[]
  projectProcess: ProjectProcess | null
  forms: any[]
}

export interface AcousticTubeListData {
  id: number
  dictionary_id: number
  quantity: number
  created_at: string
  creator: string
  creator_unionid: string
  updated_at: string
  length?: number
}

export interface TypePostAcousticTubeParams {
  project_id: number
  ebs_id: number
  engineering_listing_id: number
  dictionary_id: number
  quantity: number
  length?: number
}

export interface TypePutAcousticTubeParams {
  id: number
  project_id: number
  ebs_id: number
  engineering_listing_id: number
  dictionary_id: number
  quantity: number
  length?: number
}

export interface TypePutProjectProcessParams {
  project_id: number
  engineering_listing_id: number
  ebs_id: number
  processes: string
}
