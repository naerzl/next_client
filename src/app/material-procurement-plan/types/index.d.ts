import { BaseApiPager } from "@/types/api"
import { DictionaryData } from "@/app/material-procurement-plan/types"

// 查询采购计划
export type GetMaterialProcurementPlanParams = {
    page: number,
    limit: number,
    project_id: number,
    period: string,
    project_sp_id: string,
    project_si_id: string,
}
export type GetMaterialProcurementPlanResponse = {
    pager: BaseApiPager
    items: MaterialProcurementPlanData[]
}
export interface MaterialProcurementPlanData {
    id: number,
    name: string,
    period: string,
    project_id: number,
    project_sp_id: string,
    project_si_id: string,
    status: string,
    creator: string,
    creator_unionid: string,
    created_at: string,
    updated_at: string
}

//
export type PostMaterialProcurementPlanParams = {
    project_id: number,
    project_sp_id: string,
    project_si_id: string
}
export type PutMaterialProcurementPlanParams = {
    id: number,
    project_id: number,
    status: string,
    project_sp_id: string,
    project_si_id: string
}
export type GetProcurementPlanListitemsParams = {
    id: number,
    purchase_id: number,
    dictionary_id: number,
    planned_unit_price: number,
    planned_price_total: number,
    stock_quantity: number,
    reserves_quantity: number,
    required_quantity: number,
    quantity: number,
    quality_requirement: string,
    planned_entry_at: string,
    desc: string,
    creator: string,
    creator_unionid: string,
    created_at: string,
    updated_at: string,
}
export type GetProcurementPlanListitemsResponse = {
    pager: BaseApiPager
}
export type PutProcurementPlanListitemsParams = {
    id: number,
    purchase_id: number,
    planned_unit_price: number,
    quantity: number,
    planned_entry_at: string,
    desc: string
}
