import React from "react"
import { DialogContent, Menu } from "@mui/material"
import Table from "@mui/material/Table"
import TableHead from "@mui/material/TableHead"
import TableRow from "@mui/material/TableRow"
import TableCell from "@mui/material/TableCell"
import TableBody from "@mui/material/TableBody"
import { CONCRETE_DICTIONARY_CLASS_ID } from "@/app/ebs-data/const"
import { dayJsToStr, intoDoubleFixed3 } from "@/libs/methods"
import { MaterialDemandItemListData, MaterialDemandListData } from "@/app/material-demand/types"

const columns = [
  {
    title: "工程部位",
    key: "index",
  },
  {
    title: "物资名称",
    key: "name",
  },
  {
    title: "规格型号",
    key: "规格型号",
  },
  {
    title: "设计用量",
    key: "identifying",
  },
  {
    title: "计量单位",
    key: "计量单位",
  },
  {
    title: "损耗系数%",
    key: "损耗系数%",
  },
  {
    title: "需用数量",
    key: "需用数量",
  },
  {
    title: "计划使用时间",
    key: "计划使用时间",
  },
]

type Props = {
  requirementItemList: MaterialDemandItemListData[]
  requirementList: MaterialDemandListData
}

function findConstUnitWithDictionary(str: string) {
  const arr: { key: string; value: string }[] | any = JSON.parse(str || "[]")

  const obj = arr.find((item: any) => item.key == "常用单位")
  return obj ? obj.value : ""
}

export default function RequirementWithWorkingPointTable(props: Props) {
  const { requirementList, requirementItemList } = props

  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null)
  const openMenu = Boolean(anchorEl)

  const handleCloseMenu = () => {
    setAnchorEl(null)
  }

  const handleClickLossCoefficient = (event: React.MouseEvent<HTMLDivElement>, index: number) => {
    setAnchorEl(event.currentTarget)
  }

  return (
    <>
      <div className="px-6 flex justify-between items-center">
        <div className="flex gap-x-3.5">
          <span>工点数据名称：{requirementList?.project_si.name}</span>
          <span>状态：{requirementList.status == "confirmed" ? "已确认" : "待确认"}</span>
        </div>
        <div></div>
      </div>
      <div className="h-full overflow-hidden relative">
        <div className="h-full overflow-y-auto custom-scroll-bar">
          <Table sx={{ minWidth: 650 }} aria-label="simple table" stickyHeader>
            <TableHead sx={{ position: "sticky", top: "0", zIndex: 5 }}>
              <TableRow className="grid-cols-8 grid">
                {columns.map((col) => (
                  <TableCell align="center" key={col.key}>
                    {col.title}
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {requirementItemList.length > 0 &&
                requirementItemList.map((row, index) => {
                  return row.dictionary?.dictionary_class_id != CONCRETE_DICTIONARY_CLASS_ID ? (
                    <TableRow key={index} className="grid-cols-8 grid">
                      <TableCell align="center" scope="row">
                        {row.ebs_desc}
                      </TableCell>
                      <TableCell align="center">{row.dictionary?.dictionary_class?.name}</TableCell>
                      <TableCell align="center">{row.dictionary?.name}</TableCell>
                      <TableCell align="center">
                        {intoDoubleFixed3(row.design_usage / 1000)}
                      </TableCell>
                      <TableCell align="center">
                        {findConstUnitWithDictionary(row.dictionary?.properties)}
                      </TableCell>
                      <TableCell align="center">
                        <div
                          onClick={(event) => {
                            handleClickLossCoefficient(event, index)
                          }}>
                          {row.loss_coefficient}
                        </div>
                      </TableCell>
                      <TableCell align="center">
                        {intoDoubleFixed3(row.actual_usage / 1000)}
                      </TableCell>
                      <TableCell align="center">
                        {dayJsToStr(row.planned_usage_at, "YYYY-MM-DD")}
                      </TableCell>
                    </TableRow>
                  ) : (
                    <TableRow key={index}>
                      <TableCell colSpan={8} style={{ padding: 0 }}>
                        <Table sx={{ minWidth: 650 }}>
                          <TableBody>
                            {/* 混凝土列*/}
                            <TableRow className="grid-cols-8 grid">
                              <TableCell align="center" scope="row">
                                {row.ebs_desc}
                              </TableCell>
                              <TableCell align="center">
                                {row.dictionary?.dictionary_class?.name}
                              </TableCell>
                              <TableCell align="center">{row.dictionary?.name}</TableCell>
                              <TableCell align="center">
                                {intoDoubleFixed3(row.design_usage / 1000)}
                              </TableCell>
                              <TableCell align="center">
                                {findConstUnitWithDictionary(row.dictionary?.properties)}
                              </TableCell>
                              <TableCell align="center">
                                <div
                                  onClick={(event) => {
                                    handleClickLossCoefficient(event, index)
                                  }}>
                                  {row.loss_coefficient}
                                </div>
                              </TableCell>
                              <TableCell align="center">
                                {intoDoubleFixed3(row.actual_usage / 1000)}
                              </TableCell>
                              <TableCell align="center">
                                {dayJsToStr(row.planned_usage_at, "YYYY-MM-DD")}
                              </TableCell>
                            </TableRow>
                            {row.proportions?.map((subRow, subIndex) => (
                              <TableRow
                                className="grid-cols-8 grid"
                                key={subIndex}
                                sx={{
                                  bgcolor: "#f2f2f2",
                                  border: "1px dashed #e0e0e0",
                                  "th,td": { border: "none" },
                                }}>
                                <TableCell component="th" scope="row"></TableCell>
                                <TableCell align="center">
                                  {subRow.dictionary?.dictionary_class?.name}
                                </TableCell>
                                <TableCell align="center">{subRow.dictionaryName}</TableCell>
                                <TableCell align="center">-</TableCell>
                                <TableCell align="center">
                                  {subRow.id &&
                                    findConstUnitWithDictionary(subRow.dictionary?.properties)}
                                </TableCell>
                                <TableCell align="center">
                                  <div>{subRow.loss_coefficient}</div>
                                </TableCell>
                                <TableCell align="center">
                                  {intoDoubleFixed3(subRow.actual_usage / 1000)}
                                </TableCell>
                                <TableCell align="center">
                                  {dayJsToStr(subRow.planned_usage_at, "YYYY-MM-DD")}
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </TableCell>
                    </TableRow>
                  )
                })}
            </TableBody>
          </Table>
        </div>
      </div>

      <Menu
        sx={{ zIndex: 1700 }}
        anchorEl={anchorEl}
        open={openMenu}
        onClose={handleCloseMenu}
        MenuListProps={{
          "aria-labelledby": "basic-button",
          sx: { zIndex: 1700, width: "500px" },
        }}>
        <div className="max-h-[500px] overflow-y-auto w-full">
          <Table>
            <TableHead>
              <TableRow>
                <TableCell align="center">损耗系数名称</TableCell>
                <TableCell align="center">损耗系数</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              <TableRow>
                <TableCell align="center">钢筋加工小型成品</TableCell>
                <TableCell align="center">123</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </div>
      </Menu>
    </>
  )
}
