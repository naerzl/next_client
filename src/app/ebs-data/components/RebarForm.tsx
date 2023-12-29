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
import { reqDelRebarData, reqGetDictionary, reqGetRebarData } from "@/app/ebs-data/api"
import { DictionaryData, RebarData } from "@/app/ebs-data/types"
import AddOutlinedIcon from "@mui/icons-material/AddOutlined"
import { Connect_method_enum, REBAR_DICTIONARY_CLASS_ID } from "@/app/ebs-data/const"
import useSWRMutation from "swr/mutation"
import useAddRebarWithDrawer from "@/app/ebs-data/hooks/useAddRebarWithDrawer"
import AddRebar from "@/app/ebs-data/components/AddRebar"
import dayjs from "dayjs"
import { LayoutContext } from "@/components/LayoutContext"
import ebsDataContext from "@/app/ebs-data/context/ebsDataContext"
import { useConfirmationDialog } from "@/components/ConfirmationDialogProvider"
import { dateToYYYYMM, displayWithPermission } from "@/libs/methods"
import { renderProperty } from "@/app/ebs-data/const/method"
import permissionJson from "@/config/permission.json"

const columns = [
  {
    title: "钢筋编号",
    dataIndex: "rebar_no",
    key: "rebar_no",
    align: "left",
  },
  {
    title: "规格型号",
    dataIndex: "unit_length",
    key: "unit_length",
    align: "left",
  },
  {
    title: "单位重（kg/m）",
    dataIndex: "unit_weight",
    key: "unit_weight",
    align: "left",
  },
  {
    title: "根数",
    dataIndex: "dictionary_name",
    key: "dictionary_name",
    align: "left",
  },
  {
    title: "单根长（m）",
    dataIndex: "number",
    key: "number",
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

  const { projectId: PROJECT_ID, permissionTagList } = React.useContext(LayoutContext)

  const { trigger: getBridgeBoredBasicDataApi } = useSWRMutation("/material-rebar", reqGetRebarData)

  const [tableList, setTableList] = React.useState<RebarData[]>([])

  const getRebarListData = async () => {
    const res = await getBridgeBoredBasicDataApi({
      ebs_id: ctx.ebsItem.id,
      project_id: PROJECT_ID,
      engineering_listing_id: ctx.ebsItem.engineering_listing_id!,
    })
    setTableList(res || [])
  }

  React.useEffect(() => {
    getRebarListData()
  }, [])

  const { trigger: delBridgeBoredBasicDataApi } = useSWRMutation("/material-rebar", reqDelRebarData)

  const {
    handleEditRebarWithDrawer,
    editItem,
    open: addBridgeOpen,
    handleCloseAddRebarWithDrawer,
    handleOpenAddRebarWithDrawer,
  } = useAddRebarWithDrawer()

  const { showConfirmationDialog } = useConfirmationDialog()

  const handleDelProcessWithSWR = (id: number) => {
    showConfirmationDialog("确定删除吗？", async () => {
      await delBridgeBoredBasicDataApi({ id, project_id: PROJECT_ID })
      getRebarListData()
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
    getRebarListData()
  }

  return (
    <>
      <div className="flex justify-end">
        <Button
          variant="contained"
          style={displayWithPermission(permissionTagList, permissionJson.structure_member_write)}
          className="bg-railway_blue"
          startIcon={<AddOutlinedIcon />}
          onClick={() => {
            handleOpenAddRebarWithDrawer()
          }}>
          新建钢筋数量
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
                  <TableCell align="left">{row.rebar_no}</TableCell>
                  <TableCell align="left">{renderProperty(row.dictionary?.properties)}</TableCell>
                  <TableCell align="left">{row.unit_weight / 1000}</TableCell>
                  <TableCell align="left">{row.number / 1000}</TableCell>
                  <TableCell align="left">{row.unit_length / 1000}</TableCell>
                  <TableCell align="left">{dateToYYYYMM(row.created_at)}</TableCell>
                  <TableCell align="left">
                    <div className="flex justify-start">
                      <IconButton
                        style={displayWithPermission(
                          permissionTagList,
                          permissionJson.structure_member_update,
                        )}
                        onClick={() => {
                          handleEditRebarWithDrawer(row)
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
