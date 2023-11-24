import React from "react"
import { ReqGetProjectCurrentResponse } from "@/app/member-department/types"
import { PermissionData } from "@/types/api"

export const LayoutContext = React.createContext<{
  projectId: number
  changeProject: (id: number) => void
  projectList: ReqGetProjectCurrentResponse[]
  permissionList: PermissionData[]
  permissionTagList: string[]
  getProjectList: () => void
}>({
  projectId: 0,
  changeProject: (id: number) => {},
  projectList: [],
  permissionList: [],
  permissionTagList: [],
  getProjectList: () => {},
})
