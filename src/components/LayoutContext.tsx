import React from "react"
import { ReqGetProjectCurrentResponse } from "@/app/member-department/types"
import { PermissionData } from "@/types/api"

export const LayoutContext = React.createContext<{
  projectId: number
  changeProject: (id: number) => void
  projectList: ReqGetProjectCurrentResponse[]
  changeProjectList: (arr: ReqGetProjectCurrentResponse[]) => void
  permissionList: PermissionData[]
  changePermissionList: (arr: PermissionData[]) => void
  permissionTagList: string[]
  changePermissionTagList: (arr: string[]) => void
  getProjectList: () => void
}>({
  projectId: 0,
  changeProject: (id: number) => {},
  projectList: [],
  permissionList: [],
  permissionTagList: [],
  getProjectList: () => {},
  changePermissionList: () => {},
  changePermissionTagList: () => {},
  changeProjectList: () => {},
})
