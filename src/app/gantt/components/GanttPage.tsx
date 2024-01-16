"use client"
import React from "react"
import Gantt from "./Gantt"
import FormControl from "@mui/material/FormControl"
import RadioGroup from "@mui/material/RadioGroup"
import FormControlLabel from "@mui/material/FormControlLabel"
import Radio from "@mui/material/Radio"
import { TypeApiGetEBSParams, TypeApiPutEBSParams, TypeEBSDataList } from "@/app/ebs-data/types"
import dayjs from "dayjs"
import useSWRMutation from "swr/mutation"
import { reqPutEBS, reqGetEBS } from "../api/index"
import { Breadcrumbs, Button, MenuItem, Select } from "@mui/material"
import FullscreenIcon from "@mui/icons-material/Fullscreen"
import { reqGetProjectSubSection } from "@/app/working-point/api"
import { getHexColor } from "@/libs/methods"
import { TypeProjectSubSectionData } from "@/app/working-point/types"
import DrawerAndTabs from "./DrawerAndTabs"
import useDrawerProcess from "@/app/gantt/hooks/useDrawerProcess"
import GanttContext from "@/app/gantt/context/ganttContext"
import Link from "@mui/material/Link"
import Typography from "@mui/material/Typography"
import { LayoutContext } from "@/components/LayoutContext"
import permissionJson from "@/config/permission.json"
import NoPermission from "@/components/NoPermission"
import * as fastq from "fastq"
import type { queueAsPromised } from "fastq"
import { VariantType, useSnackbar } from "notistack"
import DialogMaterialDemand from "@/app/gantt/components/DialogMaterialDemand"
import useDialogMaterialDemand from "@/app/gantt/hooks/useDialogMaterialDemand"
import useDialogMaterialDemandWithUnitProject from "@/app/gantt/hooks/useDialogMaterialDemandWithUnitProject"
import DialogMaterialDemandWithUnitProject from "@/app/gantt/components/DialogMaterialDemandWithUnitProject"
import DialogMaterialDemandWithCollect from "@/app/gantt/components/DialogMaterialDemandWithCollect"
import useDialogMaterialDemandWithCollect from "@/app/gantt/hooks/useDialogMaterialDemandWithCollect"

type WorkingAndProjectSelectOption = {
  label: string
  value: string | number
}

type Action = "update" | "create"

type RenderGanttListType = "ebs" | "working" | "project"

// 转换下拉框需要的数据
const changeRes2SelectOptionListData = (arr: any[]): WorkingAndProjectSelectOption[] => {
  return arr.map((item) => {
    return {
      label: item.name,
      value: item.id,
    }
  })
}

// 工点数据转换个甘特图的数据
const changeWorkingRes2GanttDate = (arr: any[], parent_id?: number) => {
  return arr.map((item) => {
    // 初始化gantt图需要的对象
    const ganttItem = {} as any
    ganttItem.id = "w" + item.id
    ganttItem.text = item.extend && item.extend.name ? item.extend.name : item.name
    ganttItem.parent = parent_id
    ganttItem.hasChild = true
    ganttItem.color = getHexColor(`rgba(${61 + 10}, ${185 + 10}, ${211 - 10},1)`)
    ganttItem.textColor = getHexColor(`rgba(${255 - 10}, ${255 - 10}, ${255 - 10},1)`)

    if (item.extend) {
      ganttItem.duration = Number(item.extend.period)
      ganttItem.start_date = dayjs(item.extend.scheduled_start_at ?? Date.now()).format(
        "YYYY-MM-DD",
      )
    } else {
      ganttItem.duration = Number(0)
      ganttItem.start_date = dayjs(Date.now()).format("YYYY-MM-DD")
    }

    return Object.assign({}, item, ganttItem)
  })
}

// 单位工程转换甘特图的数据
function changeProjectRes2GanttDate(arr: any[]) {
  return arr.map((item) => {
    // 初始化gantt图需要的对象
    const ganttItem = {} as any
    ganttItem.id = "p" + item.id
    ganttItem.text = item.name
    ganttItem.parent = 0
    ganttItem.hasChild = true
    ganttItem.color = "#3db9d3"
    ganttItem.textColor = getHexColor("rgba(255)")

    if (item.extend) {
      ganttItem.duration = Number(item.extend.period)
      ganttItem.start_date = dayjs(item.extend.scheduled_start_at ?? Date.now()).format(
        "YYYY-MM-DD",
      )
    } else {
      ganttItem.duration = Number(0)
      ganttItem.start_date = dayjs(Date.now()).format("YYYY-MM-DD")
    }

    return Object.assign({}, item, ganttItem)
  })
}

