import { fetcher } from "@/libs/fetch"
import { FetchParams } from "@/types/api"
import {
  GetMaterialProcessingParams,
  GetMaterialResponse,
  PostMaterialProcessingParams,
  PutMaterialProcessingParams,
} from "@/app/material-processing/types"

// 获取查询物资加工记录
export const reqGetMaterialMachine = (
  url: string,
  { arg }: FetchParams<GetMaterialProcessingParams>,
): Promise<GetMaterialResponse> => fetcher({ url, arg })

export const reqPostMaterialMachine = (
  url: string,
  { arg }: FetchParams<PostMaterialProcessingParams>,
) => fetcher({ url, arg, method: "post" })

export const reqPutMaterialMachine = (
  url: string,
  { arg }: FetchParams<PutMaterialProcessingParams>,
) => fetcher({ url, arg, method: "put" })

export const reqDelMaterialMachine = (
  url: string,
  { arg }: FetchParams<{ id: number; project_id: number }>,
) => fetcher({ url, arg, method: "delete" })
