"use client"
import React from "react"
import { Breadcrumbs, Chip, Pagination } from "@mui/material"
import Link from "@mui/material/Link"
import Typography from "@mui/material/Typography"
import TableHead from "@mui/material/TableHead"
import TableRow from "@mui/material/TableRow"
import TableCell from "@mui/material/TableCell"
import TableBody from "@mui/material/TableBody"
import Table from "@mui/material/Table"
import AddOrEditMaterial from "@/app/material-approach/components/AddOrEditMaterial"
import { useAddOrEditMaterial } from "@/app/material-approach/hooks/useAddOrEditMaterial"
import { GetMaterialApproachParams, MaterialApproachData } from "@/app/material-approach/types"
import { reqDelMaterialApproach, reqGetMaterialApproach } from "@/app/material-approach/api"
import Loading from "@/components/loading"
import { CLASS_OPTION } from "@/app/material-approach/const/enum"
import useSWRMutation from "swr/mutation"
import { dateToYYYYMM } from "@/libs/methods"
import { useConfirmationDialog } from "@/components/ConfirmationDialogProvider"
import { message } from "antd"
import { LayoutContext } from "@/components/LayoutContext"
import dayjs from "dayjs"
import permissionJson from "@/config/permission.json"
import NoPermission from "@/components/NoPermission"
import { BaseApiPager } from "@/types/api"
import MaterialExport from "@/app/components/MaterialExport"
import useMaterialExport from "@/hooks/useMaterialExport"
import ExitToAppIcon from "@mui/icons-material/ExitToApp"
import ExportForm from "@/app/material-approach/components/ExportForm"

function renderStatus(label: string): React.ReactNode {
  switch (label) {
    case "unqualified":
      return <Chip label="不合格" color="error" />
    case "entered":
      return <Chip label="已入场" color="primary" />
    case "inspected":
      return <Chip label="已经报验" color="warning" />
    case "qualified":
      return <Chip label="检验合格" color="success" />
    default:
      return <span></span>
  }
}

function renderProperty(str: string) {
  const arr: { key: string; value: string }[] | any = JSON.parse(str || "[]")

  if (arr instanceof Array) {
    return arr.map((item, index) => {
      return (
        <div key={index}>
          <span>
            {item.key}： {item.value}
          </span>
        </div>
      )
    })
  } else {
    return <></>
  }
}