function addRgba(): string {
  return `rgba(${Math.floor(Math.random() * 256)},${Math.floor(Math.random() * 256)},${Math.floor(
    Math.random() * 256,
  )},.3)`
}

// EBS转换甘特图的数据
const changeEBSRes2GanttDate = (arr: TypeEBSDataList[], parent_id?: number) => {
  const hex = getHexColor(addRgba())
  return arr.map((item) => {
    const ganttItem = {} as any
    ganttItem.id = item.id
    ganttItem.text = item.extend && item.extend.name ? item.extend.name : item.name
    ganttItem.parent = parent_id
    ganttItem.color = hex
    ganttItem.textColor = "#0162B1"

    ganttItem.hasChild = true

    if (item.extend) {
      ganttItem.duration = Number(item.extend.period)
      ganttItem.start_date = dayjs(item.extend.scheduled_start_at ?? Date.now()).format(
        "YYYY-MM-DD",
      )
    } else {
      ganttItem.duration = Number(0)
      ganttItem.start_date = dayjs(Date.now()).format("YYYY-MM-DD")
    }

    return Object.assign(ganttItem, item)
  })
}

// 转换所有的RES数据
const changeRes2GanttData = (
  arr: TypeEBSDataList[],
  type: RenderGanttListType,
  parent_id?: number,
) => {
  switch (type) {
    case "working":
      return changeWorkingRes2GanttDate(arr, parent_id)
    case "ebs":
      return changeEBSRes2GanttDate(arr, parent_id)
    default:
      return changeProjectRes2GanttDate(arr)
  }
}

