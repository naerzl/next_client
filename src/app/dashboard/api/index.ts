import { fetcher } from "@/libs/fetch"
import { UserCurrentData } from "@/app/dashboard"

export const reqGetUserCurrent = (url: string): Promise<UserCurrentData> => fetcher({ url })
