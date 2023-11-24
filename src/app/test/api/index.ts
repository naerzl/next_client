import { fetcher } from "@/libs/fetch"
import { FetchParams } from "@/types/api"
import { ReqGetTestListParams, ReqGetTestListResponse } from "@/app/test/types"

export const reqGetMaterialTest = (
  url: string,
  { arg }: FetchParams<ReqGetTestListParams>,
): Promise<ReqGetTestListResponse> => fetcher({ url, arg })
