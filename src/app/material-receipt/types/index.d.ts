import { BaseApiPager } from "@/types/api"
import { DictionaryData } from "@/app/material-approach/types"

export interface GetMaterialReceiveParams {
  page: number
  limit: number
  project_id: number
}

export interface GetMaterialReceiveResponse {
  items: MaterialReceiveData[]
  pager: BaseApiPager
}

export interface MaterialReceiveData {
  id: number
  ebs_id: number
  test_id: number
  machine_record_id: string
  dictionary_id: number
  received_at: string
  construction_team_full_name: string
  received_quantity: number
  desc: string
  creator: string
  created_at: string
  updated_at: string
  dictionary: DictionaryData
  project_material_id: number
}

export interface PostMaterialReceiveParams {
  project_id: number
  ebs_id: number
  test_id: number
  machine_record_id: string
  dictionary_id: number
  received_at: string
  construction_team_full_name: string
  received_quantity: number
  desc: string
  project_material_id: number
}

export interface PutMaterialReceiveParams {
  id: number
  project_material_id: number
  ebs_id: number
  test_id: number
  machine_record_id: string
  dictionary_id: number
  received_at: string
  construction_team_full_name: string
  received_quantity: number
  desc: string
}
