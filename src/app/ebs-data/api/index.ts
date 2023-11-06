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
