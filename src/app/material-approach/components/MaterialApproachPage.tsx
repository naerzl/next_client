"use client"
import React from "react"
import { Breadcrumbs, Button, Chip, InputAdornment, InputBase } from "@mui/material"
import Link from "@mui/material/Link"
import Typography from "@mui/material/Typography"
import TableHead from "@mui/material/TableHead"
import TableRow from "@mui/material/TableRow"
import TableCell from "@mui/material/TableCell"
import TableBody from "@mui/material/TableBody"
import Table from "@mui/material/Table"
import AddOrEditMaterial from "@/app/material-approach/components/AddOrEditMaterial"
import { useAddOrEditMaterial } from "@/app/material-approach/hooks/useAddOrEditMaterial"
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline"
import EditOutlinedIcon from "@mui/icons-material/EditOutlined"
import { GetMaterialApproachParams, MaterialApproachData } from "@/app/material-approach/types"
import { reqDelMaterialApproach, reqGetMaterialApproach } from "@/app/material-approach/api"
import Loading from "@/components/loading"
import { PROCESSING_RESULT } from "@/app/material-approach/const/enum"
import useSWRMutation from "swr/mutation"
import { dateToYYYYMM } from "@/libs/methods"
import { useConfirmationDialog } from "@/components/ConfirmationDialogProvider"
import { OAUTH2_ACCESS_TOKEN, PROJECT_ID } from "@/libs/const"
import { message } from "antd"

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
export default function MaterialApproachPage() {
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
    limit: 20,
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

  const getDataList = async () => {
    const res = await getMaterialApproach(swrState)
    console.log(res)
    setMaterialApproachList(res.items)
  }

  React.useEffect(() => {
    getDataList()
  }, [])

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
        <div className="flex gap-2">
          <Button
            className="bg-railway_blue text-white"
            onClick={() => {
              handleAddMaterial()
            }}>
            添加
          </Button>
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
                    {dateToYYYYMM(row.arrivaled_at)}
                  </TableCell>
                  <TableCell align="left">{row.dictionary?.name}</TableCell>
                  <TableCell align="left">
                    {renderProperty(row.dictionary?.properties ?? "[]")}
                  </TableCell>
                  <TableCell align="left">{row.arrivaled_quantity}</TableCell>
                  <TableCell align="left">{row.manufacturer}</TableCell>
                  <TableCell align="left">{renderStatus(row.status)}</TableCell>
                  <TableCell align="left">{dateToYYYYMM(row.created_at)}</TableCell>
                  <TableCell align="left">{row.recorder}</TableCell>
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
