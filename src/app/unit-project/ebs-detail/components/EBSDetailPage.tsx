"use client"
import React from "react"
import useSWRMutation from "swr/mutation"
import { reqGetSubSection } from "@/app/unit-project/api"
import { useSearchParams } from "next/navigation"
import { TypeSubSectionData } from "@/app/unit-project/types"
import TableTr from "@/app/unit-project/ebs-detail/components/TableTr"
import { Breadcrumbs } from "@mui/material"
import Link from "@mui/material/Link"
import Typography from "@mui/material/Typography"

// 表格每一列的字段
const columns = [
  {
    title: "分部、分项、检验批划分",
    dataIndex: "name",
    key: "name",
  },
  {
    title: "编码",
    dataIndex: "code",
    key: "code",
  },

  {
    title: "节点分类",
    dataIndex: "subpart_type",
    key: "subpart_type",
  },
  {
    title: "节点归属",
    dataIndex: "subpart_class",
    key: "subpart_class",
  },
  {
    title: "是否前缀",
    dataIndex: "is_prefix",
    key: "is_prefix",
  },
]

// 转换数据 添加自定义字段 key
const changeTreeArr = (arr: TypeSubSectionData[], indexStr = ""): TypeSubSectionData[] => {
  if (!arr) arr = []
  return arr.map((item, index) => {
    let str = indexStr ? `${indexStr}-${index}` : `${index}`
    return {
      ...item,
      key: str,
      children: changeTreeArr(item.children as TypeSubSectionData[], str),
    }
  })
}

export default function EBSDetailPage(props: any) {
  // 获取表格数据SWR请求
  const { trigger: getSubSectionApi } = useSWRMutation("/subsection", reqGetSubSection)

  const searchParams = useSearchParams()

  const [tableData, setTableData] = React.useState<TypeSubSectionData[]>([])
  const getSubSection = async () => {
    const res = await getSubSectionApi({
      parent_id: JSON.stringify([+searchParams.get("id")!]) as string,
      project_id: 1,
    })
    const newArr = changeTreeArr(res)
    setTableData(newArr)
  }

  React.useEffect(() => {
    getSubSection()
  }, [])

  const [tableLoading, setTableLoading] = React.useState(false)

  // 渲染表格行
  const renderTableTr = (arr: TypeSubSectionData[]) => {
    return arr.map((item) => (
      <TableTr key={item.id} item={item} handleExpandOrClose={handleExpandOrClose}>
        {!item.isCloseChildren &&
          item.children &&
          item.children.length > 0 &&
          renderTableTr(item.children)}
      </TableTr>
    ))
  }

  const handleRenderTreeChildren = (data: TypeSubSectionData[], indexStr: string) => {
    const newData = structuredClone(tableData)
    const indexArr = indexStr.split("-")
    const str = `newData[${indexArr.join("].children[")}]`
    if (data.length <= 0) eval(str + ".noChildren=true")
    eval(str + ".children=data")
    eval(str + ".isCloseChildren=false")
    const newArr = changeTreeArr(newData)
    setTableData(newArr)
  }

  // 切换节点关闭方法
  const renderTreeArrOfCloseChildren = (indexStr: string) => {
    const newData = structuredClone(tableData)
    const indexArr = indexStr.split("-")
    const str = `newData[${indexArr.join("].children[")}].isCloseChildren`
    eval(str + "=true")
    setTableData(newData)
  }

  const handleExpandOrClose = async (expand: boolean, record: TypeSubSectionData) => {
    // 判断是展开还是关闭
    if (expand) {
      const res = await getSubSectionApi({ parent_id: JSON.stringify([record.id]), project_id: 1 })
      handleRenderTreeChildren(res, record.key as string)
    } else {
      renderTreeArrOfCloseChildren(record.key as string)
    }
  }

  return (
    <>
      <h3 className="font-bold text-[1.875rem]">分部分项</h3>
      <div className="mb-9 mt-7">
        <Breadcrumbs aria-label="breadcrumb" separator=">">
          <Link underline="hover" color="inherit" href="/dashboard">
            <i className="iconfont icon-homefill" style={{ fontSize: "14px" }}></i>
          </Link>
          <Link underline="hover" color="inherit" href="/unit-project" sx={{ fontSize: "14px" }}>
            单位工程
          </Link>
          <Typography color="text.primary" sx={{ fontSize: "14px" }}>
            分部分项
          </Typography>
        </Breadcrumbs>
      </div>
      <div className="bg-white border ">
        <div className="h-full  ebs_data custom-scroll-bar">
          <table className="w-full h-full border-spacing-0 border-separate">
            <thead className="bg-[#fafafa] h-12 text-sm">
              <tr className="grid grid-cols-7 h-full">
                {columns.map((col, index) => (
                  <th
                    className={`border flex items-center justify-center ${
                      index == 0 ? "col-span-3" : ""
                    }`}
                    key={col.dataIndex}>
                    {col.title}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>{renderTableTr(tableData)}</tbody>
          </table>
        </div>
      </div>
    </>
  )
}
