import { fetcher } from "@/libs/fetch"
import { FetchParams } from "@/types/api"
import { QueueList } from "@/app/queue/types"

// 获取竣工资料目录
export const reqGetQueue = (
  url: string,
  { arg }: FetchParams<{ project_id: number; path: string }>,
): Promise<QueueList[]> => fetcher({ url, arg })
