"use client"
import React from "react"
import {
  Alert,
  Button,
  Dialog,
  DialogContent,
  DialogTitle,
  InputBase,
  Pagination,
  Snackbar,
} from "@mui/material"
import Table from "@mui/material/Table"
import TableHead from "@mui/material/TableHead"
import TableRow from "@mui/material/TableRow"
import TableCell from "@mui/material/TableCell"
import TableBody from "@mui/material/TableBody"
import { LayoutContext } from "@/components/LayoutContext"
import { BaseApiPager } from "@/types/api"
import "dayjs/locale/zh-cn"
import { useRouter } from "next/navigation"
import Loading from "@/components/loading"
import useSWRMutationHooks from "@/app/gantt/hooks/useSWRMutationHooks"
import { useRequest } from "ahooks"
import {
  MaterialProcurementPlanData,
  ProcurementPlanListItemListData,
} from "@/app/material-procurement-plan/types"
import {
  CurrentDate,
  dateToUTCCustom,
  dateToYYYYMM,
  dayJsToStr,
  intoDoubleFixed3,
} from "@/libs/methods"
import Tooltip from "@mui/material/Tooltip"
import { DatePicker } from "antd"
import dayjs from "dayjs"
import Decimal from "decimal.js"
import { message } from "antd"

type Props = {
  open: boolean
  handleCloseDialogAddForm: () => void
  item: MaterialProcurementPlanData | null
  cb: () => void
}

type EditPosStateType = {
  index: number
  fields: string
}

const columns = [
  {
    title: "物资名称",
    key: "物资名称",
  },
  {
    title: "规格型号",
    key: "规格型号",
  },
  {
    title: "质量标准技术要求",
    key: "质量标准技术要求",
  },
  {
    title: "计量单位",
    key: "计量单位",
  },
  {
    title: "计划单价",
    key: "计划单价",
  },
  {
    title: "需用数量",
    key: "需用数量",
  },
  {
    title: "库存数量",
    key: "库存数量",
  },
  {
    title: "储备数量",
    key: "储备数量",
  },
  {
    title: "采购申请数量",
    key: "采购申请数量",
  },
  {
    title: "计划金额",
    key: "计划金额",
  },
  {
    title: "计划进场时间",
    key: "计划进场时间",
  },
  {
    title: "备注",
    key: "备注",
  },
]

function findConstUnitWithDictionary(str?: string) {
  if (!str) return ""
  const arr: { key: string; value: string }[] | any = JSON.parse(str || "[]")

  const obj = arr.find((item: any) => item.key == "常用单位")
  return obj ? obj.value : ""
}

function findConstStandardWithDictionary(str?: string) {
  if (!str) return ""
  const arr: { key: string; value: string }[] | any = JSON.parse(str || "[]")

  const obj = arr.find((item: any) => item.key == "质量标准技术要求")
  return obj ? obj.value : ""
}

