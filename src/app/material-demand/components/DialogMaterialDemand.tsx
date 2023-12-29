"use client"
import React from "react"
import { Button, Dialog, DialogContent, DialogTitle, Pagination } from "@mui/material"
import Table from "@mui/material/Table"
import TableHead from "@mui/material/TableHead"
import TableRow from "@mui/material/TableRow"
import TableCell from "@mui/material/TableCell"
import TableBody from "@mui/material/TableBody"
import { BaseApiPager } from "@/types/api"
import { CurrentDate, dateToUTCCustom, dayJsToStr, intoDoubleFixed3 } from "@/libs/methods"
import useSWRMutation from "swr/mutation"
import { reqGetMaterialDemandItem, reqPostMaterialDemandItem } from "@/app/material-demand/api"
import {
  DemandEditState,
  MaterialDemandItemListData,
  MaterialDemandListData,
  PostMaterialDemandItemParams,
} from "@/app/material-demand/types"
import { CONCRETE_DICTIONARY_CLASS_ID } from "@/app/ebs-data/const"
import { MaterialProportionListData } from "@/app/proportion/types"
import { reqGetDictionary } from "@/app/material-approach/api"
import { DictionaryData } from "@/app/material-approach/types"
import { DictionaryClassOption } from "@/app/material-demand/const"
import { message } from "antd"
import "dayjs/locale/zh-cn"
import { DICTIONARY_CLASS_ID } from "@/libs/const"
import { useConfirmationDialog } from "@/components/ConfirmationDialogProvider"

type Props = {
  open: boolean
  handleCloseDialogAddForm: () => void
  item: MaterialDemandListData | null
}

type SubEditState = {
  lossCoefficient: string
  actualUsage: number // 需求用量
  plannedUsageAt: string
}

export type MaterialListType = {
  parent_id?: number
  id?: number
  dictionary_class_id: number
  dictionary_id: number
  quantity?: number
  dictionaryName: string
  dictionaryList: DictionaryData[]
  dictionary: any
  isSubEdit?: boolean
  isSelect?: boolean
  class: "user" | "system"
  editState: SubEditState
  loss_coefficient: string
  actual_usage: number // 需求用量
  planned_usage_at: string
}

function findDictionaryClassName(val: number) {
  const obj = DictionaryClassOption.find((item) => item.id == val)
  return obj ? obj.label : ""
}

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
    title: "需求用量",
    key: "需求用量",
  },
  {
    title: "计划使用时间",
    key: "计划使用时间",
  },
]

function findConstUnitWithDictionary(str: string) {
  const arr: { key: string; value: string }[] | any = JSON.parse(str || "[]")

  const obj = arr.find((item: any) => item.key == "常用单位")
  return obj ? obj.value : ""
}

function findProportionSelf(
  arr: MaterialProportionListData[],
  row: MaterialDemandItemListData,
  engId: number,
) {
  return arr.filter((el) => {
    let flag1 = el.dictionary_id == row.dictionary_id
    let flag2 = false
    if (el.usages) {
      flag2 = !!el.usages.find(
        (use) => use.ebs_id == row.ebs_id && use.engineeringListing_id == engId,
      )
    } else {
      flag2 = false
    }

    return flag1 && flag2
  })
}

function filterDictionaryWithWZAttribute(str: string) {
  let attributes = JSON.parse(str ?? "[]")
  if (attributes instanceof Array) {
    let filterArr = attributes.filter((item) => item.value.startsWith("WZ"))
    return filterArr
  }
  return []
}

