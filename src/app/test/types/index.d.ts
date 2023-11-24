import { BaseApiPager } from "@/types/api"

export interface TestDataList {
  id: number
  project_id: number
  project_material_id: string
  dictionary_id: string
  ebs_id: string
  entrust_number: string
  entrust_file_url: string
  class: string
  test_number: string
  test_report_file_url: string
  tested_at: string
  tested_by: string
  datum_sets: string
  creator: string
  creator_unionid: string
  created_at: string
  updated_at: string
}

export interface ReqGetTestListResponse {
  items: TestDataList[]
  pager: BaseApiPager
}

export interface ReqGetTestListParams {
  page?: number
  limit?: number
  project_id: number
}
