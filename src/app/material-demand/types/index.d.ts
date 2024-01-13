import { BaseApiPager } from "@/types/api"
import { DictionaryData } from "@/app/material-approach/types"

export type SubEditState = {
  lossCoefficient: string
  actualUsage: number // 需求用量
  plannedUsageAt: string
}

export type MaterialListType = {
  parent_id?: number
  id?: number
  dictionary_class_id: number
  dictionaryClassName: string
  dictionary_id: number
  quantity?: number
  dictionaryName?: string
  dictionaryList: DictionaryData[]
  material_loss_coefficient: null | MaterialLossCoefficient
  dictionary: any
  isSelect?: boolean
  class: "user" | "system" | "incremental"
  editState: SubEditState
  loss_coefficient: string
  actual_usage: number // 需求用量
  planned_usage_at: string
}

export interface GetMaterialDemandParams {
  page?: number
  limit?: number
  project_id?: number
  engineering_listing_id?: number
  project_si_id?: number
  project_sp_id?: number
  period?: string
}

export interface GetMaterialDemandResponse {
  pager: BaseApiPager
  items: MaterialDemandListData[]
}

export interface MaterialDemandListData {
  id: number
  name: string
  period: string
  project_id: number
  engineering_listing_id: number
  project_sp_id: number
  project_si_id: number
  status: "waiting" | "confirmed"
  creator: string
  creator_unionid: string
  created_at: string
  updated_at: string
  project_sp: {
    id: number
    name: string
  }
  project_si: {
    id: number
    name: string
  }
}

export interface PostMaterialDemandParams {
  project_id: number
  engineering_listing_id: number
  project_sp_id: number
  project_si_id: number
  action: 2 | 1
}

export interface PutMaterialDemandParams {
  id: number
  project_id: number
  status: "waiting" | "confirmed"
}

export interface PostMaterialDemandItemParams {
  class: "user" | "system" | "incremental"
  requirement_id: number
  parent_id?: number
  ebs_id: number
  ebs_desc?: string
  proportion_id?: number
  dictionary_id: number
  loss_coefficient?: number | string
  actual_usage: number
  planned_usage_at: string
  material_class: string
}

export interface PutMaterialDemandItemParams {
  id: number
  requirement_id: number
  proportion_id?: number
  loss_coefficient?: string
  actual_usage: number
  planned_usage_at: string
  dictionary_id?: number
}

export interface GetMaterialDemandItemParams {
  page?: number
  limit?: number
  project_id?: number
  requirement_id: number
  parent_id?: number
}

export interface GetMaterialDemandItemResponse {
  pager: BaseApiPager
  items: MaterialDemandItemListData[]
}

export interface DictionaryWithDemand {
  id: number
  properties: string
  name: string
  dictionary_class_id: number
  dictionary_class: {
    id: number
    name: string
    parent_id: number
  }
}

export interface MaterialDemandItemListData {
  type?: "custom" | "material"
  id: number
  requirement_id: number
  parent_id: string
  ebs_id: number
  ebs_desc: string
  proportion_id: string
  dictionary_id: number
  quantity: number
  loss_coefficient: string
  design_usage: number
  actual_usage: number
  class: "user" | "system" | "incremental"
  created_at: string
  updated_at: string
  planned_usage_at: string
  material_loss_coefficient: null | MaterialLossCoefficient
  material_proportion: {
    id: number
    name: string
    proportion: string
    dictionary_id: number
    materials: string
    creator: string
    creator_unionid: string
    created_at: string
    updated_at: string
    dictionary: {
      id: number
      properties: string
      name: string
    }
    usages: Usages[]
  }
  dictionary: DictionaryWithDemand
  proportions?: MaterialListType[]
  isExpand?: boolean
  editState: DemandEditState
  incremental?: {
    quantity: number
    dictionary_id: number
    dictionary_class_id: number
    name: string
    dictionaryList: DictionaryData[]
  }[]
}

export interface MaterialLossCoefficient {
  class: string
  code: string
  created_at: string
  creator: string
  creator_unionid: string
  dictionary_id: number
  id: number
  level: number
  loss_coefficient: number
  name: string
  service_conditions: string
  updated_at: string
}

export interface DemandEditState {
  lossCoefficient: string
  proportion: number
  actualUsage: number // 需求用量
  plannedUsageAt: string
}

export interface Usages {
  id: number
  project_id: number
  engineeringListing_id: number
  ebs_id: number
  proportion_id: number
}

export interface GetExportMaterialDemandParams {
  project_id: number
  project_si_id?: number
  project_sp_id?: number
  file_name?: string
  period: string
}

export interface GetProjectMaterialRequirementStaticParams {
  project_id: number
  project_si_id?: number
  project_sp_id?: number
  engineering_listing_id?: number
  period?: string
}

export interface ProjectMaterialRequirementStaticListData {
  sum_quantity: number
  dictionary_id: number
  loss_coefficient: string
  planned_usage_at: string
  dictionary: {
    id: number
    dictionary_class_id: number
    properties: string
    name: string
    dictionary_class: {
      id: number
      parent_id: string
      name: string
    }
  }
}

export interface GetProjectMaterialRequirementStaticDetailParams {
  page?: number
  limit?: number
  project_id: number
  period: string
  project_si_id?: number
  project_sp_id?: number
  engineering_listing_id?: number
  dictionary_id?: number
}

export interface GetProjectMaterialRequirementStaticDetailResponse {
  items: ProjectMaterialRequirementStaticDetailListData[]
  pager: BaseApiPager
}

export interface ProjectMaterialRequirementStaticDetailListData {
  id: number
  sp_name: string
  si_name: string
  quantity: number
  design_usage: number
  loss_coefficient: string
  actual_usage: number
  dictionary_id: number
  ebs_desc: string
  dictionary: {
    id: number
    dictionary_class_id: number
    properties: string
    name: string
    dictionary_class: {
      id: number
      parent_id: string
      name: string
    }
  }
}
