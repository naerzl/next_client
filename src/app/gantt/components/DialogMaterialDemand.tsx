"use client"
import React from "react"
import {
  Alert,
  Button,
  Dialog,
  DialogContent,
  DialogTitle,
  InputBase,
  Menu,
  MenuItem,
  Pagination,
  Select,
  Snackbar,
} from "@mui/material"
import Table from "@mui/material/Table"
import TableHead from "@mui/material/TableHead"
import TableRow from "@mui/material/TableRow"
import TableCell from "@mui/material/TableCell"
import TableBody from "@mui/material/TableBody"
import { ProcessListData } from "@/app/gantt/types"
import { LayoutContext } from "@/components/LayoutContext"
import { BaseApiPager } from "@/types/api"
import Tooltip from "@mui/material/Tooltip"
import { CurrentDate, dateToUTCCustom, dayJsToStr, intoDoubleFixed3 } from "@/libs/methods"
import {
  DemandEditState,
  MaterialDemandItemListData,
  PostMaterialDemandItemParams,
  PutMaterialDemandItemParams,
  MaterialListType,
} from "@/app/material-demand/types"
import { CONCRETE_DICTIONARY_CLASS_ID } from "@/app/ebs-data/const"
import AddIcon from "@mui/icons-material/Add"
import { MaterialProportionListData } from "@/app/proportion/types"
import { DictionaryData } from "@/app/material-approach/types"
import { DictionaryClassOption } from "@/app/material-demand/const"
import { DatePicker, message } from "antd"
import locale from "antd/es/date-picker/locale/zh_CN"
import "dayjs/locale/zh-cn"
import dayjs, { Dayjs } from "dayjs"
import { DICTIONARY_CLASS_ID } from "@/libs/const"
import { useConfirmationDialog } from "@/components/ConfirmationDialogProvider"
import { useRouter } from "next/navigation"
import SelectDictionaryClass from "@/components/SelectDictionaryClass"
import Loading from "@/components/loading"
import { CLASS_OPTION } from "@/app/material-approach/const/enum"
import TreeSelectWithEbs from "@/components/TreeSelectWithEBS"
import useSWRMutationHooks from "@/app/gantt/hooks/useSWRMutationHooks"
import { useRequest } from "ahooks"
import IconButton from "@mui/material/IconButton"
import ArrowRightIcon from "@mui/icons-material/ArrowRight"
import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown"
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline"
import SaveIcon from "@mui/icons-material/Save"
import CancelIcon from "@mui/icons-material/Cancel"
import { MaterialLossCoefficientListData } from "@/app/material-loss-coefficient/types"
import Decimal from "decimal.js"

type Props = {
  open: boolean
  handleCloseDialogAddForm: () => void
  item: ProcessListData & any
}

type MainEditType = {
  ebs_id: number
  loss_coefficient: string
  actual_usage: number // 需求用量
  planned_usage_at: string
  dictionary_class_id: number
  dictionaryClassName: string
  dictionary_id: number
  dictionaryList: DictionaryData[]
}

type EditPosStateType = {
  index: number
  subIndex?: number
  fields: string
}
enum EditFieldsEnum {
  LossCoefficient = "loss_coefficient",
  ActualUsage = "actual_usage",
  PlannedUsageAt = "planned_usage_at",
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
    title: "需用数量",
    key: "需用数量",
  },
  {
    title: "计划使用时间",
    key: "计划使用时间",
  },
  {
    width: "150px",
    title: "",
    key: "action",
  },
]

type Status = "waiting" | "confirmed"

type ProportionMaterial = {
  name: string
  quantity: number
  dictionary_id: number
  dictionary_class_id: number
}

function findConstUnitWithDictionary(str: string) {
  const arr: { key: string; value: string }[] | any = JSON.parse(str || "[]")

  const obj = arr.find((item: any) => item.key == "常用单位")
  return obj ? obj.value : ""
}

