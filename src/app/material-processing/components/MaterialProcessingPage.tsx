"use client"
import React from "react"
import { Breadcrumbs, Button } from "@mui/material"
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
import { dateToYYYYMM } from "@/libs/methods"
import { useConfirmationDialog } from "@/components/ConfirmationDialogProvider"
import { message } from "antd"
import { reqDelMaterialMachine, reqGetMaterialMachine } from "@/app/material-processing/api"
import {
  GetMaterialProcessingParams,
  MaterialProcessingData,
} from "@/app/material-processing/types"
import { CLASS_OPTION } from "@/app/material-processing/const"
import { LayoutContext } from "@/components/LayoutContext"

function renderPerson(
  classes: "rebar" | "concrete",
  attribute: string,
  row: MaterialProcessingData,
) {
  const jsonData = JSON.parse(row.relate_data)

  if (classes == "rebar") {
    if (attribute == "mixer") {
      return "-"
    } else {
      return jsonData[attribute]
    }
  } else {
    if (attribute == "mixer") {
      return jsonData[attribute]
    } else {
      return "-"
    }
  }
}
export default function MaterialProcessingPage() {
  const { projectId: PROJECT_ID } = React.useContext(LayoutContext)

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
      title: "下料人员",
      dataIndex: "ebs_name",
      key: "ebs_name",
    },

    {
      title: "焊接员",
      dataIndex: "start_tally",
      key: "start_tally",
    },

    {
      title: "加工员",
      dataIndex: "end_tally",
      key: "end_tally",
    },
    {
      title: "拌合员",
      dataIndex: "parent_name",
      key: "parent_name",
    },
    {
      title: "数量",
      dataIndex: "quantity",
      key: "quantity",
    },
    {
      title: "备注",
      dataIndex: "desc",
      key: "desc",
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
    // {
    //   title: "操作",
    //   key: "action",
    // },
  ]

  const {
    drawerOpen,
    editItem,
    handleCloseMaterialWithDrawer,
    handleEditMaterial,
    handleAddMaterial,
  } = useAddOrEditMaterial()

  const { showConfirmationDialog } = useConfirmationDialog()

  const [swrState, setSWRState] = React.useState<GetMaterialProcessingParams>({
    page: 1,
    limit: 20,
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

  const getDataList = async () => {
    const res = await getMaterialMachine(swrState)
    setMaterialApproachList(res.items)
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
        <div className="bg-white border custom-scroll-bar shadow-sm flex-1 overflow-y-auto">
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

                  <TableCell align="center">
                    {renderPerson(row.class as any, "blanking_personnel", row)}
                  </TableCell>
                  <TableCell align="center">
                    {renderPerson(row.class as any, "welder", row)}
                  </TableCell>
                  <TableCell align="center">
                    {renderPerson(row.class as any, "processors", row)}
                  </TableCell>
                  <TableCell align="center">
                    {renderPerson(row.class as any, "mixer", row)}
                  </TableCell>
                  <TableCell align="center">{row.quantity}</TableCell>
                  <TableCell align="center">{row.desc}</TableCell>
                  <TableCell align="center">{dateToYYYYMM(row.created_at)}</TableCell>
                  <TableCell align="center">{row.creator}</TableCell>
                  {/*<TableCell align="center">*/}
                  {/*  <div className="flex justify-between">*/}
                  {/*    <Button*/}
                  {/*      variant="outlined"*/}
                  {/*      onClick={() => {*/}
                  {/*        handleEditMaterialApproach(row)*/}
                  {/*      }}*/}
                  {/*      startIcon={<EditOutlinedIcon />}>*/}
                  {/*      编辑*/}
                  {/*    </Button>*/}
                  {/*    <Button*/}
                  {/*      variant="outlined"*/}
                  {/*      color="error"*/}
                  {/*      onClick={() => {*/}
                  {/*        handleDelMaterialApproach(row.id)*/}
                  {/*      }}*/}
                  {/*      startIcon={<DeleteOutlineIcon />}>*/}
                  {/*      删除*/}
                  {/*    </Button>*/}
                  {/*  </div>*/}
                  {/*</TableCell>*/}
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