const GanttPage = () => {
  const { projectId: PROJECT_ID, permissionTagList } = React.useContext(LayoutContext)

  const { trigger: putEBSApi } = useSWRMutation("/ebs", reqPutEBS)

  const { trigger: getEBSApi } = useSWRMutation("/ebs", reqGetEBS)

  const { enqueueSnackbar } = useSnackbar()

  // gantt组件DOM
  const DOM_GANTT = React.useRef<{
    changeFullScreen: () => void
    // eslint-disable-next-line no-unused-vars
    resetRenderGantt: (tasks: any) => void
    // eslint-disable-next-line no-unused-vars
    ganttClearAll: (flag?: boolean) => void
  }>()

  // 切换全屏
  const changeFullScreen = () => {
    DOM_GANTT.current!.changeFullScreen()
  }

  // 转换和渲染甘特图 参数 转换的数组 和数组的类型 和父级id
  const changeAndRenderGanttLists = (
    list: any[],
    type: RenderGanttListType,
    parent_id?: number,
  ) => {
    const ganttList = changeRes2GanttData(list || [], type, parent_id)
    DOM_GANTT.current?.resetRenderGantt({ data: structuredClone(ganttList) })
  }

  const { trigger: getProjectSubSectionApi } = useSWRMutation(
    "/project-subsection",
    reqGetProjectSubSection,
  )

  const [workingSelectOption, setWorkingSelectOption] = React.useState<
    WorkingAndProjectSelectOption[]
  >([])
  const [projectSelectOption, setProjectSelectOption] = React.useState<
    WorkingAndProjectSelectOption[]
  >([])

  const StorageProjectDataRef = React.useRef<TypeProjectSubSectionData[]>([])

  const getSelectOption = () => {
    getProjectSubSectionApi({ is_subset: 1, project_id: PROJECT_ID }).then((res) => {
      setWorkingSelectOption(changeRes2SelectOptionListData(res || []))
    })
    getProjectSubSectionApi({ project_id: PROJECT_ID, is_s_data: 1 }).then((res) => {
      StorageProjectDataRef.current = res
      changeAndRenderGanttLists(res, "project")
      setProjectSelectOption(changeRes2SelectOptionListData(res || []))
    })
  }

  React.useEffect(() => {
    getSelectOption()
  }, [])

  const [zoom, setZoom] = React.useState("day")

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setZoom((event.target as HTMLInputElement).value)
  }

  const allEBSApiParams = React.useRef<{ [key: string]: string[] }>({})

  // 编辑ganttItem
  const editOneGanttItem = async (
    item: any,
    projectTask: TypeProjectSubSectionData,
    workingTask: TypeProjectSubSectionData,
  ) => {
    try {
      let params = {} as TypeApiPutEBSParams
      params.id = item.id.split("-")[0] as number
      params.project_id = PROJECT_ID
      params.name = item.text
      params.period = Number(item.duration)
      params.engineering_listing_id = item.engineering_listing_id!
      params.scheduled_start_at = item.start_date
        ? dayjs(item.start_date).format("YYYY-MM-DD")
        : dayjs(new Date()).format("YYYY-MM-DD")
      params.project_sp_id = +String(projectTask.id).replace(/[a-zA-Z]/, "")
      params.project_si_id = +String(workingTask.id).replace(/[a-zA-Z]/, "")
      return await putEBSApi(params)
    } catch (e) {
      return Promise.reject(e)
    }
  }

  type TaskAsync = {
    item: TypeEBSDataList
    projectTask: TypeProjectSubSectionData
    workingTask: TypeProjectSubSectionData
  }
  async function asyncWorker(arg: TaskAsync): Promise<void> {
    const { item, projectTask, workingTask } = arg
    // No need for a try-catch block, fastq handles errors automatically
    return await editOneGanttItem(item, projectTask, workingTask)
  }

  const q: queueAsPromised<TaskAsync> = fastq.promise(asyncWorker, 1)

  const handleEditGanttItem = async (
    item: TypeEBSDataList,
    projectTask: TypeProjectSubSectionData,
    workingTask: TypeProjectSubSectionData,
  ) => {
    q.push({ item, projectTask, workingTask })
      .then(() => {
        enqueueSnackbar("操作成功", {
          autoHideDuration: 3000,
          variant: "success",
          anchorOrigin: { vertical: "top", horizontal: "right" },
        })
      })
      .catch((err) => {
        console.error(err, "捕获错误")
        enqueueSnackbar("操作失败，将为您重新加载页面", {
          autoHideDuration: 3000,
          variant: "error",
          anchorOrigin: { vertical: "top", horizontal: "right" },
        })
        setTimeout(() => {
          location.reload()
        }, 800)
      })

    // const res = await editOneGanttItem(item, projectTask, workingTask)
  }

  const saveGetEBSApiParams = (params: TypeApiGetEBSParams, item: TypeEBSDataList) => {
    const newParams = { ...params, level: params.level! - 1 } as TypeApiGetEBSParams

    const paramsString = new URLSearchParams(newParams as any).toString()

    if (item.level > 1) {
      let objKey = ""
      for (const key in allEBSApiParams.current) {
        if (item.code.startsWith(key)) {
          objKey = key
          break
        }
      }
      const newPrevState = structuredClone(allEBSApiParams.current)
      newPrevState[objKey] = Array.from(new Set([paramsString].concat(newPrevState[objKey])))
      allEBSApiParams.current = newPrevState
    } else {
      // 深拷贝一份数据
      const newPrevState = structuredClone(allEBSApiParams.current)
      newPrevState[item.code] = newPrevState[item.code]
        ? Array.from(new Set([paramsString].concat(newPrevState[item.code])))
        : [paramsString]
      allEBSApiParams.current = newPrevState
    }
  }

  // 获取单位工程的下级
  const getProjectSubGanttList = (item: any) => {
    getProjectSubSectionApi({
      is_subset: 1,
      project_id: PROJECT_ID,
      parent_id: item.id.replace(/[a-zA-Z]/, ""),
      is_s_data: 1,
    }).then((res) => {
      changeAndRenderGanttLists(res, "working", item.id)
    })
  }

  // 获取工点数据的字节
  const getWorkingSubGanttList = (item: any) => {
    getEBSApi({
      project_id: PROJECT_ID,
      level: 2,
      is_hidden: 0,
      code: item?.engineering_listings[0]?.ebs_code,
      engineering_listing_id: item?.engineering_listings[0]?.id,
      project_si_id: item.id.substring(1),
      project_sp_id: item.parent.substring(1),
    }).then(async (res) => {
      const newArr = res.map((el) => ({
        ...el,
        engineering_listing_id: item?.engineering_listings[0]?.id,
        siId: item.id,
        spId: item.parent,
        customData: dayjs().format("YYYY-MM-DD"),
        id: el.id + `-${item.id}`,
      }))
      changeAndRenderGanttLists(newArr, "ebs", item.id)
    })
  }

  // 获取EBS树形结构的子集
  const getEBSSubGanttList = async (item: any) => {
    const getEBSParams = {
      code: item.code,
      project_id: PROJECT_ID,
      level: item.level + 1,
      engineering_listing_id: item.engineering_listing_id!,
      project_sp_id: item.spId.substring(1),
      project_si_id: item.siId.substring(1),
    } as TypeApiGetEBSParams

    console.log(item)

    const res = await getEBSApi(getEBSParams)
    let is_loop_id = 0
    const newArr = res.map((el) => {
      if (item.is_can_select == 1) {
        if (el.is_loop == 1) is_loop_id = el.id
      }
      return {
        ...el,
        engineering_listing_id: item.engineering_listing_id,
        siId: item.siId,
        spId: item.spId,
        id: el.id + `-${item.siId}`,
        is_loop_id,
      }
    })
    let newRes: any[] = []
    if (item.is_can_select == 1) {
      newRes = newArr.filter((ele) => {
        if (ele.extend) {
          if (ele.is_loop == 1) return false
          return (
            +ele.extend.project_si_id == item.siId.substring(1) &&
            ele.extend.project_sp_id == item.spId.substring(1)
          )
        }
        return false
      })
      console.log(newRes, newArr)
    } else {
      newRes = newArr
    }

    changeAndRenderGanttLists(newRes, "ebs", item.id)
  }

  const getSubGanttList = async (item: any) => {
    console.log(item)
    switch (item.$level) {
      case 0:
        getProjectSubGanttList(item)
        break
      case 1:
        getWorkingSubGanttList(item)
        break
      default:
        getEBSSubGanttList(item)
    }
  }

  const logDataUpdate = (type: any, action: Action, item: any, id: any) => {}

  const [selectValue, setSelectValue] = React.useState("all")

  React.useEffect(() => {
    if (StorageProjectDataRef.current.length > 0 && selectValue == "all") {
      DOM_GANTT.current?.ganttClearAll(true)
      changeAndRenderGanttLists(StorageProjectDataRef.current, "project")
      return
    }

    const newRes = StorageProjectDataRef.current.filter((item) => item.id == Number(selectValue))
    DOM_GANTT.current?.ganttClearAll(true)
    changeAndRenderGanttLists(newRes, "project")
  }, [selectValue])

  const { item, handleCloseDrawerProcess, handleOpenDrawerProcess, drawerProcessOpen } =
    useDrawerProcess()

  const [ebsItem, setEBSItem] = React.useState<TypeEBSDataList>({} as TypeEBSDataList)

  const changeEBSItem = (item: TypeEBSDataList) => {
    setEBSItem(item)
  }

  const {
    dialogOpen,
    handleOpenDialogWithMaterialDemand,
    handleCloseDialogWithMaterialDemand,
    item: dialogItem,
  } = useDialogMaterialDemand()

  const {
    demandUnitProjectItem,
    demandWithUnitProjectOpen,
    handleOpenDialogWithMaterialDemandWithUnitProject,
    handleCloseDialogWithMaterialDemandWithUnitProject,
  } = useDialogMaterialDemandWithUnitProject()

  const {
    demandWithCollectOpen,
    handleOpenDialogWithMaterialDemandWithCollect,
    handleCloseDialogWithMaterialDemandWithCollect,
  } = useDialogMaterialDemandWithCollect()

  const handleExportRequirePlan = () => {
    handleOpenDialogWithMaterialDemandWithCollect()
  }

  if (!permissionTagList.includes(permissionJson.construction_plan_member_read)) {
    return <NoPermission />
  }

  return (
    <GanttContext.Provider value={{ ebsItem, changeEBSItem }}>
      <h3 className="font-bold text-[1.875rem]">施工计划</h3>
      <div className="mb-9 mt-7">
        <Breadcrumbs aria-label="breadcrumb" separator=">">
          <Link underline="hover" color="inherit" href="/dashboard">
            <i className="iconfont icon-homefill" style={{ fontSize: "14px" }}></i>
          </Link>
          <Typography color="text.primary" sx={{ fontSize: "14px" }}>
            施工计划
          </Typography>
        </Breadcrumbs>
      </div>

      <div
        className="flex w-full flex-col flex-1 overflow-hidden"
        id="gantt_cover"
        style={{ backgroundColor: "#fff" }}>
        <div id="menuObj"></div>
        <header className="flex justify-between h-10 my-3 px-3">
          <div className="flex gap-x-2.5">
            <Select
              sx={{ width: 150 }}
              id="status"
              size="small"
              placeholder="请选择用户状态"
              fullWidth
              onChange={(event) => {
                setSelectValue(event.target.value as any)
              }}
              value={selectValue}
              defaultValue="">
              <MenuItem value={"all"}>全部</MenuItem>
              {projectSelectOption.map((item) => (
                <MenuItem value={item.value} key={item.value}>
                  {item.label}
                </MenuItem>
              ))}
            </Select>
            <Button
              variant="contained"
              onClick={() => {
                handleExportRequirePlan()
              }}>
              导出物资需求计划
            </Button>
          </div>
          <div>
            {/*<FormControlLabel*/}
            {/*  control={*/}
            {/*    <Checkbox*/}
            {/*      value={apiParams.status == "completed"}*/}
            {/*      onChange={(_, checked) => {*/}
            {/*        onCheckboxChange(checked, "status")*/}
            {/*      }}*/}
            {/*    />*/}
            {/*  }*/}
            {/*  label="显示已完成"*/}
            {/*/>*/}
            <FormControl>
              <RadioGroup
                row
                aria-labelledby="demo-controlled-radio-buttons-group"
                name="controlled-radio-buttons-group"
                value={zoom}
                onChange={handleChange}>
                <FormControlLabel value="day" control={<Radio />} label="天" />
                <FormControlLabel value="week" control={<Radio />} label="周" />
                <FormControlLabel value="month" control={<Radio />} label="月" />
                <FormControlLabel value="quarter" control={<Radio />} label="季" />
              </RadioGroup>
            </FormControl>

            <FullscreenIcon
              className="text-railway_gray cursor-pointer"
              onClick={() => {
                changeFullScreen()
              }}
            />
          </div>
        </header>
        <div className="gantt-container h-full overflow-y-auto">
          <Gantt
            ref={DOM_GANTT}
            zoom={zoom}
            onDataUpdated={logDataUpdate}
            editGanttItem={handleEditGanttItem}
            getSubGanttList={getSubGanttList}
            handleOpenDrawerProcess={handleOpenDrawerProcess}
            handleOpenDialogWithMaterialDemand={handleOpenDialogWithMaterialDemand}
            handleOpenDialogWithMaterialDemandWithUnitProject={
              handleOpenDialogWithMaterialDemandWithUnitProject
            }
          />
        </div>
        {drawerProcessOpen && (
          <DrawerAndTabs
            item={item}
            open={drawerProcessOpen}
            handleCloseDrawerProcess={handleCloseDrawerProcess}
          />
        )}
        {dialogOpen && (
          <DialogMaterialDemand
            open={dialogOpen}
            item={dialogItem}
            handleCloseDialogAddForm={handleCloseDialogWithMaterialDemand}
          />
        )}
        {demandWithUnitProjectOpen && (
          <DialogMaterialDemandWithUnitProject
            open={demandWithUnitProjectOpen}
            item={demandUnitProjectItem}
            handleCloseDialogAddForm={handleCloseDialogWithMaterialDemandWithUnitProject}
          />
        )}

        {demandWithCollectOpen && (
          <DialogMaterialDemandWithCollect
            open={demandWithCollectOpen}
            handleCloseDialogAddForm={handleCloseDialogWithMaterialDemandWithCollect}
          />
        )}
      </div>
    </GanttContext.Provider>
  )
}

export default GanttPage
