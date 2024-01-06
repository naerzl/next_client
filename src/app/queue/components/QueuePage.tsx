"use client"
import React from "react"
import {
  Breadcrumbs,
  Button,
  Chip,
  InputBase,
  MenuItem,
  Pagination,
  Select,
  Table,
  TableHead,
} from "@mui/material"
import Link from "@mui/material/Link"
import Typography from "@mui/material/Typography"
import { LayoutContext } from "@/components/LayoutContext"
import useSWRMutation from "swr/mutation"
import { reqGetQueue, reqGetQueueExportFile } from "@/app/queue/api"
import TableCell from "@mui/material/TableCell"
import TableRow from "@mui/material/TableRow"
import TableBody from "@mui/material/TableBody"
import { dateToUTCCustom } from "@/libs/methods"
import { CLASS_ENUM, STATUS_ENUM } from "@/app/queue/const"
import { GetQueueParams, QueueList } from "@/app/queue/types"
import { BaseApiPager } from "@/types/api"

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
  const { projectId: PROJECT_ID } = React.useContext(LayoutContext)

  const { trigger: getQueueApi } = useSWRMutation("/queue", reqGetQueue)
  const { trigger: getQueueExportFileApi } = useSWRMutation(
    "/queue/export/file",
    reqGetQueueExportFile,
  )

  const [queueList, setQueueList] = React.useState<QueueList[]>([])
  const [pager, setPager] = React.useState<BaseApiPager>({} as BaseApiPager)

  const [swrState, setSWRState] = React.useState<GetQueueParams>({
    page: 1,
    limit: 10,
    project_id: PROJECT_ID,
    class: "inspection_lot",
  })

  const getQueueList = async () => {
    const res = await getQueueApi(swrState)
    setQueueList(res.items)
    setPager(res.pager)
  }

  React.useEffect(() => {
    getQueueList()
  }, [swrState])

  const handleSearch = async () => {
    let params = structuredClone(swrState)
    params.page = 1
    setSWRState(params)
    const res = await getQueueApi(swrState)
    setQueueList(res.items)
    setPager(res.pager)
  }

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
      a.href = fileUrlArr[index].replace("http", "https") as string
      a.click()
    }

    a.remove()
  }

  const handlePaginationChange = async (val: any, type: keyof GetQueueParams) => {
    let params = {} as GetQueueParams
    for (let swrStateKey in swrState) {
      // @ts-ignore
      if (swrState[swrStateKey] && swrState[swrStateKey] != "null") {
        // @ts-ignore
        params[swrStateKey] = swrState[swrStateKey]
      }
    }
    if (type == "limit") {
      params.page = 1
    }
    // @ts-ignore
    params[type] = val
    setSWRState(params)
    const res = await getQueueApi(params)

    setQueueList(res.items)
    setPager(res.pager)
  }

  const handleChangeSearchValue = (type: keyof GetQueueParams, value: string) => {
    const params = structuredClone(swrState)
    if (value == "all") {
      if (type == "status") {
        delete params.status
      } else if (type == "class") {
        delete params.class
      }
    } else {
      // @ts-ignore
      params[type] = value
    }
    setSWRState(params)
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
          <Select
            sx={{ width: 150 }}
            id="status"
            size="small"
            placeholder="请选择导出状态"
            value={swrState.status ?? "all"}
            fullWidth
            onChange={(event) => {
              handleChangeSearchValue("status", event.target.value)
            }}
            defaultValue="">
            <MenuItem value={"all"}>全部</MenuItem>
            {STATUS_ENUM.map((item) => (
              <MenuItem value={item.value} key={item.value}>
                {item.label}
              </MenuItem>
            ))}
          </Select>
          <Select
            sx={{ width: 150 }}
            id="status"
            size="small"
            placeholder="请选择导出类型"
            fullWidth
            value={swrState.class ?? "all"}
            onChange={(event) => {
              handleChangeSearchValue("class", event.target.value)
            }}
            defaultValue="">
            <MenuItem value={"all"}>全部</MenuItem>
            {CLASS_ENUM.map((item) => (
              <MenuItem value={item.value} key={item.value}>
                {item.label}
              </MenuItem>
            ))}
          </Select>
          <Button
            className="bg-railway_blue text-white"
            onClick={() => {
              handleSearch()
            }}>
            搜索
          </Button>
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
          <div className="absolute bottom-0 w-full flex justify-center items-center gap-x-2 bg-white border-t">
            <span>共{pager.count}条</span>
            <select
              value={swrState.limit}
              className="border"
              onChange={(event) => {
                handlePaginationChange(event.target.value, "limit")
              }}>
              <option value={10}>10条/页</option>
              <option value={20}>20条/页</option>
              <option value={50}>50条/页</option>
            </select>
            <Pagination
              page={swrState.page}
              count={pager.count ? Math.ceil(pager.count / pager.limit) : 1}
              variant="outlined"
              shape="rounded"
              onChange={(event, page) => {
                handlePaginationChange(page, "page")
              }}
            />
          </div>
        </div>
      </div>
    </>
  )
}
