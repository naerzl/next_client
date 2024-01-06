import { fetcher } from "@/libs/fetch"
import { FetchParams } from "@/types/api"
import {
  GetMaterialProportionParams,
  GetMaterialProportionResponse,
  PostMaterialProportionParams,
  PutMaterialProportionParams,
} from "@/app/proportion/types"

export const reqGetMaterialProportion = (
  url: string,
  { arg }: FetchParams<GetMaterialProportionParams>,
): Promise<GetMaterialProportionResponse> => fetcher({ url, arg })

export const reqPostMaterialProportion = (
  url: string,
  { arg }: FetchParams<PostMaterialProportionParams>,
): Promise<GetMaterialProportionResponse> => fetcher({ url, arg, method: "post" })

export const reqPutMaterialProportion = (
  url: string,
  { arg }: FetchParams<PutMaterialProportionParams>,
): Promise<GetMaterialProportionResponse> => fetcher({ url, arg, method: "put" })

export const reqDelMaterialProportion = (
  url: string,
  { arg }: FetchParams<{ id: number; project_id: number }>,
) => fetcher({ url, arg, method: "delete" })
