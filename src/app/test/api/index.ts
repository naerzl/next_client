import { fetcher } from "@/libs/fetch"
import { FetchParams } from "@/types/api"
import { ReqGetTestListResponse } from "@/app/test/types"

export const reqGetMaterialTest = (
  url: string,
  { arg }: FetchParams<{ page?: number; limit?: number }>,
): Promise<ReqGetTestListResponse> => fetcher({ url, arg })
