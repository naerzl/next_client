import { BaseApiPager } from "@/types/api"

export interface GetMaterialProcessingParams {
  page: number
  limit: number
  project_id: number
}

export interface GetMaterialResponse {
  items: MaterialProcessingData[]
  pager: BaseApiPager
}

export interface MaterialProcessingData {
  id: number
  project_id: number
  dictionary_id: number
  recorder: string
  class: string
  quantity: number
  desc: number
  relate_data: string
  creator: string
  created_at: string
  updated_at: string
}

export interface PostMaterialProcessingParams {
  project_id: number
  dictionary_id: number
  class: string
  quantity: number
  desc: string
  relate_data: string
}

export interface PutMaterialProcessingParams {
  id: number
  dictionary_id: number
  class: string
  quantity: number
  desc: number
  relate_data: string
}
