import { fetcher } from "@/libs/fetch"
import { FetchParams } from "@/types/api"
import { GetQueueParams, GetQueueResponse, QueueList } from "@/app/queue/types"

// 获取竣工资料目录
export const reqGetQueue = (
  url: string,
  { arg }: FetchParams<GetQueueParams>,
): Promise<GetQueueResponse> => fetcher({ url, arg })

export const reqGetQueueExportFile = (url: string, { arg }: FetchParams<{ filePath: string }>) =>
  fetcher({ url, arg })
