import { fetcher } from "@/libs/fetch"
import { FetchParams } from "@/types/api"
import {
  TypeApiGEtCodeCountParams,
  TypeApiGetCodeCountResponse,
  TypeApiGetEBSParams,
  TypeApiPostEBSParams,
  TypeApiPostEBSResponse,
  TypeApiPutEBSParams,
  TypeEBSDataList,
  ProcessFormListData,
  ProcessListData,
  BridgeBoredBasicData,
  TypeApiPostBridgeBoredBasicDataParams,
  TypePostRebarParams,
  TypeApiPutBridgeBoredBasicDataParams,
  RebarData,
  TypePostConcreteParams,
  TypePutRebarParams,
  ConcreteData,
  TypePutConcreteParams,
  DictionaryData,
} from "@/app/ebs-data/types"

type SubpartClass = "field" | "subpart" | "subitem" | "examination"

/* 获取EBS结构列表*/
export const reqGetEBS = (
  url: string,
  { arg }: FetchParams<TypeApiGetEBSParams>,
): Promise<TypeEBSDataList[]> => fetcher({ url, arg })

/* 获取系统EBS结构列表*/
export const reqGetEBSSystem = (
  url: string,
  { arg }: FetchParams<{ code?: string; level?: number; subpart_class: SubpartClass }>,
): Promise<TypeEBSDataList[]> => fetcher({ url, arg })

/*创建EBS结构*/
export const reqPostEBS = (
  url: string,
  { arg }: FetchParams<TypeApiPostEBSParams>,
): Promise<TypeApiPostEBSResponse> => fetcher({ url, arg, method: "post" })

/*修改EBS结构*/
export const reqPutEBS = (url: string, { arg }: FetchParams<TypeApiPutEBSParams>) =>
  fetcher({ url, arg, method: "put" })

/*删除EBS结构*/
export const reqDeleteEBS = (
  url: string,
  { arg }: FetchParams<{ id: number; project_id: number; engineering_listing_id: number }>,
) => fetcher({ url, arg, method: "delete" })

/*获取EBS指定code（父级）下级数量统计*/
export const reqGetCodeCount = (
  url: string,
  { arg }: FetchParams<TypeApiGEtCodeCountParams>,
): Promise<TypeApiGetCodeCountResponse[]> => fetcher({ url, arg })

// 获取基础工序--表单
export const reqGetProcessForm = (
  url: string,
  {
    arg,
  }: FetchParams<{
    process_id: number
    project_id: number
    engineering_listing_id: number
    project_sp_id?: number
    project_si_id?: number
  }>,
): Promise<ProcessFormListData[]> => fetcher({ url, arg })

// 获取基础工序
export const reqGetProcess = (
  url: string,
  { arg }: FetchParams<{ ebs_id: number; name?: string }>,
): Promise<ProcessListData[]> => fetcher({ url, arg })

// 获取基础数据（桥涵-钻孔桩）
export const reqGetBridgeBoredBasicData = (
  url: string,
  {
    arg,
  }: FetchParams<{
    ebs_id: number
    project_id: number
    engineering_listing_id: number
    project_sp_id?: number
    project_si_id?: number
  }>,
): Promise<BridgeBoredBasicData[]> => fetcher({ url, arg })

// 添加基础数据（桥涵-钻孔桩）
export const reqPostBridgeBoredBasicData = (
  url: string,
  { arg }: FetchParams<TypeApiPostBridgeBoredBasicDataParams>,
) => fetcher({ url, arg, method: "post" })

// 修改基础数据（桥涵-钻孔桩）
export const reqPutBridgeBoredBasicData = (
  url: string,
  { arg }: FetchParams<TypeApiPutBridgeBoredBasicDataParams>,
) => fetcher({ url, arg, method: "put" })

// 删除基础数据（桥涵-钻孔桩）
export const reqDelBridgeBoredBasicData = (
  url: string,
  { arg }: FetchParams<{ id: number; project_id: number }>,
) => fetcher({ url, arg, method: "delete" })

// 获取基础数据（钢筋）
export const reqGetRebarData = (
  url: string,
  {
    arg,
  }: FetchParams<{
    ebs_id: number
    project_id: number
    engineering_listing_id: number
    project_sp_id?: number
    project_si_id?: number
  }>,
): Promise<RebarData[]> => fetcher({ url, arg })

// 添加基础数据（钢筋）
export const reqPostRebarData = (url: string, { arg }: FetchParams<TypePostRebarParams>) =>
  fetcher({ url, arg, method: "post" })

// 修改基础数据（钢筋）
export const reqPutRebarData = (url: string, { arg }: FetchParams<TypePutRebarParams>) =>
  fetcher({ url, arg, method: "put" })

// 删除基础数据（钢筋）
export const reqDelRebarData = (
  url: string,
  { arg }: FetchParams<{ id: number; project_id: number }>,
) => fetcher({ url, arg, method: "delete" })

// 获取基础数据（钢筋）
export const reqGetConcreteData = (
  url: string,
  {
    arg,
  }: FetchParams<{
    ebs_id: number
    project_id: number
    engineering_listing_id: number
    project_sp_id?: number
    project_si_id?: number
  }>,
): Promise<ConcreteData[]> => fetcher({ url, arg })

// 添加基础数据（钢筋）
export const reqPostConcreteData = (url: string, { arg }: FetchParams<TypePostConcreteParams>) =>
  fetcher({ url, arg, method: "post" })

// 修改基础数据（钢筋）
export const reqPutConcreteData = (url: string, { arg }: FetchParams<TypePutConcreteParams>) =>
  fetcher({ url, arg, method: "put" })

// 删除基础数据（钢筋）
export const reqDelConcreteData = (
  url: string,
  { arg }: FetchParams<{ id: number; project_id: number }>,
) => fetcher({ url, arg, method: "delete" })

// 获取字典
export const reqGetDictionary = (
  url: string,
  { arg }: FetchParams<{ name?: string; class_id?: number }>,
): Promise<DictionaryData[]> => fetcher({ url, arg })
