"use client"
import React from "react"
import { Button, Divider, IconButton, MenuItem, Select, TextField } from "@mui/material"
import Table from "@mui/material/Table"
import TableHead from "@mui/material/TableHead"
import TableRow from "@mui/material/TableRow"
import TableCell from "@mui/material/TableCell"
import TableBody from "@mui/material/TableBody"
import useDialogProcessForm from "@/app/ebs-data/hooks/useDialogProcessForm"
import DialogProcessForm from "@/app/ebs-data/components/DialogProcessForm"
import { ProcessListData } from "@/app/ebs-data/types"
import ebsDataContext from "@/app/ebs-data/context/ebsDataContext"
import useSWRMutation from "swr/mutation"
import EditIcon from "@mui/icons-material/Edit"
import { reqGetProcess, reqPutProjectProcess } from "@/app/ebs-data/api"
import { LayoutContext } from "@/components/LayoutContext"
import { useSearchParams } from "next/navigation"
import { message } from "antd"

const stageEnum = [
  {
    label: "开始",
    value: 1,
  },
  {
    label: "结束",
    value: 3,
  },
]

type ProcessesType = {
  percentage: string
  process_id: number
  stage: number
}

function renderTableCellStage(stage: number | null) {
  return stageEnum.find((el) => el.value == stage)?.label
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
    title: "阶段",
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
    align: "left",
    title: "关联表单名称",
    dataIndex: "关联表单名称",
    key: "关联表单名称",
  },
  {
    align: "left",
    title: "是否循环",
    dataIndex: "是否循环",
    key: "是否循环",
  },
  {
    align: "left",
    title: "关联角色",
    dataIndex: "关联角色",
    key: "关联角色",
  },
]

function averageTo100(arr: ProcessListData[]) {
  if (arr.length <= 0 || arr[0].projectProcess) return arr
  let len = arr.length

  if (len == 0) return arr

  let superfluous = 100 % len

  let averageValue = parseInt((100 / len).toString())

  return arr.map((item, index) => {
    if (index == len - 1) {
      return { ...item, projectProcess: { percentage: averageValue + superfluous, stage: 2 } }
    }
    return { ...item, projectProcess: { percentage: averageValue, stage: 2 } }
  })
}

type RenderFormType = "name" | "is_loop" | "roles"

function renderForm(formList: any[] | null, type: RenderFormType) {
  if (!formList) return <ul></ul>

  switch (type) {
    case "name":
      return (
        <ul>
          {formList.map((item) => (
            <li key={item.id}>{item[type]}</li>
          ))}
        </ul>
      )
    case "is_loop":
      return (
        <ul>
          {formList.map((item) => (
            <li key={item.id}>{item[type] == 1 ? "是" : "否"}</li>
          ))}
        </ul>
      )
    case "roles":
      const renderRoles = (roles: any[] | null) => {
        if (!roles) return ""

        return roles.map((item) => item.flag_name).join(",")
      }

      return (
        <ul>
          {formList.map((item) => (
            <li key={item.id}>{renderRoles(item.roles)}</li>
          ))}
        </ul>
      )
  }
}

