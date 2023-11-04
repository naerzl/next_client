// 获取平台用户
import { fetcher } from "@/libs/fetch"
import { FetchParams } from "@/types/api"
import {
  ReqGetProjectCurrentResponse,
  ReqGetRolesParams,
  ReqGetUserListParams,
  ReqPostRolesParams,
  ReqPostUserParams,
  ReqPutRolesParams,
  RolesListData,
  UserListData,
  UserListDataPager,
  ReqPutUserParams,
} from "@/app/member-department/types"

// 获取当前项目
export const reqGetCurrentProject = (url: string): Promise<ReqGetProjectCurrentResponse[]> =>
  fetcher({ url })

// 获取平台用户列表
export const reqGetUserList = (
  url: string,
  { arg }: FetchParams<ReqGetUserListParams>,
): Promise<{ items: UserListData[] } & UserListDataPager> => fetcher({ url, arg })

// 新增平台用户
export const reqPostUser = (url: string, { arg }: FetchParams<ReqPostUserParams>) =>
  fetcher({ url, arg, method: "post" })

// 修改平台用户
export const reqPutUser = (url: string, { arg }: FetchParams<ReqPutUserParams>) =>
  fetcher({ url, arg, method: "put" })

// 删除平台用户
export const reqDelUser = (
  url: string,
  { arg }: FetchParams<{ id: string; unionid: string; project_id: number }>,
) => fetcher({ url, arg, method: "delete" })

// 获取平台角色
export const reqGetRole = (
  url: string,
  { arg }: FetchParams<ReqGetRolesParams>,
): Promise<RolesListData[]> => fetcher({ url, arg })

// 新增平台角色
export const reqPostRole = (url: string, { arg }: FetchParams<ReqPostRolesParams>) =>
  fetcher({ url, arg, method: "post" })

// 修改
export const reqPutRole = (url: string, { arg }: FetchParams<ReqPutRolesParams>) =>
  fetcher({ url, arg, method: "put" })

// 删除
export const reqDelRole = (url: string, { arg }: FetchParams<{ id: number; project_id: number }>) =>
  fetcher({ url, arg, method: "delete" })

// 查询已存在用户信息
export const reqGetUserExisted = (url: string, { arg }: FetchParams<{ phone: string }>) =>
  fetcher({ url, arg })
