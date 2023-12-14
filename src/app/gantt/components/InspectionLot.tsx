"use client"
import { Button, Divider } from "@mui/material"
import React from "react"
import useSWRMutation from "swr/mutation"
import { reqGetExportInspectionLot } from "@/app/gantt/api"
import { LayoutContext } from "@/components/LayoutContext"
import GanttContext from "@/app/gantt/context/ganttContext"
import { FILE_NAME } from "@/app/gantt/const"
import { message } from "antd"

const INDEX_ARR = [1, 7, 4, 10, 11, 12, 13]
export default function InspectionLot() {
  const { projectId: PROJECT_ID } = React.useContext(LayoutContext)

  const ctx = React.useContext(GanttContext)

  const { trigger: getExportInspectionLotApi } = useSWRMutation(
    "/export-inspection-lot",
    reqGetExportInspectionLot,
  )

  const [selectFile, setSelectFile] = React.useState("")

  const [isMultiple, setIsMultiple] = React.useState(false)

  const [multipleState, setMultipleState] = React.useState<number[]>([])

  const getExportInspectionLotListData = (classNum: number) => {
    return getExportInspectionLotApi({
      project_id: PROJECT_ID,
      ebs_id: parseInt(ctx.ebsItem.id),
      project_si_id: Number(ctx.ebsItem.siId.substring(1)),
      project_sp_id: Number(ctx.ebsItem.spId.substring(1)),
      class: classNum,
    })
  }

  const handleClickFile = (fileName: string, index: number) => {
    setSelectFile(fileName)
    if (isMultiple) {
      if (multipleState.includes(index)) {
        setMultipleState((prevState) => prevState.filter((num) => num != index))
      } else {
        setMultipleState((prevState) => [...prevState, index])
      }
    }
  }

  const handleExport = async () => {
    if (isMultiple) {
      if (multipleState.length <= 0) return message.error("请选择导出文件")
      await Promise.all(multipleState.map((num) => getExportInspectionLotListData(num + 1)))
      message.success("已加入导出队列，请到’导出管理下载该文件")
    } else {
      if (selectFile == "") return message.error("请选择导出文件")
      await getExportInspectionLotListData(FILE_NAME.indexOf(selectFile) + 1)
      message.success("已加入导出队列，请到’导出管理下载该文件")
    }
  }

  return (
    <div className="w-full p-10 h-full relative flex overflow-hidden flex-col">
      <header className="text-3xl text-[#44566C] mb-8">
        <div className="flex justify-between">
          <div>文件名称</div>
          <div>
            <Button
              variant="text"
              disabled
              onClick={() => {
                setIsMultiple((prevState) => !prevState)
              }}>
              {isMultiple ? "取消" : "批量导出"}
            </Button>
          </div>
        </div>
        <Divider sx={{ my: 1.5 }} />
      </header>
      <div className="flex-1 flex overflow-hidden">
        <div className="flex-1 flex flex-col overflow-hidden gap-y-3">
          <ul className="flex-1 overflow-auto custom-scroll-bar">
            {FILE_NAME.map((str, index) => (
              <li
                key={index}
                className={`mb-3 ${
                  INDEX_ARR.includes(index + 1) ? "cursor-not-allowed" : "cursor-pointer"
                } flex items-center  ${
                  selectFile == str ? "text-railway_blue" : "text-railway_303"
                }`}
                style={INDEX_ARR.includes(index + 1) ? { color: "#ebeced" } : {}}
                onClick={() => {
                  if (INDEX_ARR.includes(index + 1)) return
                  handleClickFile(str, index)
                }}>
                {isMultiple && (
                  <span>
                    {multipleState.includes(index) ? (
                      <i
                        className="w-4 h-4 border bg-railway_blue cursor-pointer inline-block"
                        onClick={() => {
                          setMultipleState((prevState) => prevState.filter((num) => num != index))
                        }}></i>
                    ) : (
                      <i
                        className="w-4 h-4 border cursor-pointer inline-block"
                        onClick={() => {
                          setMultipleState((prevState) => [...prevState, index])
                        }}></i>
                    )}
                  </span>
                )}
                <i
                  className={`iconfont icon-format-xlsx ${
                    INDEX_ARR.includes(index + 1) ? "text-[#ebeced]" : "text-[#039e55]"
                  } text-xl`}></i>
                <span>{str}</span>
              </li>
            ))}
          </ul>
          <div>
            <Button
              variant="contained"
              className="bg-railway_blue"
              onClick={() => {
                handleExport()
              }}>
              导出
            </Button>
          </div>
        </div>
        <div className="flex-1"></div>
      </div>
    </div>
  )
}
