import { fetcher } from "@/libs/fetch"
import { FetchParams } from "@/types/api"
import {
  GetMaterialDemandItemParams,
  GetMaterialDemandItemResponse,
  GetMaterialDemandParams,
  GetMaterialDemandResponse,
  PostMaterialDemandItemParams,
  PostMaterialDemandParams,
  PutMaterialDemandItemParams,
  PutMaterialDemandParams,
} from "@/app/material-demand/types"

export const reqGetMaterialDemand = (
  url: string,
  { arg }: FetchParams<GetMaterialDemandParams>,
): Promise<GetMaterialDemandResponse> => fetcher({ url, arg })

export const reqPostMaterialDemand = (
  url: string,
  { arg }: FetchParams<PostMaterialDemandParams>,
) => fetcher({ url, arg, method: "post" })

export const reqPutMaterialDemand = (url: string, { arg }: FetchParams<PutMaterialDemandParams>) =>
  fetcher({ url, arg, method: "put" })

export const reqDelMaterialDemand = (
  url: string,
  { arg }: FetchParams<{ id: number; project_id: number }>,
) => fetcher({ url, arg, method: "delete" })

export const reqGetMaterialDemandItem = (
  url: string,
  { arg }: FetchParams<GetMaterialDemandItemParams>,
): Promise<GetMaterialDemandItemResponse> => fetcher({ url, arg })

export const reqPostMaterialDemandItem = (
  url: string,
  { arg }: FetchParams<PostMaterialDemandItemParams>,
): Promise<{ id: number }> => fetcher({ url, arg, method: "post" })

export const reqPutMaterialDemandItem = (
  url: string,
  { arg }: FetchParams<PutMaterialDemandItemParams>,
) => fetcher({ url, arg, method: "put" })

export const reqDelMaterialDemandItem = (
  url: string,
  { arg }: FetchParams<{ id: number; requirement_id: number }>,
) => fetcher({ url, arg, method: "delete" })