function renderQuantity(item: MaterialApproachData) {
  const obj = CLASS_OPTION.find((el) => el.value == item.class)

  return obj
    ? parseFloat((item.arrivaled_quantity / 1000).toFixed(3)) + obj.unit
    : parseFloat((item.arrivaled_quantity / 1000).toFixed(3))
}
export default function MaterialApproachPage() {
  const { projectId: PROJECT_ID, permissionTagList } = React.useContext(LayoutContext)

  // 表格配置列
  const columns = [
    {
      title: "到货日期",
      dataIndex: "id",
      key: "id",
    },
    {
      title: "物资名称",
      dataIndex: "name",
      key: "name",
    },
    {
      title: "规格型号",
      dataIndex: "ebs_name",
      key: "ebs_name",
    },
    {
      title: "物资类型",
      dataIndex: "class",
      key: "class",
    },
    {
      title: "到货数量",
      dataIndex: "start_tally",
      key: "start_tally",
    },

    {
      title: "生产厂家",
      dataIndex: "end_tally",
      key: "end_tally",
    },
    {
      title: "处理结果",
      dataIndex: "parent_name",
      key: "parent_name",
    },
    {
      title: "记录时间",
      dataIndex: "parent_name",
      key: "parent_name",
    },
    {
      title: "记录者",
      dataIndex: "parent_name",
      key: "parent_name",
    },
    {
      title: "操作",
      key: "action",
    },
  ]

  const {
    drawerOpen,
    editItem,
    handleCloseMaterialWithDrawer,
    handleEditMaterial,
    handleAddMaterial,
  } = useAddOrEditMaterial()

  const { showConfirmationDialog } = useConfirmationDialog()

  const [swrState, setSWRState] = React.useState<GetMaterialApproachParams>({
    page: 1,
    limit: 10,
    project_id: PROJECT_ID,
  })

  const { trigger: getMaterialApproach, isMutating } = useSWRMutation(
    "/material-approach",
    reqGetMaterialApproach,
    // fetcher,
  )

  const { trigger: delMaterialApproach } = useSWRMutation(
    "/material-approach",
    reqDelMaterialApproach,
  )

  const [materialApproachList, setMaterialApproachList] = React.useState<MaterialApproachData[]>([])
  const [pager, setPager] = React.useState<BaseApiPager>({} as BaseApiPager)

  const getDataList = async () => {
    let params = {} as GetMaterialApproachParams
    for (let swrStateKey in swrState) {
      // @ts-ignore
      if (swrState[swrStateKey] && swrState[swrStateKey] != "null") {
        // @ts-ignore
        params[swrStateKey] = swrState[swrStateKey]
      }
    }

    const res = await getMaterialApproach(params)
    const newArr = res.items.sort(
      (a, b) => dayjs(b.arrivaled_at).unix() - dayjs(a.arrivaled_at).unix(),
    )
    setMaterialApproachList(newArr)
    setPager(res.pager)
  }

  React.useEffect(() => {
    getDataList()
  }, [])

  const handleChangeSearchOption = (value: string, type: keyof GetMaterialApproachParams) => {
    setSWRState((prevState) => ({ ...prevState, [type]: value }))
  }

  const handleSearchMaterialApproachList = async () => {
    let params = {} as GetMaterialApproachParams
    for (let swrStateKey in swrState) {
      // @ts-ignore
      if (swrState[swrStateKey] && swrState[swrStateKey] != "null") {
        // @ts-ignore
        params[swrStateKey] = swrState[swrStateKey]
      }
    }

    const res = await getMaterialApproach(params)
    const newArr = res.items.sort(
      (a, b) => dayjs(b.arrivaled_at).unix() - dayjs(a.arrivaled_at).unix(),
    )
    setMaterialApproachList(newArr)
    setPager(res.pager)
  }

  const handlePaginationChange = async (val: any, type: keyof GetMaterialApproachParams) => {
    let params = {} as GetMaterialApproachParams
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
    const res = await getMaterialApproach(params)
    const newArr = res.items.sort(
      (a, b) => dayjs(b.arrivaled_at).unix() - dayjs(a.arrivaled_at).unix(),
    )
    setMaterialApproachList(newArr)
    setPager(res.pager)
  }

  // 删除物资进场数据
  const handleDelMaterialApproach = (id: number) => {
    showConfirmationDialog("确认要删除吗？", async () => {
      await delMaterialApproach({ id, project_id: PROJECT_ID })
      message.success("操作成功")
      setMaterialApproachList((prevState) => prevState.filter((e) => e.id != id))
    })
  }

  const handleEditMaterialApproach = (materialData: MaterialApproachData) => {
    handleEditMaterial(materialData)
  }
  const { exportOpen, handleExportOpen, handleExportClose } = useMaterialExport()

  if (!permissionTagList.includes(permissionJson.material_approach_member_read)) {
    return <NoPermission />
  }

  return (
    <>
      <h3 className="font-bold text-[1.875rem]">物资进场</h3>
      <div className="mb-9 mt-7">
        <Breadcrumbs aria-label="breadcrumb" separator=">">
          <Link underline="hover" color="inherit" href="/dashboard">
            <i className="iconfont icon-homefill" style={{ fontSize: "14px" }}></i>
          </Link>
          <Typography color="text.primary" sx={{ fontSize: "14px" }}>
            物资进场
          </Typography>
        </Breadcrumbs>
      </div>
      <header className="flex justify-between mb-4">
        <div className="flex gap-x-2">
          {/*<InputBase*/}
          {/*  className="w-[12rem] h-10 border  px-2 shadow bg-white"*/}
          {/*  placeholder="请输入物资名称"*/}
          {/*  value={swrState.name}*/}
          {/*  onChange={(event) => {*/}
          {/*    handleChangeSearchOption(event.target.value, "name")*/}
          {/*  }}*/}
          {/*/>*/}

          {/*<InputBase*/}
          {/*  className="w-[12rem] h-10 border  px-2 shadow bg-white"*/}
          {/*  placeholder="请输入生产厂家"*/}
          {/*  value={swrState.manufacturer}*/}
          {/*  onChange={(event) => {*/}
          {/*    handleChangeSearchOption(event.target.value, "manufacturer")*/}
          {/*  }}*/}
          {/*/>*/}

          {/*<Select*/}
          {/*  labelId="demo-simple-select-label"*/}
          {/*  id="demo-simple-select"*/}
          {/*  size="small"*/}
          {/*  placeholder="请选择一个状态"*/}
          {/*  value={swrState.status}*/}
          {/*  onChange={(event) => {*/}
          {/*    handleChangeSearchOption(event.target.value, "status")*/}
          {/*  }}*/}
          {/*  className="w-[12rem] bg-white shadow">*/}
          {/*  <MenuItem value="null" disabled>*/}
          {/*    <i className="text-[#ababab]">请选择一个状态</i>*/}
          {/*  </MenuItem>*/}
          {/*  {PROCESSING_RESULT.map((item: any) => (*/}
          {/*    <MenuItem value={item.value} key={item.value}>*/}
          {/*      {item.label}*/}
          {/*    </MenuItem>*/}
          {/*  ))}*/}
          {/*</Select>*/}

          {/*<DatePicker.RangePicker*/}
          {/*  onChange={(_, dateString) => {*/}
          {/*    // console.log(dateString)*/}
          {/*    let str = dateString.join(",")*/}
          {/*    handleChangeSearchOption(str, "created_between")*/}
          {/*  }}*/}
          {/*  locale={locale}*/}
          {/*/>*/}

          {/*<InputBase*/}
          {/*  className="w-[12rem] h-10 border  px-2 shadow bg-white"*/}
          {/*  placeholder="请输入记录员"*/}
          {/*  value={swrState.creator}*/}
          {/*  onChange={(event) => {*/}
          {/*    handleChangeSearchOption(event.target.value, "creator")*/}
          {/*  }}*/}
          {/*/>*/}
          {/*<Button*/}
          {/*  className="bg-railway_blue text-white"*/}
          {/*  onClick={() => {*/}
          {/*    handleSearchMaterialApproachList()*/}
          {/*  }}>*/}
          {/*  搜索*/}
          {/*</Button>*/}
        </div>
        <div>
          {/*<Button*/}
          {/*  style={displayWithPermission(*/}
          {/*    permissionTagList,*/}
          {/*    permissionJson.material_approach_member_write,*/}
          {/*  )}*/}
          {/*  className="bg-railway_blue text-white"*/}
          {/*  onClick={() => {*/}
          {/*    handleAddMaterial()*/}
          {/*  }}>*/}
          {/*  添加*/}
          {/*</Button>*/}
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
                      <TableCell key={index} sx={{ width: col.key == "action" ? "210px" : "auto" }}>
                        {col.title}
                      </TableCell>
                    ))}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {materialApproachList.map((row) => (
                    <TableRow key={row.id}>
                      <TableCell component="th" scope="row">
                        {dateToYYYYMM(row.arrivaled_at)}
                      </TableCell>
                      <TableCell align="left">{row.dictionary?.name}</TableCell>
                      <TableCell align="left">
                        {renderProperty(row.dictionary?.properties ?? "[]")}
                      </TableCell>
                      <TableCell align="left">
                        {CLASS_OPTION.find((item) => item.value == row.class)?.label}
                      </TableCell>
                      <TableCell align="left">{renderQuantity(row)}</TableCell>
                      <TableCell align="left">{row.manufacturer}</TableCell>
                      <TableCell align="left">{renderStatus(row.status)}</TableCell>
                      <TableCell align="left">{dateToYYYYMM(row.created_at)}</TableCell>
                      <TableCell align="left">{row.creator}</TableCell>
                      <TableCell align="left">
                        <div className="flex justify-between">
                          {/*<Button*/}
                          {/*  variant="outlined"*/}
                          {/*  onClick={() => {*/}
                          {/*    handleExportOpen()*/}
                          {/*  }}*/}
                          {/*  startIcon={<ExitToAppIcon />}>*/}
                          {/*  导出*/}
                          {/*</Button>*/}
                          {/*<Button*/}
                          {/*  style={displayWithPermission(*/}
                          {/*    permissionTagList,*/}
                          {/*    permissionJson.material_approach_member_update,*/}
                          {/*  )}*/}
                          {/*  variant="outlined"*/}
                          {/*  onClick={() => {*/}
                          {/*    handleEditMaterialApproach(row)*/}
                          {/*  }}*/}
                          {/*  startIcon={<EditOutlinedIcon />}>*/}
                          {/*  编辑*/}
                          {/*</Button>*/}
                          {/*<Button*/}
                          {/*  style={displayWithPermission(*/}
                          {/*    permissionTagList,*/}
                          {/*    permissionJson.material_approach_member_delete,*/}
                          {/*  )}*/}
                          {/*  variant="outlined"*/}
                          {/*  color="error"*/}
                          {/*  onClick={() => {*/}
                          {/*    handleDelMaterialApproach(row.id)*/}
                          {/*  }}*/}
                          {/*  startIcon={<DeleteOutlineIcon />}>*/}
                          {/*  删除*/}
                          {/*</Button>*/}
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

      {drawerOpen && (
        <AddOrEditMaterial
          open={drawerOpen}
          close={handleCloseMaterialWithDrawer}
          editItem={editItem}
          getDataList={getDataList}
        />
      )}

      {exportOpen && (
        <MaterialExport open={exportOpen} handleClose={handleExportClose}>
          <ExportForm handleClose={handleExportClose} />
        </MaterialExport>
      )}
    </>
  )
}
