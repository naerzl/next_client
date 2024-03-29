import { fetcher } from "@/libs/fetch"
import { FetchParams } from "@/types/api"

import {
  GetMaterialProcurementPlanResponse,
  GetMaterialProcurementPlanParams,
  PostMaterialProcurementPlanParams,
  PutMaterialProcurementPlanParams,
  PutProcurementPlanListitemsParams,
  GetProcurementPlanListItemsParams,
  GetProcurementPlanListItemsResponse,
} from "@/app/material-procurement-plan/types"

// 查询采购计划
export const reqGetMaterialProcurementPlan = (
  url: string,
  { arg }: FetchParams<GetMaterialProcurementPlanParams>,
): Promise<GetMaterialProcurementPlanResponse> => fetcher({ url, arg })

// 生成/重置采购计划
export const reqPostMaterialProcurementPlan = (
  url: string,
  { arg }: FetchParams<PostMaterialProcurementPlanParams>,
) => fetcher({ url, arg, method: "post" })

// 采购计划修改
export const reqPutMaterialProcurementPlan = (
  url: string,
  { arg }: FetchParams<PutMaterialProcurementPlanParams>,
) => fetcher({ url, arg, method: "put" })

// 获取采购计划列表项
export const reqGetProcurementPlanListItems = (
  url: string,
  { arg }: FetchParams<GetProcurementPlanListItemsParams>,
): Promise<GetProcurementPlanListItemsResponse> => fetcher({ url, arg })

// 采购计划修改项
export const reqPutProcurementPlanListItems = (
  url: string,
  { arg }: FetchParams<PutProcurementPlanListitemsParams>,
) => fetcher({ url, arg, method: "put" })
