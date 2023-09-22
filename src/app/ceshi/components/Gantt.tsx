"use client"
import "dhtmlx-gantt/codebase/dhtmlxgantt.css"

import { gantt } from "dhtmlx-gantt"
import React, { Component, useEffect, useState } from "react"

function Gantt(props: any) {
  const { zoom, tasks, onDataUpdated } = props
  // const [type, setType] = useState(true)

  const chartDom = React.useRef<HTMLDivElement | null>(null) //获取id

  // 参数设置
  const initZoom = () => {
    gantt.i18n.setLocale("cn") //设置中文
    // gantt.config.readonly = true//只读
    gantt.config.order_branch = true // 左侧可以拖动
    gantt.config.sort = true //左侧点击表头排序
    // gantt.config.drag_move = true //是否可以移动
    // gantt.config.drag_progress = false //拖放进度
    gantt.config.drag_resize = true //控制大小
    gantt.ext.zoom.init({
      levels: [
        {
          name: "Hours",
          scale_height: 60,
          min_column_width: 30,
          scales: [
            { unit: "day", step: 1, format: "%d %M  " },
            { unit: "hour", step: 1, format: "%H" },
          ],
        },
        {
          name: "Days",
          scale_height: 60,
          min_column_width: 70,
          scales: [
            // { unit: 'week', step: 1, format: '#%W' },
            { unit: "day", step: 1, format: " %M%d" },
          ],
        },
        {
          name: "Months",
          scale_height: 60,
          min_column_width: 70,
          scales: [
            { unit: "month", step: 1, format: "%F" },
            { unit: "week", step: 1, format: "#%W" },
          ],
        },
      ],
    })

    // 可以通过此控制 是否可以拖动
    gantt.attachEvent("onBeforeTaskDrag", function (id: any, mode: any, e: any) {
      const task = gantt.getTask(id)
      // console.log('onBeforeTaskDrag', id, mode, e, task)
      console.log("task", task)
      if (task.id === 1) {
        return false
      } else {
        return true
      }
    })
    //测试---------------------
    gantt.config.fit_tasks = false
    // 双击task时，弹出lightbox弹出框
    gantt.attachEvent("onEmptyClick", function (e: any) {
      console.log("我点击了空白")
    })
    //缩放
    const zoomConfig = {
      levels: [
        {
          name: "Hours", //时
          scale_height: 60,
          min_column_width: 30,
          scales: [
            { unit: "day", step: 1, format: "%M %d " },
            { unit: "hour", step: 1, format: "%H" },
          ],
        },
        {
          name: "Days", //日
          scale_height: 27,
          min_column_width: 100,
          scales: [{ unit: "day", step: 1, format: " %M %d" }],
        },
        {
          name: "Quarter", //月
          height: 100,
          min_column_width: 90,
          scales: [{ unit: "month", step: 1, format: "%M" }],
        },
        {
          name: "Year", //年
          scale_height: 50,
          min_column_width: 30,
          scales: [{ unit: "year", step: 1, format: "%Y" }],
        },
      ],
    }

    gantt.ext.zoom.init(zoomConfig)
    //测试结束---------------------
  }

  const setZoom = (value: any) => {
    if (!gantt.$initialized) {
      initZoom()
    }
    //缩放
    gantt.ext.zoom.setLevel(value)
  }
  useEffect(() => {
    setZoom(zoom)
  }, [zoom])
  useEffect(() => {
    if (tasks) {
      componentDidMount(tasks)
    }
  }, [tasks])

  const initGanttDataProcessor = () => {
    gantt.createDataProcessor((type: any, action: any, item: any, id: any) => {
      return new Promise<void>((resolve, reject) => {
        if (onDataUpdated) {
          onDataUpdated(type, action, item, id)
        }
        return resolve()
      })
    })
  }
  const componentDidMount = (list: any) => {
    gantt.config.date_format = "%Y-%m-%d %H:%i"
    gantt.init(chartDom.current!) //根据 id
    initGanttDataProcessor()
    gantt.parse(list) //渲染数据
  }
  return <div id="main" style={{ width: "100%", height: "100%" }} ref={chartDom}></div>
}

export default Gantt
