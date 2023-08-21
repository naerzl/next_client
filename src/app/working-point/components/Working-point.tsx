"use client"
import React from "react"
import WorkingPointContext from "@/app/working-point/context/workingPointContext"
import { useRouter } from "next/navigation"
import useSWRMutation from "swr/mutation"
import { reqDelProjectSubSection } from "@/app/working-point/api"
import { ColumnsType } from "antd/es/table"
import { TypeProjectSubSectionData } from "@/app/working-point/types"
import { Button, Input, Table } from "antd"
import DialogProject from "@/app/working-point/components/DialogProject"

export default function WorkingPoint() {
  const ctx = React.useContext(WorkingPointContext)

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
      title: "序号",
      dataIndex: "id",
      key: "id",
    },
    {
      title: "工点名称",
      dataIndex: "name",
      key: "name",
    },
    {
      title: "专业名称",
      dataIndex: "ebs_name",
      key: "ebs_name",
    },

    {
      title: "开始",
      dataIndex: "start_tally",
      key: "start_tally",
    },

    {
      title: "结束",
      dataIndex: "end_tally",
      key: "end_tally",
    },
    {
      title: "所属单位工程",
      dataIndex: "parent_name",
      key: "parent_name",
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
              EBS
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
