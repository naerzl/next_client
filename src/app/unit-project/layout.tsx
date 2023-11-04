"use client"
import React from "react"
import UnitProjectContext from "@/app/unit-project/context/unitProjectContext"
import {
  TypeGetProjectSubSectionParams,
  TypeProjectSubSectionData,
  TypeSubSectionData,
} from "@/app/unit-project/types"
import useSWRMutation from "swr/mutation"
import { reqGetProjectSubSection, reqGetSubSection } from "@/app/unit-project/api"
import { PROJECT_ID } from "@/libs/const"

export default function UnitProjectLayout({ children }: { children: React.ReactNode }) {
  //页面表格数据
  const [tableList, setTableList] = React.useState<TypeProjectSubSectionData[]>([])
  const [professionList, setProfessionList] = React.useState<TypeSubSectionData[]>([])

  // 获取表格数据SWR请求
  const { trigger: getProjectSubSectionApi } = useSWRMutation(
    "/project-subsection",
    reqGetProjectSubSection,
  )

  // 获取表格数据SWR请求
  const { trigger: getSubSectionApi } = useSWRMutation("/subsection", reqGetSubSection)

  // 获取表格数据方法
  const getProjectSubSection = async (option?: TypeGetProjectSubSectionParams) => {
    const res = await getProjectSubSectionApi(option ? { ...option } : { project_id: PROJECT_ID })
    setTableList(res || [])
  }

  // 获取专业列表
  const getSubSection = async () => {
    const res = await getSubSectionApi({ project_id: PROJECT_ID })
    setProfessionList(res || [])
  }

  React.useEffect(() => {
    getProjectSubSection()
    getSubSection()
  }, [])

  const handleAddTableList = () => {
    setTableList([{} as TypeProjectSubSectionData, ...tableList])
  }

  const [editItem, setEditItem] = React.useState<TypeProjectSubSectionData | null>(null)

  const changeEditItem = (item: TypeProjectSubSectionData | null) => {
    setEditItem(item)
  }

  return (
    <UnitProjectContext.Provider
      value={{ tableList, getProjectSubSection, professionList, editItem, changeEditItem }}>
      <div className="min-h-full unit_project">{children}</div>
    </UnitProjectContext.Provider>
  )
}
