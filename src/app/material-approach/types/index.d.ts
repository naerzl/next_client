import { BaseApiPager } from "@/types/api"

export interface GetMaterialApproachParams {
  page: number
  limit: number
  project_id: number
  has_test?: boolean
}

export interface GetMaterialApproachResponse {
  pager: BaseApiPager
  items: MaterialApproachData[]
}

export interface MaterialApproachData {
  id: number
  project_id: number
  dictionary_id: number
  arrivaled_at: string
  arrivaled_quantity: number
  certificate_number: string
  manufacturer: string
  status: string
  handling_suggestions: string
  desc: string
  supplier: string
  storage_location: string
  entrust_number: string
  Entrust_file_url: string
  creator: string
  created_at: string
  updated_at: string
  dictionary: DictionaryData
  recorder: string
}

export interface PostMaterialApproachParams {
  project_id: number
  class: string
  dictionary_id: number
  arrivaled_at: string
  arrivaled_quantity: number
  certificate_number: string
  manufacturer: string
  status: string
  handling_suggestions: string
  desc: string
  supplier: string
  storage_location: string
  entrust_number: string
  Entrust_file_url: string
}

export interface PutMaterialApproachParams {
  id: number
  dictionary_id: number
  arrivaled_at: string
  arrivaled_quantity: number
  certificate_number: string
  manufacturer: string
  status: string
  class: string
  handling_suggestions: string
  desc: string
  supplier: string
  storage_location: string
  entrust_number: string
  Entrust_file_url: string
}

export interface DictionaryData {
  id: number
  name: string
  properties: string
}

export interface GetDictionaryClassResponse {
  pager: BaseApiPager
  items: DictionaryClassListData[]
}

export interface DictionaryClassListData {
  id: number
  parent_id: number
  name: string
  serial: number
  icon: string
  relationship: number[]
}
