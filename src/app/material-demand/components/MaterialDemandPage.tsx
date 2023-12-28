"use client"
import React from "react"
import { Breadcrumbs, Button, Pagination } from "@mui/material"
import Link from "@mui/material/Link"
import Typography from "@mui/material/Typography"
import TableHead from "@mui/material/TableHead"
import TableRow from "@mui/material/TableRow"
import TableCell from "@mui/material/TableCell"
import TableBody from "@mui/material/TableBody"
import Table from "@mui/material/Table"
import Loading from "@/components/loading"
import useSWRMutation from "swr/mutation"
import { useConfirmationDialog } from "@/components/ConfirmationDialogProvider"
import { message } from "antd"
import { LayoutContext } from "@/components/LayoutContext"
import permissionJson from "@/config/permission.json"
import NoPermission from "@/components/NoPermission"
import { DatePicker } from "antd"
import locale from "antd/es/date-picker/locale/zh_CN"
import { BaseApiPager } from "@/types/api"
import MaterialExport from "@/app/components/MaterialExport"
import useMaterialExport from "@/hooks/useMaterialExport"
import ExportForm from "@/app/material-approach/components/ExportForm"
import { GetMaterialDemandParams, MaterialDemandListData } from "@/app/material-demand/types"
import { reqDelMaterialDemand, reqGetMaterialDemand } from "@/app/material-demand/api"

export default function MaterialDemandPage() {
  const { projectId: PROJECT_ID, permissionTagList } = React.useContext(LayoutContext)

  // 表格配置列
  const columns = [
    {
      title: "单位工程名称",
      dataIndex: "id",
      key: "id",
    },
    {
      title: "工点名称",
      dataIndex: "name",
      key: "name",
    },
    {
      title: "月份",
      dataIndex: "ebs_name",
      key: "ebs_name",
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

  const { showConfirmationDialog } = useConfirmationDialog()

  const [swrState, setSWRState] = React.useState<GetMaterialDemandParams>({
    page: 1,
    limit: 10,
    project_id: PROJECT_ID,
  })

  const { trigger: getMaterialDemandApi, isMutating } = useSWRMutation(
    "/project-material-requirement",
    reqGetMaterialDemand,
    // fetcher,
  )

  const { trigger: delMaterialDemandApi } = useSWRMutation(
    "/project-material-requirement",
    reqDelMaterialDemand,
  )

  const [materialDemandList, setMaterialDemandList] = React.useState<MaterialDemandListData[]>([])
  const [pager, setPager] = React.useState<BaseApiPager>({} as BaseApiPager)

  const getDataList = async () => {
    let params = {} as GetMaterialDemandParams
    for (let swrStateKey in swrState) {
      // @ts-ignore
      if (swrState[swrStateKey] && swrState[swrStateKey] != "null") {
        // @ts-ignore
        params[swrStateKey] = swrState[swrStateKey]
      }
    }

    const res = await getMaterialDemandApi(params)

    setMaterialDemandList(res.items)
    setPager(res.pager)
  }

  React.useEffect(() => {
    getDataList()
  }, [])

  const handleChangeSearchOption = (value: string, type: keyof GetMaterialDemandParams) => {
    setSWRState((prevState) => ({ ...prevState, [type]: value }))
  }

  const handleSearchMaterialApproachList = async () => {
    let params = {} as GetMaterialDemandParams
    for (let swrStateKey in swrState) {
      // @ts-ignore
      if (swrState[swrStateKey] && swrState[swrStateKey] != "null") {
        // @ts-ignore
        params[swrStateKey] = swrState[swrStateKey]
      }
    }

    const res = await getMaterialDemandApi(params)

    setMaterialDemandList(res.items)
    setPager(res.pager)
  }

  const handlePaginationChange = async (val: any, type: keyof GetMaterialDemandParams) => {
    let params = {} as GetMaterialDemandParams
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
    const res = await getMaterialDemandApi(params)

    setMaterialDemandList(res.items)
    setPager(res.pager)
  }

  // 删除物资进场数据
  const handleDelMaterialApproach = (id: number) => {
    showConfirmationDialog("确认要删除吗？", async () => {
      await delMaterialDemandApi({ id, project_id: PROJECT_ID })
      message.success("操作成功")
      setMaterialDemandList((prevState) => prevState.filter((e) => e.id != id))
    })
  }

  const { exportOpen, handleExportOpen, handleExportClose } = useMaterialExport()

  if (!permissionTagList.includes(permissionJson.material_approach_member_read)) {
    return <NoPermission />
  }

  return (
    <>
      <h3 className="font-bold text-[1.875rem]">物资需求计划</h3>
      <div className="mb-9 mt-7">
        <Breadcrumbs aria-label="breadcrumb" separator=">">
          <Link underline="hover" color="inherit" href="/dashboard">
            <i className="iconfont icon-homefill" style={{ fontSize: "14px" }}></i>
          </Link>
          <Typography color="text.primary" sx={{ fontSize: "14px" }}>
            物资需求计划
          </Typography>
        </Breadcrumbs>
      </div>
      <header className="flex justify-between mb-4">
        <div className="flex gap-x-2">
          <DatePicker.RangePicker
            onChange={(_, dateString) => {
              let str = dateString.join(",")
              handleChangeSearchOption(str, "period")
            }}
            locale={locale}
          />

          <Button
            className="bg-railway_blue text-white"
            onClick={() => {
              handleSearchMaterialApproachList()
            }}>
            搜索
          </Button>
        </div>
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
                      <TableCell key={index}>{col.title}</TableCell>
                    ))}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {materialDemandList.map((row) => (
                    <TableRow key={row.id}>
                      <TableCell component="th" scope="row"></TableCell>
                      <TableCell align="left"></TableCell>
                      <TableCell align="left"></TableCell>
                      <TableCell align="left"></TableCell>
                      <TableCell align="left">
                        <div className="flex justify-center gap-x-2">
                          <Button onClick={() => {}}>查看</Button>
                          <Button color="primary" onClick={() => {}}>
                            下载
                          </Button>
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

      {exportOpen && (
        <MaterialExport open={exportOpen} handleClose={handleExportClose}>
          <ExportForm handleClose={handleExportClose} />
        </MaterialExport>
      )}
    </>
  )
}
