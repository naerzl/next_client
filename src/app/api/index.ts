import { fetcher } from "@/libs/fetch"
import { DictionaryClassData, FetchParams, PermissionData } from "@/types/api"

// 1
export const reqGetPermission = (
  url: string,
  { arg }: FetchParams<{ project_id: number }>,
): Promise<PermissionData[]> => fetcher({ url, arg })

export const reqPutProjectChangeDefault = (
  url: string,
  { arg }: FetchParams<{ project_id: number }>,
) => fetcher({ url, arg, method: "put" })

export const reqGetDictionaryClass = (
  url: string,
  { arg }: FetchParams<{ parent_id?: number; is_all?: 0 | 1 }>,
): Promise<DictionaryClassData[]> => fetcher({ url, arg })
