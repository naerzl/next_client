"use client"
import React from "react"
import { Breadcrumbs, Button, Chip, Pagination, MenuItem, Select, InputBase } from "@mui/material"
import Link from "@mui/material/Link"
import Typography from "@mui/material/Typography"
import TableHead from "@mui/material/TableHead"
import TableRow from "@mui/material/TableRow"
import TableCell from "@mui/material/TableCell"
import TableBody from "@mui/material/TableBody"
import Table from "@mui/material/Table"
import Loading from "@/components/loading"
import useSWRMutation from "swr/mutation"
import { LayoutContext } from "@/components/LayoutContext"
import { BaseApiPager } from "@/types/api"
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline"
import EditOutlinedIcon from "@mui/icons-material/EditOutlined"
import {
  GetMaterialProcurementPlanParams,
  MaterialProcurementPlanData,
  PlanStatus,
} from "@/app/material-procurement-plan/types"
import { reqGetMaterialProcurementPlan } from "@/app/material-procurement-plan/api"
import STATUS_ENUM from "@/app/material-procurement-plan/const"
import { dateToUTCCustom } from "@/libs/methods"
import useAddOrEditMaterialProcurementPlan from "@/app/material-procurement-plan/hooks/useAddOrEditMaterialProcurementPlan"
import AddOrEditProcurementPlan from "@/app/material-procurement-plan/components/AddOrEditProcurementPlan"
import useSWRMutationHooks from "@/app/gantt/hooks/useSWRMutationHooks"
import SearchOutlinedIcon from "@mui/icons-material/SearchOutlined"

function renderStatus(label: PlanStatus): React.ReactNode {
  switch (label) {
    case "pending_application":
      return <Chip label="待申请" color="default" />
    case "application_in_progress":
      return <Chip label="申请中" color="primary" />
    case "procurement_in_progress":
      return <Chip label="采购中" color="primary" />
    case "procurement_completed":
      return <Chip label="采购完成" color="success" />
    case "rejected":
      return <Chip label="已驳回" color="error" />
    default:
      return <span></span>
  }
}
const columns = [
  {
    title: "创建时间",
    dataIndex: "time",
    key: "time",
  },
  {
    title: "申请表名称",
    dataIndex: "name",
    key: "name",
  },
  {
    title: "日期",
    dataIndex: "ebs_name",
    key: "ebs_name",
  },
  {
    title: "申请人",
    dataIndex: "class",
    key: "class",
  },
  {
    title: "状态",
    dataIndex: "class",
    key: "class",
  },
  {
    title: "操作",
    key: "action",
  },
]
export default function MaterialProcurementPlanPage() {
  const { projectId: PROJECT_ID, permissionTagList } = React.useContext(LayoutContext)

  // 表格配置列

  // const { showConfirmationDialog } = useConfirmationDialog()

  const {
    open,
    handleOpenDialogWithEdit,
    handleOpenDialogWithAdd,
    handleCloseDialog,
    procurementPlanItem,
  } = useAddOrEditMaterialProcurementPlan()

  const [swrState, setSWRState] = React.useState<GetMaterialProcurementPlanParams | any>({
    page: 1,
    limit: 10,
    project_id: PROJECT_ID,
  })

  const { trigger: getMaterialProcurementPlanApi, isMutating } = useSWRMutation(
    "/project-material-purchase",
    reqGetMaterialProcurementPlan,
  )

  const [MaterialProcurementPlan, setMaterialProcurementPlan] = React.useState<
    MaterialProcurementPlanData[]
  >([])

  const [pager, setPager] = React.useState<BaseApiPager>({} as BaseApiPager)

  const getDataList = async () => {
    let params = {} as GetMaterialProcurementPlanParams
    for (let swrStateKey in swrState) {
      // @ts-ignore
      if (swrState[swrStateKey] && swrState[swrStateKey] != "null") {
        // @ts-ignore
        params[swrStateKey] = swrState[swrStateKey]
      }
    }
    const res = await getMaterialProcurementPlanApi(params)
    setMaterialProcurementPlan(res.items)
    console.log(res.items)
    setPager(res.pager)
  }

  React.useEffect(() => {
    getDataList()
  }, [])

  const handlePaginationChange = async (val: any, type: keyof GetMaterialProcurementPlanParams) => {
    let params = {} as GetMaterialProcurementPlanParams
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
    const res = await getMaterialProcurementPlanApi(params)
    setMaterialProcurementPlan(res.items)
    setPager(res.pager)
  }

  const handleDialogCallBack = async () => {
    getDataList()
  }

  //   if (!permissionTagList.includes(permissionJson.material_approach_member_read)) {
  //     return <NoPermission />
  //   }

  return (
    <>
      <h3 className="font-bold text-[1.875rem]">物资采购计划</h3>
      <div className="mb-9 mt-7">
        <Breadcrumbs aria-label="breadcrumb" separator=">">
          <Link underline="hover" color="inherit" href="/dashboard">
            <i className="iconfont icon-homefill" style={{ fontSize: "14px" }}></i>
          </Link>
          <Typography color="text.primary" sx={{ fontSize: "14px" }}>
            物资采购计划
          </Typography>
        </Breadcrumbs>
      </div>
      <header className="flex justify-between mb-4">
        <div className="flex gap-x-2"></div>
      </header>
      {isMutating ? (
        <Loading />
      ) : (
        <div className="flex-1 overflow-hidden">
          <div className="h-full relative border">
            <div
              className="bg-white  custom-scroll-bar shadow-sm overflow-y-auto "
              style={{ height: "calc(100% - 32px)" }}>
              <Table sx={{ minWidth: 650 }} aria-label="simple table" stickyHeader>
                <TableHead sx={{ position: "sticky", top: "0", zIndex: 5 }}>
                  <TableRow>
                    {columns.map((col, index) => (
                      <TableCell align="center" key={index}>
                        {col.title}
                      </TableCell>
                    ))}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {MaterialProcurementPlan.map((row) => (
                    <TableRow key={row.id}>
                      <TableCell align="center">
                        {dateToUTCCustom(row.created_at, "YYYY-MM-DD")}
                      </TableCell>
                      <TableCell align="center">{row.name}</TableCell>
                      <TableCell align="center">{row.period}</TableCell>
                      <TableCell align="center">{row.creator}</TableCell>
                      <TableCell align="center">{renderStatus(row.status)}</TableCell>
                      <TableCell align="center">
                        <div className="flex justify-center gap-x-2">
                          {(row.status == "pending_application" ||
                            row.status == "application_in_progress") && (
                            <Button
                              variant="outlined"
                              onClick={() => {
                                handleOpenDialogWithEdit(row)
                              }}
                              startIcon={<EditOutlinedIcon />}>
                              编辑
                            </Button>
                          )}

                          {row.status != "pending_application" && (
                            <Button
                              variant="outlined"
                              color="success"
                              onClick={() => {
                                handleOpenDialogWithEdit(row)
                              }}
                              startIcon={<SearchOutlinedIcon />}>
                              查看
                            </Button>
                          )}
                        </div>
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
      )}
      {open && (
        <AddOrEditProcurementPlan
          open={open}
          handleCloseDialogAddForm={handleCloseDialog}
          item={procurementPlanItem}
          cb={handleDialogCallBack}
        />
      )}
    </>
  )
}
