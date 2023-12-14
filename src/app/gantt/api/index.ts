import { fetcher } from "@/libs/fetch"
import { FetchParams } from "@/types/api"
import { TypeApiGetEBSParams, TypeApiPutEBSParams, TypeEBSDataList } from "@/app/ebs-data/types"
import {
  DictionaryData,
  GetExportInspectionLotParams,
  ProcessFormListData,
  ProcessListData,
  TypePostProcessDataCollectionGenerate,
} from "@/app/gantt/types"

/* 获取EBS结构列表*/
export const reqGetEBS = (
  url: string,
  { arg }: FetchParams<TypeApiGetEBSParams>,
): Promise<TypeEBSDataList[]> => fetcher({ url, arg })

/*修改EBS结构*/
export const reqPutEBS = (url: string, { arg }: FetchParams<TypeApiPutEBSParams>) =>
  fetcher({ url, arg, method: "put" })

// 获取基础工序--表单
export const reqGetProcessForm = (
  url: string,
  {
    arg,
  }: FetchParams<{
    process_id: number
    project_id: number
    project_sp_id?: number
    project_si_id?: number
  }>,
): Promise<ProcessFormListData[]> => fetcher({ url, arg })

// 获取基础工序
export const reqGetProcess = (
  url: string,
  { arg }: FetchParams<{ ebs_id: number; name?: string }>,
): Promise<ProcessListData[]> => fetcher({ url, arg })

// 获取字典
export const reqGetDictionary = (
  url: string,
  { arg }: FetchParams<{ name?: string; class_id?: number }>,
): Promise<DictionaryData[]> => fetcher({ url, arg })

export const reqPostProcessDataCollectionGenerate = (
  url: string,
  { arg }: FetchParams<TypePostProcessDataCollectionGenerate>,
) => fetcher({ url, arg, method: "post" })

export const reqGetExportInspectionLot = (
  url: string,
  { arg }: FetchParams<GetExportInspectionLotParams>,
) => fetcher({ url, arg })
