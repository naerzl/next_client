"use client"
import React from "react"
import {
  Button,
  Dialog,
  DialogContent,
  DialogTitle,
  InputBase,
  MenuItem,
  Pagination,
  Select,
} from "@mui/material"
import Table from "@mui/material/Table"
import TableHead from "@mui/material/TableHead"
import TableRow from "@mui/material/TableRow"
import TableCell from "@mui/material/TableCell"
import TableBody from "@mui/material/TableBody"
import { ProcessListData } from "@/app/gantt/types"
import ganttContext from "@/app/gantt/context/ganttContext"
import { LayoutContext } from "@/components/LayoutContext"
import { BaseApiPager } from "@/types/api"
import Tooltip from "@mui/material/Tooltip"
import { CurrentDate, dateToUTCCustom, dayJsToStr, intoDoubleFixed3 } from "@/libs/methods"
import useSWRMutation from "swr/mutation"
import {
  reqDelMaterialDemandItem,
  reqGetMaterialDemand,
  reqGetMaterialDemandItem,
  reqPostMaterialDemand,
  reqPostMaterialDemandItem,
  reqPutMaterialDemandItem,
} from "@/app/material-demand/api"
import {
  DemandEditState,
  MaterialDemandItemListData,
  PutMaterialDemandItemParams,
} from "@/app/material-demand/types"
import { CONCRETE_DICTIONARY_CLASS_ID } from "@/app/ebs-data/const"
import AddIcon from "@mui/icons-material/Add"
import { reqGetMaterialProportion } from "@/app/proportion/api"
import { MaterialProportionListData } from "@/app/proportion/types"
import { reqGetDictionary } from "@/app/material-approach/api"
import { DictionaryData } from "@/app/material-approach/types"
import { DictionaryClassOption } from "@/app/material-demand/const"
import { subConcreteDictionaryClass } from "@/app/material-processing/const"
import { DatePicker, message } from "antd"
import locale from "antd/es/date-picker/locale/zh_CN"

import "dayjs/locale/zh-cn"
import dayjs, { Dayjs } from "dayjs"
import { DICTIONARY_CLASS_ID } from "@/libs/const"

type Props = {
  open: boolean
  handleCloseDialogAddForm: () => void
  item: ProcessListData & any
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
  isSubEdit?: boolean
  isSelect?: boolean
  editState: SubEditState
  isDel?: boolean
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
  {
    width: "150px",
    title: "操作",
    key: "action",
  },
]

function findConstUnitWithDictionary(str: string) {
  const arr: { key: string; value: string }[] | any = JSON.parse(str || "[]")

  const obj = arr.find((item: any) => item.key == "常用单位")
  return obj ? obj.value : ""
}

