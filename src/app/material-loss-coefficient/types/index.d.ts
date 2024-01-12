import { BaseApiPager } from "@/types/api"

export interface GetMaterialLossCoefficientParams {
  page?: number
  limit?: number
  project_id?: number
  engineering_listing_id?: number
  ebs_id?: number
  name?: string
  code?: string
  level?: number
}

export interface GetMaterialLossCoefficientResponse {
  items: MaterialLossCoefficientListData[]
  pager: BaseApiPager
}

export interface MaterialLossCoefficientListData {
  id: number
  code: string
  level: number
  dictionary_class_id: string
  service_conditions: string
  class: string
  desc: string
  name: string
  loss_coefficient: number
  dictionary_id: string
  dictionary: {
    id: number
    dictionary_class_id: number
    properties: string
    name: string
    dictionary_class: {
      id: number
      parent_id: number
      name: string
    }
  }
  dictionary_class: {
    id: number
    parent_id: number
    name: string
  }
  ebses: EBSes[]
  project_loss_coefficient: ProjectLossCoefficient | null
  creator: string
  creator_unionid: string
  created_at: string
  updated_at: string
}

export interface ProjectLossCoefficient {
  id: number
  project_id: number
  engineering_listing_id: number
  ebs_id: number
  loss_coefficient: number
}

export interface EBSes {
  id: number
  name: string
  code: string
  level: number
}

export interface PostMaterialLossCoefficientParams {
  loss_coefficient_id: number
  project_id: number
  engineering_listing_id: number
  ebs_id: number
  loss_coefficient: number
  service_conditions: string
}
