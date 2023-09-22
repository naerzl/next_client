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

export interface ProcessListData {
  id: number
  name: string
  desc: string
  created_at: string
  updated_at: string
  percentage: number
  stage: number
  roles: ProcessRoleData[]
}

export interface TypeEBSDataList {
  key?: string
  id: number
  created_at: string
  updated_at: string
  h_subpart_code: string
  n_subpart_code: string
  subpart_class: string
  subpart_type: string
  parent_id: number
  code: string
  define_code: string
  name: string
  level: number
  unit: string
  is_loop: "yes" | "no"
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
  related_ebs: TypeEBSDataList
}

export interface TypeApiPostBridgeBoredBasicDataParams {
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
  liner_dictionary_id: number
  liner_number: number
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
}

export interface TypePostConcreteParams {
  project_id: number
  ebs_id: number
  project_sp_id: number
  project_si_id: number
  dictionary_id: number
}

export interface TypePutConcreteParams {
  id: number
  project_id: number
  dictionary_id: number
}

export interface DictionaryData {
  id: number
  name: string
  properties: string
}
