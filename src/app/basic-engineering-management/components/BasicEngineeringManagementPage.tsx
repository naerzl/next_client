"use client"
import React from "react"
import { useConfirmationDialog } from "@/components/ConfirmationDialogProvider"
import useSWRMutation from "swr/mutation"
import { message } from "antd"
import { Breadcrumbs, Button } from "@mui/material"
import Link from "@mui/material/Link"
import Typography from "@mui/material/Typography"
import Loading from "@/components/loading"
import Table from "@mui/material/Table"
import TableHead from "@mui/material/TableHead"
import TableRow from "@mui/material/TableRow"
import TableCell from "@mui/material/TableCell"
import TableBody from "@mui/material/TableBody"
import TableFooter from "@mui/material/TableFooter"
import { dateToUTCCustom, dateToYYYYMM } from "@/libs/methods"
import EditOutlinedIcon from "@mui/icons-material/EditOutlined"
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline"
import {
  reqDelEngineeringListing,
  reqGetEngineeringListing,
} from "@/app/basic-engineering-management/api"
import { EngineeringListing } from "@/app/basic-engineering-management/types/index.d"
import { useAddOrEditEngineering } from "@/app/basic-engineering-management/hooks/useAddOrEditEngineering"
import AddOrEditEngineering from "@/app/basic-engineering-management/components/AddOrEditEngineering"
import { useRouter } from "next/navigation"
import ConstructionIcon from "@mui/icons-material/Construction"
import { LayoutContext } from "@/components/LayoutContext"
import dayjs from "dayjs"

export default function BasicEngineeringManagementPage() {
  const { projectId: PROJECT_ID } = React.useContext(LayoutContext)

  // 表格配置列
  const columns = [
    {
      title: "创建时间",
      key: "create_time",
    },
    {
      title: "专业名称",
      key: "ebs_id",
    },
    {
      title: "工程名称",
      key: "name",
    },

    {
      title: "开始里程",
      key: "start_mileage",
    },

    {
      title: "结束里程",
      key: "end_mileage",
    },
    {
      title: "是否高速",
      key: "is_highspeed",
    },
    {
      title: "创建人",
      key: "create_by",
    },
    {
      title: "操作",
      key: "action",
    },
  ]

  const {
    drawerOpen,
    editItem,
    handleCloseEngineeringWithDrawer,
    handleAddEngineering,
    handleEditEngineering,
  } = useAddOrEditEngineering()

  const router = useRouter()

  const { showConfirmationDialog } = useConfirmationDialog()

  const [swrState, setSWRState] = React.useState({
    project_id: PROJECT_ID,
  })

  const { trigger: getEngineeringListingApi, isMutating } = useSWRMutation(
    "/engineering-listing",
    reqGetEngineeringListing,
  )

  const { trigger: delEngineeringListingApi } = useSWRMutation(
    "/engineering-listing",
    reqDelEngineeringListing,
  )

  const [engineeringList, setEngineeringList] = React.useState<EngineeringListing[]>([])

  const getDataList = async () => {
    const res = await getEngineeringListingApi(swrState)
    const newArr = res.sort((a, b) => {
      return dayjs(b.created_at).unix() - dayjs(a.created_at).unix()
    })

    setEngineeringList(newArr)
  }

  React.useEffect(() => {
    getDataList()
  }, [])

  // 删除物资进场数据
  const handleDelMaterialApproach = (id: number) => {
    showConfirmationDialog("确认要删除吗？", async () => {
      await delEngineeringListingApi({ id, project_id: PROJECT_ID })
      message.success("操作成功")
      setEngineeringList((prevState) => prevState.filter((e) => e.id != id))
    })
  }

  const handleEditMaterialApproach = (engineeringData: EngineeringListing) => {
    handleEditEngineering(engineeringData)
  }

  const handleGoToEBS = (engineeringData: EngineeringListing) => {
    router.push(`/ebs-data?code=${engineeringData.ebs.code}&baseId=${engineeringData.id}`)
  }
  return (
    <>
      <h3 className="font-bold text-[1.875rem]">构筑物</h3>
      <div className="mb-9 mt-7">
        <Breadcrumbs aria-label="breadcrumb" separator=">">
          <Link underline="hover" color="inherit" href="/dashboard">
            <i className="iconfont icon-homefill" style={{ fontSize: "14px" }}></i>
          </Link>
          <Typography color="text.primary" sx={{ fontSize: "14px" }}>
            构筑物
          </Typography>
        </Breadcrumbs>
      </div>
      <header className="flex justify-between mb-4">
        <div className="flex gap-2">
          <Button
            className="bg-railway_blue text-white"
            onClick={() => {
              handleAddEngineering()
            }}>
            添加
          </Button>
        </div>
        <div></div>
      </header>
      {isMutating ? (
        <Loading />
      ) : (
        <div className="bg-white border custom-scroll-bar shadow-sm flex-1 overflow-auto">
          <Table sx={{ minWidth: 650 }} aria-label="simple table" stickyHeader>
            <TableHead sx={{ position: "sticky", top: "0px", zIndex: 5 }}>
              <TableRow>
                {columns.map((col, index) => (
                  <TableCell key={index} sx={{ width: col.key == "action" ? "340px" : "auto" }}>
                    {col.title}
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {engineeringList.map((row) => (
                <TableRow sx={{ "&:last-child td, &:last-child th": { border: 0 } }} key={row.id}>
                  <TableCell align="left">
                    {dateToUTCCustom(row.created_at, "YYYY-MM-DD HH:mm")}
                  </TableCell>
                  <TableCell align="left">{row?.ebs?.name}</TableCell>
                  <TableCell align="left">{row.name}</TableCell>
                  <TableCell align="left">{row.start_mileage}</TableCell>
                  <TableCell align="left">{row.end_mileage}</TableCell>
                  <TableCell align="left">{row.is_highspeed == 1 ? "是" : "否"}</TableCell>
                  <TableCell align="left">{row.creator}</TableCell>

                  <TableCell align="left">
                    <div className="flex justify-between">
                      <Button
                        variant="outlined"
                        onClick={() => {
                          handleGoToEBS(row)
                        }}
                        color="success"
                        startIcon={<ConstructionIcon />}>
                        工程结构
                      </Button>
                      <Button
                        variant="outlined"
                        onClick={() => {
                          handleEditMaterialApproach(row)
                        }}
                        startIcon={<EditOutlinedIcon />}>
                        编辑
                      </Button>
                      <Button
                        variant="outlined"
                        color="error"
                        onClick={() => {
                          handleDelMaterialApproach(row.id)
                        }}
                        startIcon={<DeleteOutlineIcon />}>
                        删除
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
            <TableFooter></TableFooter>
          </Table>
        </div>
      )}
      {drawerOpen && (
        <AddOrEditEngineering
          open={drawerOpen}
          close={handleCloseEngineeringWithDrawer}
          editItem={editItem}
          getDataList={getDataList}
        />
      )}
    </>
  )
}
