import { fetcher } from "@/libs/fetch"
import { FetchParams } from "@/types/api"
import {
  DictionaryClassListData,
  DictionaryData,
  GetDictionaryClassResponse,
  GetMaterialApproachParams,
  GetMaterialApproachResponse,
  PostMaterialApproachParams,
  PutMaterialApproachParams,
} from "@/app/material-approach/types"

// 查询物资进场记录
export const reqGetMaterialApproach = (
  url: string,
  { arg }: FetchParams<GetMaterialApproachParams>,
): Promise<GetMaterialApproachResponse> => fetcher({ url, arg })

// 增加物资进场记录
export const reqPostMaterialApproach = (
  url: string,
  { arg }: FetchParams<PostMaterialApproachParams>,
) => fetcher({ url, arg, method: "post" })

// 修改物资进场记录
export const reqPutMaterialApproach = (
  url: string,
  { arg }: FetchParams<PutMaterialApproachParams>,
) => fetcher({ url, arg, method: "put" })

// 修改物资进场记录
export const reqDelMaterialApproach = (
  url: string,
  { arg }: FetchParams<{ id: number; project_id: number }>,
) => fetcher({ url, arg, method: "delete" })

export const reqGetDictionary = (
  url: string,
  { arg }: FetchParams<{ name?: string; class_id?: number }>,
): Promise<DictionaryData[]> => fetcher({ url, arg })

export const reqGetDictionaryClass = (
  url: string,
  { arg }: FetchParams<{ parent_id?: number; page: number; limit: number }>,
): Promise<DictionaryClassListData[]> => fetcher({ url, arg })

export const reqPostMaterialEntrust = (
  url: string,
  { arg }: FetchParams<{ project_id: number; file: any }>,
) => fetcher({ url, arg, method: "post" })
