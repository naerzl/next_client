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
    title: "序号",
    dataIndex: "index",
    key: "index",
    align: "left",
  },
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
    title: "操作",
    key: "action",
  },
]

export default function ProcessList() {
  const ctx = React.useContext(ebsDataContext)

  const { data: tableList, mutate: mutateTableList } = useSWR(
    () => (ctx.ebsItem.id ? `/process?ebs_id=${ctx.ebsItem.id}` : null),
    (url: string) => reqGetProcess(url, { arg: { ebs_id: ctx.ebsItem.id } }),
    {
      revalidateIfStale: false,
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
    },
  )

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
                  <TableCell component="th" scope="row">
                    {index + 1}
                  </TableCell>
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
