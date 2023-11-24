import { fetcher } from "@/libs/fetch"
import { FetchParams, PermissionData } from "@/types/api"

export const reqGetPermission = (
  url: string,
  { arg }: FetchParams<{ project_id: number }>,
): Promise<PermissionData[]> => fetcher({ url, arg })

export const reqPutProjectChangeDefault = (
  url: string,
  { arg }: FetchParams<{ project_id: number }>,
) => fetcher({ url, arg, method: "put" })
