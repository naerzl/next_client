"use client"
import React, { useRef } from "react"
import ReactDOM from "react-dom/client"
import { gantt, Task } from "dhtmlx-gantt"
import "dhtmlx-gantt/codebase/dhtmlxgantt.css"
import "./Gantt.scss"
import dayjs from "dayjs"
import ganttContext from "@/app/gantt/context/ganttContext"
import { message } from "antd"
import { PILE_CODE } from "@/app/gantt/const"
import { dateToUTCCustom, dateToYYYYMM } from "@/libs/methods"
import permissionJson from "@/config/permission.json"
import { LayoutContext } from "@/components/LayoutContext"
import useSWRMutation from "swr/mutation"
import { reqGetProcess } from "@/app/gantt/api"
import { ProcessListData } from "@/app/gantt/types"

type Props = {
  tasks?: any
  zoom: any
  // eslint-disable-next-line no-unused-vars
  onDataUpdated: (type: any, action: any, item: any, id: any) => void
  // eslint-disable-next-line no-unused-vars
  editGanttItem: (item: any, topTask: any, secondTask: any) => Promise<any>
  // eslint-disable-next-line no-unused-vars
  getSubGanttList: (item: any) => void
  // eslint-disable-next-line no-unused-vars
  handleOpenDrawerProcess: (item: any) => void
  // eslint-disable-next-line no-unused-vars
  handleOpenDialogWithMaterialDemand: (item: any) => void
}

function getGanttTopLevelParentId(id: string | number): string | number {
  return gantt.getParent(id) == 0 ? id : getGanttTopLevelParentId(gantt.getParent(id))
}

let updatedParentTasks: Task[] = []
// 更新父节点数据
function updateParentTask(task: Task) {
  // 找到父级任务进行对象
  const parentTask = gantt.getTask(gantt.getParent(task.id))
  console.log(parentTask)

  if (String(parentTask.id).startsWith("w") || String(parentTask.id).startsWith("p")) return
  // 深拷贝一个父级任务
  const newParentTask = structuredClone(parentTask)

  if (!parentTask.duration) {
    newParentTask.start_date = task.start_date
    newParentTask.end_date = task.end_date
  }

  if (dayjs(task.start_date).unix() < dayjs(parentTask.start_date).unix()) {
    newParentTask.start_date = task.start_date
  }

  if (dayjs(task.end_date).unix() > dayjs(parentTask.end_date).unix()) {
    newParentTask.end_date = task.end_date
  }

  updatedParentTasks.push(newParentTask)

  updateParentTask(newParentTask)
}

let updatedChildrenTasks: Task[] = []
// 更新子节点数据
function updateChildrenTask(task: Task, duration?: number) {
  if (task.$open) {
    //  获取到下级的数据
    const childTasksIdList = gantt.getChildren(task.id)
    // 判断个数是否为0
    if (childTasksIdList.length > 0) {
      const newChildTasksList = childTasksIdList.map((taskId) => {
        const childTask = gantt.getTask(taskId)
        const newChildTask = structuredClone(childTask)
        // 如果工期为0 则不管
        if (newChildTask.duration == 0) return newChildTask

        if (duration) {
          newChildTask.start_date = new Date(
            new Date(newChildTask.start_date!).getTime() + duration,
          )
          newChildTask.end_date = new Date(new Date(newChildTask.end_date!).getTime() + duration)

          return newChildTask
        }

        // 如果当前任务的起始时间大于 子任务的其实时间  设其子集起始时间与当前时间一致
        if (dayjs(task.start_date).unix() > dayjs(childTask.start_date).unix()) {
          newChildTask.start_date = task.start_date
        }

        // 如果当前任务的结束时间小于 子任务的结束时间  设其子集起始时间与当前时间一致
        if (dayjs(task.end_date).unix() < dayjs(childTask.end_date).unix()) {
          newChildTask.end_date = task.end_date
        }
        if (dayjs(newChildTask.end_date).unix() < dayjs(newChildTask.start_date).unix()) {
          newChildTask.end_date = newChildTask.start_date
        }

        return newChildTask
      })

      updatedChildrenTasks.push(...newChildTasksList.filter((item) => item.duration != 0))

      childTasksIdList.forEach((taskId) => {
        updateChildrenTask(gantt.getTask(taskId), duration)
      })
    }
  }
}

