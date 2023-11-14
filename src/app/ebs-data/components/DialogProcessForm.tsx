import React from "react"
import { Dialog, DialogContent, DialogTitle, IconButton } from "@mui/material"
import Table from "@mui/material/Table"
import TableHead from "@mui/material/TableHead"
import TableRow from "@mui/material/TableRow"
import TableCell from "@mui/material/TableCell"
import TableBody from "@mui/material/TableBody"
import useSWR from "swr"
import { reqGetProcessForm } from "@/app/ebs-data/api"
import { ProcessListData, ProcessRoleData, TypeEBSDataList } from "@/app/ebs-data/types"
import { LayoutContext } from "@/components/LayoutContext"
import ebsDataContext from "@/app/ebs-data/context/ebsDataContext"

type Props = {
  open: boolean
  handleCloseDialogAddForm: () => void
  item: ProcessListData & any
}

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
    title: "表单名称",
    dataIndex: "name",
    key: "name",
    align: "left",
  },
  {
    title: "角色",
    dataIndex: "duration",
    key: "duration",
    align: "left",
  },
  {
    title: "是否循环工序",
    dataIndex: "identifying",
    key: "identifying",
    align: "left",
  },

  {
    width: "150px",
    title: "操作",
    key: "action",
  },
]

const renderTableCellRole = (arr: ProcessRoleData[]) => {
  return arr.map((item) => item.flag_name).join(",")
}

export default function DialogProcessForm(props: Props) {
  const { open, handleCloseDialogAddForm, item } = props

  const { projectId: PROJECT_ID } = React.useContext(LayoutContext)

  const ctx = React.useContext(ebsDataContext)

  const { data: tableList, mutate: mutateTableList } = useSWR(
    () => (item.id ? `/process-form?process_id =${item.id}` : null),
    (url: string) =>
      reqGetProcessForm(url, {
        arg: {
          process_id: +item.id,
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

  return (
    <>
      <Dialog
        onClose={handleCloseDialogAddForm}
        open={open}
        sx={{ zIndex: 1700 }}
        className="custom">
        <DialogTitle>工序名称:{item.name}</DialogTitle>
        <div className="px-6">
          <span className="mr-3">工作量：{item.percentage}%</span>
          <span>标识：{renderTableCellStage(item)}</span>
        </div>
        <DialogContent sx={{ width: "80vw", height: "80vh" }}>
          <div>
            <header></header>
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
                      <TableCell align="left">{renderTableCellRole(row.roles)}</TableCell>
                      <TableCell align="left">{row.desc}</TableCell>
                      <TableCell align="left">
                        <div className="flex justify-start"></div>
                      </TableCell>
                    </TableRow>
                  ))}
              </TableBody>
            </Table>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
