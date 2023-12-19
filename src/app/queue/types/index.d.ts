import { BaseApiPager } from "@/types/api"

export interface QueueList {
  project_id: number
  data: string
  status: string
  exception: string
  class: string
  created_at: string
  updated_at: string
  file_names: string | null
}

export interface GetQueueResponse {
  items: QueueList[]
  pager: BaseApiPager
}

export interface GetQueueParams {
  page?: number
  limit?: number
  class: string
  project_id: number
  status?: string
}