export default function DialogMaterialDemand(props: Props) {
  const { open, handleCloseDialogAddForm, item } = props

  const { trigger: getMaterialDemandItemApi } = useSWRMutation(
    "/project-material-requirement-item",
    reqGetMaterialDemandItem,
  )

  const { trigger: postMaterialDemandItemApi } = useSWRMutation(
    "/project-material-requirement-item",
    reqPostMaterialDemandItem,
  )

  const { trigger: getDictionaryListApi } = useSWRMutation("/dictionary", reqGetDictionary)

  const [pageState, setPageState] = React.useState({
    page: 1,
    limit: 10,
  })

  const [requirementId, setRequirementId] = React.useState(item!.id)

  const [pager, setPager] = React.useState<BaseApiPager>({} as BaseApiPager)

  const [requirementList, setRequirementList] = React.useState<MaterialDemandItemListData[]>([])

  const getMaterialDemandItemList = async (flag?: boolean) => {
    const res = await getMaterialDemandItemApi({
      requirement_id: requirementId,
      page: pageState.page,
      limit: pageState.limit,
    })

    //  处理完的数据
    const arrs: MaterialDemandItemListData[] = []

    // 遍历数据
    for (const itemsKey in res.items) {
      let item = res.items[itemsKey]

      // 给主列表编辑的数据保留一份
      item.editState = {
        lossCoefficient: item.loss_coefficient,
        actualUsage: item.actual_usage / 1000,
        plannedUsageAt: dateToUTCCustom(item.planned_usage_at, "YYYY-MM-DD"),
      } as DemandEditState
      item.isEdit = flag ?? allEdit

      let subR: MaterialDemandItemListData[] = []
      if (item.material_proportion) {
        item.editState.proportion = item.material_proportion.id
      }
      //   有没有保存过的
      if (item.dictionary && item.dictionary.dictionary_class_id == DICTIONARY_CLASS_ID.concrete) {
        // 获取混凝土的子列表
        const r = await getMaterialDemandItemApi({
          requirement_id: requirementId,
          parent_id: item.id,
        })
        subR = r.items
      }
      if (subR.length > 0) {
        // 处理子列表的数据
        const subTableList = []

        for (const subRKey in subR) {
          let subItem = subR[subRKey]

          // 处理数据
          let obj = {
            id: subItem.id,
            dictionary_id: subItem.dictionary_id,
            quantity: subItem.quantity,
            dictionaryList: [],
            dictionaryName: subItem.dictionary.name,
            dictionary: subItem.dictionary,
            dictionary_class_id: subItem.dictionary.dictionary_class_id,
            isSubEdit: item.isEdit,
            class: subItem.class,
            editState: {
              plannedUsageAt: dateToUTCCustom(subItem.planned_usage_at, "YYYY-MM-DD"),
              lossCoefficient: subItem.loss_coefficient,
              actualUsage: subItem.actual_usage / 1000, // 需求用量
            },
            planned_usage_at: dateToUTCCustom(subItem.planned_usage_at, "YYYY-MM-DD"),
            loss_coefficient: subItem.loss_coefficient,
            actual_usage: subItem.actual_usage,
          } as MaterialListType

          subTableList.push(obj)
        }
        item.proportions = subTableList

        arrs.push(item)
        // 自定义的
      } else if (item.material_proportion) {
        item.editState.proportion = item.material_proportion.id

        let materials = JSON.parse(item.material_proportion.materials)
        let subArr: Array<PostMaterialDemandItemParams> = []

        for (const materialsKey in materials) {
          let itemWithMaterial = materials[materialsKey]

          let subActualUsage =
            item.actual_usage * intoDoubleFixed3(itemWithMaterial.quantity / 1000)
          // 需要计算数据
          let postParams = {
            class: "system",
            parent_id: item.id,
            requirement_id: requirementId,
            dictionary_id: itemWithMaterial.dictionary_id,
            actual_usage: subActualUsage,
            loss_coefficient: +item.loss_coefficient,
            ebs_id: item.ebs_id,
            planned_usage_at: dateToUTCCustom(item.planned_usage_at, "YYYY-MM-DD"),
          } as PostMaterialDemandItemParams

          subArr.push(postParams)
        }
        await Promise.all(subArr.map((params) => postMaterialDemandItemApi(params)))
        getMaterialDemandItemList()

        // 字典的
      } else if (
        item.dictionary &&
        item.dictionary.dictionary_class_id == DICTIONARY_CLASS_ID.concrete
      ) {
        let _WZArr = filterDictionaryWithWZAttribute(item.dictionary.properties)
        console.log(_WZArr)
        for (const wzArrKey in _WZArr) {
          let wzItem = _WZArr[wzArrKey]
          let valueSplitArr = wzItem.value.split("-")
          let subActualUsage = item.actual_usage * intoDoubleFixed3(Number(valueSplitArr[2]) / 1000)
          let dictionaryLists = await getDictionaryListApi({ name: valueSplitArr[1].trim() })
          if (dictionaryLists.length > 0) {
            let postParams = {
              class: "system",
              parent_id: item.id,
              requirement_id: requirementId,
              dictionary_id: dictionaryLists[0].id,
              actual_usage: subActualUsage,
              loss_coefficient: +item.loss_coefficient,
              ebs_id: item.ebs_id,
              planned_usage_at: dateToUTCCustom(item.planned_usage_at, "YYYY-MM-DD"),
            } as PostMaterialDemandItemParams
            await postMaterialDemandItemApi(postParams)
          }
        }
        getMaterialDemandItemList()
      } else {
        arrs.push(item)
      }
    }
    setRequirementList(arrs)
    setPager(res.pager)
  }

  React.useEffect(() => {
    !!requirementId && getMaterialDemandItemList()
  }, [requirementId, pageState])

  const handleCreateMaterialDemand = async () => {}

  const [allEdit, setAllEdit] = React.useState(false)

  const { showConfirmationDialog } = useConfirmationDialog()

  const checkListHaveEdit = () => {
    return requirementList.some((item) => {
      if (item.proportions && item.proportions.length > 0) {
        return item.proportions.some((subItem) => subItem.isSubEdit)
      }
      return item.isEdit
    })
  }

  const handlePaginationChange = (val: number, type: "page" | "limit") => {
    let clonePage = structuredClone(pageState)
    if (type == "limit") {
      clonePage.page = 1
      clonePage.limit = val
    } else {
      // if (clonePage.page == val) return
      clonePage.page = val
    }
    // 判断是否有编辑
    let flag = checkListHaveEdit()
    if (flag) {
      showConfirmationDialog("修改信息未保存，确认离开当前页面？", () => {
        setAllEdit(false)
        setPageState(clonePage)
      })
    } else {
      setPageState(clonePage)
    }
  }

  const handleCloseDialog = () => {
    let flag = checkListHaveEdit()

    if (flag) {
      showConfirmationDialog("修改信息未保存，确认离开当前页面？", () => {
        handleCloseDialogAddForm()
      })
    } else {
      handleCloseDialogAddForm()
    }
  }

  const handleExport = () => {
    message.success("导出成功，可到“导出管理”中下载--（导出功能没实现）")
  }

  const CreateMaterialDemandBtn = () => (
    <div className="h-full overflow-hidden pb-[4.375rem] flex items-center justify-center">
      <Button variant="contained" onClick={() => handleCreateMaterialDemand()}>
        生成物资需求计划
      </Button>
    </div>
  )

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
          {CurrentDate.getYear()}年{CurrentDate.getMonth()}月主要物资设计数量明细表
        </DialogTitle>
        <div className="px-6 flex justify-between items-center">
          <div>工点数据名称：{item?.project_si.name}</div>
          <div>
            {/*<Button*/}
            {/*  onClick={() => {*/}
            {/*    handleExport()*/}
            {/*  }}>*/}
            {/*  导出*/}
            {/*</Button>*/}
          </div>
        </div>
        <DialogContent sx={{ width: "90vw", height: "80vh" }}>
          {!requirementId ? (
            CreateMaterialDemandBtn()
          ) : (
            <div className="h-full overflow-hidden pb-[4.375rem] relative">
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
                    {requirementList.length > 0 &&
                      requirementList.map((row, index) => {
                        return row.dictionary?.dictionary_class_id !=
                          CONCRETE_DICTIONARY_CLASS_ID ? (
                          <TableRow key={index} className="grid-cols-8 grid">
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
                            <TableCell align="center">{row.loss_coefficient}</TableCell>
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
                                    <TableCell align="center">{row.loss_coefficient}</TableCell>
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
                                          findConstUnitWithDictionary(
                                            subRow.dictionary?.properties,
                                          )}
                                      </TableCell>
                                      <TableCell align="center">
                                        {subRow.loss_coefficient}
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

              <div className="absolute bottom-0 w-full">
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
        </DialogContent>
      </Dialog>
    </>
  )
}
