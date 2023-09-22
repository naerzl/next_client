import { fetcher } from "@/libs/fetch"
import { FetchParams } from "@/types/api"
import {
  TypeGetProjectSubSectionParams,
  TypePostProjectSubSectionParams,
  TypeProjectSubSectionData,
  TypeSubSectionData,
} from "@/app/unit-project/types"

/*获取分部分项列表*/
export const reqGetSubSection = (
  url: string,
  { arg }: FetchParams<{ parent_id?: string; project_id: number }>,
): Promise<TypeSubSectionData[]> => fetcher({ url, arg })

// 获取单位工程/工点数据列表
export const reqGetProjectSubSection = (
  url: string,
  { arg }: FetchParams<TypeGetProjectSubSectionParams>,
): Promise<TypeProjectSubSectionData[]> => fetcher({ url, arg })

// 添加分部分项数据
export const reqPostProjectSubSection = (
  url: string,
  { arg }: FetchParams<TypePostProjectSubSectionParams>,
) => fetcher({ url, method: "post", arg })

// 删除分部分项数据
export const reqDelProjectSubSection = (url: string, { arg }: FetchParams<{ id: number }>) =>
  fetcher({ url, method: "delete", arg })
