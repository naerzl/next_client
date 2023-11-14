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
import { reqDelBridgeBoredBasicData, reqGetBridgeBoredBasicData } from "@/app/ebs-data/api"
import { BridgeBoredBasicData } from "@/app/ebs-data/types"
import AddOutlinedIcon from "@mui/icons-material/AddOutlined"
import useAddBridgeBoredWithDrawer from "@/app/ebs-data/hooks/useAddBridgeBoredWithDrawer"
import AddBridge from "./AddBridge"
import { Pile_Type_Enum, Drill_Mode_Enum } from "@/app/ebs-data/const"
import useHooksConfirm from "@/hooks/useHooksConfirm"
import useSWRMutation from "swr/mutation"
import { LayoutContext } from "@/components/LayoutContext"
import ebsDataContext from "@/app/ebs-data/context/ebsDataContext"
import { useConfirmationDialog } from "@/components/ConfirmationDialogProvider"

const columns = [
  {
    title: "序号",
    dataIndex: "index",
    key: "index",
    align: "left",
  },
  {
    title: "桩径",
    dataIndex: "pile_diameter",
    key: "pile_diameter",
    align: "left",
  },
  {
    title: "桩长",
    dataIndex: "pile_length",
    key: "pile_length",
    align: "left",
  },
  {
    title: "桩顶标高",
    dataIndex: "pile_top_elevation",
    key: "pile_top_elevation",
    align: "left",
  },
  {
    title: "桩型",
    dataIndex: "pile_type",
    key: "pile_type",
    align: "left",
  },
  {
    title: "钻孔方式",
    dataIndex: "dill_mode",
    key: "dill_mode",
    align: "left",
  },
  {
    title: "钢筋笼长度",
    dataIndex: "rebar_cage_length",
    key: "rebar_cage_length",
    align: "left",
  },
  {
    title: "垫块字典ID",
    dataIndex: "liner_dictionary_id",
    key: "liner_dictionary_id",
    align: "left",
  },
  {
    title: "垫块数量",
    dataIndex: "liner_number",
    key: "liner_number",
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

export default function BaseForm() {
  const ctx = React.useContext(ebsDataContext)

  const { projectId: PROJECT_ID } = React.useContext(LayoutContext)

  const { data: tableList, mutate: mutateTableList } = useSWR(
    () => (ctx.ebsItem.id ? `/bridge-bored-basic-datum?ebs_id=${ctx.ebsItem.id}` : null),
    (url: string) =>
      reqGetBridgeBoredBasicData(url, {
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
    "/bridge-bored-basic-datum",
    reqDelBridgeBoredBasicData,
  )

  const {
    handleEditBridgeWithDrawer,
    handleCloseAddBridgeWithDrawer,
    handleOpenAddBridgeWithDrawer,
    editItem,
    open: addBridgeOpen,
  } = useAddBridgeBoredWithDrawer()

  const { showConfirmationDialog } = useConfirmationDialog()

  const handleDelProcessWithSWR = (id: number) => {
    showConfirmationDialog("确定要删除吗？", async () => {
      await delBridgeBoredBasicDataApi({ id, project_id: PROJECT_ID })
      await mutateTableList(tableList?.filter((item) => item.id != id), false)
    })
  }

  const handleAddOrEditBridgeCallBack = async (item: BridgeBoredBasicData, isAdd: boolean) => {
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
            handleOpenAddBridgeWithDrawer()
          }}>
          新建基础数据
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
              tableList.map((row: BridgeBoredBasicData, index: number) => (
                <TableRow key={row.id}>
                  <TableCell component="th" scope="row">
                    {index + 1}
                  </TableCell>
                  <TableCell align="left">{row.pile_diameter / 1000}</TableCell>
                  <TableCell align="left">{row.pile_length / 1000}</TableCell>
                  <TableCell align="left">{row.pile_top_elevation / 1000}</TableCell>
                  <TableCell align="left">{renderCellType(row)}</TableCell>
                  <TableCell align="left">{renderCellDrillMode(row)}</TableCell>
                  <TableCell align="left">{row.rebar_cage_length / 1000}</TableCell>
                  <TableCell align="left">{row.liner_dictionary_id}</TableCell>
                  <TableCell align="left">{row.liner_number / 1000}</TableCell>
                  <TableCell align="left">
                    <div className="flex justify-start">
                      <IconButton
                        onClick={() => {
                          handleEditBridgeWithDrawer(row)
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
        <AddBridge
          editItem={editItem}
          open={addBridgeOpen}
          handleCloseAddBridgeWithDrawer={handleCloseAddBridgeWithDrawer}
          cb={handleAddOrEditBridgeCallBack}
        />
      )}
    </>
  )
}
