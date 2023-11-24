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
import AddOrEditMaterial from "@/app/material-processing/components/AddOrEditMaterial"
import { useAddOrEditMaterial } from "@/app/material-processing/hooks/useAddOrEditMaterial"
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline"
import EditOutlinedIcon from "@mui/icons-material/EditOutlined"
import Loading from "@/components/loading"
import useSWRMutation from "swr/mutation"
import { dateToYYYYMM, displayWithPermission } from "@/libs/methods"
import { useConfirmationDialog } from "@/components/ConfirmationDialogProvider"
import { message } from "antd"
import { reqDelMaterialMachine, reqGetMaterialMachine } from "@/app/material-processing/api"
import {
  GetMaterialProcessingParams,
  MaterialProcessingData,
} from "@/app/material-processing/types"
import { CLASS_OPTION, LINK_METHOD_OPTION } from "@/app/material-processing/const"
import { LayoutContext } from "@/components/LayoutContext"
import permissionJson from "@/config/permission.json"
import NoPermission from "@/components/NoPermission"
import { BaseApiPager } from "@/types/api"
import { GetMaterialApproachParams } from "@/app/material-approach/types"
import dayjs from "dayjs"
import ZoomInIcon from "@mui/icons-material/ZoomIn"
import { useLookDetail } from "@/app/material-processing/hooks/useLookDetail"
import LookDetail from "@/app/material-processing/components/LookDetaill"

function renderPerson(classes: "rebar" | "concrete", row: MaterialProcessingData) {
  const jsonData = JSON.parse(row.relate_data)

  if (classes == "rebar") {
    return (
      <div>
        <span>下料人员： {jsonData.blanking_personnel}</span>
        <span>焊接员： {jsonData.welder}</span>
        <span>加工员： {jsonData.processors}</span>
        <span>
          钢筋连接方式：
          {LINK_METHOD_OPTION.find((item) => item.value == jsonData.link_type)?.label}
        </span>
      </div>
    )
  } else {
    return (
      <div>
        <span>拌合员： {jsonData.mixer}</span>
      </div>
    )
  }
}

