// 获取分部分项接口响应数据
export interface TypeSubSectionData {
  id: number
  parent_id: string
  code: string
  name: string
  expect: string
}

// 获取单位工程/工点数据列表 接口响应数据
export interface TypeProjectSubSectionData {
  id: number
  parent_id: string
  parent_name: string
  code: string
  name: string
  subpart_name: string
  start_mileage: string
  end_mileage: string
  start_tally: string
  end_tally: string
  calculate_value: string
}

// 添加分部分项数据 请求参数
export interface TypePostProjectSubSectionParams {
  id?: number
  parent_id?: string
  parent_name?: string
  code: string
  name: string
  subpart_name: string
  subpart_id: number
  start_mileage?: string
  end_mileage?: string
  start_tally?: string
  end_tally?: string
  calculate_value?: string
}

export interface TypeGetProjectSubSectionParams {
  parent_id?: number
  name?: string
  is_subset?: 0 | 1
}