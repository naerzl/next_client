import React from "react"
import { RolesListData, UserListDataPager } from "@/app/member-department/types"

/* eslint-disable */
const MemberDepartmentContext = React.createContext<{
  insertSideBarWithAddOrEdit: (
    item: RolesListData,
    indexStr: string,
    isAdd: boolean,
    bool: boolean,
  ) => void
  sideBarList: RolesListData[]
  changeSideBarList: () => void
  currentRoleFlag: string
  // eslint-disable-next-line no-unused-vars
  changeCurrentRoleFlag: (currentId: string) => void
  // eslint-disable-next-line no-unused-vars
  getSubClassList: (id: number, indexStr: string) => void
}>({
  sideBarList: [],
  changeSideBarList: () => {},
  currentRoleFlag: "",
  changeCurrentRoleFlag: () => {},
  getSubClassList: () => {},
  insertSideBarWithAddOrEdit() {},
})

export default MemberDepartmentContext
