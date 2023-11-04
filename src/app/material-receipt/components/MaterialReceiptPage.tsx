"use client"
import React from "react"
import { Breadcrumbs, Button } from "@mui/material"
import Link from "@mui/material/Link"
import Typography from "@mui/material/Typography"
import Loading from "@/components/loading"
import Table from "@mui/material/Table"
import TableHead from "@mui/material/TableHead"
import TableRow from "@mui/material/TableRow"
import TableCell from "@mui/material/TableCell"
import TableBody from "@mui/material/TableBody"
import { dateToYYYYMM } from "@/libs/methods"
import EditOutlinedIcon from "@mui/icons-material/EditOutlined"
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline"
import { useAddOrEditMaterial } from "@/app/material-receipt/hooks/useAddOrEditMaterial"
import { useConfirmationDialog } from "@/components/ConfirmationDialogProvider"
import useSWRMutation from "swr/mutation"
import { reqGetMaterialReceive, reqDelMaterialReceive } from "@/app/material-receipt/api"
import { PROJECT_ID } from "@/libs/const"
import { message } from "antd"
import { GetMaterialReceiveParams, MaterialReceiveData } from "@/app/material-receipt/types"
import AddOrEditMaterial from "@/app/material-receipt/components/AddOrEditMaterial"

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

export default function MaterialReceiptPage() {
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
    limit: 20,
    project_id: PROJECT_ID,
  })

  const { trigger: getMaterialReceive, isMutating } = useSWRMutation(
    "/material-receive",
    reqGetMaterialReceive,
  )

  const { trigger: delMaterialReceive } = useSWRMutation("/material-receive", reqDelMaterialReceive)

  const [materialApproachList, setMaterialApproachList] = React.useState<MaterialReceiveData[]>([])

  const getDataList = async () => {
    const res = await getMaterialReceive(swrState)
    setMaterialApproachList(res.items)
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
          <Button
            className="bg-railway_blue text-white"
            onClick={() => {
              handleAddMaterial()
            }}>
            添加
          </Button>
        </div>
        <div></div>
      </header>
      {isMutating ? (
        <Loading />
      ) : (
        <div className="bg-white border custom-scroll-bar shadow-sm min-h-[570px]">
          <Table sx={{ minWidth: 650 }} aria-label="simple table" stickyHeader>
            <TableHead sx={{ position: "sticky", top: "64px", zIndex: 5 }}>
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
                  <TableCell align="left">{row.dictionary.name}</TableCell>
                  <TableCell align="left">{renderProperty(row.dictionary.properties)}</TableCell>
                  <TableCell align="left">{row.received_quantity}</TableCell>
                  <TableCell align="left">{row.construction_team_full_name}</TableCell>
                  <TableCell align="left">{dateToYYYYMM(row.created_at)}</TableCell>
                  <TableCell align="left">{row.creator}</TableCell>
                  <TableCell align="left">
                    <div className="flex justify-between">
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
          </Table>
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
    </>
  )
}
