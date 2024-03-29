// 获取分部分项接口响应数据
export interface TypeSubSectionData {
  id: number
  parent_id: string
  code: string
  name: string
  expect: string
  class_name: string
  key?: string
  subpart_type: "basic" | "sync"
  subpart_class: EnumNodeType
  is_prefix: 0 | 1
  children?: TypeSubSectionData[]
  isCloseChildren?: boolean
  noChildren?: boolean
}

// 获取单位工程/工点数据列表 接口响应数据
export interface TypeProjectSubSectionData {
  id: number
  parent_id: string
  parent_name: string
  code: string
  name: string
  ebs_id: string
  ebs_code: string
  ebs_name: string
  subpart_id: string
  subpart_name: string
  start_mileage: string
  end_mileage: string
  start_tally: string
  end_tally: string
  calculate_value: string
  extend: string[]
  engineering_listings: {
    id: number
    name: string
  }[]
  created_at: string
  creator: string
}

// 添加分部分项数据 请求参数
export interface TypePostProjectSubSectionParams {
  project_id: number
  name: string
  related_to: string
  id?: number
}

// 获取工程数据请求参数
export interface TypeGetProjectSubSectionParams {
  parent_id?: number
  name?: string
  is_subset?: 0 | 1
  project_id: number
}

// 节点归属
