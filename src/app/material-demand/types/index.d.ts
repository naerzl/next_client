import { BaseApiPager } from "@/types/api"
import { MaterialListType } from "@/app/gantt/components/DialogMaterialDemand"

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
  class: "user" | "system"
  requirement_id: number
  parent_id?: number
  ebs_id: number
  ebs_desc?: string
  proportion_id?: number
  dictionary_id: number
  loss_coefficient?: number | string
  actual_usage: number
  planned_usage_at: string
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
  class: string
  created_at: string
  updated_at: string
  planned_usage_at: string
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
  isEdit?: boolean
  isConcreteEdit?: boolean
  editState: DemandEditState
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