export default function AddOrEditProcurementPlan(props: Props) {
  const { open, handleCloseDialogAddForm, item: propsItem, cb } = props

  const { projectId: PROJECT_ID } = React.useContext(LayoutContext)

  const {
    getQueueApi,
    getProjectMaterialPurchaseItemApi,
    putProjectMaterialPurchaseItemApi,
    putProjectMaterialPurchaseApi,
  } = useSWRMutationHooks()

  const [pageState, setPageState] = React.useState<BaseApiPager>({
    page: 1,
    limit: 10,
  } as BaseApiPager)

  const [pager, setPager] = React.useState<BaseApiPager>({} as BaseApiPager)

  const [isLoading, setIsLoading] = React.useState(false)

  const [purchaseItemList, setPurchaseItemList] = React.useState<ProcurementPlanListItemListData[]>(
    [],
  )

  const [editPos, setEditPos] = React.useState<EditPosStateType>({} as EditPosStateType)

  const checkEditPos = (index: number, field: string): boolean => {
    let flag = editPos.index == index && field == editPos.fields

    return flag
  }

  const handleCloseDialog = () => {
    handleCloseDialogAddForm()
  }

  const getPurchaseItemListData = async () => {
    try {
      setIsLoading(true)
      const res = await getProjectMaterialPurchaseItemApi({
        purchase_id: propsItem!.id,
        project_id: PROJECT_ID,
        page: pageState.page,
        limit: pageState.limit,
      })

      const arr = res.items.map<ProcurementPlanListItemListData>((item) => {
        return {
          ...item,
          planned_entry_at: dayJsToStr(item.planned_entry_at, "YYYY-MM-DD"),
          editState: {
            quantity: Decimal.div(item.quantity, 1000).toNumber(),
            plannedEntryAt: dayJsToStr(item.planned_entry_at, "YYYY-MM-DD"),
            plannedUnitPrice: Decimal.div(item.planned_unit_price, 100).toString(),
            desc: item.desc,
          },
        }
      })

      setPurchaseItemList(arr)
      setPager(res.pager)
    } finally {
      setIsLoading(false)
    }
  }

  React.useEffect(() => {
    getPurchaseItemListData()
  }, [pageState])

  const handleChangeEditStateWithPlannedUnitPrice = (index: number, val: string) => {
    console.log(val)
    const cloneList = structuredClone(purchaseItemList)
    const row = cloneList[index]
    row.editState.plannedUnitPrice = val
    row.planned_unit_price = (Number(val) * 100).toString()
    row.planned_price_total = !!val ? Decimal.mul(val, row.quantity).div(10).toNumber() : 0
    setPurchaseItemList(cloneList)
  }

  const handleBlurWithPlannedUnitPrice = async (index: number) => {
    const row = purchaseItemList[index]
    await putProjectMaterialPurchaseItemApi({
      id: row.id,
      purchase_id: propsItem!.id,
      planned_unit_price: row.planned_unit_price,
      planned_entry_at: row.planned_entry_at,
      desc: row.desc,
      quantity: row.quantity,
    })
    setEditPos({} as EditPosStateType)
  }

  const handleChangeEditStateWithQuantity = (index: number, val: number) => {
    const cloneList = structuredClone(purchaseItemList)
    const row = cloneList[index]
    row.editState.quantity = val
    row.quantity = Decimal.mul(val, 1000).toNumber()
    setPurchaseItemList(cloneList)
  }

  const handleChangeEditStateWithPlannedEntryAt = (index: number, val: string) => {
    const cloneList = structuredClone(purchaseItemList)
    const row = cloneList[index]
    if (
      dayjs(val).isAfter(dateToYYYYMM(row.planned_usage_at)) ||
      dayjs(val).isSame(dateToYYYYMM(row.planned_usage_at))
    )
      return message.warning("计划进场时间不能大于需求时间")
    row.editState.plannedEntryAt = val
    row.planned_entry_at = val
    setPurchaseItemList(cloneList)
  }

  const handleChangeEditStateWithDesc = (index: number, val: string) => {
    const cloneList = structuredClone(purchaseItemList)
    const row = cloneList[index]
    row.editState.desc = val
    row.desc = val
    setPurchaseItemList(cloneList)
  }

  const handlePaginationChange = (val: number, type: "page" | "limit") => {
    let clonePage = structuredClone(pageState)
    if (type == "limit") {
      clonePage.page = 1
      clonePage.limit = val
    } else {
      clonePage.page = val
    }
    setPageState(clonePage)
  }

  const handleStartPurchase = async () => {
    await putProjectMaterialPurchaseApi({
      project_id: PROJECT_ID,
      id: propsItem!.id,
      status: "procurement_in_progress",
    })
    cb()
  }

  const handleTurnDown = async () => {
    await putProjectMaterialPurchaseApi({
      project_id: PROJECT_ID,
      id: propsItem!.id,
      status: "rejected",
    })
    handleCloseDialog()
    cb()
  }

  const [openSnackbar, setOpenSnackbar] = React.useState(false)

  const handleCloseSnackbar = () => {
    setOpenSnackbar(false)
  }

  const getQueueList = (id: number) => {
    return getQueueApi({ project_id: PROJECT_ID, class: "material_requirement", id })
  }

  const {
    data: dataQueue,
    run: runQueue,
    cancel: cancelQueue,
  } = useRequest<any, any[]>(getQueueList, {
    pollingInterval: 1000,
    manual: true,
    pollingErrorRetryCount: 1,
  })

  React.useEffect(() => {
    if (dataQueue) {
      cancelQueue()
    }
  }, [dataQueue])

  return (
    <>
      <Dialog
        onClose={() => {
          handleCloseDialog()
        }}
        open={open}
        sx={{ zIndex: 1700, ".MuiPaper-root": { maxWidth: "none" } }}
        className="custom">
        <DialogTitle>
          <div className="flex justify-between items-center">
            <div className="font-bold">
              {CurrentDate.getYear()}年{CurrentDate.getMonth()}月采购申请表
            </div>
            <div>
              <Tooltip
                title="计划单价、采购申请数量、计划进场时间、备注点击数据可进行编辑;"
                sx={{ zIndex: 1701 }}>
                <i className="iconfont icon-bianji cursor-pointer"></i>
              </Tooltip>
              <Button onClick={() => {}}>导出采购计划</Button>
            </div>
          </div>
        </DialogTitle>
        <div className="px-6 flex justify-between items-center">
          <div>
            名称：{CurrentDate.getYear()}年{CurrentDate.getMonth()}月采购申请表
          </div>
        </div>
        <DialogContent sx={{ width: "95vw", height: "80vh" }}>
          {isLoading ? (
            <Loading></Loading>
          ) : (
            <div className="h-full overflow-hidden pb-[4.375rem] relative">
              <div className="h-full overflow-y-auto custom-scroll-bar">
                <Table
                  sx={{ minWidth: 650, ".MuiTableCell-root": { lineHeight: "2rem" } }}
                  aria-label="simple table"
                  stickyHeader>
                  <TableHead sx={{ position: "sticky", top: "0", zIndex: 5 }}>
                    <TableRow className="grid-cols-12 grid">
                      {columns.map((col) => (
                        <TableCell align="center" key={col.key}>
                          {col.title}
                        </TableCell>
                      ))}
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {purchaseItemList.map((row, index) => (
                      <TableRow key={index} className="grid-cols-12 grid">
                        <TableCell align="center">
                          {row.dictionary?.dictionary_class?.name}
                        </TableCell>
                        <TableCell align="center">{row.dictionary?.name}</TableCell>
                        <TableCell align="center">
                          {findConstStandardWithDictionary(row.dictionary?.properties)}
                        </TableCell>
                        <TableCell align="center">
                          {findConstUnitWithDictionary(row.dictionary?.properties)}
                        </TableCell>
                        <TableCell align="center">
                          {checkEditPos(index, "planned_unit_price") &&
                          propsItem!.status == "pending_application" ? (
                            <div>
                              <InputBase
                                autoFocus
                                className="border-b border-[#e0e0e0] text-railway_blue"
                                value={row.editState.plannedUnitPrice}
                                onChange={(event) => {
                                  let str = event.target.value.replace(/[^\d.]/g, "")
                                  handleChangeEditStateWithPlannedUnitPrice(index, str)
                                }}
                                onBlur={(event) => {
                                  handleBlurWithPlannedUnitPrice(index)
                                }}
                              />
                            </div>
                          ) : (
                            <div
                              className="cursor-pointer"
                              onClick={() => {
                                setEditPos({ index, fields: "planned_unit_price" })
                              }}>
                              {Number(row.planned_unit_price) / 100}
                            </div>
                          )}
                        </TableCell>
                        <TableCell align="center">
                          {intoDoubleFixed3(row.required_quantity / 1000)}
                        </TableCell>

                        <TableCell align="center">
                          {intoDoubleFixed3(row.stock_quantity / 1000)}
                        </TableCell>
                        <TableCell align="center">
                          {intoDoubleFixed3(row.reserves_quantity / 1000)}
                        </TableCell>
                        <TableCell align="center">
                          {checkEditPos(index, "quantity") &&
                          propsItem!.status == "pending_application" ? (
                            <div>
                              <InputBase
                                autoFocus
                                className="border-b border-[#e0e0e0] text-railway_blue"
                                value={intoDoubleFixed3(row.quantity / 1000)}
                                onChange={(event) => {
                                  let str = event.target.value.replace(/[^0-9]/g, "")
                                  if (0 <= +str || +str <= 999) {
                                    handleChangeEditStateWithQuantity(index, Number(str))
                                  }
                                }}
                                onBlur={(event) => {
                                  handleBlurWithPlannedUnitPrice(index)
                                }}
                              />
                            </div>
                          ) : (
                            <div
                              className="cursor-pointer"
                              onClick={() => {
                                setEditPos({ index, fields: "quantity" })
                              }}>
                              {intoDoubleFixed3(row.quantity / 1000)}
                            </div>
                          )}
                        </TableCell>
                        <TableCell align="center">
                          {intoDoubleFixed3(row.planned_price_total / 100)}
                        </TableCell>

                        <TableCell align="center">
                          {checkEditPos(index, "planned_entry_at") &&
                          propsItem!.status == "pending_application" ? (
                            <div>
                              <DatePicker
                                autoFocus
                                value={dayjs(row.editState.plannedEntryAt)}
                                onChange={(newVal) => {
                                  handleChangeEditStateWithPlannedEntryAt(
                                    index,
                                    dayJsToStr(newVal ?? new Date(), "YYYY-MM-DD"),
                                  )
                                }}
                                onBlur={() => {
                                  handleBlurWithPlannedUnitPrice(index)
                                }}
                              />
                            </div>
                          ) : (
                            <div
                              className="cursor-pointer"
                              onClick={() => {
                                setEditPos({
                                  index,
                                  fields: "planned_entry_at",
                                })
                              }}>
                              {dayJsToStr(row.planned_entry_at, "YYYY-MM-DD")}
                            </div>
                          )}
                        </TableCell>
                        <TableCell align="center">
                          {checkEditPos(index, "desc") ? (
                            <div>
                              <InputBase
                                autoFocus
                                className="border-b border-[#e0e0e0] text-railway_blue"
                                value={row.editState.desc}
                                onChange={(event) => {
                                  handleChangeEditStateWithDesc(index, event.target.value)
                                }}
                                onBlur={() => {
                                  handleBlurWithPlannedUnitPrice(index)
                                }}
                              />
                            </div>
                          ) : (
                            <div
                              title={row.desc}
                              className="w-full h-full cursor-pointer overflow-hidden text-ellipsis whitespace-nowrap"
                              onClick={() => {
                                setEditPos({ index, fields: "desc" })
                              }}>
                              {row.desc}
                            </div>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              <div className="absolute bottom-0 w-full">
                <div className="overflow-hidden flex justify-end gap-x-2">
                  <Button
                    color="error"
                    variant="contained"
                    disabled={propsItem!.status != "pending_application"}
                    onClick={() => {
                      handleTurnDown()
                    }}>
                    驳回
                  </Button>
                  {propsItem!.status == "pending_application" && (
                    <Button
                      variant="contained"
                      onClick={() => {
                        handleStartPurchase()
                      }}>
                      开始采购
                    </Button>
                  )}
                </div>
                <div className="w-full flex justify-center items-center gap-x-2 bg-white border-t">
                  <span>共{pager.count}条</span>
                  <select
                    value={pageState.limit}
                    className="border"
                    onChange={(event) => {
                      handlePaginationChange(+event.target.value, "limit")
                    }}>
                    <option value={10}>10条/页</option>
                    <option value={20}>20条/页</option>
                    <option value={50}>50条/页</option>
                  </select>
                  <Pagination
                    page={pageState.page}
                    count={pager.count ? Math.ceil(pager.count / pager.limit) : 1}
                    variant="outlined"
                    shape="rounded"
                    onChange={(event, page) => {
                      handlePaginationChange(page, "page")
                    }}
                  />
                </div>
              </div>
            </div>
          )}
          <Snackbar
            sx={{ zIndex: 1720 }}
            anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
            open={openSnackbar}
            autoHideDuration={3000}
            onClose={handleCloseSnackbar}>
            {dataQueue ? (
              <Alert severity="success">导出成功</Alert>
            ) : (
              <Alert severity="info">导出中</Alert>
            )}
          </Snackbar>
        </DialogContent>
      </Dialog>
    </>
  )
}