export default function DialogMaterialDemand(props: Props) {
  const { open, handleCloseDialogAddForm, item } = props

  const { trigger: postMaterialDemandApi } = useSWRMutation(
    "/project-material-requirement",
    reqPostMaterialDemand,
  )

  const { trigger: getMaterialDemandItemApi } = useSWRMutation(
    "/project-material-requirement-item",
    reqGetMaterialDemandItem,
  )

  const { trigger: putMaterialDemandItemApi } = useSWRMutation(
    "/project-material-requirement-item",
    reqPutMaterialDemandItem,
  )

  const { trigger: postMaterialDemandItemApi } = useSWRMutation(
    "/project-material-requirement-item",
    reqPostMaterialDemandItem,
  )

  const { trigger: delMaterialDemandItemApi } = useSWRMutation(
    "/project-material-requirement-item",
    reqDelMaterialDemandItem,
  )

  const { trigger: getMaterialDemandApi } = useSWRMutation(
    "/project-material-requirement",
    reqGetMaterialDemand,
  )

  const { trigger: getMaterialProportionApi } = useSWRMutation(
    "/material-proportion",
    reqGetMaterialProportion,
  )

  const { trigger: getDictionaryListApi } = useSWRMutation("/dictionary", reqGetDictionary)

  const { projectId: PROJECT_ID } = React.useContext(LayoutContext)

  const ctx = React.useContext(ganttContext)

  const [requirementId, setRequirementId] = React.useState(0)

  const [pager, setPager] = React.useState<BaseApiPager>({} as BaseApiPager)

  const [requirementList, setRequirementList] = React.useState<MaterialDemandItemListData[]>([])

  const getMaterialDemandList = async () => {
    const res = await getMaterialDemandApi({
      project_id: PROJECT_ID,
      engineering_listing_id: item.engineering_listings[0].id,
      project_si_id: Number(item.id.substring(1)),
      project_sp_id: item.parent_id,
    })
    if (res.items.length > 0) {
      setRequirementId(res.items[0].id)
    } else {
      setRequirementId(0)
      setRequirementList([])
    }
  }
  const getMaterialDemandItemList = async () => {
    const res = await getMaterialDemandItemApi({ requirement_id: requirementId })

    const arrs: MaterialDemandItemListData[] = []

    for (const itemsKey in res.items) {
      let item = res.items[itemsKey]

      item.editState = {
        lossCoefficient: item.loss_coefficient,
        actualUsage: item.actual_usage / 1000,
        plannedUsageAt: dateToUTCCustom(item.planned_usage_at, "YYYY-MM-DD"),
      } as DemandEditState

      if (item.dictionary && item.dictionary.dictionary_class_id == DICTIONARY_CLASS_ID.concrete) {
        // 获取混凝土的子列表
        const r = await getMaterialDemandItemApi({
          requirement_id: requirementId,
          parent_id: item.id,
        })

        const subTableList = []

        // 获取每一个子项的字典名称
        for (const rKey in r.items) {
          let subItem = r.items[rKey]
          const subDictionary = await getDictionaryListApi({
            class_id: subItem.dictionary.dictionary_class_id,
          })

          // 处理数据
          let obj = {
            id: subItem.id,
            dictionary_id: subItem.dictionary_id,
            quantity: subItem.quantity,
            dictionaryList: subDictionary,
            dictionaryName: subDictionary.find((dict) => dict.id == subItem.dictionary_id)!.name,
            dictionary_class_id: subItem.dictionary.dictionary_class_id,
            isDel: true,
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

        if (item.material_proportion) {
          // item.editState.proportion = item.material_proportion.id
          // let materials = JSON.parse(item.material_proportion.materials)
          // let arr: Array<MaterialListType> = []
          //
          // for (const materialsKey in materials) {
          //   let itemWithMaterial = materials[materialsKey]
          //   const res = await getDictionaryListApi({
          //     class_id: itemWithMaterial.dictionary_class_id,
          //   })
          //
          //   // 需要计算数据
          //   let obj = {
          //     dictionary_id: itemWithMaterial.dictionary_id,
          //     quantity: itemWithMaterial.quantity,
          //     dictionaryList: res,
          //     dictionary_class_id: itemWithMaterial.dictionary_class_id,
          //     editState: {
          //       plannedUsageAt: dateToUTCCustom(item.planned_usage_at, "YYYY-MM-DD"),
          //       lossCoefficient: "",
          //       actualUsage: 0, // 需求用量
          //     },
          //     planned_usage_at: dateToUTCCustom(item.planned_usage_at, "YYYY-MM-DD"),
          //     actual_usage: 0,
          //   } as MaterialListType
          //
          //   arr.push(obj)
          // }

          // arrs.push({ ...item, proportions: [...arr, ...subTableList] })
          arrs.push({ ...item, proportions: [...subTableList] })
        } else {
          arrs.push(item)
        }
      } else {
        arrs.push(item)
      }
    }

    setRequirementList(arrs)
    setPager(res.pager)
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
  }, [requirementId])

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
  }

  const handleChangeSelectProportion = async (val: number, index: number) => {
    const obj = materialProportionList.find((item) => item.id == val)!
    if (obj) {
      const cloneList = structuredClone(requirementList)

      let materials = JSON.parse(obj.materials)
      let arr: Array<MaterialListType> = []
      for (const materialsKey in materials) {
        let item = materials[materialsKey]
        const res = await getDictionaryListApi({ class_id: item.dictionary_class_id })

        let obj = {
          dictionary_id: item.dictionary_id,
          quantity: item.quantity,
          dictionaryList: res,
          dictionary_class_id: item.dictionary_class_id,
          isSelect: false,
          isSubEdit: true,
          editState: {
            lossCoefficient: "",
            actualUsage: 0,
            plannedUsageAt: cloneList[index].editState.plannedUsageAt,
          },
          planned_usage_at: cloneList[index].editState.plannedUsageAt,
          loss_coefficient: "",
          actual_usage: 0,
        } as MaterialListType

        arr.push(obj)
      }

      cloneList[index].editState.proportion = val
      cloneList[index].proportions = arr
      setRequirementList(cloneList)
    }
  }

  // 添加子列表里面的物资
  const handleAddConcreteMaterial = (index: number) => {
    const cloneList = structuredClone(requirementList)

    if (cloneList[index].proportions) {
      cloneList[index].proportions?.push({
        dictionary_class_id: 0,
        dictionary_id: 0,
        dictionaryList: [],
        isSelect: true,
        isSubEdit: true,
        dictionaryName: "",
        loss_coefficient: "",
        actual_usage: 0,
        planned_usage_at: dateToUTCCustom(cloneList[index].planned_usage_at, "YYYY-MM-DD"),
        editState: {
          lossCoefficient: "",
          actualUsage: 0,
          plannedUsageAt: dateToUTCCustom(cloneList[index].planned_usage_at, "YYYY-MM-DD"),
        },
      })
    } else {
      cloneList[index].proportions = [
        {
          dictionary_class_id: 0,
          dictionary_id: 0,
          dictionaryList: [],
          isSelect: true,
          isSubEdit: true,
          dictionaryName: "",
          loss_coefficient: "",
          actual_usage: 0,
          planned_usage_at: dateToUTCCustom(new Date(), "YYYY-MM-DD"),
          editState: {
            lossCoefficient: "",
            actualUsage: 0,
            plannedUsageAt: dateToUTCCustom(new Date(), "YYYY-MM-DD"),
          },
        },
      ]
    }

    setRequirementList(cloneList)
  }

  //  编辑没有子列表的主列表
  const handleEditMainTableNoConcrete = (index: number) => {
    const cloneList = structuredClone(requirementList)
    cloneList[index].isEdit = true
    setRequirementList(cloneList)
  }

  const handleChangeMainTableEditInput = (
    index: number,
    val: string | Dayjs,
    type: keyof DemandEditState,
  ) => {
    const cloneList = structuredClone(requirementList)
    // @ts-ignore
    if (type == "actualUsage") {
      // @ts-ignore
      cloneList[index].editState[type] = val
    } else if (type == "plannedUsageAt") {
      if (dayjs(val).unix() < dayjs(cloneList[index].planned_usage_at).unix()) {
        return message.warning("计划使用时间需晚于施工计划时间")
      }
      cloneList[index].editState["plannedUsageAt"] = dayJsToStr(val, "YYYY-MM-DD")
    } else {
      // @ts-ignore
      cloneList[index].editState[type] = val
      cloneList[index].editState["actualUsage"] = +(
        (cloneList[index].design_usage / 1000) *
        (1 + Number(val) / 100)
      ).toFixed(3)
    }
    setRequirementList(cloneList)
  }

  // 保存主列表编辑
  const handleSaveMainTableNoConcrete = async (index: number, row: MaterialDemandItemListData) => {
    let params = {
      id: row.id,
      requirement_id: requirementId,
      actual_usage: row.editState.actualUsage * 1000,
      loss_coefficient: row.editState.lossCoefficient,
      planned_usage_at: row.editState.plannedUsageAt,
    } as PutMaterialDemandItemParams
    await putMaterialDemandItemApi(params)

    const cloneList = structuredClone(requirementList)
    cloneList[index].loss_coefficient = row.editState.lossCoefficient
    cloneList[index].actual_usage = row.editState.actualUsage * 1000
    cloneList[index].planned_usage_at = row.editState.plannedUsageAt
    cloneList[index].isEdit = false
    setRequirementList(cloneList)
  }

  const handleEditWithConcrete = (index: number) => {
    const cloneList = structuredClone(requirementList)

    cloneList[index].isConcreteEdit = true
    cloneList[index].isEdit = true
    if (cloneList[index].proportions && cloneList[index].proportions!.length > 0) {
      cloneList[index].proportions = cloneList[index].proportions!.map((item) => {
        item.isSubEdit = true
        return item
      })
    }

    setRequirementList(cloneList)
  }

  const handleSaveWithConcrete = async (index: number, row: MaterialDemandItemListData) => {
    let params = {
      id: row.id,
      requirement_id: requirementId,
      actual_usage: row.editState.actualUsage * 1000,
      loss_coefficient: row.editState.lossCoefficient,
    } as PutMaterialDemandItemParams
    if (row.editState.proportion) {
      params.proportion_id = row.editState.proportion
    }
    await putMaterialDemandItemApi(params)

    if (!row.proportions) {
      return getMaterialDemandItemList()
    }

    const cloneList = structuredClone(requirementList)

    let needEditItems: MaterialListType[] = []
    cloneList[index].proportions!.forEach((sub) => {
      if (
        sub.loss_coefficient != sub.editState.lossCoefficient ||
        sub.actual_usage / 1000 != sub.editState.actualUsage
      ) {
        needEditItems.push(sub)
      }
    })

    const axiosList = needEditItems.map((item, subIndex) => {
      if (item.id) {
        let params = {
          id: item.id,
          requirement_id: requirementId,
          actual_usage: item.actual_usage,
          loss_coefficient: item.editState.lossCoefficient,
        } as PutMaterialDemandItemParams
        return putMaterialDemandItemApi(params)
      } else {
        let postParams = {
          parent_id: row.id,
          requirement_id: requirementId,
          dictionary_id: row.proportions![subIndex].dictionary_id,
          actual_usage: row.proportions![subIndex].editState.actualUsage * 1000,
          loss_coefficient: row.proportions![subIndex].editState.lossCoefficient,
          ebs_id: row.ebs_id,
          planned_usage_at: row.proportions![subIndex].editState.plannedUsageAt,
        }

        return postMaterialDemandItemApi(postParams)
      }
    })

    await Promise.all(axiosList)

    cloneList[index].loss_coefficient = row.editState.lossCoefficient
    cloneList[index].actual_usage = row.editState.actualUsage * 1000
    cloneList[index].isEdit = false
    cloneList[index].isConcreteEdit = false
    cloneList[index].proportions = cloneList[index].proportions!.map((item) => {
      const index = needEditItems.findIndex((needItem) => needItem.id == item.id)
      if (index >= 0) {
        item.loss_coefficient = item.editState.lossCoefficient
        item.actual_usage = item.editState.actualUsage * 1000
        item.planned_usage_at = item.editState.plannedUsageAt
      }
      item.isSubEdit = false
      return item
    })
    setRequirementList(cloneList)
  }

  const [allEdit, setAllEdit] = React.useState(false)

  const handleAllEdit = () => {
    setAllEdit(true)
    const cloneList = structuredClone(requirementList)
    for (const cloneListKey in cloneList) {
      let item = cloneList[cloneListKey]
      item.isEdit = true
      if (item.proportions && item.proportions.length > 0) {
        item.proportions.forEach((subItem) => {
          subItem.isSubEdit = true
        })
      }
    }

    setRequirementList(cloneList)
  }

  const allSaveCheckSubIsEdited = (arrs: MaterialListType[], parent_id: number) => {
    let needArr: MaterialListType[] = []
    arrs.forEach((item) => {
      if (
        item.loss_coefficient != item.editState.lossCoefficient ||
        intoDoubleFixed3(item.actual_usage / 1000) != item.editState.actualUsage ||
        item.planned_usage_at != item.editState.plannedUsageAt
      ) {
        if (
          !!item.editState.lossCoefficient &&
          !!item.editState.actualUsage &&
          !!item.editState.plannedUsageAt
        ) {
          needArr.push({ ...item, parent_id })
        }
      }
    })
    return needArr
  }

  const handleAllSave = async () => {
    let needEditItems: MaterialDemandItemListData[] = []
    let needSubEditItems: MaterialListType[] = []
    requirementList.forEach((item) => {
      if (
        item.loss_coefficient != item.editState.lossCoefficient ||
        intoDoubleFixed3(item.actual_usage / 1000) != item.editState.actualUsage
      ) {
        needEditItems.push(item)
      }
      if (item.proportions && item.proportions.length > 0) {
        needSubEditItems.push(...allSaveCheckSubIsEdited(item.proportions, item.id))
      }
    })

    const axiosList = needEditItems.map((item) => {
      let params = {
        id: item.id,
        requirement_id: requirementId,
        actual_usage: item.editState.actualUsage * 1000,
        loss_coefficient: item.editState.lossCoefficient,
      } as PutMaterialDemandItemParams
      return putMaterialDemandItemApi(params)
    })

    const subAxiosList = needSubEditItems.map((item) => {
      if (item.id) {
        let params = {
          id: item.id,
          requirement_id: requirementId,
          actual_usage: item.editState.actualUsage * 1000,
          loss_coefficient: item.editState.lossCoefficient,
        } as PutMaterialDemandItemParams
        return putMaterialDemandItemApi(params)
      } else {
        const row = requirementList.find((el) => el.id == item.parent_id)!

        let postParams = {
          parent_id: item.parent_id,
          requirement_id: requirementId,
          dictionary_id: item.dictionary_id,
          actual_usage: item.editState.actualUsage * 1000,
          loss_coefficient: item.editState.lossCoefficient,
          ebs_id: row.ebs_id,
          planned_usage_at: item.editState.plannedUsageAt,
        }

        return postMaterialDemandItemApi(postParams)
      }
    })

    let requestList = [...axiosList, ...subAxiosList]

    await Promise.all(requestList)

    getMaterialDemandItemList()
    // const cloneList = structuredClone(requirementList)
    //
    // cloneList.forEach((item) => {
    //   const index = needEditItems.findIndex((needItem) => needItem.id == item.id)
    //   if (index >= 0) {
    //     item.loss_coefficient = item.editState.lossCoefficient
    //     item.actual_usage = item.editState.actualUsage * 1000
    //     item.planned_usage_at = item.editState.plannedUsageAt
    //   }
    //   item.isEdit = false
    //   if (item.proportions && item.proportions.length > 0) {
    //     item.proportions.forEach((el) => {
    //       el.isSubEdit = false
    //       el.loss_coefficient = el.editState.lossCoefficient
    //       el.actual_usage = el.editState.actualUsage * 1000
    //       el.planned_usage_at = el.editState.plannedUsageAt
    //     })
    //   }
    // })
    //
    // setRequirementList(cloneList)
    setAllEdit(false)
  }

  const handleChangeSelectSubDictionaryClass = async (
    val: number,
    index: number,
    subIndex: number,
  ) => {
    const cloneList = structuredClone(requirementList)
    cloneList[index].proportions![subIndex].dictionary_class_id = val
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

  const handleSaveSubMaterialWithConcrete = async (
    index: number,
    subIndex: number,
    row: MaterialDemandItemListData,
  ) => {
    const res = await postMaterialDemandItemApi({
      parent_id: row.id,
      requirement_id: requirementId,
      dictionary_id: row.proportions![subIndex].dictionary_id,
      actual_usage: row.proportions![subIndex].editState.actualUsage * 1000,
      loss_coefficient: row.proportions![subIndex].editState.lossCoefficient,
      ebs_id: row.ebs_id,
      planned_usage_at: row.proportions![subIndex].editState.plannedUsageAt,
    })
    // const cloneList = structuredClone(requirementList)
    // cloneList[index].proportions![subIndex].isDel = true
    // cloneList[index].proportions![subIndex].id = res.id
    // cloneList[index].proportions![subIndex].isSelect = false
    // cloneList[index].proportions![subIndex].actual_usage =
    //   row.proportions![subIndex].editState.actualUsage * 1000
    // cloneList[index].proportions![subIndex].loss_coefficient =
    //   row.proportions![subIndex].editState.lossCoefficient
    // cloneList[index].proportions![subIndex].planned_usage_at =
    //   row.proportions![subIndex].editState.plannedUsageAt

    getMaterialDemandItemList()

    // setRequirementList(cloneList)
  }

  const handleDelSubMaterialWithConcrete = async (
    index: number,
    subIndex: number,
    row: MaterialDemandItemListData,
  ) => {
    const res = await delMaterialDemandItemApi({
      requirement_id: requirementId,
      id: row.proportions![subIndex].id!,
    })

    getMaterialDemandItemList()
  }

  const handleChangeSubState = (
    val: any,
    index: number,
    subIndex: number,
    type: keyof SubEditState,
  ) => {
    const cloneList = structuredClone(requirementList)
    let rowItem = cloneList[index]

    if (type == "actualUsage") {
      // @ts-ignore
      rowItem.proportions![subIndex].editState[type] = val
    } else if (type == "lossCoefficient") {
      rowItem.proportions![subIndex].editState["lossCoefficient"] = val
      // 下面判断有问题
      if (rowItem.material_proportion) {
        const numArr = rowItem.material_proportion.proportion.split(":")
        const materis = JSON.parse(rowItem.material_proportion.materials)
        if (numArr[subIndex]) {
          rowItem.proportions![subIndex].editState["actualUsage"] =
            rowItem.editState.actualUsage * materis[subIndex].quantity * (val / 100)
        }
      }
    } else if (type == "plannedUsageAt") {
      if (dayjs(val).unix() < dayjs(cloneList[index].planned_usage_at).unix()) {
        return message.warning("计划使用时间需晚于施工计划时间")
      }
      rowItem.proportions![subIndex].editState["plannedUsageAt"] = dayJsToStr(val, "YYYY-MM-DD")
    } else {
      // @ts-ignore
      rowItem.proportions![subIndex].editState[type] = val
    }

    setRequirementList(cloneList)
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
        onClose={handleCloseDialogAddForm}
        open={open}
        sx={{ zIndex: 1700, ".MuiPaper-root": { maxWidth: "none" } }}
        className="custom">
        <DialogTitle>
          {CurrentDate.getYear()}年{CurrentDate.getMonth()}月主要物资设计数量明细表
          <Button
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
            {allEdit ? (
              <Button
                className="text-railway_303"
                onClick={() => {
                  handleAllSave()
                }}>
                保存
              </Button>
            ) : (
              <Button
                className="text-railway_303"
                onClick={() => {
                  handleAllEdit()
                }}>
                批量编辑
              </Button>
            )}
            <Button>导出</Button>
          </div>
        </div>
        <DialogContent sx={{ width: "90vw", height: "80vh" }}>
          {requirementList.length <= 0 ? (
            CreateMaterialDemandBtn()
          ) : (
            <div className="h-full overflow-hidden pb-[4.375rem] relative">
              <div className="h-full overflow-y-auto custom-scroll-bar">
                <Table sx={{ minWidth: 650 }} aria-label="simple table" stickyHeader>
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
                              {findDictionaryClassName(row.dictionary?.dictionary_class_id)}
                            </TableCell>
                            <TableCell align="center">{row.dictionary?.name}</TableCell>
                            <TableCell align="center">
                              {intoDoubleFixed3(row.design_usage / 1000)}
                            </TableCell>
                            <TableCell align="center">
                              {findConstUnitWithDictionary(row.dictionary?.properties)}
                            </TableCell>
                            <TableCell align="center">
                              {row.isEdit ? (
                                <div>
                                  <InputBase
                                    className="outline outline-[#e0e0e0]"
                                    value={row.editState.lossCoefficient}
                                    onChange={(event) => {
                                      handleChangeMainTableEditInput(
                                        index,
                                        event.target.value,
                                        "lossCoefficient",
                                      )
                                    }}
                                  />
                                </div>
                              ) : (
                                row.loss_coefficient
                              )}
                            </TableCell>
                            <TableCell align="center">
                              {row.isEdit ? (
                                <div>
                                  <InputBase
                                    className="outline outline-[#e0e0e0]"
                                    value={row.editState.actualUsage}
                                    onChange={(event) => {
                                      handleChangeMainTableEditInput(
                                        index,
                                        event.target.value,
                                        "actualUsage",
                                      )
                                    }}
                                  />
                                </div>
                              ) : (
                                intoDoubleFixed3(row.actual_usage / 1000)
                              )}
                            </TableCell>
                            <TableCell align="center">
                              {row.isEdit ? (
                                <div>
                                  <DatePicker
                                    value={dayjs(row.editState.plannedUsageAt)}
                                    onChange={(newVal) => {
                                      handleChangeMainTableEditInput(
                                        index,
                                        newVal ?? dayjs(new Date()),
                                        "plannedUsageAt",
                                      )
                                    }}
                                  />
                                </div>
                              ) : (
                                dayJsToStr(row.planned_usage_at, "YYYY-MM-DD")
                              )}
                            </TableCell>
                            <TableCell align="center">
                              <div className="flex justify-center gap-x-2 ">
                                {!row.isEdit ? (
                                  <Button
                                    variant="text"
                                    onClick={() => {
                                      handleEditMainTableNoConcrete(index)
                                    }}>
                                    编辑
                                  </Button>
                                ) : (
                                  <Button
                                    variant="text"
                                    onClick={() => {
                                      handleSaveMainTableNoConcrete(index, row)
                                    }}>
                                    保存
                                  </Button>
                                )}
                              </div>
                            </TableCell>
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
                                      {findDictionaryClassName(row.dictionary?.dictionary_class_id)}
                                    </TableCell>
                                    <TableCell align="center">{row.dictionary?.name}</TableCell>
                                    <TableCell align="center">
                                      {intoDoubleFixed3(row.design_usage / 1000)}
                                    </TableCell>
                                    <TableCell align="center">
                                      {findConstUnitWithDictionary(row.dictionary?.properties)}
                                    </TableCell>
                                    <TableCell align="center">
                                      {row.isEdit ? (
                                        <div>
                                          <InputBase
                                            className="outline outline-[#e0e0e0]"
                                            value={row.editState.lossCoefficient}
                                            onChange={(event) => {
                                              handleChangeMainTableEditInput(
                                                index,
                                                event.target.value,
                                                "lossCoefficient",
                                              )
                                            }}
                                          />
                                        </div>
                                      ) : (
                                        row.loss_coefficient
                                      )}
                                    </TableCell>
                                    <TableCell align="center">
                                      {row.isEdit ? (
                                        <div>
                                          <InputBase
                                            className="outline outline-[#e0e0e0]"
                                            value={row.editState.actualUsage}
                                            onChange={(event) => {
                                              handleChangeMainTableEditInput(
                                                index,
                                                event.target.value,
                                                "actualUsage",
                                              )
                                            }}
                                          />
                                        </div>
                                      ) : (
                                        intoDoubleFixed3(row.actual_usage / 1000)
                                      )}
                                    </TableCell>
                                    <TableCell align="center">
                                      {row.isEdit ? (
                                        <div>
                                          <DatePicker
                                            locale={locale}
                                            className="w-full"
                                            value={dayjs(row.editState.plannedUsageAt)}
                                            onChange={(newValue) => {
                                              handleChangeMainTableEditInput(
                                                index,
                                                newValue ?? dayjs(new Date()),
                                                "plannedUsageAt",
                                              )
                                            }}
                                          />
                                        </div>
                                      ) : (
                                        dayJsToStr(row.planned_usage_at, "YYYY-MM-DD")
                                      )}
                                    </TableCell>
                                    <TableCell align="center">
                                      <div className="flex justify-center gap-x-2 ">
                                        {!row.isEdit ? (
                                          <Button
                                            variant="text"
                                            onClick={() => {
                                              handleEditWithConcrete(index)
                                            }}>
                                            编辑
                                          </Button>
                                        ) : (
                                          <Button
                                            variant="text"
                                            onClick={() => {
                                              handleSaveWithConcrete(index, row)
                                            }}>
                                            保存
                                          </Button>
                                        )}
                                      </div>
                                    </TableCell>
                                  </TableRow>
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
                                        id="tags"
                                        fullWidth
                                        disabled={!row.isConcreteEdit}
                                        size="small"
                                        MenuProps={{ sx: { zIndex: 1703 } }}
                                        value={
                                          row.editState.proportion ? row.editState.proportion : 0
                                        }
                                        onChange={(event) => {
                                          handleChangeSelectProportion(+event.target.value, index)
                                        }}>
                                        <MenuItem value={0} disabled>
                                          <i className="text-railway_gray">请选择一个配合比</i>
                                        </MenuItem>
                                        {materialProportionList.map((item) => (
                                          <MenuItem value={item.id} key={item.id}>
                                            {item.name}
                                          </MenuItem>
                                        ))}
                                        <div className="pl-3">
                                          <Button
                                            startIcon={<AddIcon />}
                                            onClick={(event) => {
                                              event.stopPropagation()
                                            }}>
                                            添加配合比
                                          </Button>
                                        </div>
                                      </Select>
                                    </TableCell>
                                    <TableCell align="center" className="col-span-6"></TableCell>
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
                                          <Select
                                            fullWidth
                                            MenuProps={{ sx: { zIndex: 1702, height: "400px" } }}
                                            size="small"
                                            value={subRow.dictionary_class_id}
                                            onChange={(event) => {
                                              handleChangeSelectSubDictionaryClass(
                                                +event.target.value,
                                                index,
                                                subIndex,
                                              )
                                            }}>
                                            <MenuItem value={0} disabled>
                                              <i className="text-railway_gray">物资名称</i>
                                            </MenuItem>
                                            {subConcreteDictionaryClass.map((item: any) => (
                                              <MenuItem value={item.id} key={item.id}>
                                                {item.label}
                                              </MenuItem>
                                            ))}
                                          </Select>
                                        ) : (
                                          findDictionaryClassName(subRow.dictionary_class_id)
                                        )}
                                      </TableCell>
                                      <TableCell align="center">
                                        {subRow.isSelect ? (
                                          <Select
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
                                          subRow.dictionaryList.find(
                                            (dict) => dict.id == subRow.dictionary_id,
                                          )?.name
                                        )}
                                      </TableCell>
                                      <TableCell align="center">-</TableCell>
                                      <TableCell align="center"></TableCell>
                                      <TableCell align="center">
                                        {subRow.isSubEdit ? (
                                          <div>
                                            <InputBase
                                              className="outline outline-[#e0e0e0]"
                                              value={subRow.editState.lossCoefficient}
                                              onChange={(event) => {
                                                handleChangeSubState(
                                                  +event.target.value,
                                                  index,
                                                  subIndex,
                                                  "lossCoefficient",
                                                )
                                              }}
                                            />
                                          </div>
                                        ) : (
                                          subRow.loss_coefficient
                                        )}
                                      </TableCell>
                                      <TableCell align="center">
                                        {subRow.isSubEdit ? (
                                          <div>
                                            <InputBase
                                              className="outline outline-[#e0e0e0]"
                                              value={subRow.editState.actualUsage}
                                              onChange={(event) => {
                                                handleChangeSubState(
                                                  +event.target.value,
                                                  index,
                                                  subIndex,
                                                  "actualUsage",
                                                )
                                              }}
                                            />
                                          </div>
                                        ) : (
                                          intoDoubleFixed3(subRow.actual_usage / 1000)
                                        )}
                                      </TableCell>
                                      <TableCell align="center">
                                        {subRow.isSubEdit ? (
                                          <DatePicker
                                            locale={locale}
                                            className="w-full"
                                            value={dayjs(subRow.editState.plannedUsageAt)}
                                            onChange={(newValue) => {
                                              handleChangeSubState(
                                                dateToUTCCustom(
                                                  newValue ?? new Date(),
                                                  "YYYY-MM-DD",
                                                ),
                                                index,
                                                subIndex,
                                                "plannedUsageAt",
                                              )
                                            }}
                                          />
                                        ) : (
                                          dayJsToStr(subRow.planned_usage_at, "YYYY-MM-DD")
                                        )}
                                      </TableCell>
                                      <TableCell align="center">
                                        <div className="flex justify-center gap-x-2 ">
                                          {(subRow.isSelect || subRow.isDel) &&
                                            !subRow.isSubEdit && (
                                              <Button
                                                variant="text"
                                                onClick={() => {
                                                  handleDelSubMaterialWithConcrete(
                                                    index,
                                                    subIndex,
                                                    row,
                                                  )
                                                }}>
                                                删除
                                              </Button>
                                            )}
                                          {subRow.isSubEdit && subRow.isSelect && (
                                            <Button
                                              variant="text"
                                              onClick={() => {
                                                handleSaveSubMaterialWithConcrete(
                                                  index,
                                                  subIndex,
                                                  row,
                                                )
                                              }}>
                                              保存
                                            </Button>
                                          )}
                                        </div>
                                      </TableCell>
                                    </TableRow>
                                  ))}
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
                                        <Button
                                          variant="text"
                                          onClick={() => {
                                            handleAddConcreteMaterial(index)
                                          }}>
                                          添加
                                        </Button>
                                      </div>
                                    </TableCell>
                                  </TableRow>
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
                <div className="overflow-hidden">
                  <Button className="float-right" variant="contained">
                    确认需求计划
                  </Button>
                </div>
                <div className="w-full flex justify-center items-center gap-x-2 bg-white border-t">
                  <span>共{pager.count}条</span>
                  <select
                    className="border"
                    onChange={(event) => {
                      // handlePaginationChange(event.target.value, "limit")
                    }}>
                    <option value={10}>10条/页</option>
                    <option value={20}>20条/页</option>
                    <option value={50}>50条/页</option>
                  </select>
                  <Pagination
                    count={pager.count ? Math.ceil(pager.count / pager.limit) : 1}
                    variant="outlined"
                    shape="rounded"
                    onChange={(event, page) => {
                      // handlePaginationChange(page, "page")
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