// 表格配置列
const columns = [
  {
    title: "加工类型",
    dataIndex: "id",
    key: "id",
  },
  {
    title: "名称",
    dataIndex: "name",
    key: "name",
  },
  {
    title: "数量",
    dataIndex: "quantity",
    key: "quantity",
  },
  {
    title: "基础数据",
    dataIndex: "base_data",
    key: "base_data",
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
    title: "备注",
    dataIndex: "desc",
    key: "desc",
  },
  {
    title: "操作",
    key: "action",
  },
]
export default function MaterialProcessingPage() {
  const { projectId: PROJECT_ID, permissionTagList } = React.useContext(LayoutContext)

  const {
    drawerOpen,
    editItem,
    handleCloseMaterialWithDrawer,
    handleEditMaterial,
    handleAddMaterial,
  } = useAddOrEditMaterial()

  const {
    drawerOpen: detailOpen,
    detailItem,
    handleLookTestDetailOpen,
    handleCloseLookTestDetailDrawer,
  } = useLookDetail()

  const { showConfirmationDialog } = useConfirmationDialog()

  const [swrState, setSWRState] = React.useState<GetMaterialProcessingParams>({
    page: 1,
    limit: 10,
    project_id: PROJECT_ID,
  })

  const { trigger: getMaterialMachine, isMutating } = useSWRMutation(
    "/material-machine",
    reqGetMaterialMachine,
  )

  const { trigger: delMaterialMachine } = useSWRMutation("/material-machine", reqDelMaterialMachine)

  const [materialApproachList, setMaterialApproachList] = React.useState<MaterialProcessingData[]>(
    [],
  )

  const [pager, setPager] = React.useState<BaseApiPager>({} as BaseApiPager)

  const getDataList = async () => {
    const res = await getMaterialMachine(swrState)
    setMaterialApproachList(res.items)
    setPager(res.pager)
  }

  React.useEffect(() => {
    getDataList()
  }, [])

  // 删除物资进场数据
  const handleDelMaterialApproach = (id: number) => {
    showConfirmationDialog("确认要删除吗？", async () => {
      await delMaterialMachine({ id, project_id: PROJECT_ID })
      message.success("操作成功")
      setMaterialApproachList((prevState) => prevState.filter((e) => e.id != id))
    })
  }

  const handleEditMaterialApproach = (materialData: MaterialProcessingData) => {
    handleEditMaterial(materialData)
  }

  const handlePaginationChange = async (val: any, type: keyof GetMaterialProcessingParams) => {
    let params = {} as GetMaterialProcessingParams
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
    const res = await getMaterialMachine(params)
    const newArr = res.items.sort((a, b) => dayjs(b.created_at).unix() - dayjs(a.created_at).unix())
    setMaterialApproachList(newArr)
    setPager(res.pager)
  }

  if (!permissionTagList.includes(permissionJson.material_processing_member_read)) {
    return <NoPermission />
  }

  return (
    <>
      <h3 className="font-bold text-[1.875rem]">物资加工</h3>
      <div className="mb-9 mt-7">
        <Breadcrumbs aria-label="breadcrumb" separator=">">
          <Link underline="hover" color="inherit" href="/dashboard">
            <i className="iconfont icon-homefill" style={{ fontSize: "14px" }}></i>
          </Link>
          <Typography color="text.primary" sx={{ fontSize: "14px" }}>
            物资加工
          </Typography>
        </Breadcrumbs>
      </div>
      <header className="flex justify-between mb-4">
        <div className="flex gap-2">
          {/*<Button*/}
          {/*  style={displayWithPermission(*/}
          {/*    permissionTagList,*/}
          {/*    permissionJson.material_processing_member_write,*/}
          {/*  )}*/}
          {/*  className="bg-railway_blue text-white"*/}
          {/*  onClick={() => {*/}
          {/*    handleAddMaterial()*/}
          {/*  }}>*/}
          {/*  添加*/}
          {/*</Button>*/}
        </div>
        <div>
          {/*<InputBase*/}
          {/*  className="w-[18.125rem] h-10 border  px-2 shadow bg-white"*/}
          {/*  onBlur={(event) => {}}*/}
          {/*  endAdornment={*/}
          {/*    <InputAdornment position="end">*/}
          {/*      <IconButton*/}
          {/*        type="button"*/}
          {/*        edge="end"*/}
          {/*        sx={{ p: "10px" }}*/}
          {/*        aria-label="search"*/}
          {/*        disableRipple>*/}
          {/*        <SearchIcon />*/}
          {/*      </IconButton>*/}
          {/*    </InputAdornment>*/}
          {/*  }*/}
          {/*/>*/}
        </div>
      </header>
      {isMutating ? (
        <Loading />
      ) : (
        <div className="bg-white border custom-scroll-bar shadow-sm flex-1 overflow-hidden relative pb-8">
          <div className="overflow-y-auto h-full">
            <Table sx={{ minWidth: 650 }} aria-label="simple table" stickyHeader>
              <TableHead sx={{ position: "sticky", top: "0", zIndex: 5 }}>
                <TableRow>
                  {columns.map((col, index) => (
                    <TableCell
                      key={index}
                      sx={{ width: col.key == "action" ? "210px" : "auto", textAlign: "center" }}>
                      {col.title}
                    </TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {materialApproachList.map((row) => (
                  <TableRow sx={{ "&:last-child td, &:last-child th": { border: 0 } }} key={row.id}>
                    <TableCell align="center" scope="row">
                      {CLASS_OPTION.find((ele) => ele.value == row.class)?.label}
                    </TableCell>
                    <TableCell align="center"></TableCell>
                    <TableCell align="center">{row.quantity}</TableCell>

                    <TableCell align="center">{renderPerson(row.class as any, row)}</TableCell>

                    <TableCell align="center">{dateToYYYYMM(row.created_at)}</TableCell>
                    <TableCell align="center">{row.creator}</TableCell>
                    <TableCell align="center">{row.desc}</TableCell>
                    <TableCell align="center">
                      <div className="flex justify-between">
                        <Button
                          variant="outlined"
                          onClick={() => {
                            handleLookTestDetailOpen(row)
                          }}
                          startIcon={<ZoomInIcon />}>
                          查看详情
                        </Button>
                        {/*<Button*/}
                        {/*  variant="outlined"*/}
                        {/*  style={displayWithPermission(*/}
                        {/*    permissionTagList,*/}
                        {/*    permissionJson.material_processing_member_update,*/}
                        {/*  )}*/}
                        {/*  onClick={() => {*/}
                        {/*    handleEditMaterialApproach(row)*/}
                        {/*  }}*/}
                        {/*  startIcon={<EditOutlinedIcon />}>*/}
                        {/*  编辑*/}
                        {/*</Button>*/}
                        {/*<Button*/}
                        {/*  variant="outlined"*/}
                        {/*  color="error"*/}
                        {/*  style={displayWithPermission(*/}
                        {/*    permissionTagList,*/}
                        {/*    permissionJson.material_processing_member_delete,*/}
                        {/*  )}*/}
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

      {detailOpen && (
        <LookDetail
          open={detailOpen}
          close={handleCloseLookTestDetailDrawer}
          editItem={detailItem}
        />
      )}
    </>
  )
}
