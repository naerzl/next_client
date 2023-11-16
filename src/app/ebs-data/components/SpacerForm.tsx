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
import { reqDelSpacerData, reqGetDictionary, reqGetSpacerData } from "@/app/ebs-data/api"
import { AcousticTubeListData, DictionaryData, RebarData } from "@/app/ebs-data/types"
import AddOutlinedIcon from "@mui/icons-material/AddOutlined"
import { Connect_method_enum, SPACER_DICTIONARY_CLASS_ID } from "@/app/ebs-data/const"
import useSWRMutation from "swr/mutation"
import { LayoutContext } from "@/components/LayoutContext"
import ebsDataContext from "@/app/ebs-data/context/ebsDataContext"
import { useConfirmationDialog } from "@/components/ConfirmationDialogProvider"
import useAddAcousticTubeWithDrawer from "@/app/ebs-data/hooks/useAddAcousticTubeWithDrawer"
import AddSpacer from "@/app/ebs-data/components/AddSpacer"
import { dateToYYYYMM } from "@/libs/methods"
import { renderProperty } from "@/app/ebs-data/const/method"

const columns = [
  {
    title: "规格型号",
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

export default function SpacerForm() {
  const ctx = React.useContext(ebsDataContext)

  const { projectId: PROJECT_ID } = React.useContext(LayoutContext)

  const { trigger: getAcousticTubeDataApi } = useSWRMutation("/material-spacer", reqGetSpacerData)

  const { trigger: delAcousticTubeDataApi } = useSWRMutation("/material-spacer", reqDelSpacerData)

  const { trigger: getDictionaryApi } = useSWRMutation("/dictionary", reqGetDictionary)

  const [dictionaryList, setDictionaryList] = React.useState<DictionaryData[]>([])

  const [tableList, setTableList] = React.useState<AcousticTubeListData[]>([])

  const getSpacerListData = async () => {
    const res = await getAcousticTubeDataApi({
      ebs_id: ctx.ebsItem.id,
      project_id: PROJECT_ID,
      engineering_listing_id: ctx.ebsItem.engineering_listing_id!,
    })
    setTableList(res)
  }

  React.useEffect(() => {
    getSpacerListData()
  }, [])

  const getDictionary = async () => {
    const res = await getDictionaryApi({ class_id: SPACER_DICTIONARY_CLASS_ID })
    setDictionaryList(res || [])
  }

  React.useEffect(() => {
    getDictionary()
  }, [])

  function findDictionaryName(value: number) {
    const dictionaryItem = dictionaryList.find((item) => item.id == value)
    console.log(dictionaryItem, dictionaryList, value)
    return dictionaryItem ? renderProperty(dictionaryItem.properties) : ""
  }

  const {
    handleOpenAddAcousticTubeWithDrawer,
    editItem,
    open: addAcousticTubeOpen,
    handleCloseAddAcousticTubeWithDrawer,
    handleEditAcousticTubeWithDrawer,
  } = useAddAcousticTubeWithDrawer()

  const { showConfirmationDialog } = useConfirmationDialog()

  const handleDelProcessWithSWR = (id: number) => {
    showConfirmationDialog("确定删除吗？", async () => {
      await delAcousticTubeDataApi({
        id,
        project_id: PROJECT_ID,
        ebs_id: ctx.ebsItem.id,
        engineering_listing_id: ctx.ebsItem.engineering_listing_id!,
      })
      getSpacerListData()
    })
  }

  const handleAddOrEditBridgeCallBack = async (item: AcousticTubeListData, isAdd: boolean) => {
    const newData = structuredClone(tableList)
    if (isAdd) {
      newData?.push(item)
    } else {
      const index = newData!.findIndex((el) => item.id == el.id)
      newData![index] = item
    }
    getSpacerListData()
  }

  return (
    <>
      <div className="flex justify-end">
        <Button
          variant="contained"
          className="bg-railway_blue"
          startIcon={<AddOutlinedIcon />}
          onClick={() => {
            handleOpenAddAcousticTubeWithDrawer()
          }}>
          新建垫块数量表
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
              tableList.map((row: AcousticTubeListData, index: number) => (
                <TableRow key={row.id}>
                  <TableCell component="th" scope="row">
                    {findDictionaryName(row.dictionary_id)}
                  </TableCell>
                  <TableCell component="th" scope="row">
                    {row.quantity / 1000}
                  </TableCell>
                  <TableCell align="left">{dateToYYYYMM(row.created_at)}</TableCell>
                  <TableCell align="left">
                    <div className="flex justify-start">
                      <IconButton
                        onClick={() => {
                          handleEditAcousticTubeWithDrawer(row)
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
      {addAcousticTubeOpen && (
        <AddSpacer
          open={addAcousticTubeOpen}
          handleCloseAddBridgeWithDrawer={handleCloseAddAcousticTubeWithDrawer}
          cb={handleAddOrEditBridgeCallBack}
          editItem={editItem}
        />
      )}
    </>
  )
}
