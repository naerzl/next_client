import { BaseApiPager } from "@/types/api"

export interface GetMaterialProportionParams {
  page?: number
  limit?: number
  project_id?: number
  engineeringListing_id?: number
  ebs_id?: number
  name?: string
  proportion?: any
  dictionary_id?: number
}

export interface GetMaterialProportionResponse {
  pager: BaseApiPager
  items: MaterialProportionListData[]
}

export interface MaterialProportionListData {
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
    dictionary_class_id: number
  }
  desc: string
  usages: Usages[]
}

export interface Usages {
  ebs_id: number
  engineeringListing_id: number
  id: number
  project_id: number
  proportion_id: number
}

export interface PostMaterialProportionParams {
  name: string
  proportion: string
  dictionary_id: number
  dictionary_class_id: number
  materials: string
  project_id: number
  engineering_listing_id?: number
  ebs_ids?: string
  desc: string
}

export interface PutMaterialProportionParams {
  id: number
  name: string
  proportion: string
  dictionary_id: number
  materials: string
  project_id: number
  engineering_listing_id: number
  ebs_ids: string
  desc: string
}
