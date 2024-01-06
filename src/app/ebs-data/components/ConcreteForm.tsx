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
import { reqDelConcreteData, reqGetConcreteData } from "@/app/ebs-data/api"
import { BridgeBoredBasicData, ConcreteData } from "@/app/ebs-data/types"
import AddOutlinedIcon from "@mui/icons-material/AddOutlined"
import { Pile_Type_Enum, Drill_Mode_Enum } from "@/app/ebs-data/const"
import useHooksConfirm from "@/hooks/useHooksConfirm"
import useSWRMutation from "swr/mutation"
import useAddConcreteWithDrawer from "../hooks/useAddConcreteWithDrawer"
import AddConrete from "@/app/ebs-data/components/AddConrete"
import dayjs from "dayjs"
import { LayoutContext } from "@/components/LayoutContext"
import ebsDataContext from "@/app/ebs-data/context/ebsDataContext"
import { useConfirmationDialog } from "@/components/ConfirmationDialogProvider"
import { renderProperty } from "@/app/ebs-data/const/method"
import { dateToYYYYMM, displayWithPermission } from "@/libs/methods"
import permissionJson from "@/config/permission.json"

const columns = [
  {
    title: "混凝土型号",
    dataIndex: "dictionary_name",
    key: "dictionary_name",
    align: "left",
  },
  {
    title: "方量（m³）",
    dataIndex: "方量",
    key: "方量",
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
  const ctx = React.useContext(ebsDataContext)

  const { projectId: PROJECT_ID, permissionTagList } = React.useContext(LayoutContext)

  const { trigger: getBridgeBoredBasicDataApi } = useSWRMutation(
    "/material-concrete",
    reqGetConcreteData,
  )

  const { trigger: delBridgeBoredBasicDataApi } = useSWRMutation(
    "/material-concrete",
    reqDelConcreteData,
  )

  const [tableList, setTableList] = React.useState<ConcreteData[]>([])

  const getConcreteListData = async () => {
    const res = await getBridgeBoredBasicDataApi({
      ebs_id: ctx.ebsItem.id,
      project_id: PROJECT_ID,
      engineering_listing_id: ctx.ebsItem.engineering_listing_id!,
    })

    setTableList(res)
  }
  React.useEffect(() => {
    getConcreteListData()
  }, [])

  const {
    handleOpenAddConcreteWithDrawer,
    handleCloseAddConcreteWithDrawer,
    handleEditConcreteWithDrawer,
    open: addConcreteOpen,
    editItem,
  } = useAddConcreteWithDrawer()

  const { showConfirmationDialog } = useConfirmationDialog()

  const handleDelProcessWithSWR = (id: number) => {
    showConfirmationDialog("确定要删除吗？", async () => {
      await delBridgeBoredBasicDataApi({ id, project_id: PROJECT_ID })
      getConcreteListData()
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
    getConcreteListData()
  }

  return (
    <>
      <div className="flex justify-end">
        <Button
          style={displayWithPermission(permissionTagList, permissionJson.structure_member_write)}
          variant="contained"
          className="bg-railway_blue"
          startIcon={<AddOutlinedIcon />}
          onClick={() => {
            handleOpenAddConcreteWithDrawer()
          }}>
          新建混凝土
        </Button>
      </div>
      <div style={{ width: "100%", height: "100%", paddingBottom: "38px" }}>
        <Table sx={{ minWidth: 650 }} aria-label="simple table" stickyHeader>
          <TableHead>
            <TableRow>
              {columns.map((col, index) => (
                <TableCell key={index} sx={{ width: col.key == "action" ? "150px" : "auto" }}>
                  {col.title}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {tableList &&
              tableList.map((row: ConcreteData, index: number) => (
                <TableRow key={row.id}>
                  <TableCell align="left">{renderProperty(row.dictionary?.properties)}</TableCell>
                  <TableCell align="left">{row.quantity ? row.quantity / 1000 : ""}</TableCell>
                  <TableCell align="left">{dateToYYYYMM(row.created_at)}</TableCell>
                  <TableCell align="left">
                    <div className="flex justify-start">
                      <IconButton
                        style={displayWithPermission(
                          permissionTagList,
                          permissionJson.structure_member_update,
                        )}
                        onClick={() => {
                          handleEditConcreteWithDrawer(row)
                        }}>
                        <EditOutlinedIcon />
                      </IconButton>
                      <IconButton
                        style={displayWithPermission(
                          permissionTagList,
                          permissionJson.structure_member_delete,
                        )}
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
