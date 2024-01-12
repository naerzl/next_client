import React from "react"
import Table from "@mui/material/Table"
import TableHead from "@mui/material/TableHead"
import TableRow from "@mui/material/TableRow"
import TableCell from "@mui/material/TableCell"
import TableBody from "@mui/material/TableBody"
import { Button, IconButton } from "@mui/material"
import DeleteIcon from "@mui/icons-material/DeleteOutlined"
import EditOutlinedIcon from "@mui/icons-material/EditOutlined"
import {
  reqDelBridgeBoredBasicData,
  reqGetBridgeBoredBasicData,
  reqGetDictionary,
} from "@/app/ebs-data/api"
import { BridgeBoredBasicData } from "@/app/ebs-data/types"
import AddOutlinedIcon from "@mui/icons-material/AddOutlined"
import useAddBridgeBoredWithDrawer from "@/app/ebs-data/hooks/useAddBridgeBoredWithDrawer"
import AddBridge from "./AddBridge"
import {
  Pile_Type_Enum,
  DRILL_MODE,
  BASIC_DICTIONARY_CLASS_ID,
  CONSTRUCTION_TECHNOLOGY,
} from "@/app/ebs-data/const"
import useSWRMutation from "swr/mutation"
import { LayoutContext } from "@/components/LayoutContext"
import ebsDataContext from "@/app/ebs-data/context/ebsDataContext"
import { useConfirmationDialog } from "@/components/ConfirmationDialogProvider"
import { DictionaryData } from "@/app/gantt/types"
import { renderProperty } from "@/app/ebs-data/const/method"
import { displayWithPermission } from "@/libs/methods"
import permissionJson from "@/config/permission.json"

const columns = [
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
    title: "桩顶标高(m)",
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
    title: "施工工艺",
    dataIndex: "construction_technology",
    key: "construction_technology",
    align: "left",
  },
  {
    title: "钻孔方式",
    dataIndex: "dill_mode",
    key: "dill_mode",
    align: "left",
  },
  {
    title: "钢筋笼长度(m)",
    dataIndex: "rebar_cage_length",
    key: "rebar_cage_length",
    align: "left",
  },

  {
    width: "150px",
    title: "操作",
    key: "action",
  },
]

function renderCellType(item: BridgeBoredBasicData) {
  const _metadata = JSON.parse(item.metadata)
  return Pile_Type_Enum.find((el) => el.value == _metadata.pile_type)?.label
}

function renderCellDrillMode(item: BridgeBoredBasicData) {
  const _metadata = JSON.parse(item.metadata)
  return DRILL_MODE.find((el) => el.value == _metadata.drill_mode)?.label
}

function renderConstruction(item: BridgeBoredBasicData) {
  const _metadata = JSON.parse(item.metadata)
  return CONSTRUCTION_TECHNOLOGY.find((el) => el.value == _metadata.construction_technology)?.label
}

function renderBaseCell(item: BridgeBoredBasicData, type: string) {
  const _metadata = JSON.parse(item.metadata)
  return _metadata[type] / 1000
}

export default function BaseForm() {
  const ctx = React.useContext(ebsDataContext)

  const { projectId: PROJECT_ID, permissionTagList } = React.useContext(LayoutContext)

  const { trigger: getBridgeBoredBasicDataApi } = useSWRMutation(
    "/basic-datum",
    reqGetBridgeBoredBasicData,
  )

  const { trigger: delBridgeBoredBasicDataApi } = useSWRMutation(
    "/basic-datum",
    reqDelBridgeBoredBasicData,
  )

  const [tableList, setTableList] = React.useState<BridgeBoredBasicData[]>([])

  const getBaseFormListData = async () => {
    const res = await getBridgeBoredBasicDataApi({
      ebs_id: ctx.ebsItem.id,
      project_id: PROJECT_ID,
      engineering_listing_id: ctx.ebsItem.engineering_listing_id!,
    })
    setTableList(res || [])
  }

  React.useEffect(() => {
    getBaseFormListData()
  }, [])

  const { trigger: getDictionaryApi } = useSWRMutation("/dictionary", reqGetDictionary)

  const [dictionaryListOptions, setDictionaryListOptions] = React.useState<DictionaryData[]>([])

  const getDictionary = async () => {
    const res = await getDictionaryApi({ class_id: BASIC_DICTIONARY_CLASS_ID })
    setDictionaryListOptions(res || [])
  }

  function findDictionaryItem(id: number): string {
    const item = dictionaryListOptions.find((item) => item.id == id)
    return item ? item.properties : "[]"
  }

  React.useEffect(() => {
    getDictionary()
  }, [])

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
      getBaseFormListData()
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
    getBaseFormListData()
  }

  return (
    <>
      <div className="flex justify-end">
        <Button
          variant="contained"
          className="bg-railway_blue"
          startIcon={<AddOutlinedIcon />}
          style={displayWithPermission(permissionTagList, permissionJson.structure_member_write)}
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
              tableList.map((row: BridgeBoredBasicData) => (
                <TableRow key={row.id}>
                  <TableCell align="left">{renderBaseCell(row, columns[0].key)}</TableCell>
                  <TableCell align="left">{renderBaseCell(row, columns[1].key)}</TableCell>
                  <TableCell align="left">{renderBaseCell(row, columns[2].key)}</TableCell>
                  <TableCell align="left">{renderCellType(row)}</TableCell>
                  <TableCell align="left">{renderConstruction(row)}</TableCell>
                  <TableCell align="left">{renderCellDrillMode(row)}</TableCell>
                  <TableCell align="left">{renderBaseCell(row, columns[6].key)}</TableCell>

                  <TableCell align="left">
                    <div className="flex justify-start">
                      <IconButton
                        style={displayWithPermission(
                          permissionTagList,
                          permissionJson.structure_member_update,
                        )}
                        onClick={() => {
                          handleEditBridgeWithDrawer(row)
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
