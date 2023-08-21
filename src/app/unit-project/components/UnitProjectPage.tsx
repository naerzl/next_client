"use client"
import React from "react"
import { Button, Dropdown, Input, Table } from "antd"
import useSWRMutation from "swr/mutation"
import { ColumnsType } from "antd/es/table"
import UnitProjectContext from "@/app/unit-project/context/unitProjectContext"
import DialogProject from "@/app/unit-project/components/DialogProject"
import { TypeProjectSubSectionData } from "@/app/unit-project/types"
import { reqDelProjectSubSection } from "@/app/unit-project/api"
import { useRouter } from "next/navigation"

export default function UnitProjectPage(props: any) {
  const ctx = React.useContext(UnitProjectContext)

  const router = useRouter()

  const [dialogOpen, setDialogOpen] = React.useState(false)

  const { trigger: delProjectSubSection } = useSWRMutation(
    "/project-subsection",
    reqDelProjectSubSection,
  )

  // 处理点击删除
  const handleClickDelete = async (id: number) => {
    await delProjectSubSection({ id })
    ctx.getProjectSubSection()
  }

  // 表格配置列
  const columns: ColumnsType<TypeProjectSubSectionData> = [
    {
      title: "编号",
      dataIndex: "code",
      key: "code",
    },
    {
      title: "单位工程名称",
      dataIndex: "name",
      key: "name",
    },
    {
      title: "专业名称",
      dataIndex: "subpart_name",
      key: "subpart_name",
    },
    {
      title: "开始里程",
      dataIndex: "start_mileage",
      key: "start_mileage",
    },
    {
      title: "开始",
      dataIndex: "start_tally",
      key: "start_tally",
    },
    {
      title: "结束里程",
      dataIndex: "end_mileage",
      key: "end_mileage",
    },
    {
      title: "结束",
      dataIndex: "end_tally",
      key: "end_tally",
    },
    {
      title: "长度m",
      dataIndex: "calculate_value",
      key: "calculate_value",
    },
    {
      width: "180px",
      title: "操作",
      key: "action",
      render(_, record) {
        return (
          <div className="flex justify-between">
            <Button
              className="bg-railway_blue"
              type="primary"
              onClick={() => {
                router.push(`/unit-project/ebs-detail?id=${record.id}`)
              }}>
              进入
            </Button>
            <Button
              danger
              onClick={() => {
                handleClickDelete(record.id)
              }}>
              删除
            </Button>
          </div>
        )
      },
    },
  ]

  const changeDialogOpen = (open: boolean) => {
    setDialogOpen(open)
  }

  const handleClickSearch = (value: string) => {
    ctx.getProjectSubSection({ name: value })
  }

  return (
    <>
      <header className="flex justify-between mb-4">
        <div className="flex gap-2">
          <Button
            type="primary"
            className="bg-railway_blue"
            onClick={() => {
              setDialogOpen(true)
            }}>
            添加
          </Button>
          <Button type="primary" className="bg-railway_blue">
            导出
          </Button>
        </div>
        <div>
          <Input.Search
            placeholder="搜索项目名称"
            onSearch={(value: string) => {
              handleClickSearch(value)
            }}></Input.Search>
        </div>
      </header>
      <div>
        <Table columns={columns} dataSource={ctx.tableList} rowKey="id" bordered />
      </div>
      <DialogProject open={dialogOpen} changeDialogOpen={changeDialogOpen}></DialogProject>
    </>
  )
}
