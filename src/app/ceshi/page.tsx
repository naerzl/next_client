"use client"
import React from "react"
import { Dropdown, MenuProps, Table } from "antd"
import type { ColumnsType } from "antd/es/table"
import useSWR from "swr"
import useSWRMutation from "swr/mutation"
import { reqGetEBS } from "@/app/ebs-data/api"
import { TypeEBSDataList } from "@/app/ebs-data/types"

const items: MenuProps["items"] = [
  {
    label: "复制",
    key: "1",
    onClick(...arg) {
      console.log(arg)
    },
  },
  {
    label: "添加",
    key: "2",
  },
  {
    label: "修改",
    key: "3",
  },
  {
    label: "删除",
    key: "4",
  },
]

const columns: ColumnsType<TypeEBSDataList> = [
  {
    title: "EBS名称",
    dataIndex: "name",
    key: "id",
    className: "My_abc",
    ellipsis: true,
    render(text, data, index) {
      return (
        <Dropdown
          menu={{ items }}
          trigger={["contextMenu"]}
          onOpenChange={(open) => {
            console.log(open, index)
          }}>
          <div className="afgasfas">{text}</div>
        </Dropdown>
      )
    },
  },
  {
    title: "部位",
    dataIndex: "age",
    key: "id",
  },
  {
    title: "EBS编码",
    dataIndex: "code",
    key: "id",
  },
  {
    title: "单位",
    dataIndex: "unit",
    key: "id",
  },
  {
    title: "单位工程编号",
    dataIndex: "单位工程编号",
    key: "单位工程编号",
  },
  {
    title: "分布编号",
    dataIndex: "分布编号",
    key: "分布编号",
  },
  {
    title: "分项编号",
    dataIndex: "分项编号",
    key: "分项编号",
  },
  {
    title: "检验批编号",
    dataIndex: "检验批编号",
    key: "检验批编号",
  },
]

const changeTreeArr = (arr: TypeEBSDataList[], indexStr = ""): TypeEBSDataList[] => {
  if (!arr) arr = []
  return arr.map((item, index) => {
    let str = indexStr ? `${indexStr}-${index}` : `${index}`
    return { ...item, key: str, children: changeTreeArr(item.children as TypeEBSDataList[], str) }
  })
}

export default function EBSDataPage(props: any) {
  const { trigger: getEBSApi, isMutating } = useSWRMutation("/ebs", reqGetEBS)
  const [tableData, setTableData] = React.useState<TypeEBSDataList[]>([])

  React.useEffect(() => {
    getEBSApi({ project_id: 1, level: 1, is_hidde: 0 }).then((res) => {
      if (res) {
        const newArr = changeTreeArr(res)
        const arr = []
        for (let i = 0; i < 1; i++) {
          arr.push(...newArr)
        }
        setTableData(arr.map((item) => ({ ...item, children: [{} as TypeEBSDataList] })))
        // setTableData(newArr)
      }
    })
  }, [])

  // 渲染树结构方法
  const renderTreeArr = (data: TypeEBSDataList[], indexStr: string) => {
    const newData = structuredClone(tableData)
    const indexArr = indexStr.split("-")
    const str = `newData[${indexArr.join("].children[")}].children`
    eval(str + "=data")
    const newArr = changeTreeArr(newData)
    setTableData(newArr)
  }

  // 列表展开合并触发的方法
  const handleExpandChange = async (expanded: boolean, record: TypeEBSDataList) => {
    if (expanded) {
      const res = await getEBSApi({
        code: record.code,
        project_id: 1,
        level: record.level + 1,
        is_hidde: 0,
      })
      renderTreeArr(res, record.key as string)
    }
  }

  return (
    <div className="h-full overflow-auto overflow-x-hidden">
      <Table
        columns={columns}
        dataSource={tableData as TypeEBSDataList[]}
        bordered
        loading={isMutating}
        rowKey="id"
        onExpand={(expanded, record) => {
          handleExpandChange(expanded, record)
        }}
        pagination={false}
      />
    </div>
  )
}
