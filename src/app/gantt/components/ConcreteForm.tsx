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
import {
  reqDelBridgeBoredBasicData,
  reqDelConcreteData,
  reqGetBridgeBoredBasicData,
  reqGetConcreteData,
  reqGetRebarData,
} from "@/app/gantt/api"
import { BridgeBoredBasicData, ConcreteData, RebarData, TypeEBSDataList } from "@/app/gantt/types"
import AddOutlinedIcon from "@mui/icons-material/AddOutlined"
import useAddBridgeBoredWithDrawer from "@/app/gantt/hooks/useAddBridgeBoredWithDrawer"
import AddBridge from "./AddBridge"
import { Pile_Type_Enum, Drill_Mode_Enum } from "@/app/gantt/const"
import useHooksConfirm from "@/hooks/useHooksConfirm"
import useSWRMutation from "swr/mutation"
import ganttContext from "@/app/gantt/context/ganttContext"
import useAddRebarWithDrawer from "@/app/gantt/hooks/useAddRebarWithDrawer"
import AddRebar from "@/app/gantt/components/AddRebar"
import useAddConcreteWithDrawer from "../hooks/useAddConcreteWithDrawer"
import AddConrete from "@/app/gantt/components/AddConrete"
import dayjs from "dayjs"
import { LayoutContext } from "@/components/LayoutContext"

const columns = [
  {
    title: "序号",
    dataIndex: "index",
    key: "index",
    align: "left",
  },
  {
    title: "字典名称",
    dataIndex: "dictionary_name",
    key: "dictionary_name",
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

function renderCellType(item: BridgeBoredBasicData) {
  return Pile_Type_Enum.find((el) => el.value == item.pile_type)?.label
}

function renderCellDrillMode(item: BridgeBoredBasicData) {
  return Drill_Mode_Enum.find((el) => el.value == item.drill_mode)?.label
}

export default function ConcreteForm() {
  const ctx = React.useContext(ganttContext)

  const { projectId: PROJECT_ID } = React.useContext(LayoutContext)

  const { data: tableList, mutate: mutateTableList } = useSWR(
    () => (ctx.ebsItem.id ? `/material-concrete?ebs_id=${ctx.ebsItem.id}` : null),
    (url: string) =>
      reqGetConcreteData(url, {
        arg: {
          ebs_id: ctx.ebsItem.id,
          project_id: PROJECT_ID,
          project_sp_id: ctx.ebsItem.project_sp_id.replace(/[a-zA-Z]/, ""),
          project_si_id: ctx.ebsItem.project_si_id.replace(/[a-zA-Z]/, ""),
        },
      }),
    {
      revalidateIfStale: false,
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
    },
  )

  const { trigger: delBridgeBoredBasicDataApi } = useSWRMutation(
    "/material-concrete",
    reqDelConcreteData,
  )

  const {
    handleOpenAddConcreteWithDrawer,
    handleCloseAddConcreteWithDrawer,
    handleEditConcreteWithDrawer,
    open: addConcreteOpen,
    editItem,
  } = useAddConcreteWithDrawer()

  const { handleConfirm } = useHooksConfirm()

  const handleDelProcessWithSWR = (id: number) => {
    handleConfirm(async () => {
      await delBridgeBoredBasicDataApi({ id, project_id: PROJECT_ID })
      await mutateTableList(tableList?.filter((item) => item.id != id), false)
    })
  }

  const handleAddOrEditBridgeCallBack = async (item: ConcreteData, isAdd: boolean) => {
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
            handleOpenAddConcreteWithDrawer()
          }}>
          新建混凝土表
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
              tableList.map((row: ConcreteData, index: number) => (
                <TableRow key={row.id}>
                  <TableCell align="left">{index + 1}</TableCell>
                  <TableCell align="left">{row.dictionary.name}</TableCell>
                  <TableCell align="left">
                    {dayjs(row.created_at).format("YYYY-MM-DD HH:ss:mm")}
                  </TableCell>
                  <TableCell align="left">
                    <div className="flex justify-start">
                      <IconButton
                        onClick={() => {
                          handleEditConcreteWithDrawer(row)
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

      {addConcreteOpen && (
        <AddConrete
          editItem={editItem}
          open={addConcreteOpen}
          handleCloseAddConcreteWithDrawer={handleCloseAddConcreteWithDrawer}
          cb={handleAddOrEditBridgeCallBack}
        />
      )}
    </>
  )
}
