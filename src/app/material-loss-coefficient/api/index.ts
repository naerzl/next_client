import { fetcher } from "@/libs/fetch"
import { FetchParams } from "@/types/api"
import {
  GetMaterialLossCoefficientParams,
  GetMaterialLossCoefficientResponse,
  PostMaterialLossCoefficientParams,
} from "@/app/material-loss-coefficient/types"

export const reqGetMaterialLossCoefficient = (
  url: string,
  { arg }: FetchParams<GetMaterialLossCoefficientParams>,
): Promise<GetMaterialLossCoefficientResponse> => fetcher({ url, arg })

export const reqPostMaterialLossCoefficient = (
  url: string,
  { arg }: FetchParams<PostMaterialLossCoefficientParams>,
) => fetcher({ url, arg, method: "post" })
