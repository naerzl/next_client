"use client"
import React from "react"
import useSWRMutation from "swr/mutation"
import { reqGetCodeCount, reqGetEBS } from "@/app/ebs-data/api"
import { TypeEBSDataList } from "@/app/ebs-data/types"
import TableTr from "@/app/ebs-data/components/TableTr"
import { Spin } from "antd"
import EBSDataContext from "@/app/ebs-data/context/ebsDataContext"
import DialogEBS from "@/app/ebs-data/components/DialogEBS"
import useEBSDataDialog from "@/hooks/useEBSDataDialog"
import { useSearchParams } from "next/navigation"
import { PROJECT_ID } from "@/libs/const"
import { Breadcrumbs } from "@mui/material"
import Link from "@mui/material/Link"
import Typography from "@mui/material/Typography"

// 表格每一列的字段
const columns = [
  {
    title: "EBS名称",
    dataIndex: "name",
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
    title: "节点类型",
    dataIndex: "节点类型",
    key: "节点类型",
  },
  {
    title: "分部分项编码",
    dataIndex: "分部分项编码",
    key: "分部分项编码",
  },
]

// 转换数据 添加自定义字段 key
const changeTreeArr = (arr: TypeEBSDataList[], indexStr = ""): TypeEBSDataList[] => {
  if (!arr) arr = []
  return arr.map((item, index) => {
    let str = indexStr ? `${indexStr}-${index}` : `${index}`
    return { ...item, key: str, children: changeTreeArr(item.children as TypeEBSDataList[], str) }
  })
}

function EBSDataPage(props: any) {
  // 获取EBS结构数据
  const { trigger: getEBSApi, isMutating } = useSWRMutation("/ebs", reqGetEBS)
  const [tableData, setTableData] = React.useState<TypeEBSDataList[]>([])
  const searchParams = useSearchParams()

  const {
    dialogOpen,
    isEdit,
    deletedDataList,
    addType,
    handleAddEBS,
    item,
    changeDialogOpen,
    changeIsEdit,
    handleAddCustomEBS,
    handleEditCustomEBS,
  } = useEBSDataDialog()

  // 页面加载获取数据
  React.useEffect(() => {
    getEBSApi({ project_id: PROJECT_ID, level: 1, is_hidde: 0 }).then((res) => {
      if (res) {
        console.log(res)
        const filterRes = searchParams.get("code")
          ? res.filter((item) => item.code == searchParams.get("code"))
          : res
        const newArr = changeTreeArr(filterRes)
        setTableData(newArr)
      }
    })
  }, [])

  // 渲染节点下面的children 树结构方法
  const renderTreeArr = (data: TypeEBSDataList[], indexStr: string) => {
    const newData = structuredClone(tableData)
    const indexArr = indexStr.split("-")
    const str = `newData[${indexArr.join("].children[")}]`
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

  // 控制表格加载状态
  const [tableLoading, setTableLoading] = React.useState(false)

  const { trigger: getCodeCountApi } = useSWRMutation("/ebs/code-count", reqGetCodeCount)

  // 列表展开合并触发的方法
  const handleExpandChange = async (expanded: boolean, record: TypeEBSDataList) => {
    setTableLoading(true)
    // expanded 为真 即是展开
    if (expanded) {
      const res = await getEBSApi({
        code: record.code,
        project_id: PROJECT_ID,
        level: record.level + 1,
        is_hidde: 0,
      })

      if (res.length > 0) {
        // 获取子节点的code数组
        const codeArr = res.map((item) => item.code)
        // 获取子节点
        const resCount = await getCodeCountApi({
          code: JSON.stringify(codeArr),
          // code: JSON.stringify(["0102", "0101"]),
          level: record.level + 2,
          is_hidden: 0,
          project_id: PROJECT_ID,
        })
        if (Object.keys(resCount).length > 0) {
          const childrenArr = res.map((item) => ({
            ...item,
            childrenCount: resCount[String(item.code) as any] || {
              platform: 0,
              system: 0,
              userdefined: 0,
              none: 0,
            },
          }))
          renderTreeArr(childrenArr, record.key as string)
        } else {
          const childrenArr = res.map((item) => ({
            ...item,
            childrenCount: { platform: 0, system: 0, userdefined: 0, none: 0 },
          }))
          renderTreeArr(childrenArr, record.key as string)
        }
      }
    } else {
      renderTreeArrOfCloseChildren(record.key as string)
    }
    setTableLoading(false)
  }

  // 获取父级的子集节点
  const handleGetParentChildren = async (parentIndexArr: string[]) => {
    if (parentIndexArr[0] == "") {
      getEBSApi({ project_id: PROJECT_ID, level: 1, is_hidde: 0 }).then((res) => {
        if (res) {
          const newArr = changeTreeArr(res)
          setTableData(newArr)
        }
      })
    } else {
      // 获取到父级节点
      const parentItem = eval(`tableData[${parentIndexArr.join("].children[")}]`)
      // 获取父级的数据
      const res = await getEBSApi({
        code: parentItem.code,
        project_id: PROJECT_ID,
        level: parentItem.level + 1,
        is_hidde: 0,
      })

      renderTreeArr(res, parentItem.key as string)
    }
  }

  // 渲染表格每一行
  const renderTableTr = (arr: TypeEBSDataList[]) => {
    return arr.map((item) => (
      <TableTr
        item={item}
        key={item.id}
        handleGetParentChildren={handleGetParentChildren}
        handleAddCustomEBS={handleAddCustomEBS}
        handleEditCustomEBS={handleEditCustomEBS}
        handleAddEBS={handleAddEBS}>
        {!item.isCloseChildren &&
          item.children &&
          item.children.length > 0 &&
          renderTableTr(item.children)}
      </TableTr>
    ))
  }

  return (
    <EBSDataContext.Provider value={{ handleExpandChange, tableData }}>
      <h3 className="font-bold text-[1.875rem]">EBS模板</h3>
      <div className="mb-9 mt-7">
        <Breadcrumbs aria-label="breadcrumb" separator=">">
          <Link underline="hover" color="inherit" href="/dashboard">
            <i className="iconfont icon-homefill" style={{ fontSize: "14px" }}></i>
          </Link>
          <Link underline="hover" color="inherit" href="/working-point" sx={{ fontSize: "14px" }}>
            工点数据
          </Link>
          <Typography color="text.primary" sx={{ fontSize: "14px" }}>
            EBS模板
          </Typography>
        </Breadcrumbs>
      </div>
      <div className="bg-white border ">
        <div className="h-full overflow-auto">
          <Spin spinning={tableLoading}>
            <table className="w-full h-full border-spacing-0 border-separate">
              <thead className="bg-[#fafafa] h-12 text-sm">
                <tr className="grid grid-cols-7 h-full">
                  {columns.map((col, index) => (
                    <th
                      className={`border p-4 ${index == 0 ? "col-span-3" : ""}`}
                      key={col.dataIndex}>
                      {col.title}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>{renderTableTr(tableData)}</tbody>
            </table>
          </Spin>
          <DialogEBS
            open={dialogOpen}
            item={item}
            changeDialogOpen={changeDialogOpen}
            deletedDataList={deletedDataList}
            addType={addType}
            isEdit={isEdit}
            handleGetParentChildren={handleGetParentChildren}
            changeIsEdit={changeIsEdit}></DialogEBS>
        </div>
      </div>
    </EBSDataContext.Provider>
  )
}

export default EBSDataPage
