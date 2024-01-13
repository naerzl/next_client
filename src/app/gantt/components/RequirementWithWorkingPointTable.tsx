import React from "react"
import { Menu } from "@mui/material"
import Table from "@mui/material/Table"
import TableHead from "@mui/material/TableHead"
import TableRow from "@mui/material/TableRow"
import TableCell from "@mui/material/TableCell"
import TableBody from "@mui/material/TableBody"
import { CONCRETE_DICTIONARY_CLASS_ID } from "@/app/ebs-data/const"
import { dayJsToStr, intoDoubleFixed3 } from "@/libs/methods"
import { MaterialDemandItemListData, MaterialDemandListData } from "@/app/material-demand/types"
import { MaterialLossCoefficientListData } from "@/app/material-loss-coefficient/types"
import useSWRMutationHooks from "@/app/gantt/hooks/useSWRMutationHooks"
import { LayoutContext } from "@/components/LayoutContext"
import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown"
import ArrowRightIcon from "@mui/icons-material/ArrowRight"
import { DictionaryData } from "@/app/material-approach/types"

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
  unitIndex: number
  // eslint-disable-next-line no-unused-vars
  handleTableExpand: (index: number, isExpand: boolean, unitIndex: number) => void
}

function findDictionaryItem(arr: DictionaryData[], id: number) {
  return arr.find((dic) => dic.id == id)
}

function findConstUnitWithDictionary(str?: string) {
  if (!str) return ""
  const arr: { key: string; value: string }[] | any = JSON.parse(str || "[]")

  const obj = arr.find((item: any) => item.key == "常用单位")
  return obj ? obj.value : ""
}

