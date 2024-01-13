"use client"
import React from "react"
import {
  Alert,
  Button,
  Dialog,
  DialogContent,
  DialogTitle,
  InputBase,
  Menu,
  Snackbar,
} from "@mui/material"
import { CurrentDate, dateToUTCCustom, dateToYYYYMM, intoDoubleFixed3 } from "@/libs/methods"
import "dayjs/locale/zh-cn"
import { useRequest } from "ahooks"
import useSWRMutationHooks from "@/app/gantt/hooks/useSWRMutationHooks"
import { LayoutContext } from "@/components/LayoutContext"
import Table from "@mui/material/Table"
import TableHead from "@mui/material/TableHead"
import TableRow from "@mui/material/TableRow"
import TableCell from "@mui/material/TableCell"
import TableBody from "@mui/material/TableBody"
import {
  GetProjectMaterialRequirementStaticDetailParams,
  ProjectMaterialRequirementStaticDetailListData,
  ProjectMaterialRequirementStaticListData,
} from "@/app/material-demand/types"
import dayjs from "dayjs"
import { QueueList } from "@/app/queue/types"
import useSWRMutation from "swr/mutation"
import { reqGetQueueExportFile } from "@/app/queue/api"
import { message } from "antd"

type Props = {
  open: boolean
  handleCloseDialogAddForm: () => void
}

const columns = [
  {
    title: "物资名称",
    key: "index",
  },
  {
    title: "规格型号",
    key: "name",
  },
  {
    title: "质量标准技术要求",
    key: "质量标准技术要求",
  },
  {
    title: "计量单位",
    key: "计量单位",
  },
  {
    title: "需用数量",
    key: "需用数量",
  },
  {
    title: "计划施工日期",
    key: "计划施工日期",
  },
]

function findConstUnitWithDictionary(str: string) {
  const arr: { key: string; value: string }[] | any = JSON.parse(str || "[]")

  const obj = arr.find((item: any) => item.key == "常用单位")
  return obj ? obj.value : ""
}

function findConstStandardWithDictionary(str: string) {
  const arr: { key: string; value: string }[] | any = JSON.parse(str || "[]")

  const obj = arr.find((item: any) => item.key == "质量标准技术要求")
  return obj ? obj.value : ""
}

