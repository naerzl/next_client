"use client"
import React from "react"
import Table from "@mui/material/Table"
import TableHead from "@mui/material/TableHead"
import TableRow from "@mui/material/TableRow"
import TableCell from "@mui/material/TableCell"
import TableBody from "@mui/material/TableBody"
import { Button, IconButton } from "@mui/material"
import DeleteIcon from "@mui/icons-material/DeleteOutlined"
import EditOutlinedIcon from "@mui/icons-material/EditOutlined"
import useSWR from "swr"
import { reqDelBridgeBoredBasicData, reqGetRebarData } from "@/app/ebs-data/api"
import { RebarData } from "@/app/ebs-data/types"
import AddOutlinedIcon from "@mui/icons-material/AddOutlined"
import { Connect_method_enum } from "@/app/ebs-data/const"
import useHooksConfirm from "@/hooks/useHooksConfirm"
import useSWRMutation from "swr/mutation"
import useAddRebarWithDrawer from "@/app/ebs-data/hooks/useAddRebarWithDrawer"
import AddRebar from "@/app/ebs-data/components/AddRebar"
import dayjs from "dayjs"
import { LayoutContext } from "@/components/LayoutContext"
import ebsDataContext from "@/app/ebs-data/context/ebsDataContext"

const columns = [
  {
    title: "序号",
    dataIndex: "index",
    key: "index",
    align: "left",
  },
  {
    title: "钢筋编号",
    dataIndex: "rebar_no",
    key: "rebar_no",
    align: "left",
  },
  {
    title: "单位长",
    dataIndex: "unit_length",
    key: "unit_length",
    align: "left",
  },
  {
    title: "单位重",
    dataIndex: "unit_weight",
    key: "unit_weight",
    align: "left",
  },
  {
    title: "字典名称",
    dataIndex: "dictionary_name",
    key: "dictionary_name",
    align: "left",
  },
  {
    title: "数量",
    dataIndex: "number",
    key: "number",
    align: "left",
  },
  {
    title: "连接方式",
    dataIndex: "connect_method",
    key: "connect_method",
    align: "left",
  },
  {
    title: "创建时间",
    dataIndex: "created_at",
    key: "created_at",
    align: "left",
  },

  {
    width: "150px",
    title: "操作",
    key: "action",
  },
]

function renderCellConnectMethod(item: RebarData) {
  return Connect_method_enum.find((el) => el.value == item.connect_method)?.label
}

export default function RebarForm() {
  const ctx = React.useContext(ebsDataContext)

  const { projectId: PROJECT_ID } = React.useContext(LayoutContext)

  const { data: tableList, mutate: mutateTableList } = useSWR(
    () => (ctx.ebsItem.id ? `/material-rebar?ebs_id=${ctx.ebsItem.id}` : null),
    (url: string) =>
      reqGetRebarData(url, {
        arg: {
          ebs_id: ctx.ebsItem.id,
          project_id: PROJECT_ID,
          engineering_listing_id: ctx.ebsItem.engineering_listing_id!,
        },
      }),
    {
      revalidateIfStale: false,
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
    },
  )

  const { trigger: delBridgeBoredBasicDataApi } = useSWRMutation(
    "/material-rebar",
    reqDelBridgeBoredBasicData,
  )

  const {
    handleEditRebarWithDrawer,
    editItem,
    open: addBridgeOpen,
    handleCloseAddRebarWithDrawer,
    handleOpenAddRebarWithDrawer,
  } = useAddRebarWithDrawer()

  const { handleConfirm } = useHooksConfirm()

  const handleDelProcessWithSWR = (id: number) => {
    handleConfirm(async () => {
      await delBridgeBoredBasicDataApi({ id, project_id: PROJECT_ID })
      await mutateTableList(tableList?.filter((item) => item.id != id), false)
    })
  }

  const handleAddOrEditBridgeCallBack = async (item: RebarData, isAdd: boolean) => {
    const newData = structuredClone(tableList)
    if (isAdd) {
      newData?.push(item)
    } else {
      const index = newData!.findIndex((el) => item.id == el.id)
      newData![index] = item
    }
    await mutateTableList(newData, false)
  }

  return (
    <>
      <div className="flex justify-end">
        <Button
          variant="contained"
          className="bg-railway_blue"
          startIcon={<AddOutlinedIcon />}
          onClick={() => {
            handleOpenAddRebarWithDrawer()
          }}>
          新建钢筋数量表
        </Button>
      </div>
      <div style={{ width: "100%", height: "100%", paddingBottom: "38px" }}>
        <Table sx={{ minWidth: 650 }} aria-label="simple table" stickyHeader>
          <TableHead>
            <TableRow>
              {columns.map((col) => (
                <TableCell key={col.key} sx={{ width: col.key == "action" ? "150px" : "auto" }}>
                  {col.title}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {tableList &&
              tableList.map((row: RebarData, index: number) => (
                <TableRow key={row.id}>
                  <TableCell component="th" scope="row">
                    {index + 1}
                  </TableCell>
                  <TableCell align="left">{row.rebar_no}</TableCell>
                  <TableCell align="left">{row.unit_length / 1000}</TableCell>
                  <TableCell align="left">{row.unit_weight / 1000}</TableCell>
                  <TableCell align="left">{row.dictionary.name}</TableCell>
                  <TableCell align="left">{row.number / 1000}</TableCell>
                  <TableCell align="left">{renderCellConnectMethod(row)}</TableCell>
                  <TableCell align="left">
                    {dayjs(row.created_at).format("YYYY-MM-DD HH:ss:mm")}
                  </TableCell>
                  <TableCell align="left">
                    <div className="flex justify-start">
                      <IconButton
                        onClick={() => {
                          handleEditRebarWithDrawer(row)
                        }}>
                        <EditOutlinedIcon />
                      </IconButton>
                      <IconButton
                        onClick={() => {
                          handleDelProcessWithSWR(row.id)
                        }}>
                        <DeleteIcon />
                      </IconButton>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
          </TableBody>
        </Table>
      </div>

      {addBridgeOpen && (
        <AddRebar
          editItem={editItem}
          open={addBridgeOpen}
          handleCloseAddBridgeWithDrawer={handleCloseAddRebarWithDrawer}
          cb={handleAddOrEditBridgeCallBack}
        />
      )}
    </>
  )
}