const Gantt = React.forwardRef(function Gantt(props: Props, ref) {
  const {
    zoom,
    onDataUpdated,
    editGanttItem,
    getSubGanttList,
    handleOpenDrawerProcess,
    handleOpenDialogWithMaterialDemand,
  } = props

  const { trigger: getProcessApi } = useSWRMutation("/process", reqGetProcess)

  const GANTT_DOM = useRef<HTMLDivElement | null>(null)

  const ctx = React.useContext(ganttContext)

  const { permissionTagList } = React.useContext(LayoutContext)

  function initGanttDataProcessor() {
    gantt.createDataProcessor((type: any, action: any, item: any, id: any) => {
      return new Promise<void>((resolve) => {
        if (onDataUpdated) {
          onDataUpdated(type, action, item, id)
        }
        return resolve()
      })
    })
  }

  React.useEffect(() => {
    gantt.plugins({
      fullscreen: true, // 全屏
      // tooltip: true, // 鼠标已入提示信息
      marker: true, // 垂直标记
      // quick_info: true, // 单击快捷查看信息
      keyboard_navigation: true, // 键盘导航
      undo: true, // 撤销重做
      critical_path: true, // 高亮关键路径
      drag_timeline: true, // 拖拽时间线
    })

    gantt.i18n.setLocale("cn") //设置中文
    gantt.config.date_format = "%Y-%m-%d %H:%i"

    // gantt.templates.date_grid = function (date, task, column): string {
    // if (task && gantt.isUnscheduledTask(task) && gantt.config.show_unscheduled) {
    //   return gantt.templates.task_unscheduled_time(task)
    // } else {
    //   return gantt.templates.grid_date_format(date)
    // }
    // }

    initGanttDataProcessor()
    gantt.init(GANTT_DOM!.current as HTMLDivElement) //根据 id
  }, [gantt])

  const beforeDragTask = React.useRef({} as Task)

  // 参数设置
  const initZoom = () => {
    gantt.config.order_branch = true // 左侧可以拖动
    gantt.config.sort = true //左侧点击表头排序
    gantt.config.drag_move = true //是否可以移动
    gantt.config.drag_progress = true //拖放进度
    gantt.config.drag_resize = true //控制大小
    gantt.config.drag_links = false // 允许通过拖放创建依赖项链接
    gantt.config.fit_tasks = true // 甘特图自动延长时间刻度，以适应所有显示的任务
    gantt.config.auto_scheduling_descendant_links = false // 允许或禁止创建从父任务（项目）到其子任务（项目）的链接
    gantt.config.branch_loading = true // 分支加载
    gantt.config.branch_loading_property = "hasChild" // 分支加载的属性
    gantt.config.autofit = true // 允许左边自动调整宽度
    gantt.config.grid_width = 600 // 左边整体宽度
    gantt.config.keep_grid_width = true // 以保留初始网格的宽度，同时调整其中的列大小 (pro 版本才可以使用)
    gantt.config.grid_resize = true //通过拖动右侧网格的边框使网格可调整大小 （pro 版本才可以使用）（已弃用）
    gantt.config.scale_height = 40 // 缩放头部高度
    gantt.config.highlight_critical_path = true // 高亮关键路径 （pro版本）
    // gantt.config.autosize = true  //
    gantt.config.deepcopy_on_parse = true // 让gantt.parse()使用数据源的深拷贝对象 操作不会影响到源对象
    gantt.config.initial_scroll = false // 设置是否最初滚动日程表区域以显示最早的任务
    gantt.config.min_duration = 0 // 设置最小工期
    gantt.config.buttons_right = []
    if (!permissionTagList.includes(permissionJson.construction_plan_member_update)) {
      gantt.config.readonly = true
    }
    gantt.config.undo = true

    // 左边每一列配置
    gantt.config.columns = [
      { name: "text", label: "工程结构名称", tree: true, width: "*", resize: true, sort: false },
      {
        name: "start_date",
        label: "开始时间",
        align: "center",
        max_width: 120,
        resize: true,
      },
      { name: "duration", label: "工期", align: "center", max_width: 40, resize: true },
    ]

    // 将外部组件呈现到 DOM 中
    gantt.config.external_render = {
      isElement: (element: any) => {
        return React.isValidElement(element)
      },
      renderElement: (element: any, container: any) => {
        ReactDOM.createRoot(container).render(element)
      },
    }

    // 提示信息文本
    gantt.templates.tooltip_text = function (start, end, task) {
      return (
        "<b>任务名：</b>" +
        task.text +
        "<br/><b>工期：</b> " +
        `${task.duration}天` +
        "<br/><b>工程结构编号：</b> " +
        `${task.code ?? ""}`
      )
    }

    // 关于提示信息 不知道干嘛的
    gantt.ext.tooltips?.tooltipFor({
      selector: ".gantt_row",
      // eslint-disable-next-line no-unused-vars
      html: function (event, domElement) {
        return ""
      },
    })

    // 配置时间线拖拽
    gantt.config.drag_timeline = {
      ignore: ".gantt_task_line, .gantt_task_link",
      useKey: "ctrlKey",
    }

    gantt.attachEvent("onBeforeTaskUpdate", function (taskId, task) {
      const parentTask = gantt.getTask(gantt.getParent(taskId))
      if (task.duration == beforeDragTask.current.duration) {
        return true
      } else {
        if (
          dayjs(task.start_date).unix() < dayjs(parentTask.start_date).unix() &&
          parseInt(String(parentTask.id)) >= 0
        ) {
          resetRenderGantt({ data: [beforeDragTask.current] })
          return false
        }
      }
      return true
    })

    gantt.attachEvent("onAfterTaskUpdate", async function (id, task) {
      const topLevelParentId = getGanttTopLevelParentId(id)
      const topTask = gantt.getTask(topLevelParentId)
      const secondTask = gantt.getTask(gantt.getChildren(topLevelParentId)[0])
      console.log(task)
      try {
        editGanttItem(task, topTask, secondTask)
        updateParentTask(task)
        resetRenderGantt({ data: updatedParentTasks })
        updatedParentTasks = []

        updateChildrenTask(
          task,
          task.duration == beforeDragTask.current.duration
            ? new Date(task.start_date).getTime() -
                new Date(beforeDragTask.current.start_date!).getTime()
            : undefined,
        )

        resetRenderGantt({ data: updatedChildrenTasks })
        updatedChildrenTasks = []
      } catch (e) {
        resetRenderGantt({ data: [beforeDragTask.current] })
      }
    })
    // 监听任务更新之后

    gantt.attachEvent("onBeforeLightbox", function (taskId) {
      const task = gantt.getTask(taskId)
      return Number(task.$level) > 1
    })

    gantt.attachEvent("onLightboxSave", function (id, task: Task) {
      const parentTask = gantt.getTask(gantt.getParent(id))
      // console.log(task)
      // if (task.start_date == null) {
      //   task.start_date = new Date(dateToUTCCustom(new Date(), "YYYY-MM-DD"))
      //   task.end_date = new Date(dateToUTCCustom(new Date(), "YYYY-MM-DD"))
      //   task.duration = 0
      // }
      console.log(dayjs(parentTask.start_date).unix(), dayjs(task.start_date).unix())
      console.log(dayjs(parentTask.end_date).unix(), dayjs(task.end_date).unix())
      if (!parentTask.duration) return true
      if (
        dayjs(parentTask.start_date).unix() > dayjs(task.start_date).unix() ||
        dayjs(parentTask.end_date).unix() < dayjs(task.end_date).unix()
      ) {
        message.destroy()
        message.error("设置任务需要在上一个时间范围内")
        return false
      }

      return true
    })

    gantt.attachEvent("onBeforeTaskDrag", function (id) {
      const task = gantt.getTask(id)
      beforeDragTask.current = structuredClone(task)
      // 大于1层级（3） 才可以拖动
      return Number(task.$level) > 1
    })

    // 监听侧边树形数据展开事件
    gantt.attachEvent("onTaskOpened", function (taskId) {
      const ganttItem = gantt.getTask(taskId)
      ganttItem.hasChild && getSubGanttList(ganttItem)
      return true
    })

    let selected_column: any = null
    gantt.attachEvent("onScaleClick", function (e, date) {
      selected_column = date
      let pos = gantt.getScrollState()
      gantt.render()
      gantt.scrollTo(pos.x, pos.y)
    })

    gantt.attachEvent("onTaskClick", function (taskId, e) {
      console.log(taskId, e.target.className)
      if (/^\d/.test(taskId)) {
        if (e.target.className.includes("gantt_task_content")) {
          const task = gantt.getTask(taskId)
          const someOne = PILE_CODE.some((code) => task.code != code && task.code.startsWith(code))

          if (task.is_corporeal == 1) {
            const topLevelParentId = getGanttTopLevelParentId(taskId)
            const secondTask = gantt.getTask(gantt.getChildren(topLevelParentId)[0])
            const newTask: any = structuredClone(task)
            newTask.project_sp_id = topLevelParentId
            newTask.project_si_id = secondTask.id

            ctx.changeEBSItem(newTask as any)
            handleOpenDrawerProcess(newTask)
          }
        }

        if (e.target.className.includes("iconfont")) {
        }
      }
      if (String(taskId).startsWith("w") && !e.target.className.includes("gantt_tree_icon")) {
        const task = gantt.getTask(taskId)
        handleOpenDialogWithMaterialDemand(task)
      }
      return true
    })

    gantt.attachEvent("onGanttReady", function () {})

    function is_selected_column(column_date: any) {
      return !!(selected_column && column_date.valueOf() == selected_column.valueOf())
    }

    gantt.templates.scale_cell_class = function (date) {
      return is_selected_column(date) ? "highlighted-column" : ""
    }
    gantt.templates.timeline_cell_class = function (item, date) {
      return is_selected_column(date) ? "highlighted-column" : ""
    }

    // 任务进度显示百分比
    gantt.templates.progress_text = function (start, end, task) {
      return (
        "<div class='text-left text-white'>" +
        Math.round((task.progress ? task.progress : 0) * 100) +
        "% </div>"
      )
    }

    gantt.templates.task_date = function (date) {
      return dateToUTCCustom(date, "YYYY年MM月DD日")
    }
    gantt.templates.lightbox_header = function (start_date, end_date, task) {
      return (
        gantt.templates.task_time(task.start_date!, task.end_date!, task) +
        "&nbsp;" +
        (gantt.templates.task_text(task.start_date!, task.end_date!, task) || "").substring(0, 70)
      )
    }

    //缩放
    const zoomConfig = {
      levels: [
        {
          name: "day", //日
          min_column_width: 80,
          scales: [{ unit: "day", step: 1, format: "%m-%d" }],
        },
        {
          name: "week",
          min_column_width: 80,
          scales: [
            { unit: "week", format: "第%W周" },
            { unit: "day", step: 1, format: "%m-%d" },
          ],
        },
        {
          name: "month",
          min_column_width: 120,
          scales: [
            { unit: "month", format: "%M" },
            { unit: "day", step: 1, format: "%d" },
          ],
        },
        {
          name: "quarter", //季度
          min_column_width: 90,
          scales: [
            {
              unit: "quarter",
              format: (date: any) => {
                let quarters = ["第1季度", "第2季度", "第3季度", "第4季度"]
                let quarter = quarters[Math.floor((date.getMonth() + 3) / 3) - 1]
                return quarter
              },
            },
            { unit: "month", format: "%Y-%m" },
          ],
        },
      ],

      useKey: "ctrlKey", // 使用ctrl键
      trigger: "wheel", // 触发方式滑轮
      element: function () {
        return gantt.$root.querySelector(".gantt_task")
      },
    }

    // 指定全屏容器
    gantt.ext.fullscreen.getFullscreenElement = function () {
      return document.getElementById("gantt_cover") as HTMLElement
    }

    // gantt.locale.labels.time_enable_button = "安排计划"
    // gantt.locale.labels.time_disable_button = "取消计划"
    gantt.config.lightbox.sections = [
      { name: "description", height: 38, map_to: "text", type: "textarea", focus: true },

      {
        name: "time",
        type: "duration",
        map_to: "auto",
        time_format: ["%Y", "%m", "%d"],
      },
    ]

    // 初始化 zoom
    gantt.ext.zoom.init(zoomConfig)
  }

  const setZoom = (value: any) => {
    if (!gantt.$initialized) {
      initZoom()
    }
    // 缩放
    gantt.ext.zoom.setLevel(value)
  }

  React.useEffect(() => {
    setZoom(zoom)
  }, [zoom])

  const resetRenderGantt = (tasks: any) => {
    gantt.parse(tasks)
    gantt.sort((a, b) => {
      if (a.created_at) {
        return dayjs(b.created_at).unix() - dayjs(a.created_at).unix()
      } else {
        if (typeof a.id == "string") {
          return a.id.split("-")[0] - b.id.split("-")[0]
        } else if (typeof a.id == "number") {
          return a.id - b.id
        } else {
          return -1
        }
      }
    }, false)
  }

  const ganttClearAll = (flag = false) => {
    flag && gantt.clearAll()
  }

  React.useImperativeHandle(
    ref,
    () => {
      return {
        changeFullScreen: () => {
          gantt.ext.fullscreen.toggle()
        },
        resetRenderGantt,
        ganttClearAll,
      }
    },
    [],
  )

  return <div id="gantt_box" ref={GANTT_DOM} className="w-full h-full"></div>
})

export default Gantt