export default function RequirementWithWorkingPointTable(props: Props) {
  const { requirementList, requirementItemList, handleTableExpand, unitIndex } = props

  const { projectId: PROJECT_ID } = React.useContext(LayoutContext)

  const { getMaterialLossCoefficientApi } = useSWRMutationHooks()

  const [menuLossCoefficientLists, setMenuLossCoefficientLists] = React.useState<
    MaterialLossCoefficientListData[]
  >([])

  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null)
  const openMenu = Boolean(anchorEl)

  const handleCloseMenu = () => {
    setAnchorEl(null)
  }

  const handleClickLossCoefficient = async (
    event: React.MouseEvent<HTMLDivElement>,
    index: number,
  ) => {
    let row = requirementItemList[index]
    if (row.class == "incremental") {
      setAnchorEl(event.currentTarget)
      const res = await getMaterialLossCoefficientApi({
        engineering_listing_id: requirementList.engineering_listing_id,
        ebs_id: row.ebs_id,
        code: row.material_loss_coefficient!.code,
        project_id: PROJECT_ID,
      })
      setMenuLossCoefficientLists(res.items)
    }
  }

  const handleMainExpand = async (index: number, isExpand: boolean) => {
    handleTableExpand(index, isExpand, unitIndex)
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
                    <TableRow key={index}>
                      <TableCell colSpan={8} style={{ padding: 0 }}>
                        <Table sx={{ minWidth: 650 }}>
                          <TableBody>
                            <TableRow className="grid-cols-8 grid">
                              <TableCell align="center" scope="row">
                                {row.ebs_desc}
                              </TableCell>
                              <TableCell align="center">
                                {
                                  <div>
                                    <span>{row.dictionary?.dictionary_class?.name}</span>
                                    {row.class == "incremental" && (
                                      <React.Fragment>
                                        {row.isExpand ? (
                                          <ArrowDropDownIcon
                                            className="cursor-pointer"
                                            onClick={() => {
                                              handleMainExpand(index, false)
                                            }}
                                          />
                                        ) : (
                                          <ArrowRightIcon
                                            className="cursor-pointer"
                                            onClick={() => {
                                              handleMainExpand(index, true)
                                            }}
                                          />
                                        )}
                                      </React.Fragment>
                                    )}
                                  </div>
                                }
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
                                  className="cursor-pointer"
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
                            {row.isExpand && (
                              <React.Fragment>
                                {row.class == "incremental" &&
                                  row.isExpand &&
                                  row.incremental &&
                                  row.incremental.map((inc, incIndex) => (
                                    <TableRow
                                      className="grid-cols-8 grid bg-[#f2f2f2]"
                                      key={incIndex}>
                                      <TableCell align="center"></TableCell>
                                      <TableCell
                                        align="center"
                                        onClick={(event) => {
                                          handleClickLossCoefficient(event, index)
                                        }}>
                                        <div>额外增量：{inc.quantity}</div>
                                        {inc.name}
                                      </TableCell>
                                      <TableCell
                                        align="center"
                                        onClick={(event) => {
                                          handleClickLossCoefficient(event, index)
                                        }}>
                                        {findConstUnitWithDictionary(
                                          findDictionaryItem(inc.dictionaryList, inc.dictionary_id)
                                            ?.properties,
                                        )}
                                      </TableCell>
                                      <TableCell
                                        align="center"
                                        onClick={(event) => {
                                          handleClickLossCoefficient(event, index)
                                        }}>
                                        -
                                      </TableCell>
                                      <TableCell
                                        align="center"
                                        onClick={(event) => {
                                          handleClickLossCoefficient(event, index)
                                        }}>
                                        {
                                          findDictionaryItem(inc.dictionaryList, inc.dictionary_id)
                                            ?.name
                                        }
                                      </TableCell>
                                      <TableCell
                                        align="center"
                                        onClick={(event) => {
                                          handleClickLossCoefficient(event, index)
                                        }}>
                                        {row.loss_coefficient}
                                      </TableCell>
                                      <TableCell align="center">{inc.quantity}</TableCell>
                                      <TableCell align="center"></TableCell>
                                    </TableRow>
                                  ))}
                              </React.Fragment>
                            )}
                          </TableBody>
                        </Table>
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
                                {
                                  <div>
                                    <span>{row.dictionary?.dictionary_class?.name}</span>
                                    {row.isExpand ? (
                                      <ArrowDropDownIcon
                                        className="cursor-pointer"
                                        onClick={() => {
                                          handleMainExpand(index, false)
                                        }}
                                      />
                                    ) : (
                                      <ArrowRightIcon
                                        className="cursor-pointer"
                                        onClick={() => {
                                          handleMainExpand(index, true)
                                        }}
                                      />
                                    )}
                                  </div>
                                }
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
                            {row.isExpand && (
                              <React.Fragment>
                                {row.class == "incremental" &&
                                  row.isExpand &&
                                  row.incremental &&
                                  row.incremental.map((inc, incIndex) => (
                                    <TableRow
                                      className="grid-cols-8 grid bg-[#f2f2f2]"
                                      key={incIndex}>
                                      <TableCell align="center"></TableCell>
                                      <TableCell
                                        align="center"
                                        onClick={(event) => {
                                          handleClickLossCoefficient(event, index)
                                        }}>
                                        <div>额外增量：{inc.quantity}</div>
                                        {inc.name}
                                      </TableCell>
                                      <TableCell
                                        align="center"
                                        onClick={(event) => {
                                          handleClickLossCoefficient(event, index)
                                        }}>
                                        {findConstUnitWithDictionary(
                                          findDictionaryItem(inc.dictionaryList, inc.dictionary_id)
                                            ?.properties,
                                        )}
                                      </TableCell>
                                      <TableCell
                                        align="center"
                                        onClick={(event) => {
                                          handleClickLossCoefficient(event, index)
                                        }}>
                                        -
                                      </TableCell>
                                      <TableCell
                                        align="center"
                                        onClick={(event) => {
                                          handleClickLossCoefficient(event, index)
                                        }}>
                                        {
                                          findDictionaryItem(inc.dictionaryList, inc.dictionary_id)
                                            ?.name
                                        }
                                      </TableCell>
                                      <TableCell
                                        align="center"
                                        onClick={(event) => {
                                          handleClickLossCoefficient(event, index)
                                        }}>
                                        {row.loss_coefficient}
                                      </TableCell>
                                      <TableCell align="center">{inc.quantity}</TableCell>
                                      <TableCell align="center"></TableCell>
                                    </TableRow>
                                  ))}
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
                              </React.Fragment>
                            )}
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

      {openMenu && (
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
                {menuLossCoefficientLists.map((row, index) => (
                  <TableRow key={index}>
                    <TableCell align="center">{row.name}</TableCell>
                    <TableCell align="center">
                      {row.project_loss_coefficient
                        ? row.project_loss_coefficient.loss_coefficient
                        : row.loss_coefficient}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </Menu>
      )}
    </>
  )
}