export default function DialogMaterialDemandWithCollect(props: Props) {
  const { open, handleCloseDialogAddForm } = props

  const {
    getExportMaterialDemandApi,
    getQueueApi,
    getProjectMaterialRequirementStaticApi,
    getProjectMaterialRequirementStaticDetailApi,
    postProjectMaterialPurchaseApi,
  } = useSWRMutationHooks()

  const { trigger: getQueueExportFileApi } = useSWRMutation(
    "/queue/export/file",
    reqGetQueueExportFile,
  )

  const { projectId: PROJECT_ID } = React.useContext(LayoutContext)

  const [projectMaterialRequirementStaticList, setProjectMaterialRequirementStaticList] =
    React.useState<ProjectMaterialRequirementStaticListData[]>([])

  const [
    projectMaterialRequirementStaticDetailList,
    setProjectMaterialRequirementStaticDetailList,
  ] = React.useState<ProjectMaterialRequirementStaticDetailListData[]>([])

  const getProjectMaterialRequirementStaticList = async () => {
    const res = await getProjectMaterialRequirementStaticApi({ project_id: PROJECT_ID })
    setProjectMaterialRequirementStaticList(res)
  }

  React.useEffect(() => {
    getProjectMaterialRequirementStaticList()
  }, [])

  const getProjectMaterialRequirementStaticDetailListData = async (dictionaryId?: number) => {
    let period = CurrentDate.getYear() + "-" + String(CurrentDate.getMonth()).padStart(2, "0")

    let params: GetProjectMaterialRequirementStaticDetailParams = {
      project_id: PROJECT_ID,
      period,
    }
    if (dictionaryId) {
      params.dictionary_id = dictionaryId
    }
    const res = await getProjectMaterialRequirementStaticDetailApi(params)
    setProjectMaterialRequirementStaticDetailList(res.items)
  }

  const handleCloseDialog = () => {
    handleCloseDialogAddForm()
  }

  const [openSnackbar, setOpenSnackbar] = React.useState(false)

  const handleCloseSnackbar = () => {
    setOpenSnackbar(false)
  }

  const getQueueList = (id: number) => {
    return getQueueApi({ project_id: PROJECT_ID, class: "material_requirement", id })
  }

  const {
    data: dataQueue,
    run: runQueue,
    cancel: cancelQueue,
  } = useRequest<any, any[]>(getQueueList, {
    pollingInterval: 1000,
    manual: true,
    pollingErrorRetryCount: 1,
  })

  React.useEffect(() => {
    console.log(dataQueue)
    if (dataQueue && dataQueue.items[0].status == "done") {
      cancelQueue()
      setOpenSnackbar(true)
    }
  }, [dataQueue])

  const handleExport = async () => {
    const res = await getExportMaterialDemandApi({
      project_id: PROJECT_ID,
      period: `${CurrentDate.getYear()}-${String(CurrentDate.getMonth()).padStart(2, "0")}`,
    })
    setOpenSnackbar(true)
    runQueue(res.id)
  }

  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null)
  const openMenu = Boolean(anchorEl)

  const handleCloseMenu = () => {
    setAnchorEl(null)
    setProjectMaterialRequirementStaticDetailList([])
  }

  const handleClickSumQuantity = (
    event: React.MouseEvent<HTMLDivElement>,
    row: ProjectMaterialRequirementStaticListData,
  ) => {
    setAnchorEl(event.currentTarget)
    getProjectMaterialRequirementStaticDetailListData(row.dictionary_id)
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

  const handleCreatePurchase = async () => {
    const res = await postProjectMaterialPurchaseApi({ project_id: PROJECT_ID })
    console.log(res)
    message.success("采购计划已生成，请到【物资采购计划】中查看")
  }

  return (
    <>
      <Dialog
        onClose={() => {
          handleCloseDialog()
        }}
        open={open}
        sx={{ zIndex: 1700, ".MuiPaper-root": { maxWidth: "none" } }}
        className="custom">
        <DialogTitle>
          {CurrentDate.getYear()}年{CurrentDate.getMonth()}月物资需求计划
        </DialogTitle>
        <div className="px-6 flex justify-between items-center">
          <div>汇总表</div>
          <div>
            <Button
              onClick={() => {
                handleExport()
              }}>
              导出物资需求计划
            </Button>
          </div>
        </div>
        <DialogContent
          sx={{ width: "90vw", height: "80vh", display: "flex", flexDirection: "column" }}>
          <div className="bg-white  custom-scroll-bar shadow-sm overflow-y-auto flex-1">
            <Table sx={{ minWidth: 650 }} aria-label="simple table" stickyHeader>
              <TableHead sx={{ position: "sticky", top: "0", zIndex: 5 }}>
                <TableRow>
                  {columns.map((col, index) => (
                    <TableCell key={index}>{col.title}</TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {projectMaterialRequirementStaticList.map((row, index) => (
                  <TableRow key={index}>
                    <TableCell align="left">{row.dictionary?.dictionary_class?.name}</TableCell>
                    <TableCell align="left">{row.dictionary.name}</TableCell>
                    <TableCell align="left">
                      {findConstStandardWithDictionary(row.dictionary.properties)}
                    </TableCell>
                    <TableCell align="left">
                      {findConstUnitWithDictionary(row.dictionary.properties)}
                    </TableCell>
                    <TableCell align="left">
                      <div
                        className="cursor-pointer text-railway_blue"
                        onClick={(event) => {
                          handleClickSumQuantity(event, row)
                        }}>
                        {intoDoubleFixed3(row.sum_quantity / 1000)}
                      </div>
                    </TableCell>
                    <TableCell align="left">
                      {dateToUTCCustom(row.planned_usage_at, "YYYY-MM-DD")}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          <div className="flex justify-end gap-x-2 h-10">
            <Button
              variant="contained"
              onClick={() => {
                handleCreatePurchase()
              }}>
              生成采购计划
            </Button>
          </div>
          <Snackbar
            sx={{ zIndex: 1720 }}
            anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
            open={openSnackbar}
            onClose={handleCloseSnackbar}>
            {dataQueue && dataQueue.items[0].status == "done" ? (
              <Alert severity="success" onClose={handleCloseSnackbar}>
                导出成功
                <a
                  className="ml-2 cursor-pointer"
                  onClick={(event) => {
                    event.preventDefault()
                    handleClickDownLoad(dataQueue.items[0])
                  }}>
                  下载
                </a>
              </Alert>
            ) : (
              <Alert severity="info" onClose={handleCloseSnackbar}>
                导出中
              </Alert>
            )}
          </Snackbar>

          <Menu
            sx={{ zIndex: 1700 }}
            anchorEl={anchorEl}
            open={openMenu}
            onClose={handleCloseMenu}
            MenuListProps={{
              "aria-labelledby": "basic-button",
              sx: { zIndex: 1700, width: "700px" },
            }}>
            <div className="max-h-[500px] overflow-y-auto w-full">
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell align="center" className="font-bold">
                      单位工程名称
                    </TableCell>
                    <TableCell align="center" className="font-bold">
                      工点数据名称
                    </TableCell>
                    <TableCell align="center" className="font-bold">
                      工程部位
                    </TableCell>
                    <TableCell align="center" className="font-bold">
                      设计数量
                    </TableCell>
                    <TableCell align="center" className="font-bold">
                      计量单位
                    </TableCell>
                    <TableCell align="center" className="font-bold">
                      损耗系数(%)
                    </TableCell>
                    <TableCell align="center" className="font-bold">
                      需用数量
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {projectMaterialRequirementStaticDetailList.map((row, index) => (
                    <TableRow key={index}>
                      <TableCell align="center">{row.sp_name}</TableCell>
                      <TableCell align="center">{row.si_name}</TableCell>
                      <TableCell align="center">{row.ebs_desc}</TableCell>
                      <TableCell align="center">
                        {intoDoubleFixed3(row.design_usage / 1000)}
                      </TableCell>
                      <TableCell align="center">
                        {findConstUnitWithDictionary(row.dictionary.properties)}
                      </TableCell>
                      <TableCell align="center">{row.loss_coefficient}</TableCell>
                      <TableCell align="center">
                        {intoDoubleFixed3(row.actual_usage / 1000)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </Menu>
        </DialogContent>
      </Dialog>
    </>
  )
}
