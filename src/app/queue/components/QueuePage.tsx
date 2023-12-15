"use client"
import React from "react"
import { Breadcrumbs, Button, Chip, InputBase, Table, TableHead } from "@mui/material"
import Link from "@mui/material/Link"
import Typography from "@mui/material/Typography"
import { LayoutContext } from "@/components/LayoutContext"
import useSWRMutation from "swr/mutation"
import { reqGetQueue, reqGetQueueExportFile } from "@/app/queue/api"
import TableCell from "@mui/material/TableCell"
import TableRow from "@mui/material/TableRow"
import TableBody from "@mui/material/TableBody"
import { dateToUTCCustom, findEnumValueWithLabel } from "@/libs/methods"
import { STATUS_ENUM } from "@/app/queue/const"
import { QueueList } from "@/app/queue/types"

let STR =
  "http://zctc-docs.oss-cn-beijing.aliyuncs.com/export%2F27%2F31%2F32795%2FInspection_lot_template%2F02%28%E8%AE%B0%29%E9%92%A2%E6%8A%A4%E7%AD%92%E5%AE%89%E8%A3%85%E8%B4%A8%E9%87%8F%E6%A3%80%E9%AA%8C%E8%AE%B0%E5%BD%95%E8%A1%A8.xlsx?Expires=601702620668&OSSAccessKeyId=LTAI5tRrhJmZ5QDdkcYk9h5C&Signature=D6FJ3uVEnknfP%2BSK3A2Gm416SV0%3D"

const columns = [
  // {
  //   title: "单位工程名称",
  //   key: "id",
  // },
  // {
  //   title: "节点名称",
  //   key: "name",
  // },
  {
    title: "文件名称",
    key: "ebs_name",
  },
  {
    title: "状态",
    key: "状态",
  },
  // {
  //   title: "创建人",
  //   key: "创建人",
  // },

  {
    title: "创建时间",
    key: "创建时间",
  },

  {
    title: "原因",
    key: "原因",
  },

  {
    title: "操作",
    key: "action",
  },
]

function renderStatus(label: string): React.ReactNode {
  switch (label) {
    case "failed":
      return <Chip label="失败" color="error" />
    case "pending":
      return <Chip label="等待" color="primary" />
    case "exceptional":
      return <Chip label="异常" color="warning" />
    case "done":
      return <Chip label="完成" color="success" />
    default:
      return <span></span>
  }
}

function renderRowCellName(fileName: string | null) {
  if (fileName == null) {
    return <></>
  }
  let fileNameArr: string[] = JSON.parse(fileName)

  const _strSplit = (str: string) => {
    let arr = str.split("/")
    return arr.length > 0 ? arr[arr.length - 1] : ""
  }

  return (
    <ul>
      {fileNameArr.map((str, index) => (
        <li key={index}>{_strSplit(str)}</li>
      ))}
    </ul>
  )
}

export default function QueuePage() {
  const { projectId: PROJECT_id } = React.useContext(LayoutContext)

  const { trigger: getQueueApi } = useSWRMutation("/queue", reqGetQueue)
  const { trigger: getQueueExportFileApi } = useSWRMutation(
    "/queue/export/file",
    reqGetQueueExportFile,
  )

  const [queueList, setQueueList] = React.useState<QueueList[]>([])

  const getQueueList = async () => {
    const res = await getQueueApi({ project_id: PROJECT_id, class: "inspection_lot" })
    setQueueList(res)
  }

  React.useEffect(() => {
    getQueueList()
  }, [])

  const handleSearch = () => {}

  const handleClickDownLoad = async (item: QueueList) => {
    if (item.file_names == null) return

    const fileNameArr: string[] = JSON.parse(item.file_names)
    const fileUrlArr: string[] = []
    for (let index in fileNameArr) {
      let res = await getQueueExportFileApi({ filePath: fileNameArr[index] })
      fileUrlArr.push(res.file_url)
    }

    const a = document.createElement("a")
    for (const index in fileUrlArr) {
      let r = await fetch(STR)
      let blob = await r.blob()
      let localUrl = URL.createObjectURL(blob)
      console.log(localUrl)
      const fr = new FileReader()
      fr.readAsDataURL(blob)
      fr.onload = (e) => {
        console.log(e.target?.result)
        a.href = e.target!.result as string
        a.click()
      }
      // console.log(localUrl)
    }

    a.remove()
  }

  return (
    <>
      <h3 className="font-bold text-[1.875rem]">导出任务</h3>
      <div className="mb-9 mt-7">
        <Breadcrumbs aria-label="breadcrumb" separator=">">
          <Link underline="hover" color="inherit" href="/dashboard">
            <i className="iconfont icon-homefill" style={{ fontSize: "14px" }}></i>
          </Link>
          <Typography color="text.primary" sx={{ fontSize: "14px" }}>
            导出任务
          </Typography>
        </Breadcrumbs>
      </div>
      <header className="flex justify-between mb-4">
        <div className="flex gap-x-2">
          {/*<InputBase*/}
          {/*  className="w-[12rem] h-10 border px-2 shadow bg-white"*/}
          {/*  placeholder="请输入单位工程名称"*/}
          {/*  onChange={(event) => {}}*/}
          {/*/>*/}

          {/*<InputBase*/}
          {/*  className="w-[12rem] h-10 border px-2 shadow bg-white"*/}
          {/*  placeholder="请输入节点名称"*/}
          {/*  onChange={(event) => {}}*/}
          {/*/>*/}
          {/*<Button*/}
          {/*  className="bg-railway_blue text-white"*/}
          {/*  onClick={() => {*/}
          {/*    handleSearch()*/}
          {/*  }}>*/}
          {/*  搜索*/}
          {/*</Button>*/}
        </div>
        <div></div>
      </header>
      <div className="flex-1 bg-white overflow-hidden">
        <div className="h-full relative border">
          <div
            className="custom-scroll-bar shadow-sm overflow-y-auto "
            style={{ height: "calc(100% - 32px)" }}>
            <Table sx={{ minWidth: 650 }} aria-label="simple table" stickyHeader>
              <TableHead sx={{ position: "sticky", top: "0", zIndex: 5 }}>
                <TableRow>
                  {columns.map((col, index) => (
                    <TableCell key={index} sx={{ width: col.key == "action" ? "250px" : "auto" }}>
                      {col.title}
                    </TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {queueList.map((row, index) => (
                  <TableRow key={index}>
                    {/*<TableCell component="th" scope="row"></TableCell>*/}
                    {/*<TableCell align="left"></TableCell>*/}
                    <TableCell align="left">{renderRowCellName(row.file_names)}</TableCell>
                    <TableCell align="left">{renderStatus(row.status)}</TableCell>
                    {/*<TableCell align="left">{}</TableCell>*/}
                    <TableCell align="left">
                      {dateToUTCCustom(row.created_at, "YYYY-MM-DD HH:mm")}
                    </TableCell>
                    <TableCell align="left">{row.exception}</TableCell>
                    <TableCell align="left">
                      {row.status == "done" && (
                        <div className="flex gap-x-2">
                          <Button
                            variant="text"
                            onClick={() => {
                              handleClickDownLoad(row)
                            }}>
                            下载
                          </Button>
                        </div>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      </div>
    </>
  )
}