// 找混凝土对应的配合比
function findProportionSelf(
  arr: MaterialProportionListData[],
  row: MaterialDemandItemListData,
  engId: number,
) {
  return arr.filter((el) => {
    let flag1 = el.dictionary_id == row.dictionary_id
    let flag2: boolean
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

function findDictionaryClassEnum(name: string) {
  return CLASS_OPTION.find((classItem) => classItem.label == name)
}

// 处理系统字典的属性（找WZ）
function filterDictionaryWithWZAttribute(str: string) {
  let attributes = JSON.parse(str ?? "[]")
  if (attributes instanceof Array) {
    return attributes.filter((item) => item.value.startsWith("WZ"))
  }
  return []
}

export default function DialogMaterialDemand(props: Props) {
  const { open, handleCloseDialogAddForm, item } = props

  const router = useRouter()

  const {
    getMaterialDemandItemApi,
    getMaterialProportionApi,
    getMaterialDemandApi,
    postMaterialDemandApi,
    putMaterialDemandItemApi,
    postMaterialDemandItemApi,
    delMaterialDemandItemApi,
    putMaterialDemandApi,
    getExportMaterialDemandApi,
    getDictionaryListApi,
    getQueueApi,
    getMaterialLossCoefficientApi,
    postMaterialLossCoefficientApi,
  } = useSWRMutationHooks()

  const { projectId: PROJECT_ID } = React.useContext(LayoutContext)

  const [pageState, setPageState] = React.useState({
    page: 1,
    limit: 10,
  })

  const [requirementId, setRequirementId] = React.useState(0)

  const [requirementStatus, setRequirementStates] = React.useState<Status>("waiting")

  const [pager, setPager] = React.useState<BaseApiPager>({} as BaseApiPager)

  const [requirementList, setRequirementList] = React.useState<MaterialDemandItemListData[]>([])

  const [isLoading, setIsLoading] = React.useState(false)

  const getMaterialDemandList = async () => {
    const res = await getMaterialDemandApi({
      project_id: PROJECT_ID,
      engineering_listing_id: item.engineering_listings[0].id,
      project_si_id: Number(item.id.substring(1)),
      project_sp_id: item.parent_id,
    })
    if (res.items.length > 0) {
      setRequirementId(res.items[0].id)
      setRequirementStates(res.items[0].status)
    } else {
      setRequirementId(0)
      setRequirementList([])
    }
  }

  //  获取需求计划的项
  const getMaterialDemandItemList = async (flag?: boolean) => {
    try {
      setIsLoading(true)
      const res = await getMaterialDemandItemApi({
        project_id: PROJECT_ID,
        requirement_id: requirementId,
        page: pageState.page,
        limit: pageState.limit,
      })

      //  处理完的数据
      const arrs: MaterialDemandItemListData[] = []

      // 遍历数据 判断三种情况 （1.自定义配合比 2.字典配合比 3.不处理）
      for (const itemsKey in res.items) {
        let item = res.items[itemsKey]

        // 给主列表编辑的数据保留一份
        item.editState = {
          lossCoefficient: item.loss_coefficient,
          actualUsage: Decimal.div(Number(item.actual_usage), 1000).toNumber(),
          plannedUsageAt: dateToUTCCustom(item.planned_usage_at, "YYYY-MM-DD"),
        } as DemandEditState

        item.isExpand = true

        // 如果有自定义配合比存起来
        if (item.material_proportion) {
          item.editState.proportion = item.material_proportion.id
        }

        //   有没有保存过的
        let subR: MaterialDemandItemListData[] = []
        if (
          item.dictionary &&
          item.dictionary.dictionary_class_id == DICTIONARY_CLASS_ID.concrete
        ) {
          // 获取混凝土的子列表
          const r = await getMaterialDemandItemApi({
            project_id: PROJECT_ID,
            requirement_id: requirementId,
            parent_id: item.id,
          })
          subR = r.items
        }
        // 有保存过得
        if (subR.length > 0) {
          // 处理子列表的数据
          const subTableList: MaterialListType[] = []

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
              dictionaryClassName: subItem.dictionary.dictionary_class.name,
              class: subItem.class,
              material_loss_coefficient: subItem.material_loss_coefficient,
              editState: {
                plannedUsageAt: dateToUTCCustom(subItem.planned_usage_at, "YYYY-MM-DD"),
                lossCoefficient: subItem.loss_coefficient,
                actualUsage: Decimal.div(subItem.actual_usage, 1000).toNumber(), // 需求用量
              },
              planned_usage_at: dateToUTCCustom(subItem.planned_usage_at, "YYYY-MM-DD"),
              loss_coefficient: subItem.loss_coefficient,
              actual_usage: subItem.actual_usage,
            } as MaterialListType

            subTableList.push(obj)
          }

          // 获取到子列表 判断有没有自定义配合比 对照顺序
          if (item.material_proportion) {
            let proportionMaterialArr = JSON.parse(item.material_proportion.materials)
            let mapArr = proportionMaterialArr.map(
              (ppMItem: any) =>
                subTableList.find((subItem) => subItem.dictionary_id == ppMItem.dictionary_id)!,
            )
            const customLists = subTableList.filter((item) => item.class == "user")
            item.proportions = [...mapArr.filter((mapArrItem: any) => mapArrItem), ...customLists]
          } else {
            item.proportions = subTableList
          }

          arrs.push(item)
          // 自定义的
        } else if (item.material_proportion) {
          item.editState.proportion = item.material_proportion.id

          let materials = JSON.parse(item.material_proportion.materials)
          let subArr: Array<PostMaterialDemandItemParams> = []

          for (const materialsKey in materials) {
            let itemWithMaterial = materials[materialsKey]

            let subActualUsage = Decimal.mul(
              item.actual_usage,
              intoDoubleFixed3(itemWithMaterial.quantity / 1000),
            ).toNumber()

            let findClassItem = findDictionaryClassEnum(itemWithMaterial.name)
            // 需要计算数据
            let postParams = {
              class: "system",
              parent_id: item.id,
              requirement_id: requirementId,
              dictionary_id: itemWithMaterial.dictionary_id,
              actual_usage: subActualUsage,
              loss_coefficient: +item.loss_coefficient,
              ebs_id: item.ebs_id,
              ebs_desc: item.ebs_desc,
              planned_usage_at: dateToUTCCustom(item.planned_usage_at, "YYYY-MM-DD"),
              material_class: findClassItem ? findClassItem.value : "none",
            } as PostMaterialDemandItemParams

            subArr.push(postParams)
          }
          await Promise.all(subArr.map((params) => postMaterialDemandItemApi(params)))
          getMaterialDemandItemList()
          return
          // 字典的
        } else if (
          item.dictionary &&
          item.dictionary.dictionary_class_id == DICTIONARY_CLASS_ID.concrete
        ) {
          let _WZArr = filterDictionaryWithWZAttribute(item.dictionary.properties)
          for (const wzArrKey in _WZArr) {
            let wzItem = _WZArr[wzArrKey]
            let valueSplitArr = wzItem.value.split("!")
            let subActualUsage = Decimal.mul(
              item.actual_usage,
              intoDoubleFixed3(Number(valueSplitArr[2]) / 1000),
            ).toNumber()
            let dictionaryLists = await getDictionaryListApi({ name: valueSplitArr[1].trim() })
            if (dictionaryLists.length > 0) {
              const findClassItem = findDictionaryClassEnum(wzItem.key)
              let postParams = {
                class: "system",
                parent_id: item.id,
                requirement_id: requirementId,
                dictionary_id: dictionaryLists[0].id,
                actual_usage: subActualUsage,
                loss_coefficient: +item.loss_coefficient,
                ebs_id: item.ebs_id,
                ebs_desc: item.ebs_desc,
                planned_usage_at: dateToUTCCustom(item.planned_usage_at, "YYYY-MM-DD"),
                material_class: findClassItem ? findClassItem.value : "none",
              } as PostMaterialDemandItemParams
              await postMaterialDemandItemApi(postParams)
            }
          }
          getMaterialDemandItemList()
          return
        } else {
          arrs.push(item)
        }
      }
      setRequirementList(arrs)
      setPager(res.pager)
    } finally {
      setIsLoading(false)
    }
  }

  const [materialProportionList, setMaterialProportionList] = React.useState<
    MaterialProportionListData[]
  >([])

  const getProportionList = async () => {
    const res = await getMaterialProportionApi({})
    setMaterialProportionList(res.items)
  }

  React.useEffect(() => {
    getProportionList()
    getMaterialDemandList()
  }, [])

  React.useEffect(() => {
    !!requirementId && getMaterialDemandItemList()
  }, [requirementId, pageState])

  const handleCreateMaterialDemand = async () => {
    await postMaterialDemandApi({
      project_id: PROJECT_ID,
      engineering_listing_id: item.engineering_listings[0].id,
      project_si_id: Number(item.id.substring(1)),
      project_sp_id: item.parent_id,
      action: 1,
    })
    getMaterialDemandList()
  }

  const handleUploadMaterialDemand = async () => {
    await postMaterialDemandApi({
      project_id: PROJECT_ID,
      engineering_listing_id: item.engineering_listings[0].id,
      project_si_id: Number(item.id.substring(1)),
      project_sp_id: item.parent_id,
      action: 2,
    })
    getMaterialDemandList()
    getMaterialDemandItemList()
  }

  const handleChangeSelectProportion = async (val: number, index: number) => {
    const obj = materialProportionList.find((item) => item.id == val)!
    if (obj) {
      const cloneList = structuredClone(requirementList)
      // 主列表对象
      const requirementItem = cloneList[index]

      await putMaterialDemandItemApi({
        id: requirementItem.id!,
        dictionary_id: requirementItem.dictionary_id,
        requirement_id: requirementId,
        actual_usage: requirementItem.actual_usage,
        proportion_id: val,
        loss_coefficient: requirementItem.loss_coefficient,
        planned_usage_at: requirementItem.editState.plannedUsageAt,
      })

      let materials: ProportionMaterial[] = JSON.parse(obj.materials ?? "[]")

      const filterWithUserAddArr = requirementItem.proportions?.filter((el) => el.class != "user")

      // 判断子项和配比的对象数量是不是一样
      if (filterWithUserAddArr!.length > materials.length) {
        let remainingList: MaterialListType[] = []
        for (const materialsKey in materials) {
          let materialItem = materials[materialsKey]
          let findSubItem = filterWithUserAddArr!.find(
            (el) => el.dictionary_class_id == materialItem.dictionary_class_id,
          )
          findSubItem && remainingList.push(findSubItem)
          //
          if (findSubItem) {
            let sumActualUsage = Decimal.add(1, Number(findSubItem.loss_coefficient) / 100)
              .mul(materialItem.quantity)
              .toNumber()
            // (1 + Number(findSubItem.loss_coefficient) / 100) * materialItem.quantity

            await putMaterialDemandItemApi({
              id: findSubItem.id!,
              dictionary_id: materialItem.dictionary_id,
              requirement_id: requirementId,
              actual_usage: Math.round(
                Decimal.mul(
                  intoDoubleFixed3(sumActualUsage / 1000),
                  requirementItem.actual_usage,
                ).toNumber(),
              ),
              loss_coefficient: findSubItem.loss_coefficient ?? 0,
              planned_usage_at: findSubItem.editState.plannedUsageAt,
            })
          } else {
            const findClassItem = CLASS_OPTION.find((classItem) => classItem.label == item.name)

            await postMaterialDemandItemApi({
              class: "system",
              requirement_id: requirementId,
              parent_id: requirementItem.id,
              ebs_id: requirementItem.ebs_id,
              ebs_desc: requirementItem.ebs_desc,
              dictionary_id: materialItem.dictionary_id,
              actual_usage: Math.round(
                Decimal.mul(
                  intoDoubleFixed3(materialItem.quantity / 1000),
                  requirementItem.actual_usage,
                ).toNumber(),
              ),
              planned_usage_at: dayJsToStr(requirementItem.planned_usage_at, "YYYY-MM-DD"),
              loss_coefficient: 0,
              material_class: findClassItem ? findClassItem.value : "none",
            })
          }
        }
        const needDelItems = filterWithUserAddArr!.filter(
          (ele) => !remainingList.find((subEle) => subEle.id == ele.id),
        )
        let axiosList = needDelItems.map((ele) =>
          delMaterialDemandItemApi({ requirement_id: requirementId, id: ele.id! }),
        )
        await Promise.all(axiosList)
      } else {
        for (const materialsKey in materials) {
          // 配合比对象
          let item = materials[materialsKey]
          // 子列表对象
          let findSubItem = requirementItem!.proportions!.find(
            (el) => el.dictionary_class_id == item.dictionary_class_id,
          )

          if (findSubItem) {
            findSubItem.dictionary_id = item.dictionary_id
            let sumActualUsage = Decimal.add(1, Number(findSubItem.loss_coefficient) / 100)
              .mul(item.quantity)
              .toNumber()
            // (1 + Number(findSubItem.loss_coefficient) / 100) * item.quantity

            await putMaterialDemandItemApi({
              id: findSubItem.id!,
              dictionary_id: item.dictionary_id,
              requirement_id: requirementId,
              actual_usage: Math.round(
                Decimal.mul(
                  intoDoubleFixed3(sumActualUsage / 1000),
                  requirementItem.actual_usage,
                ).toNumber(),
              ),
              loss_coefficient: findSubItem.loss_coefficient ?? 0,
              planned_usage_at: findSubItem.editState.plannedUsageAt,
            })
          } else {
            const findClassItem = CLASS_OPTION.find((classItem) => classItem.label == item.name)

            await postMaterialDemandItemApi({
              class: "system",
              requirement_id: requirementId,
              parent_id: requirementItem.id,
              ebs_id: requirementItem.ebs_id,
              ebs_desc: requirementItem.ebs_desc,
              dictionary_id: item.dictionary_id,
              actual_usage: Math.round(
                Decimal.mul(
                  intoDoubleFixed3(item.quantity / 1000),
                  requirementItem.actual_usage,
                ).toNumber(),
              ),
              planned_usage_at: dayJsToStr(requirementItem.planned_usage_at, "YYYY-MM-DD"),
              loss_coefficient: 0,
              material_class: findClassItem ? findClassItem.value : "none",
            })
          }
        }
      }

      getMaterialDemandItemList()
    }
  }

  const [editPos, setEditPos] = React.useState<EditPosStateType>({} as EditPosStateType)

  const checkEditPos = (
    type: "sub" | "main",
    index: number,
    field: string,
    subIndex?: number,
  ): boolean => {
    let flag = editPos.index == index && field == editPos.fields

    return type == "main"
      ? editPos.subIndex == undefined && flag
      : flag && editPos.subIndex == subIndex
  }

  const handleChangeMainTableEditInputWithPlannedUsageAt = (index: number, val: string | Dayjs) => {
    const cloneList = structuredClone(requirementList)
    let rowItem = cloneList[index]
    rowItem.editState.plannedUsageAt = dayJsToStr(val, "YYYY-MM-DD")
    rowItem.planned_usage_at = rowItem.editState.plannedUsageAt
    setRequirementList(cloneList)
  }

  const handleMainExpand = (index: number, isExpand: boolean) => {
    const cloneList = structuredClone(requirementList)
    let rowItem = cloneList[index]
    rowItem.isExpand = isExpand
    setRequirementList(cloneList)
  }

  const handleSaveWithConcrete = async (index: number, row: MaterialDemandItemListData) => {
    // setIsLoading(true)
    let params = {
      id: row.id,
      requirement_id: requirementId,
      actual_usage: row.editState.actualUsage * 1000,
      loss_coefficient: row.editState.lossCoefficient,
      dictionary_id: row.dictionary_id,
      planned_usage_at: row.editState.plannedUsageAt,
    } as PutMaterialDemandItemParams
    if (row.editState.proportion) {
      params.proportion_id = row.editState.proportion
    }
    await putMaterialDemandItemApi(params)

    if (!row.proportions) {
      // getMaterialDemandItemList()
      return
    }

    const cloneList = structuredClone(requirementList)

    let needEditItems: MaterialListType[] = []
    cloneList[index].proportions!.forEach((sub) => {
      needEditItems.push(sub)
    })

    const axiosList = needEditItems.map((item, subIndex) => {
      if (item.id) {
        let params = {
          id: item.id,
          requirement_id: requirementId,
          actual_usage: Math.round(
            Decimal.mul(intoDoubleFixed3(item.editState.actualUsage), 1000).toNumber(),
          ),
          loss_coefficient: item.editState.lossCoefficient,
          dictionary_id: item.dictionary_id,
          planned_usage_at: item.editState.plannedUsageAt,
        } as PutMaterialDemandItemParams
        return putMaterialDemandItemApi(params)
      }
    })

    await Promise.all(axiosList)
    // getMaterialDemandItemList()
  }

  const handleBlurMainPlannedUsageAt = async (index: number) => {
    if ("confirmed" == requirementStatus) {
      return
    }
    const cloneList = structuredClone(requirementList)
    let rowItem = cloneList[index]
    await putMaterialDemandItemApi({
      id: rowItem.id!,
      dictionary_id: rowItem.dictionary_id,
      requirement_id: requirementId,
      actual_usage: rowItem.actual_usage,
      loss_coefficient: rowItem.loss_coefficient,
      planned_usage_at: rowItem.editState.plannedUsageAt,
    })
    rowItem.planned_usage_at = rowItem.editState.plannedUsageAt
    setEditPos({} as EditPosStateType)
    setRequirementList(cloneList)
  }

  const handleBlurMainLossCoefficient = (index: number) => {
    setEditPos({} as EditPosStateType)
    handleSaveWithConcrete(index, requirementList[index])
  }

  const handleBlurMainActualUsage = async (index: number) => {
    if ("confirmed" == requirementStatus) {
      return
    }
    setEditPos({} as EditPosStateType)
    handleSaveWithConcrete(index, requirementList[index])
  }

  //需要 子集列表 父级对象 自定义配比数组
  const _ComputeProportion = (
    proportions: MaterialListType[],
    rowItem: MaterialDemandItemListData,
    materials: any[],
  ) => {
    return proportions!.map((subRow) => {
      // 找到配合比的字典和分类
      let findMaterialItem = materials.find(
        (material) =>
          material.dictionary_id == subRow.dictionary_id &&
          material.dictionary_class_id == subRow.dictionary_class_id,
      )
      if (findMaterialItem) {
        // 找到配比计算（父级需求 * 子集配比的量*（1+损耗系数））
        let sum = Decimal.add(1, Number(subRow.loss_coefficient) / 100)
          .mul(findMaterialItem.quantity)
          .toNumber()
        // findMaterialItem.quantity * (1 + Number(subRow.loss_coefficient) / 100)

        subRow.editState.actualUsage = intoDoubleFixed3(
          Decimal.mul(rowItem.editState.actualUsage, sum).div(1000).toNumber(),
        )

        subRow.actual_usage = Decimal.mul(subRow.editState.actualUsage, 1000).toNumber()
      } else {
        // 找不到哦啊（父级需求 * 1+损耗系数）
        let sum = Decimal.add(1, Number(subRow.loss_coefficient) / 100)
          .mul(rowItem.editState.actualUsage)
          .toNumber()
        // rowItem.editState.actualUsage * (1 + Number(subRow.loss_coefficient) / 100)
        subRow.editState.actualUsage = intoDoubleFixed3(sum)
        subRow.actual_usage = Decimal.mul(subRow.editState.actualUsage, 1000).toNumber()
        // subRow.editState.actualUsage * 1000
      }
      return subRow
    })
  }

  //需要 子集列表 父级对象 字典数组（wz split处理）
  const _ComputeWithDictionary = (
    proportions: MaterialListType[],
    rowItem: MaterialDemandItemListData,
    wzWithSplit: any[],
  ) => {
    return proportions!.map((subRow) => {
      // 找到配合比的字典和分类
      let findWzItem = wzWithSplit.find((wzSplitItem) => wzSplitItem[1] == subRow.dictionaryName)
      if (findWzItem) {
        // 找到配比计算（父级需求 * 子集配比的量*（1+损耗系数））
        let sum = Decimal.add(1, Number(subRow.loss_coefficient) / 100)
          .mul(Number(findWzItem[2]))
          .toNumber()
        // findWzItem[2] * (1 + Number(subRow.loss_coefficient) / 100)
        subRow.editState.actualUsage = intoDoubleFixed3(
          Decimal.mul(rowItem.editState.actualUsage, sum).div(1000).toNumber(),
        )
        subRow.actual_usage = Decimal.mul(subRow.editState.actualUsage, 1000).toNumber()
        // subRow.editState.actualUsage * 1000
      } else {
        // 找不到哦啊（父级需求 * 1+损耗系数）

        let sum = Decimal.add(1, Number(subRow.loss_coefficient) / 100)
          .mul(rowItem.editState.actualUsage)
          .toNumber()
        subRow.editState.actualUsage = intoDoubleFixed3(sum)
        subRow.actual_usage = Decimal.mul(subRow.editState.actualUsage, 1000).toNumber()
      }
      return subRow
    })
  }

  const handleChangeMainTableEditInputWithActualUsage = (index: number, val: string) => {
    const cloneList = structuredClone(requirementList)
    let rowItem = cloneList[index]

    rowItem.editState.actualUsage = Number(val)
    rowItem.actual_usage = Math.round(Decimal.mul(Number(val), 1000).toNumber())

    // 配合比子物料列表
    let materials: any[] = []

    if (rowItem.material_proportion) {
      materials = JSON.parse(rowItem.material_proportion.materials)
    }

    // 判断是否有子集数据
    if (rowItem.proportions && rowItem.proportions!.length > 0) {
      if (materials.length > 0) {
        rowItem.proportions = _ComputeProportion(rowItem.proportions, rowItem, materials)
      } else if (
        rowItem.dictionary &&
        rowItem.dictionary.dictionary_class_id == DICTIONARY_CLASS_ID.concrete
      ) {
        let _WZArr = filterDictionaryWithWZAttribute(rowItem.dictionary.properties)
        if (_WZArr && _WZArr.length > 0) {
          const wzWithSplit = _WZArr.map((wzItem) => wzItem.value.split("!"))
          rowItem.proportions = _ComputeWithDictionary(rowItem.proportions, rowItem, wzWithSplit)
        }
      }
    }
    setRequirementList(cloneList)
  }

  const _ComputedMainLossCoefficientWithActualUsage = (
    rowItem: MaterialDemandItemListData,
    val: string,
  ) => {
    if (rowItem.dictionary.dictionary_class.name == "声测管") {
    }
    return intoDoubleFixed3(
      Decimal.add(1, Number(val) / 100)
        .mul(rowItem.design_usage)
        .div(1000)
        .toNumber(),
    )
    // return intoDoubleFixed3((rowItem.design_usage * (1 + Number(val) / 100)) / 1000)
  }

  const handleChangeMainTableEditInputWithLossCoefficient = (index: number, val: any) => {
    // 判断数据是否在范围
    if (+val < 0 || +val > 100) return message.warning("损耗系数区间需在0-100")
    const cloneList = structuredClone(requirementList)
    let rowItem = cloneList[index]
    rowItem.editState.lossCoefficient = val
    rowItem.loss_coefficient = val
    rowItem.editState.actualUsage = _ComputedMainLossCoefficientWithActualUsage(
      rowItem,
      String(val),
    )
    rowItem.actual_usage = Math.round(Decimal.mul(rowItem.editState.actualUsage, 1000).toNumber())

    // 配合比子物料列表
    let materials: any[] = []

    if (rowItem.material_proportion) {
      materials = JSON.parse(rowItem.material_proportion.materials)
    }

    // 判断是否有子集数据
    if (rowItem.proportions && rowItem.proportions!.length > 0) {
      if (materials.length > 0) {
        rowItem.proportions = _ComputeProportion(rowItem.proportions, rowItem, materials)
      } else if (
        rowItem.dictionary &&
        rowItem.dictionary.dictionary_class_id == DICTIONARY_CLASS_ID.concrete
      ) {
        let _WZArr = filterDictionaryWithWZAttribute(rowItem.dictionary.properties)
        if (_WZArr && _WZArr.length > 0) {
          const wzWithSplit = _WZArr.map((wzItem) => wzItem.value.split("!"))
          rowItem.proportions = _ComputeWithDictionary(rowItem.proportions, rowItem, wzWithSplit)
        }
      }
    }

    setRequirementList(cloneList)
  }

  const [menuLossCoefficientLists, setMenuLossCoefficientLists] = React.useState<
    MaterialLossCoefficientListData[]
  >([])

  // 处理有系统或项目的损耗系数
  const handleHaveProjectLossCoefficient = async (
    event: React.MouseEvent<HTMLDivElement>,
    index: number,
  ) => {
    setAnchorEl(event.currentTarget)
    let row = requirementList[index]
    const res = await getMaterialLossCoefficientApi({
      engineering_listing_id: item.engineering_listings[0].id,
      ebs_id: row.ebs_id,
      code: row.material_loss_coefficient!.code,
      project_id: PROJECT_ID,
    })

    let newArr = res.items.sort((a, b) => a.id - b.id)

    setMenuLossCoefficientLists(newArr)
  }

  // 处理没有系统的
  const handleNoPorjectLossCoefficient = (index: number) => {
    setEditPos({
      index,
      fields: EditFieldsEnum.LossCoefficient,
    })
  }

  const handleClickLossCoefficient = async (
    event: React.MouseEvent<HTMLDivElement>,
    index: number,
  ) => {
    if ("confirmed" == requirementStatus) {
      return
    }

    let row = requirementList[index]
    if (row.material_loss_coefficient) {
      handleHaveProjectLossCoefficient(event, index)
      handleNoPorjectLossCoefficient(index)
    } else {
      handleNoPorjectLossCoefficient(index)
    }
  }

  const handleSubHaveProjectLossCoefficient = async (
    event: React.MouseEvent<HTMLDivElement>,
    row: MaterialDemandItemListData,
    subRow: MaterialListType,
  ) => {
    setAnchorEl(event.currentTarget)
    const res = await getMaterialLossCoefficientApi({
      engineering_listing_id: item.engineering_listings[0].id,
      ebs_id: row.ebs_id,
      code: subRow.material_loss_coefficient!.code,
      project_id: PROJECT_ID,
    })

    setMenuLossCoefficientLists(res.items)
  }

  // 处理没有系统的
  const handleSubNoPorjectLossCoefficient = (index: number, subIndex: number) => {
    setEditPos({
      index,
      fields: EditFieldsEnum.LossCoefficient,
      subIndex,
    })
  }

  const handleClickSubLossCoefficient = (
    event: React.MouseEvent<HTMLDivElement>,
    index: number,
    subIndex: number,
  ) => {
    if ("confirmed" == requirementStatus) {
      return
    }
    let row = requirementList[index]
    let subRow = requirementList[index].proportions![subIndex]

    if (subRow.material_loss_coefficient) {
      handleSubHaveProjectLossCoefficient(event, row, subRow)
      handleSubNoPorjectLossCoefficient(index, subIndex)
    } else {
      handleSubNoPorjectLossCoefficient(index, subIndex)
    }
  }

  const handleChangeSelectSubDictionaryClass = async (
    value: { val: number; label: string },
    index: number,
    subIndex: number,
  ) => {
    let { val, label } = value
    const cloneList = structuredClone(requirementList)
    cloneList[index].proportions![subIndex].dictionary_class_id = val
    cloneList[index].proportions![subIndex].dictionaryClassName = label

    const res = await getDictionaryListApi({ class_id: val })
    cloneList[index].proportions![subIndex].dictionaryList = res

    setRequirementList(cloneList)
  }

  const handleChangeSelectSubDictionary = async (val: number, index: number, subIndex: number) => {
    const cloneList = structuredClone(requirementList)
    cloneList[index].proportions![subIndex].dictionary_id = val
    cloneList[index].proportions![subIndex].dictionaryName = cloneList[index].proportions![
      subIndex
    ].dictionaryList.find((dic) => val == dic.id)!.name
    setRequirementList(cloneList)
  }

  const handleDelSubMaterialWithConcrete = async (
    index: number,
    subIndex: number,
    row: MaterialDemandItemListData,
  ) => {
    await delMaterialDemandItemApi({
      requirement_id: requirementId,
      id: row.proportions![subIndex].id!,
    })

    getMaterialDemandItemList()
  }

  const handleChangeSubActualUsage = (val: any, index: number, subIndex: number) => {
    const cloneList = structuredClone(requirementList)
    let rowItem = cloneList[index]
    rowItem.proportions![subIndex].editState.actualUsage = val
    setRequirementList(cloneList)
  }

  const handleChangeSubPlannedUsageAt = (val: any, index: number, subIndex: number) => {
    const cloneList = structuredClone(requirementList)
    let rowItem = cloneList[index]
    if (
      dayjs(val).unix() < dayjs(cloneList[index].proportions![subIndex].planned_usage_at).unix() ||
      dayjs(val).unix() > dayjs(cloneList[index].editState.plannedUsageAt).unix()
    ) {
      return message.warning("计划使用时间需晚于施工计划时间")
    }
    rowItem.proportions![subIndex].editState["plannedUsageAt"] = dayJsToStr(val, "YYYY-MM-DD")
    setRequirementList(cloneList)
  }

  const handleChangeSubLossCoefficient = (val: any, index: number, subIndex: number) => {
    const cloneList = structuredClone(requirementList)
    let rowItem = cloneList[index]
    let subItem = cloneList[index].proportions![subIndex]

    if (val < 0 || val > 100) return message.warning("损耗系数区间需在0-100")
    subItem.editState["lossCoefficient"] = val

    // 下面判断有问题
    if (rowItem.material_proportion) {
      const materials = JSON.parse(rowItem.material_proportion.materials)

      const findMaterialItem = materials.find(
        (material: any) =>
          material.dictionary_id == subItem.dictionary_id &&
          material.dictionary_class_id == subItem.dictionary_class_id,
      )
      if (findMaterialItem) {
        let sum = Decimal.add(1, Number(val) / 100)
          .mul(findMaterialItem.quantity)
          .toNumber()
        // findMaterialItem.quantity * (1 + val / 100)
        subItem.editState["actualUsage"] = intoDoubleFixed3(
          Decimal.mul(sum, rowItem.editState.actualUsage).div(1000).toNumber(),
        )
        subItem.actual_usage = Math.round(
          Decimal.mul(subItem.editState.actualUsage, 1000).toNumber(),
        )
      } else {
        let sum = Decimal.add(1, Number(val) / 100)
          .mul(rowItem.editState.actualUsage)
          .toNumber()
        // rowItem.editState.actualUsage * (1 + Number(val) / 100)
        subItem.editState.actualUsage = intoDoubleFixed3(Decimal.div(sum, 1000).toNumber())
        subItem.actual_usage = Math.round(
          Decimal.mul(subItem.editState.actualUsage, 1000).toNumber(),
        )
      }
    } else if (
      rowItem.dictionary &&
      rowItem.dictionary.dictionary_class_id == DICTIONARY_CLASS_ID.concrete
    ) {
      let _WZArr = filterDictionaryWithWZAttribute(rowItem.dictionary.properties)
      if (_WZArr && _WZArr.length > 0) {
        const wzWithSplit = _WZArr.map((wzItem) => wzItem.value.split("!"))
        const findWzItem = wzWithSplit.find((wzItem) => wzItem[1] == subItem.dictionaryName)
        if (findWzItem) {
          let sum = Decimal.add(1, Number(val) / 100)
            .mul(findWzItem[2])
            .toNumber()
          // findWzItem[2] * (1 + val / 100)
          subItem.editState["actualUsage"] = intoDoubleFixed3(
            Decimal.mul(sum, rowItem.editState.actualUsage).div(1000).toNumber(),
          )
          subItem.actual_usage = Math.round(
            Decimal.mul(subItem.editState.actualUsage, 1000).toNumber(),
          )
        } else {
          let sum = Decimal.add(1, Number(val) / 100)
            .mul(rowItem.editState.actualUsage)
            .toNumber()
          // rowItem.editState.actualUsage * (1 + Number(val) / 100)
          subItem.editState.actualUsage = intoDoubleFixed3(Decimal.div(sum, 1000).toNumber())
          subItem.actual_usage = Math.round(
            Decimal.mul(subItem.editState.actualUsage, 1000).toNumber(),
          )
        }
      }
    }

    setRequirementList(cloneList)
  }

  const handleBlurSubActualUsage = async (index: number, subIndex: number) => {
    const cloneList = structuredClone(requirementList)
    let rowItem = cloneList[index]
    let subItem = rowItem.proportions![subIndex]

    await putMaterialDemandItemApi({
      id: subItem.id!,
      dictionary_id: subItem.dictionary_id,
      requirement_id: requirementId,
      actual_usage: Decimal.mul(subItem.editState.actualUsage, 1000).toNumber(),
      loss_coefficient: subItem.loss_coefficient,
      planned_usage_at: subItem.planned_usage_at,
    })
    subItem.actual_usage = Decimal.mul(subItem.editState.actualUsage, 1000).toNumber()
    setEditPos({} as EditPosStateType)
    setRequirementList(cloneList)
  }

  const handleBlurSubLossCoefficient = async (index: number, subIndex: number) => {
    const cloneList = structuredClone(requirementList)
    let rowItem = cloneList[index]
    let subItem = rowItem.proportions![subIndex]

    await putMaterialDemandItemApi({
      id: subItem.id!,
      dictionary_id: subItem.dictionary_id,
      requirement_id: requirementId,
      actual_usage: subItem.actual_usage,
      loss_coefficient: subItem.editState.lossCoefficient,
      planned_usage_at: subItem.planned_usage_at,
    })
    subItem.loss_coefficient = subItem.editState.lossCoefficient
    setEditPos({} as EditPosStateType)
    setRequirementList(cloneList)
  }

  const handleBlurSubPlannedUsageAt = async (index: number, subIndex: number) => {
    const cloneList = structuredClone(requirementList)
    let rowItem = cloneList[index]
    let subItem = rowItem.proportions![subIndex]

    await putMaterialDemandItemApi({
      id: subItem.id!,
      dictionary_id: subItem.dictionary_id,
      requirement_id: requirementId,
      actual_usage: subItem.actual_usage,
      loss_coefficient: subItem.loss_coefficient,
      planned_usage_at: subItem.editState.plannedUsageAt,
    })
    subItem.planned_usage_at = subItem.editState.plannedUsageAt
    setEditPos({} as EditPosStateType)
    setRequirementList(cloneList)
  }

  const { showConfirmationDialog } = useConfirmationDialog()

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
    let flag = !!editPos.index
    if (flag) {
      showConfirmationDialog("修改信息未保存，确认离开当前页面？", () => {
        setPageState(clonePage)
      })
    } else {
      setPageState(clonePage)
    }
  }

  const handleCloseDialog = () => {
    let flag = !!editPos.index

    if (flag) {
      showConfirmationDialog("修改信息未保存，确认离开当前页面？", () => {
        handleCloseDialogAddForm()
      })
    } else {
      handleCloseDialogAddForm()
    }
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

  const handleExport = async () => {
    const res = await getExportMaterialDemandApi({
      project_id: PROJECT_ID,
      period: `${CurrentDate.getYear()}-${CurrentDate.getMonth()}`,
    })
    setOpenSnackbar(true)
    runQueue(res.id)
  }

  const handleConfirmPlan = () => {
    showConfirmationDialog("需求计划生成后不可进行编辑，确认生成？", async () => {
      await putMaterialDemandApi({ project_id: PROJECT_ID, id: requirementId, status: "confirmed" })
      setRequirementStates("confirmed")
    })
  }

  const handleAddProportion = () => {
    showConfirmationDialog("即将跳转到配合比配置页面，当前页面数据将不被保存，确认跳转？", () => {
      router.push("/proportion")
    })
  }

  const [mainIsAdd, setMainIsAdd] = React.useState(false)

  const [subIsAdd, setSubIsAdd] = React.useState(false)

  const [subEditState, setSubEditState] = React.useState<MainEditType>({
    ebs_id: 0,
    loss_coefficient: "",
    actual_usage: 0, // 需求用量
    planned_usage_at: "",
    dictionary_class_id: 0,
    dictionaryClassName: "",
    dictionary_id: 0,
    dictionaryList: [],
  })

  const [mainEditState, setMainEditState] = React.useState<MainEditType>({
    ebs_id: 0,
    loss_coefficient: "",
    actual_usage: 0, // 需求用量
    planned_usage_at: "",
    dictionary_class_id: 0,
    dictionaryClassName: "",
    dictionary_id: 0,
    dictionaryList: [],
  })

  const handleChangeMainEditStateWithEBS = (id: number) => {
    setMainEditState((prevState) => ({ ...prevState, ebs_id: id }))
  }
  const handleChangeMainEditStateWithDictionaryClass = async (id: number, name: string) => {
    const cloneState = structuredClone(mainEditState)
    cloneState.dictionary_class_id = id
    cloneState.dictionaryClassName = name
    const res = await getDictionaryListApi({ class_id: id })
    cloneState.dictionaryList = res
    setMainEditState(cloneState)
  }

  const handleChangeSubEditStateWithDictionaryClass = async (id: number, name: string) => {
    const cloneState = structuredClone(subEditState)
    cloneState.dictionary_class_id = id
    cloneState.dictionaryClassName = name
    const res = await getDictionaryListApi({ class_id: id })
    cloneState.dictionaryList = res
    setSubEditState(cloneState)
  }

  const handleSaveAddMainTable = async () => {
    let findItem = findDictionaryClassEnum(mainEditState.dictionaryClassName)
    let params = {
      class: "user",
      planned_usage_at: mainEditState.planned_usage_at,
      loss_coefficient: mainEditState.loss_coefficient,
      actual_usage: Decimal.mul(mainEditState.actual_usage, 1000).toNumber(),
      dictionary_id: mainEditState.dictionary_id,
      ebs_id: mainEditState.ebs_id,
      material_class: findItem ? findItem.value : "none",
      requirement_id: requirementId,
    } as PostMaterialDemandItemParams
    await postMaterialDemandItemApi(params)
    setMainIsAdd(false)
    getMaterialDemandItemList()
  }

  const handleSaveAddSubTable = async (row: MaterialDemandItemListData) => {
    let findItem = findDictionaryClassEnum(subEditState.dictionaryClassName)
    let params = {
      class: "user",
      ebs_id: row.ebs_id,
      parent_id: row.id,
      planned_usage_at: subEditState.planned_usage_at,
      loss_coefficient: subEditState.loss_coefficient,
      actual_usage: Decimal.mul(subEditState.actual_usage, 1000).toNumber(),
      dictionary_id: subEditState.dictionary_id,
      material_class: findItem ? findItem.value : "none",
      requirement_id: requirementId,
    } as PostMaterialDemandItemParams
    await postMaterialDemandItemApi(params)
    setSubIsAdd(false)
    getMaterialDemandItemList()
  }

  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null)
  const openMenu = Boolean(anchorEl)

  const handleCloseMenu = () => {
    setAnchorEl(null)
    handleBlurMainActualUsage(editPos.index)
  }

  const [editMenuPos, setEditMenuPos] = React.useState<{ index?: number }>({})

  const checkMenuEditPos = (index: number) => {
    return editMenuPos.index == index
  }

  const handleClickMenuLossCoefficient = (index: number) => {
    setEditMenuPos({ index })
  }

  const handleChangeMenuLossCoefficient = (index: number, val: string) => {
    let value = Number(val)
    if (value < 0 || value > 100) return
    const cloneList = structuredClone(menuLossCoefficientLists)
    if (cloneList[index].project_loss_coefficient) {
      cloneList[index].project_loss_coefficient!.loss_coefficient = value
    } else {
      cloneList[index].loss_coefficient = value
    }
    setMenuLossCoefficientLists(cloneList)
  }

  const _ComputedWithMenuChangeLossCoefficient = () => {
    const row = requirementList[editPos.index]

    const rowActualUsage = menuLossCoefficientLists.reduce(
      (previousValue, currentValue, currentIndex) => {
        let lossCoefficient = currentValue.project_loss_coefficient
          ? currentValue.project_loss_coefficient.loss_coefficient
          : currentValue.loss_coefficient

        return Decimal.add(1, Number(lossCoefficient) / 100)
          .mul(previousValue)
          .toNumber()
        // previousValue * (1 + Number(lossCoefficient) / 100)
      },
      row.design_usage,
    )
    handleChangeMainTableEditInputWithActualUsage(
      editPos.index,
      intoDoubleFixed3(rowActualUsage / 1000).toString(),
    )
  }

  const handleBlurMenuLossCoefficient = async (index: number) => {
    if (editPos.subIndex) {
    } else {
      let row = menuLossCoefficientLists[index]

      await postMaterialLossCoefficientApi({
        project_id: PROJECT_ID,
        loss_coefficient_id: row.id,
        loss_coefficient: row.project_loss_coefficient
          ? row.project_loss_coefficient.loss_coefficient
          : row.loss_coefficient,
        engineering_listing_id: item.engineering_listings[0].id,
        ebs_id: requirementList[editPos.index].ebs_id,
      })
      _ComputedWithMenuChangeLossCoefficient()
      setEditMenuPos({})
    }
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
          <Button
            disabled={"confirmed" == requirementStatus}
            className="ml-2 text-sm"
            onClick={() => {
              handleUploadMaterialDemand()
            }}>
            更新数据
            <Tooltip title="重新获取设计数据; " sx={{ zIndex: 1701 }}>
              <i className="iconfont icon-wenhao-xianxingyuankuang cursor-pointer"></i>
            </Tooltip>
          </Button>
        </DialogTitle>
        <div className="px-6 flex justify-between items-center">
          <div>工点数据名称：{item.name}</div>
          <div>
            {/*{requirementStatus == "confirmed" && (*/}
            {/*  <Button*/}
            {/*    onClick={() => {*/}
            {/*      handleExport()*/}
            {/*    }}>*/}
            {/*    导出*/}
            {/*  </Button>*/}
            {/*)}*/}
          </div>
        </div>
        <DialogContent sx={{ width: "90vw", height: "80vh" }}>
          {isLoading ? (
            <Loading></Loading>
          ) : !requirementId ? (
            CreateMaterialDemandBtn()
          ) : (
            <div className="h-full overflow-hidden pb-[4.375rem] relative">
              <div className="h-full overflow-y-auto custom-scroll-bar">
                <Table
                  sx={{ minWidth: 650, ".MuiTableCell-root": { lineHeight: "2rem" } }}
                  aria-label="simple table"
                  stickyHeader>
                  <TableHead sx={{ position: "sticky", top: "0", zIndex: 5 }}>
                    <TableRow className="grid-cols-9 grid">
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
                          <TableRow key={index} className="grid-cols-9 grid">
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
                              {checkEditPos("main", index, EditFieldsEnum.LossCoefficient) &&
                              !row.material_loss_coefficient ? (
                                <div>
                                  <InputBase
                                    autoFocus
                                    className="border-b border-[#e0e0e0] text-railway_blue"
                                    value={row.editState.lossCoefficient}
                                    onChange={(event) => {
                                      let str = event.target.value.replace(/[^0-9]/g, "")
                                      handleChangeMainTableEditInputWithLossCoefficient(index, +str)
                                    }}
                                    onBlur={(event) => {
                                      event.target.value != "" &&
                                        handleBlurMainLossCoefficient(index)
                                    }}
                                  />
                                </div>
                              ) : (
                                <div
                                  className="cursor-pointer"
                                  onClick={(event) => {
                                    handleClickLossCoefficient(event, index)
                                  }}>
                                  {row.loss_coefficient}
                                </div>
                              )}
                            </TableCell>
                            <TableCell align="center">
                              {checkEditPos("main", index, EditFieldsEnum.ActualUsage) ? (
                                <div>
                                  <InputBase
                                    autoFocus
                                    className="border-b border-[#e0e0e0] text-railway_blue"
                                    value={row.editState.actualUsage}
                                    onChange={(event) => {
                                      let str = event.target.value.replace(/[^0-9.]/g, "")
                                      handleChangeMainTableEditInputWithActualUsage(index, str)
                                    }}
                                    onBlur={() => {
                                      handleBlurMainActualUsage(index)
                                    }}
                                  />
                                </div>
                              ) : (
                                <div
                                  onClick={() => {
                                    if ("confirmed" == requirementStatus) {
                                      return
                                    }
                                    setEditPos({ index, fields: EditFieldsEnum.ActualUsage })
                                  }}>
                                  {intoDoubleFixed3(row.actual_usage / 1000)}
                                </div>
                              )}
                            </TableCell>
                            <TableCell align="center">
                              {checkEditPos("main", index, EditFieldsEnum.PlannedUsageAt) ? (
                                <div>
                                  <DatePicker
                                    autoFocus
                                    value={dayjs(row.editState.plannedUsageAt)}
                                    onChange={(newVal) => {
                                      handleChangeMainTableEditInputWithPlannedUsageAt(
                                        index,
                                        newVal ?? dayjs(new Date()),
                                      )
                                    }}
                                    onBlur={() => {
                                      handleBlurMainPlannedUsageAt(index)
                                    }}
                                  />
                                </div>
                              ) : (
                                <div
                                  onClick={() => {
                                    if ("confirmed" == requirementStatus) {
                                      return
                                    }
                                    setEditPos({ index, fields: EditFieldsEnum.PlannedUsageAt })
                                  }}>
                                  {dayJsToStr(row.planned_usage_at, "YYYY-MM-DD")}
                                </div>
                              )}
                            </TableCell>
                            <TableCell align="center"></TableCell>
                          </TableRow>
                        ) : (
                          <TableRow key={index}>
                            <TableCell colSpan={8} style={{ padding: 0 }}>
                              <Table sx={{ minWidth: 650 }}>
                                <TableBody>
                                  {/* 混凝土列*/}
                                  <TableRow className="grid-cols-9 grid">
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
                                      {checkEditPos(
                                        "main",
                                        index,
                                        EditFieldsEnum.LossCoefficient,
                                      ) && !row.material_loss_coefficient ? (
                                        <div>
                                          <InputBase
                                            autoFocus
                                            className="border-b border-[#e0e0e0] text-railway_blue"
                                            value={row.editState.lossCoefficient}
                                            onChange={(event) => {
                                              let str = event.target.value.replace(/[^0-9]/g, "")
                                              handleChangeMainTableEditInputWithLossCoefficient(
                                                index,
                                                +str,
                                              )
                                            }}
                                            onBlur={() => {
                                              handleBlurMainLossCoefficient(index)
                                            }}
                                          />
                                        </div>
                                      ) : (
                                        <div
                                          className="h-8 leading-8 cursor-pointer"
                                          onClick={(event) => {
                                            handleClickLossCoefficient(event, index)
                                          }}>
                                          {row.loss_coefficient}
                                        </div>
                                      )}
                                    </TableCell>
                                    <TableCell align="center">
                                      {checkEditPos("main", index, EditFieldsEnum.ActualUsage) ? (
                                        <div>
                                          <InputBase
                                            autoFocus
                                            className="border-b border-[#e0e0e0] text-railway_blue h-8"
                                            value={row.editState.actualUsage}
                                            onChange={(event) => {
                                              let str = event.target.value.replace(/[^0-9.]/g, "")
                                              handleChangeMainTableEditInputWithActualUsage(
                                                index,
                                                str,
                                              )
                                            }}
                                            onBlur={() => {
                                              handleBlurMainActualUsage(index)
                                            }}
                                          />
                                        </div>
                                      ) : (
                                        <div
                                          className="h-8 leading-8"
                                          onClick={() => {
                                            if ("confirmed" == requirementStatus) {
                                              return
                                            }
                                            setEditPos({
                                              index,
                                              fields: EditFieldsEnum.ActualUsage,
                                            })
                                          }}>
                                          {intoDoubleFixed3(row.actual_usage / 1000)}
                                        </div>
                                      )}
                                    </TableCell>
                                    <TableCell align="center">
                                      {checkEditPos(
                                        "main",
                                        index,
                                        EditFieldsEnum.PlannedUsageAt,
                                      ) ? (
                                        <div>
                                          <DatePicker
                                            autoFocus
                                            value={dayjs(row.editState.plannedUsageAt)}
                                            onChange={(newVal) => {
                                              handleChangeMainTableEditInputWithPlannedUsageAt(
                                                index,
                                                newVal ?? dayjs(new Date()),
                                              )
                                            }}
                                            onBlur={() => {
                                              handleBlurMainPlannedUsageAt(index)
                                            }}
                                          />
                                        </div>
                                      ) : (
                                        <div
                                          onClick={() => {
                                            if ("confirmed" == requirementStatus) {
                                              return
                                            }
                                            setEditPos({
                                              index,
                                              fields: EditFieldsEnum.PlannedUsageAt,
                                            })
                                          }}>
                                          {dayJsToStr(row.planned_usage_at, "YYYY-MM-DD")}
                                        </div>
                                      )}
                                    </TableCell>
                                    <TableCell align="center"></TableCell>
                                  </TableRow>
                                  {row.isExpand && (
                                    <React.Fragment>
                                      <TableRow
                                        className="grid-cols-9 grid"
                                        sx={{
                                          bgcolor: "#f2f2f2",
                                          border: "1px dashed #e0e0e0",
                                          "th,td": { border: "none" },
                                        }}>
                                        <TableCell component="th" scope="row"></TableCell>
                                        <TableCell></TableCell>
                                        <TableCell align="center">
                                          <div className="text-left">包含物资</div>
                                          <Select
                                            className="bg-white"
                                            disabled={requirementStatus == "confirmed"}
                                            id="tags"
                                            fullWidth
                                            size="small"
                                            MenuProps={{ sx: { zIndex: 1703 } }}
                                            value={
                                              row.editState.proportion
                                                ? row.editState.proportion
                                                : 0
                                            }
                                            onChange={(event) => {
                                              handleChangeSelectProportion(
                                                +event.target.value,
                                                index,
                                              )
                                            }}>
                                            <MenuItem value={0} disabled>
                                              <i className="text-railway_gray">请选择一个配合比</i>
                                            </MenuItem>
                                            {findProportionSelf(
                                              materialProportionList,
                                              row,
                                              item.engineering_listings[0].id,
                                            ).map((item) => (
                                              <MenuItem value={item.id} key={item.id}>
                                                {item.name}-{item.proportion}
                                              </MenuItem>
                                            ))}
                                            <div className="pl-3">
                                              <Button
                                                startIcon={<AddIcon />}
                                                onClick={(event) => {
                                                  event.stopPropagation()
                                                  handleAddProportion()
                                                }}>
                                                添加配合比
                                              </Button>
                                            </div>
                                          </Select>
                                        </TableCell>
                                        <TableCell
                                          align="center"
                                          className="col-span-6"></TableCell>
                                      </TableRow>
                                      {row.proportions?.map((subRow, subIndex) => (
                                        <TableRow
                                          className="grid-cols-9 grid"
                                          key={subIndex}
                                          sx={{
                                            bgcolor: "#f2f2f2",
                                            border: "1px dashed #e0e0e0",
                                            "th,td": { border: "none" },
                                          }}>
                                          <TableCell component="th" scope="row"></TableCell>
                                          <TableCell align="center">
                                            {subRow.isSelect ? (
                                              <SelectDictionaryClass
                                                disabled={requirementStatus == "confirmed"}
                                                placeholder="请选择一个物资名称"
                                                onChange={(id, label) => {
                                                  handleChangeSelectSubDictionaryClass(
                                                    { val: id, label },
                                                    index,
                                                    subIndex,
                                                  )
                                                }}></SelectDictionaryClass>
                                            ) : (
                                              subRow.dictionary?.dictionary_class?.name
                                            )}
                                          </TableCell>
                                          <TableCell align="center">
                                            {subRow.isSelect ? (
                                              <Select
                                                className="bg-white"
                                                disabled={requirementStatus == "confirmed"}
                                                fullWidth
                                                size="small"
                                                MenuProps={{ sx: { zIndex: 1703 } }}
                                                value={subRow.dictionary_id}
                                                onChange={(event) => {
                                                  handleChangeSelectSubDictionary(
                                                    +event.target.value,
                                                    index,
                                                    subIndex,
                                                  )
                                                }}>
                                                <MenuItem value={0} disabled>
                                                  <i className="text-railway_gray">规格型号</i>
                                                </MenuItem>
                                                {subRow.dictionaryList.map((item) => (
                                                  <MenuItem value={item.id} key={item.id}>
                                                    {item.name}
                                                  </MenuItem>
                                                ))}
                                              </Select>
                                            ) : (
                                              subRow.dictionaryName
                                            )}
                                          </TableCell>
                                          <TableCell align="center">-</TableCell>
                                          <TableCell align="center">
                                            {subRow.id &&
                                              findConstUnitWithDictionary(
                                                subRow.dictionary?.properties,
                                              )}
                                          </TableCell>
                                          <TableCell align="center">
                                            {checkEditPos(
                                              "sub",
                                              index,
                                              EditFieldsEnum.LossCoefficient,
                                              subIndex,
                                            ) ? (
                                              <div>
                                                <InputBase
                                                  autoFocus
                                                  className="border-b border-[#e0e0e0] text-railway_blue"
                                                  value={subRow.editState.lossCoefficient}
                                                  onChange={(event) => {
                                                    let str = event.target.value.replace(
                                                      /[^0-9]/g,
                                                      "",
                                                    )
                                                    handleChangeSubLossCoefficient(
                                                      +str,
                                                      index,
                                                      subIndex,
                                                    )
                                                  }}
                                                  onBlur={() => {
                                                    handleBlurSubLossCoefficient(index, subIndex)
                                                  }}
                                                />
                                              </div>
                                            ) : (
                                              <div
                                                className="cursor-pointer"
                                                onClick={(event) => {
                                                  handleClickSubLossCoefficient(
                                                    event,
                                                    index,
                                                    subIndex,
                                                  )
                                                  // setAnchorEl(event.currentTarget)
                                                }}>
                                                {subRow.loss_coefficient}
                                              </div>
                                            )}
                                          </TableCell>
                                          <TableCell align="center">
                                            {checkEditPos(
                                              "sub",
                                              index,
                                              EditFieldsEnum.ActualUsage,
                                              subIndex,
                                            ) ? (
                                              <div>
                                                <InputBase
                                                  autoFocus
                                                  className="border-b border-[#e0e0e0] text-railway_blue"
                                                  value={subRow.editState.actualUsage}
                                                  onChange={(event) => {
                                                    let str = event.target.value.replace(
                                                      /[^0-9.]/g,
                                                      "",
                                                    )
                                                    handleChangeSubActualUsage(str, index, subIndex)
                                                  }}
                                                  onBlur={() => {
                                                    handleBlurSubActualUsage(index, subIndex)
                                                  }}
                                                />
                                              </div>
                                            ) : (
                                              <div
                                                className="h-8"
                                                onClick={() => {
                                                  if ("confirmed" == requirementStatus) {
                                                    return
                                                  }
                                                  setEditPos({
                                                    index,
                                                    subIndex,
                                                    fields: EditFieldsEnum.ActualUsage,
                                                  })
                                                }}>
                                                {intoDoubleFixed3(subRow.actual_usage / 1000)}
                                              </div>
                                            )}
                                          </TableCell>
                                          <TableCell align="center">
                                            {checkEditPos(
                                              "sub",
                                              index,
                                              EditFieldsEnum.PlannedUsageAt,
                                              subIndex,
                                            ) ? (
                                              <DatePicker
                                                autoFocus
                                                locale={locale}
                                                className="w-full"
                                                value={dayjs(subRow.editState.plannedUsageAt)}
                                                onChange={(newValue) => {
                                                  handleChangeSubPlannedUsageAt(
                                                    dayJsToStr(
                                                      newValue ?? new Date(),
                                                      "YYYY-MM-DD",
                                                    ),
                                                    index,
                                                    subIndex,
                                                  )
                                                }}
                                                onBlur={() => {
                                                  handleBlurSubPlannedUsageAt(index, subIndex)
                                                }}
                                              />
                                            ) : (
                                              <div
                                                onClick={() => {
                                                  if ("confirmed" == requirementStatus) {
                                                    return
                                                  }
                                                  setEditPos({
                                                    index,
                                                    subIndex,
                                                    fields: EditFieldsEnum.PlannedUsageAt,
                                                  })
                                                }}>
                                                {dayJsToStr(subRow.planned_usage_at, "YYYY-MM-DD")}
                                              </div>
                                            )}
                                          </TableCell>
                                          <TableCell align="center">
                                            <div className="flex justify-center gap-x-2 ">
                                              {subRow.class == "user" && !subRow.isSelect && (
                                                <IconButton
                                                  disabled={"confirmed" == requirementStatus}
                                                  onClick={() => {
                                                    handleDelSubMaterialWithConcrete(
                                                      index,
                                                      subIndex,
                                                      row,
                                                    )
                                                  }}>
                                                  <DeleteOutlineIcon className="text-railway_error" />
                                                </IconButton>
                                              )}
                                            </div>
                                          </TableCell>
                                        </TableRow>
                                      ))}
                                      {subIsAdd && (
                                        <TableRow className="grid-cols-9 grid">
                                          <TableCell align="center"></TableCell>
                                          <TableCell align="center">
                                            <SelectDictionaryClass
                                              disabled={requirementStatus == "confirmed"}
                                              placeholder="请选择一个物资名称"
                                              onChange={(id, label) => {
                                                handleChangeSubEditStateWithDictionaryClass(
                                                  id,
                                                  label,
                                                )
                                              }}></SelectDictionaryClass>
                                          </TableCell>
                                          <TableCell align="center">
                                            <Select
                                              className="bg-white"
                                              disabled={requirementStatus == "confirmed"}
                                              fullWidth
                                              size="small"
                                              MenuProps={{ sx: { zIndex: 1703 } }}
                                              onChange={(event) => {
                                                setSubEditState((prevState) => ({
                                                  ...prevState,
                                                  dictionary_id: Number(event.target.value),
                                                }))
                                              }}>
                                              <MenuItem value={0} disabled>
                                                <i className="text-railway_gray">规格型号</i>
                                              </MenuItem>
                                              {subEditState.dictionaryList.map((item) => (
                                                <MenuItem value={item.id} key={item.id}>
                                                  {item.name}
                                                </MenuItem>
                                              ))}
                                            </Select>
                                          </TableCell>
                                          <TableCell align="center">-</TableCell>
                                          <TableCell align="center">-</TableCell>
                                          <TableCell align="center">
                                            <InputBase
                                              className="outline outline-[#e0e0e0]"
                                              onChange={(event) => {
                                                let str = event.target.value.replace(/[^0-9]/g, "")
                                                setSubEditState((prevState) => ({
                                                  ...prevState,
                                                  loss_coefficient: str,
                                                }))
                                              }}
                                            />
                                          </TableCell>
                                          <TableCell align="center">
                                            <div>
                                              <InputBase
                                                className="outline outline-[#e0e0e0]"
                                                onChange={(event) => {
                                                  let str = event.target.value.replace(
                                                    /[^0-9.]/g,
                                                    "",
                                                  )
                                                  setSubEditState((prevState) => ({
                                                    ...prevState,
                                                    actual_usage: +str,
                                                  }))
                                                }}
                                              />
                                            </div>
                                          </TableCell>
                                          <TableCell align="center">
                                            <div>
                                              <DatePicker
                                                locale={locale}
                                                onChange={(newVal) => {
                                                  setSubEditState((prevState) => ({
                                                    ...prevState,
                                                    planned_usage_at: dayJsToStr(
                                                      newVal ?? new Date(),
                                                      "YYYY-MM-DD",
                                                    ),
                                                  }))
                                                }}
                                              />
                                            </div>
                                          </TableCell>
                                          <TableCell align="center">
                                            <div className="flex justify-center gap-x-2 ">
                                              <IconButton
                                                disabled={"confirmed" == requirementStatus}
                                                onClick={() => {
                                                  handleSaveAddSubTable(row)
                                                }}>
                                                <SaveIcon className="text-railway_blue" />
                                              </IconButton>
                                              <IconButton
                                                onClick={() => {
                                                  setSubIsAdd(false)
                                                  setSubEditState({
                                                    ebs_id: 0,
                                                    loss_coefficient: "",
                                                    actual_usage: 0, // 需求用量
                                                    planned_usage_at: "",
                                                    dictionary_class_id: 0,
                                                    dictionaryClassName: "",
                                                    dictionary_id: 0,
                                                    dictionaryList: [],
                                                  })
                                                }}>
                                                <CancelIcon className="text-railway_error" />
                                              </IconButton>
                                            </div>
                                          </TableCell>
                                        </TableRow>
                                      )}
                                      {!subIsAdd && process.env.NEXT_PUBLIC_CONTROL == "1" && (
                                        <TableRow
                                          className="grid-cols-8 grid"
                                          sx={{
                                            bgcolor: "#f2f2f2",
                                            border: "1px dashed #e0e0e0",
                                            "th,td": { border: "none" },
                                          }}>
                                          <TableCell component="th" scope="row"></TableCell>
                                          <TableCell align="center"></TableCell>
                                          <TableCell align="center"></TableCell>
                                          <TableCell align="center"></TableCell>
                                          <TableCell align="center"></TableCell>
                                          <TableCell align="center"></TableCell>
                                          <TableCell align="center"></TableCell>
                                          <TableCell align="center">
                                            <div className="flex justify-center gap-x-2 ">
                                              <IconButton
                                                disabled={"confirmed" == requirementStatus}
                                                onClick={() => {
                                                  setSubIsAdd(true)
                                                }}>
                                                <AddIcon className="text-railway_blue" />
                                              </IconButton>
                                            </div>
                                          </TableCell>
                                        </TableRow>
                                      )}
                                    </React.Fragment>
                                  )}
                                </TableBody>
                              </Table>
                            </TableCell>
                          </TableRow>
                        )
                      })}
                    {mainIsAdd && (
                      <TableRow className="grid-cols-9 grid">
                        <TableCell align="center">
                          <TreeSelectWithEbs
                            engineeringListingId={item.engineering_listings[0].id}
                            ebs_code={item.engineering_listings[0].ebs_code}
                            onChecked={(id: number) => {
                              handleChangeMainEditStateWithEBS(id)
                            }}
                          />
                        </TableCell>
                        <TableCell align="center">
                          <SelectDictionaryClass
                            disabled={requirementStatus == "confirmed"}
                            placeholder="请选择一个物资名称"
                            onChange={(id, label) => {
                              handleChangeMainEditStateWithDictionaryClass(id, label)
                            }}></SelectDictionaryClass>
                        </TableCell>
                        <TableCell align="center">
                          <Select
                            className="bg-white"
                            disabled={requirementStatus == "confirmed"}
                            fullWidth
                            size="small"
                            MenuProps={{ sx: { zIndex: 1703 } }}
                            onChange={(event) => {
                              setMainEditState((prevState) => ({
                                ...prevState,
                                dictionary_id: Number(event.target.value),
                              }))
                            }}>
                            <MenuItem value={0} disabled>
                              <i className="text-railway_gray">规格型号</i>
                            </MenuItem>
                            {mainEditState.dictionaryList.map((item) => (
                              <MenuItem value={item.id} key={item.id}>
                                {item.name}
                              </MenuItem>
                            ))}
                          </Select>
                        </TableCell>
                        <TableCell align="center">-</TableCell>
                        <TableCell align="center">-</TableCell>
                        <TableCell align="center">
                          <InputBase
                            className="outline outline-[#e0e0e0]"
                            onChange={(event) => {
                              let str = event.target.value.replace(/[^0-9]/g, "")
                              setMainEditState((prevState) => ({
                                ...prevState,
                                loss_coefficient: str,
                              }))
                            }}
                          />
                        </TableCell>
                        <TableCell align="center">
                          <div>
                            <InputBase
                              className="outline outline-[#e0e0e0]"
                              onChange={(event) => {
                                let str = event.target.value.replace(/[^0-9.]/g, "")
                                setMainEditState((prevState) => ({
                                  ...prevState,
                                  actual_usage: +str,
                                }))
                              }}
                            />
                          </div>
                        </TableCell>
                        <TableCell align="center">
                          <div>
                            <DatePicker
                              locale={locale}
                              onChange={(newVal) => {
                                setMainEditState((prevState) => ({
                                  ...prevState,
                                  planned_usage_at: dayJsToStr(newVal ?? new Date(), "YYYY-MM-DD"),
                                }))
                              }}
                            />
                          </div>
                        </TableCell>
                        <TableCell align="center">
                          <div className="flex justify-center gap-x-2 ">
                            <IconButton
                              disabled={"confirmed" == requirementStatus}
                              onClick={() => {
                                handleSaveAddMainTable()
                              }}>
                              <SaveIcon className="text-railway_blue" />
                            </IconButton>
                            <IconButton
                              onClick={() => {
                                setMainIsAdd(false)
                                setMainEditState({
                                  ebs_id: 0,
                                  loss_coefficient: "",
                                  actual_usage: 0, // 需求用量
                                  planned_usage_at: "",
                                  dictionary_class_id: 0,
                                  dictionaryClassName: "",
                                  dictionary_id: 0,
                                  dictionaryList: [],
                                })
                              }}>
                              <CancelIcon className="text-railway_error" />
                            </IconButton>
                          </div>
                        </TableCell>
                      </TableRow>
                    )}

                    {!mainIsAdd && process.env.NEXT_PUBLIC_CONTROL == "1" && (
                      <TableRow
                        className="grid-cols-8 grid"
                        sx={{
                          "th,td": { border: "none" },
                        }}>
                        <TableCell align="center" className="col-span-7"></TableCell>
                        <TableCell align="center">
                          <div className="flex justify-center gap-x-2 ">
                            <IconButton
                              disabled={"confirmed" == requirementStatus}
                              onClick={() => {
                                setMainIsAdd(true)
                              }}>
                              <AddIcon className="text-railway_blue" />
                            </IconButton>
                          </div>
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>

              <div className="absolute bottom-0 w-full">
                <div className="overflow-hidden">
                  <Button
                    disabled={"confirmed" == requirementStatus}
                    className="float-right"
                    variant="contained"
                    onClick={() => {
                      handleConfirmPlan()
                    }}>
                    确认需求计划
                  </Button>
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
                    <TableCell align="center" className="font-bold">
                      损耗系数名称
                    </TableCell>
                    <TableCell align="center" className="font-bold">
                      损耗系数
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {menuLossCoefficientLists.map((row, index) => (
                    <TableRow key={row.id}>
                      <TableCell align="center">{row.name}</TableCell>
                      <TableCell align="center">
                        {checkMenuEditPos(index) ? (
                          <div>
                            <InputBase
                              autoFocus
                              className="border-b border-[#e0e0e0] text-railway_blue"
                              value={
                                row.project_loss_coefficient
                                  ? row.project_loss_coefficient.loss_coefficient
                                  : row.loss_coefficient
                              }
                              onChange={(event) => {
                                let str = event.target.value.replace(/[^0-9.]/g, "")
                                handleChangeMenuLossCoefficient(index, str)
                              }}
                              onBlur={() => {
                                handleBlurMenuLossCoefficient(index)
                              }}
                            />
                          </div>
                        ) : (
                          <div
                            onClick={() => {
                              handleClickMenuLossCoefficient(index)
                            }}>
                            {row.project_loss_coefficient
                              ? row.project_loss_coefficient.loss_coefficient
                              : row.loss_coefficient}
                          </div>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </Menu>
        </DialogContent>
      </Dialog>
    </>
  )
}