export default function ProcessList() {
  const { projectId: PROJECT_ID } = React.useContext(LayoutContext)

  const ctx = React.useContext(ebsDataContext)

  const searchParams = useSearchParams()

  const { trigger: getProcessApi } = useSWRMutation("/process", reqGetProcess)

  const { trigger: putProjectProcessApi } = useSWRMutation("/project-process", reqPutProjectProcess)

  const [tableList, setTableList] = React.useState<ProcessListData[]>([])

  const [editTableState, setEditeTableState] = React.useState<ProcessesType[]>([])

  const initTableState = React.useRef<ProcessesType[]>([])

  const getProcessListData = async () => {
    let tagsArr = JSON.parse(ctx.ebsItem.tags)

    let paramsTags =
      tagsArr.length > 0 ? JSON.stringify([tagsArr[tagsArr.length - 1]]) : JSON.stringify([""])

    const res = await getProcessApi({
      tags: paramsTags,
      project_id: PROJECT_ID,
      engineering_listing_id: +searchParams.get("baseId")!,
      ebs_id: ctx.ebsItem.id,
    })
    const changeRes = averageTo100(res)
    setTableList(changeRes as any)

    let mapRes: ProcessesType[] = changeRes.map((item) => ({
      process_id: item.id,
      percentage: item.projectProcess ? item.projectProcess.percentage.toString() : "",
      stage: item.projectProcess ? item.projectProcess.stage : 2,
    }))
    setEditeTableState(mapRes)
    initTableState.current = mapRes
  }

  React.useEffect(() => {
    getProcessListData()
  }, [])

  const { handleOpenDialogAddForm, handleCloseDialogAddForm, dialogAddFormOpen, formItem } =
    useDialogProcessForm()

  const [editTable, setEditTable] = React.useState(false)

  const handleClickSave = async () => {
    const sum = editTableState.reduce((previousValue, currentValue) => {
      return previousValue + Number(currentValue.percentage)
    }, 0)

    if (sum != 100) return message.error("保存失败，工作量已超过100，请重新设置")

    await putProjectProcessApi({
      project_id: PROJECT_ID,
      engineering_listing_id: +searchParams.get("baseId")!,
      ebs_id: ctx.ebsItem.id,
      processes: JSON.stringify(
        editTableState.map((item) => ({ ...item, percentage: Number(item.percentage) })),
      ),
    })
    setEditTable(false)
    getProcessListData()
  }

  const handleChangeEditTableState = (
    index: number,
    type: keyof ProcessesType,
    value: number | string,
  ) => {
    let newState = structuredClone(editTableState)
    // @ts-ignore
    newState[index][type] = value as any
    setEditeTableState(newState)
  }

  return (
    <div className="w-full p-10">
      <header className="text-3xl text-[#44566C] mb-8">
        <div className="flex justify-between">
          <div>节点名称：{ctx.ebsItem.name}</div>
          <div>
            {editTable ? (
              <Button
                onClick={() => {
                  handleClickSave()
                }}>
                保存
              </Button>
            ) : (
              <IconButton
                onClick={() => {
                  setEditTable(true)
                }}>
                <EditIcon />
              </IconButton>
            )}
          </div>
        </div>
        <Divider sx={{ my: 1.5 }} />
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
              tableList.map((row, rowIndex) => (
                <TableRow key={row.id}>
                  <TableCell align="left">{row.name}</TableCell>
                  <TableCell align="left">
                    {editTable ? (
                      <TextField
                        size="small"
                        type="number"
                        value={editTableState[rowIndex].percentage}
                        onChange={(event) => {
                          handleChangeEditTableState(rowIndex, "percentage", event.target.value)
                        }}
                      />
                    ) : (
                      row.projectProcess && row.projectProcess.percentage
                    )}
                  </TableCell>
                  <TableCell align="left">
                    {editTable ? (
                      <Select
                        size="small"
                        value={editTableState[rowIndex].stage ?? 2}
                        className="w-52"
                        onChange={(event) => {
                          handleChangeEditTableState(rowIndex, "stage", +event.target.value)
                        }}
                        MenuProps={{ sx: { zIndex: 1800 } }}>
                        <MenuItem value={2} className="text-railway_gray">
                          请选择一个标识
                        </MenuItem>
                        {stageEnum.map((item) => (
                          <MenuItem key={item.value} value={item.value}>
                            {item.label}
                          </MenuItem>
                        ))}
                      </Select>
                    ) : (
                      renderTableCellStage(row.projectProcess && row.projectProcess.stage)
                    )}
                  </TableCell>
                  <TableCell align="left">{row.desc}</TableCell>
                  <TableCell align="left">{renderForm(row.forms, "name")}</TableCell>
                  <TableCell align="left">{renderForm(row.forms, "is_loop")}</TableCell>
                  <TableCell align="left">{renderForm(row.forms, "roles")}</TableCell>
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
