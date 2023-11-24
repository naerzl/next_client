import { fetcher } from "@/libs/fetch"
import {
  CompletionArchiveList,
  CompletionArchiveListFilesObject,
} from "@/app/completion-management/types"
import { FetchParams } from "@/types/api"

// 获取竣工资料目录
export const reqGetCompletionArchive = (
  url: string,
  { arg }: FetchParams<{ project_id: number; path: string }>,
): Promise<CompletionArchiveList> => fetcher({ url, arg })

// 获取竣工资料文件
export const reqGetCompletionArchiveObject = (
  url: string,
  { arg }: FetchParams<{ project_id: number; path: string }>,
): Promise<CompletionArchiveListFilesObject> => fetcher({ url, arg })
