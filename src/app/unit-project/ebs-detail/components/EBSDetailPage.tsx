"use client"
import React from "react"
import useSWRMutation from "swr/mutation"
import { reqGetSubSection } from "@/app/unit-project/api"
import { useSearchParams } from "next/navigation"
import { TypeSubSectionData } from "@/app/unit-project/types"
import { Button, Spin } from "antd"
import { TypeEBSDataList } from "@/app/ebs-data/types"

// 表格每一列的字段
const columns = [
  {
    title: "分部、分项、检验批划分",
    dataIndex: "name",
    key: "id",
  },
  {
    title: "编码",
    dataIndex: "age",
    key: "id",
  },
  {
    title: "单位",
    dataIndex: "code",
    key: "id",
  },
  {
    title: "分部",
    dataIndex: "unit",
    key: "id",
  },
  {
    title: "分项",
    dataIndex: "单位工程编号",
    key: "单位工程编号",
  },
  {
    title: "分布编号",
    dataIndex: "分布编号",
    key: "分布编号",
  },
  {
    title: "操作",
    dataIndex: "操作",
    key: "操作",
    render() {
      return (
        <div>
          <Button type="primary" className="bg-railway_blue">
            保存
          </Button>
        </div>
      )
    },
  },
]

function EBSDetailPage(props: any) {
  // 获取表格数据SWR请求
  const { trigger: getSubSectionApi } = useSWRMutation("/subsection", reqGetSubSection)

  const searchParams = useSearchParams()

  const [tableData, setTableData] = React.useState<TypeSubSectionData[]>([])
  const getSubSection = async () => {
    const res = await getSubSectionApi({
      parent_id: JSON.stringify([+searchParams.get("id")!]) as string,
    })
    setTableData(res || [])
  }

  React.useEffect(() => {
    getSubSection()
  }, [])

  const [tableLoading, setTableLoading] = React.useState(false)

  return (
    <Spin spinning={tableLoading}>
      <table className="w-full h-full border-spacing-0 border-separate">
        <thead className="bg-[#fafafa] h-12 text-sm">
          <tr className="grid grid-cols-10 h-full">
            {columns.map((col, index) => (
              <th
                className={`border flex items-center justify-center ${
                  index == 0 ? "col-span-4" : ""
                }`}
                key={col.dataIndex}>
                {col.render ? col.render() : col.title}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {tableData.map((col) => (
            <tr className="grid grid-cols-10 h-full" key={col.id}>
              <td className="col-span-4">1</td>
              <td>2</td>
              <td>3</td>
            </tr>
          ))}
        </tbody>
      </table>
    </Spin>
  )
}

export default EBSDetailPage
