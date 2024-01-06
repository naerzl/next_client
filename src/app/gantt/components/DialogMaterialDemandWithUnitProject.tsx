"use client"
import React from "react"
import { Alert, Button, Dialog, DialogContent, DialogTitle, Snackbar } from "@mui/material"
import { CurrentDate, dateToUTCCustom } from "@/libs/methods"
import {
  DemandEditState,
  MaterialDemandItemListData,
  MaterialDemandListData,
  MaterialListType,
} from "@/app/material-demand/types"
import "dayjs/locale/zh-cn"
import { DICTIONARY_CLASS_ID } from "@/libs/const"
import { useRequest } from "ahooks"
import useSWRMutationHooks from "@/app/gantt/hooks/useSWRMutationHooks"
import { LayoutContext } from "@/components/LayoutContext"
import RequirementWithWorkingPointTable from "@/app/gantt/components/RequirementWithWorkingPointTable"
import { TypeProjectSubSectionData } from "@/app/working-point/types"

type Props = {
  open: boolean
  handleCloseDialogAddForm: () => void
  item: MaterialDemandListData | any
}

export default function DialogMaterialDemandWithUnitProject(props: Props) {
  const { open, handleCloseDialogAddForm, item: propsItem } = props

  const {
    getMaterialDemandItemApi,
    getExportMaterialDemandApi,
    getQueueApi,
    getProjectSubSectionApi,
    getMaterialDemandApi,
  } = useSWRMutationHooks()

  const { projectId: PROJECT_ID } = React.useContext(LayoutContext)

  const [requirementList, setRequirementList] = React.useState<MaterialDemandListData[]>([])
  const [requirementItemList, setRequirementItemList] = React.useState<
    MaterialDemandItemListData[][]
  >([])

  const getMaterialDemandList = async (workingItem: TypeProjectSubSectionData) => {
    const res = await getMaterialDemandApi({
      project_id: PROJECT_ID,
      engineering_listing_id: workingItem.engineering_listings[0].id,
      project_si_id: workingItem.id,
      project_sp_id: +workingItem.parent_id,
    })
    return res.items.filter((el) => el.status == "confirmed")
  }

  const getMaterialDemandItemList = async (requirementId: number) => {
    const res = await getMaterialDemandItemApi({
      requirement_id: requirementId,
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
            class: subItem.class,
            material_loss_coefficient: subItem.material_loss_coefficient,
            editState: {
              plannedUsageAt: dateToUTCCustom(subItem.planned_usage_at, "YYYY-MM-DD"),
              lossCoefficient: subItem.loss_coefficient,
              actualUsage: subItem.actual_usage / 1000, // 需求用量
            },
            planned_usage_at: dateToUTCCustom(subItem.planned_usage_at, "YYYY-MM-DD"),
            loss_coefficient: subItem.loss_coefficient,
            actual_usage: subItem.actual_usage,
            dictionaryClassName: "",
          } as MaterialListType

          subTableList.push(obj)
        }
        item.proportions = subTableList

        arrs.push(item)
        // 自定义的
      } else {
        arrs.push(item)
      }
    }

    return arrs
  }

  const getWorkingPointList = async () => {
    const res = await getProjectSubSectionApi({
      is_subset: 1,
      project_id: PROJECT_ID,
      parent_id: propsItem.id.replace(/[a-zA-Z]/, ""),
      is_s_data: 1,
    })

    let reqLists: MaterialDemandListData[] = []
    for (const resKey in res) {
      let workingItem = res[resKey]
      const requirementLists = await getMaterialDemandList(workingItem)
      if (requirementLists.length > 0) {
        reqLists.push(requirementLists[0])
      }
    }

    setRequirementList(reqLists)
  }

  const getAllRequirementItemList = async () => {
    let reqItemLists: MaterialDemandItemListData[][] = []
    for (const key in requirementList) {
      let reqList = requirementList[key]
      const res = await getMaterialDemandItemList(reqList.id)
      if (res.length > 0) {
        reqItemLists.push(res)
      }
    }
    setRequirementItemList(reqItemLists)
  }

  React.useEffect(() => {
    getWorkingPointList()
  }, [])

  React.useEffect(() => {
    if (requirementList.length > 0) {
      getAllRequirementItemList()
    }
  }, [requirementList])

  const handleCloseDialog = () => {
    handleCloseDialogAddForm()
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
          <div></div>
          <div>
            {/*{requirementItemList.length > 0 && (*/}
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
          {requirementItemList.map((item, index) => (
            <div className="overflow-hidden pb-[4.375rem] relative" key={index}>
              <RequirementWithWorkingPointTable
                requirementItemList={item}
                requirementList={requirementList[index]}
              />
            </div>
          ))}
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
