"use client"
import React from "react"
import {
  TypeGetProjectSubSectionParams,
  TypeProjectSubSectionData,
  TypeSubSectionData,
} from "@/app/working-point/types"
import useSWRMutation from "swr/mutation"
import { reqGetProjectSubSection, reqGetSubSection } from "@/app/working-point/api"
import WorkingPointContext from "@/app/working-point/context/workingPointContext"
import { LayoutContext } from "@/components/LayoutContext"
import dayjs from "dayjs"

export default function WorkingPointLayout({ children }: { children: React.ReactNode }) {
  const { projectId: PROJECT_ID } = React.useContext(LayoutContext)

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
    const res = await getProjectSubSectionApi(
      option ? { is_subset: 1, ...option } : { is_subset: 1, project_id: PROJECT_ID },
    )
    const newArr = res.sort((a, b) => {
      return dayjs(b.created_at).unix() - dayjs(a.created_at).unix()
    })
    setTableList(newArr || [])
  }

  // 获取专业列表
  const getSubSection = async () => {
    const res = await getSubSectionApi({ project_id: PROJECT_ID })
    setProfessionList(res || [])
  }

  React.useEffect(() => {
    getProjectSubSection()
    // getSubSection()
  }, [])

  const [editItem, setEditItem] = React.useState<TypeProjectSubSectionData | null>(null)

  const changeEditItem = (item: TypeProjectSubSectionData | null) => {
    setEditItem(item)

    console.log(item)
  }

  return (
    <WorkingPointContext.Provider
      value={{ tableList, getProjectSubSection, professionList, editItem, changeEditItem }}>
      <div className="h-full flex flex-col">{children}</div>
    </WorkingPointContext.Provider>
  )
}
