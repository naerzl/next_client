"use client"
import React from "react"
import { Button, Divider, IconButton } from "@mui/material"
import Table from "@mui/material/Table"
import TableHead from "@mui/material/TableHead"
import TableRow from "@mui/material/TableRow"
import TableCell from "@mui/material/TableCell"
import TableBody from "@mui/material/TableBody"
import useDialogProcessForm from "@/app/gantt/hooks/useDialogProcessForm"
import DialogProcessForm from "@/app/gantt/components/DialogProcessForm"
import ganttContext from "@/app/gantt/context/ganttContext"
import useSWRMutation from "swr/mutation"
import { reqGetProcess } from "@/app/ebs-data/api"
import { LayoutContext } from "@/components/LayoutContext"
import { ProcessListData } from "@/app/ebs-data/types"
import dayjs from "dayjs"
import { useConfirmationDialog } from "@/components/ConfirmationDialogProvider"
import { reqPostProcessDataCollectionGenerate } from "@/app/gantt/api"
import { message } from "antd"

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
  const ctx = React.useContext(ganttContext)

  const { projectId: PROJECT_ID } = React.useContext(LayoutContext)

  const { trigger: getProcessApi } = useSWRMutation("/process", reqGetProcess)

  const { trigger: postProcessDataCollectionGenerateApi } = useSWRMutation(
    "/process-data-collection/generate",
    reqPostProcessDataCollectionGenerate,
  )

  const [tableList, setTableList] = React.useState<ProcessListData[]>([])

  const getProcessListData = async () => {
    let tagsArr = JSON.parse(ctx.ebsItem.tags)

    let paramsTags =
      tagsArr.length > 0 ? JSON.stringify([tagsArr[tagsArr.length - 1]]) : JSON.stringify([""])

    const res = await getProcessApi({
      tags: paramsTags,
      project_id: PROJECT_ID,
      engineering_listing_id: ctx.ebsItem.engineering_listing_id,
      ebs_id: parseInt(ctx.ebsItem.id),
    })
    setTableList(res)
  }

  React.useEffect(() => {
    getProcessListData()
  }, [])

  const { handleCloseDialogAddForm, dialogAddFormOpen, formItem } = useDialogProcessForm()

  const { showConfirmationDialog } = useConfirmationDialog()

  const handlePushMessage = () => {
    const _handle = async () => {
      await postProcessDataCollectionGenerateApi({
        project_id: PROJECT_ID,
        project_sp_id: Number(ctx.ebsItem.spId.substring(1)),
        project_si_id: Number(ctx.ebsItem.siId.substring(1)),
      })
      message.success("推送成功")
    }

    if (dayjs(Date.now()).unix() > dayjs(ctx.ebsItem.end_date).unix()) {
      showConfirmationDialog("工程结构结束时间已过，确认发送消息？", () => {
        _handle()
      })
    } else {
      _handle()
    }
  }

  return (
    <div className="w-full p-10 h-full relative flex overflow-hidden flex-col">
      <header className="text-3xl text-[#44566C] mb-8">
        <div className="flex justify-between">
          <div>节点名称：{ctx.ebsItem.name}</div>
          <div>
            <Button
              className="bg-railway_blue"
              variant="contained"
              onClick={() => {
                handlePushMessage()
              }}>
              消息推送
            </Button>
          </div>
        </div>
        <Divider sx={{ my: 1.5 }} />
      </header>
      <div style={{ width: "100%", paddingBottom: "38px", flex: 1, overflow: "auto" }}>
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
                  <TableCell align="left">
                    {row.projectProcess && row.projectProcess.percentage}
                  </TableCell>
                  <TableCell align="left">
                    {renderTableCellStage(row.projectProcess && row.projectProcess.stage)}
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
