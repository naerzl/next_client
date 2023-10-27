import { fetcher } from "@/libs/fetch"
import { FetchParams } from "@/types/api"
import {
  GetMaterialReceiveParams,
  GetMaterialReceiveResponse,
  PostMaterialReceiveParams,
  PutMaterialReceiveParams,
} from "@/app/material-receipt/types"

// 获取查询物资领用记录
export const reqGetMaterialReceive = (
  url: string,
  { arg }: FetchParams<GetMaterialReceiveParams>,
): Promise<GetMaterialReceiveResponse> => fetcher({ url, arg })

// 增加物资领用记录
export const reqPostMaterialReceive = (
  url: string,
  { arg }: FetchParams<PostMaterialReceiveParams>,
) => fetcher({ url, arg, method: "post" })

// 修改物资领用记录
export const reqPutMaterialReceive = (
  url: string,
  { arg }: FetchParams<PutMaterialReceiveParams>,
) => fetcher({ url, arg, method: "put" })

// 删除物资领用记录
export const reqDelMaterialReceive = (
  url: string,
  { arg }: FetchParams<{ id: number; project_id: number }>,
) => fetcher({ url, arg, method: "delete" })
