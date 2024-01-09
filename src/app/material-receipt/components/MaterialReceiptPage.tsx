"use client"
import React from "react"
import { Breadcrumbs, Button, Pagination } from "@mui/material"
import Link from "@mui/material/Link"
import Typography from "@mui/material/Typography"
import Loading from "@/components/loading"
import Table from "@mui/material/Table"
import TableHead from "@mui/material/TableHead"
import TableRow from "@mui/material/TableRow"
import TableCell from "@mui/material/TableCell"
import TableBody from "@mui/material/TableBody"
import { dateToYYYYMM, displayWithPermission, intoDoubleFixed3 } from "@/libs/methods"
import EditOutlinedIcon from "@mui/icons-material/EditOutlined"
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline"
import { useAddOrEditMaterial } from "@/app/material-receipt/hooks/useAddOrEditMaterial"
import { useConfirmationDialog } from "@/components/ConfirmationDialogProvider"
import useSWRMutation from "swr/mutation"
import { reqGetMaterialReceive, reqDelMaterialReceive } from "@/app/material-receipt/api"
import { message } from "antd"
import { GetMaterialReceiveParams, MaterialReceiveData } from "@/app/material-receipt/types"
import AddOrEditMaterial from "@/app/material-receipt/components/AddOrEditMaterial"
import { LayoutContext } from "@/components/LayoutContext"
import permissionJson from "@/config/permission.json"
import NoPermission from "@/components/NoPermission"
import { BaseApiPager } from "@/types/api"
import { GetMaterialProcessingParams } from "@/app/material-processing/types"
import dayjs from "dayjs"
import MaterialExport from "@/app/components/MaterialExport"
import ExportForm from "@/app/material-receipt/components/ExportForm"
import useMaterialExport from "@/hooks/useMaterialExport"
import ExitToAppIcon from "@mui/icons-material/ExitToApp"

function findTestName(row: MaterialReceiveData) {
  if (row.machine) {
    return row.machine.name
  }

  if (row.material) {
    return row.material.dictionary ? row.material.dictionary.name : ""
  }
}

function renderProperty(str: string) {
  const arr: { key: string; value: string }[] | any = JSON.parse(str || "{}")

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

// 表格配置列
const columns = [
  {
    title: "领用时间",
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
    title: "领用部位",
    dataIndex: "ebs_desc",
    key: "ebs_desc",
  },
  {
    title: "领用数量",
    dataIndex: "start_tally",
    key: "start_tally",
  },

  {
    title: "施工队",
    dataIndex: "end_tally",
    key: "end_tally",
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
export default function MaterialReceiptPage() {
  const { projectId: PROJECT_ID, permissionTagList } = React.useContext(LayoutContext)

  const {
    drawerOpen,
    editItem,
    handleCloseMaterialWithDrawer,
    handleEditMaterial,
    handleAddMaterial,
  } = useAddOrEditMaterial()

  const { showConfirmationDialog } = useConfirmationDialog()

  const [swrState, setSWRState] = React.useState<GetMaterialReceiveParams>({
    page: 1,
    limit: 10,
    project_id: PROJECT_ID,
  })

  const { trigger: getMaterialReceive, isMutating } = useSWRMutation(
    "/material-receive",
    reqGetMaterialReceive,
  )

  const { trigger: delMaterialReceive } = useSWRMutation("/material-receive", reqDelMaterialReceive)

  const [materialApproachList, setMaterialApproachList] = React.useState<MaterialReceiveData[]>([])

  const [pager, setPager] = React.useState<BaseApiPager>({} as BaseApiPager)

  const getDataList = async () => {
    const res = await getMaterialReceive(swrState)
    setMaterialApproachList(res.items)
    setPager(res.pager)
  }

  React.useEffect(() => {
    getDataList()
  }, [])

  // 删除物资进场数据
  const handleDelMaterialApproach = (id: number) => {
    showConfirmationDialog("确认要删除吗？", async () => {
      await delMaterialReceive({ id, project_id: PROJECT_ID })
      message.success("操作成功")
      setMaterialApproachList((prevState) => prevState.filter((e) => e.id != id))
    })
  }

  const handleEditMaterialApproach = (materialData: MaterialReceiveData) => {
    handleEditMaterial(materialData)
  }

  const handlePaginationChange = async (val: any, type: keyof GetMaterialReceiveParams) => {
    let params = {} as GetMaterialReceiveParams
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
    const res = await getMaterialReceive(params)
    const newArr = res.items.sort((a, b) => dayjs(b.created_at).unix() - dayjs(a.created_at).unix())
    setMaterialApproachList(newArr)
    setPager(res.pager)
  }

  const { exportOpen, handleExportOpen, handleExportClose } = useMaterialExport()

  if (!permissionTagList.includes(permissionJson.receipt_of_materials_member_read)) {
    return <NoPermission />
  }

  return (
    <>
      <h3 className="font-bold text-[1.875rem]">物资领用</h3>
      <div className="mb-9 mt-7">
        <Breadcrumbs aria-label="breadcrumb" separator=">">
          <Link underline="hover" color="inherit" href="/dashboard">
            <i className="iconfont icon-homefill" style={{ fontSize: "14px" }}></i>
          </Link>
          <Typography color="text.primary" sx={{ fontSize: "14px" }}>
            物资领用
          </Typography>
        </Breadcrumbs>
      </div>
      <header className="flex justify-between mb-4">
        <div className="flex gap-2">
          {/*<Button*/}
          {/*  className="bg-railway_blue text-white"*/}
          {/*  style={displayWithPermission(*/}
          {/*    permissionTagList,*/}
          {/*    permissionJson.receipt_of_materials_member_write,*/}
          {/*  )}*/}
          {/*  onClick={() => {*/}
          {/*    handleAddMaterial()*/}
          {/*  }}>*/}
          {/*  添加*/}
          {/*</Button>*/}
        </div>
        <div></div>
      </header>
      {isMutating ? (
        <Loading />
      ) : (
        <div className="bg-white border custom-scroll-bar shadow-sm flex-1 overflow-y-auto pb-8 relative">
          <div className="h-full custom-scroll-bar overflow-y-auto">
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
                  <TableRow sx={{ "&:last-child td, &:last-child th": { border: 0 } }} key={row.id}>
                    <TableCell component="th" scope="row">
                      {dateToYYYYMM(row.received_at)}
                    </TableCell>
                    <TableCell align="left">{findTestName(row)}</TableCell>
                    <TableCell align="left">
                      {renderProperty(row.dictionary ? row.dictionary.properties : "")}
                    </TableCell>
                    <TableCell align="left">{row.ebs_desc}</TableCell>
                    <TableCell align="left">
                      {row.received_quantity && intoDoubleFixed3(row.received_quantity / 1000)}
                    </TableCell>
                    <TableCell align="left">{row.construction_team_full_name}</TableCell>
                    <TableCell align="left">{dateToYYYYMM(row.created_at)}</TableCell>
                    <TableCell align="left">{row.creator}</TableCell>
                    <TableCell align="left">
                      <div className="flex justify-center gap-x-2">
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
                        {/*    permissionJson.receipt_of_materials_member_update,*/}
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
                        {/*    permissionJson.receipt_of_materials_member_delete,*/}
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
          <div className="absolute bottom-0 w-full flex justify-center items-center gap-x-2 bg-white">
            <span>共{pager.count}条</span>
            <select
              className="border"
              value={swrState.limit}
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
