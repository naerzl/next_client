import { FetchParams } from "@/types/api"
import { fetcher } from "@/libs/fetch"
import {
  EngineeringListing,
  PostEngineeringListingParams,
  PutEngineeringListingParams,
} from "@/app/basic-engineering-management/types/index.d"

export const reqGetEngineeringListing = (
  url: string,
  { arg }: FetchParams<{ project_id: number }>,
): Promise<EngineeringListing[]> => fetcher({ url, arg })

export const reqPostEngineeringListing = (
  url: string,
  { arg }: FetchParams<PostEngineeringListingParams>,
) => fetcher({ url, arg, method: "post" })

export const reqPutEngineeringListing = (
  url: string,
  { arg }: FetchParams<PutEngineeringListingParams>,
) => fetcher({ url, arg, method: "put" })

export const reqDelEngineeringListing = (
  url: string,
  { arg }: FetchParams<{ id: number; project_id: number }>,
) => fetcher({ url, arg, method: "delete" })
