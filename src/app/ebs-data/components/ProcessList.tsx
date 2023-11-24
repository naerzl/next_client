"use client"
import React from "react"
import { Divider, IconButton } from "@mui/material"
import Table from "@mui/material/Table"
import TableHead from "@mui/material/TableHead"
import TableRow from "@mui/material/TableRow"
import TableCell from "@mui/material/TableCell"
import TableBody from "@mui/material/TableBody"
import InsertDriveFileOutlinedIcon from "@mui/icons-material/InsertDriveFileOutlined"
import useSWR from "swr"
import { reqGetProcess } from "@/app/ebs-data/api"
import useDialogProcessForm from "@/app/ebs-data/hooks/useDialogProcessForm"
import DialogProcessForm from "@/app/ebs-data/components/DialogProcessForm"
import { ProcessListData } from "@/app/ebs-data/types"
import ebsDataContext from "@/app/ebs-data/context/ebsDataContext"
import useSWRMutation from "swr/mutation"

const stageEnum = [
  {
    label: "开始",
    value: 1,
  },
  {
    label: "",
    value: 2,
  },
  {
    label: "结束",
    value: 3,
  },
]

function renderTableCellStage(item: ProcessListData) {
  return stageEnum.find((el) => el.value == +item.stage)?.label
}

const columns = [
  {
    title: "工序名称",
    dataIndex: "name",
    key: "name",
    align: "left",
  },
  {
    title: "工作量%",
    dataIndex: "duration",
    key: "duration",
    align: "left",
  },
  {
    title: "标识",
    dataIndex: "identifying",
    key: "identifying",
    align: "left",
  },
  {
    align: "left",
    title: "说明",
    dataIndex: "desc",
    key: "desc",
  },

  {
    width: "150px",
    title: "查看",
    key: "action",
  },
]

export default function ProcessList() {
  const ctx = React.useContext(ebsDataContext)

  const { trigger: getProcessApi } = useSWRMutation("/process", reqGetProcess)

  const [tableList, setTableList] = React.useState<ProcessListData[]>([])

  const getProcessListData = async () => {
    // const res = await getProcessApi({ ebs_id: ctx.ebsItem.is_loop_id })
    const res = await getProcessApi({ ebs_id: 1848 })
    setTableList(res)
  }

  React.useEffect(() => {
    getProcessListData()
  }, [])

  const { handleOpenDialogAddForm, handleCloseDialogAddForm, dialogAddFormOpen, formItem } =
    useDialogProcessForm()

  return (
    <div className="w-full p-10">
      <header className="text-3xl text-[#44566C] mb-8">
        <div>节点名称：{ctx.ebsItem.name}</div>
        <Divider sx={{ my: 1.5 }} />
        <div className="flex justify-end"></div>
      </header>
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
              tableList.map((row, index) => (
                <TableRow key={row.id}>
                  <TableCell align="left">{row.name}</TableCell>
                  <TableCell align="left">{row.percentage}</TableCell>
                  <TableCell align="left">{renderTableCellStage(row)}</TableCell>
                  <TableCell align="left">{row.desc}</TableCell>
                  <TableCell align="left">
                    <div className="flex justify-start">
                      <IconButton
                        onClick={() => {
                          handleOpenDialogAddForm(row)
                        }}>
                        <InsertDriveFileOutlinedIcon />
                      </IconButton>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
          </TableBody>
        </Table>
      </div>
      {dialogAddFormOpen && (
        <DialogProcessForm
          open={dialogAddFormOpen}
          handleCloseDialogAddForm={handleCloseDialogAddForm}
          item={formItem}
        />
      )}
    </div>
  )
}
