import { BaseApiPager } from "@/types/api"

// 查询采购计划
export type GetMaterialProcurementPlanParams = {
  page: number
  limit: number
  project_id: number
  period: string
  project_sp_id: string
  project_si_id: string
}
export type GetMaterialProcurementPlanResponse = {
  pager: BaseApiPager
  items: MaterialProcurementPlanData[]
}
export interface MaterialProcurementPlanData {
  id: number
  name: string
  period: string
  project_id: number
  project_sp_id: string
  project_si_id: string
  status: PlanStatus
  creator: string
  creator_unionid: string
  created_at: string
  updated_at: string
}

//
export type PostMaterialProcurementPlanParams = {
  project_id: number
  project_sp_id?: string
  project_si_id?: string
}
export type PutMaterialProcurementPlanParams = {
  id: number
  project_id: number
  status: string
  project_sp_id?: string
  project_si_id?: string
}
export type GetProcurementPlanListItemsParams = {
  page?: number
  limit?: number
  project_id: number
  purchase_id: number
}
export type GetProcurementPlanListItemsResponse = {
  pager: BaseApiPager
  items: ProcurementPlanListItemListData[]
}

export interface ProcurementPlanListItemListData {
  id: number
  purchase_id: number
  dictionary_id: number
  planned_unit_price: string
  planned_price_total: number
  stock_quantity: number
  reserves_quantity: number
  required_quantity: number
  quantity: number
  quality_requirement: string
  planned_entry_at: string
  planned_usage_at: string
  desc: string
  creator: string
  creator_unionid: string
  created_at: string
  updated_at: string
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
  editState: {
    plannedUnitPrice: string
    desc: string
    plannedEntryAt: string
    quantity: number
  }
}
export type PutProcurementPlanListitemsParams = {
  id: number
  purchase_id: number
  planned_unit_price: string
  quantity: number
  planned_entry_at: string
  desc: string
}

export type PlanStatus =
  | "pending_application"
  | "application_in_progress"
  | "procurement_in_progress"
  | "procurement_completed"
  | "rejected"
