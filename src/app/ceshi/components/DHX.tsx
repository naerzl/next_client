"use client"
import { Button, Dropdown, Menu } from "antd"
import React, { useEffect, useState } from "react"
import "./Gantt.scss"
import Gantt from "@/app/ceshi/components/Gantt"

function DHX() {
  /**
   * Year 年
   * Quarter 月
   * Days 日
   * Hours 时
   *
   */
  const sum = [
    { name: "年", id: "Year" },
    { name: "月", id: "Quarter" },
    { name: "日", id: "Days" },
    { name: "时", id: "Hours" },
  ]
  // const currentZoom = 'Hours'
  const [currentZoom, setCurrentZoom] = useState<any>("Days") //缩放的状态

  const [data, setData] = useState<any>({ data: [], links: [] }) //初始值为空

  const [messages, setMessages] = useState<any>([
    { message: "link create: 1648541366992  ( source: 1, target: 2 )" },
  ])
  useEffect(() => {
    api()
  }, [])
  const api = () => {
    const list: any = {
      /**
       * links
       *source
       * target
       * type 1首0尾
       * parent: 1 属于谁
       */

      data: [
        //给父节点设置一个单独的状态 用于判断不可移动
        {
          id: 1,
          text: "路飞一号", //名称
          start_date: "2020-04-08", //日期
          duration: 6, //天数
          progress: 1, //控制完成百分比 范围0-1
          color: "red", //控制颜色
        },
        {
          id: "1|0",
          text: "路飞二号",
          start_date: "2020-04-08",
          duration: 2,
          progress: 0.6,
          parent: 1,
          color: "#d9363e", //控制颜色
          render: "split", //添加同一行
        },
        {
          id: "1|1",
          text: "路飞二号的子1",
          start_date: "2020-04-8",
          duration: 2,
          progress: 0.6,
          parent: "1|0",
        },
        {
          id: "1|2",
          text: "路飞二号的子2",
          start_date: "2020-04-10",
          duration: 2,
          progress: 0.6,
          parent: "1|0",
        },
        {
          id: "1|3",
          text: "路飞二号的子3",
          start_date: "2020-04-12",
          duration: 2,
          progress: 0.6,
          parent: "1|0",
        },
        {
          id: 3,
          text: "路飞三号",
          start_date: "2020-04-10",
          duration: 3,
          progress: 0.6,
          parent: 1,
        },
        {
          id: 4,
          text: "路飞四号",
          start_date: "2020-04-12",
          duration: 3,
          progress: 0.6,
        },
      ],
      /**
       * id 唯一
       * { id: 1, source: 2, target: 13, type: 0 },
       * 2的尾部连接13
       */

      links: [
        { id: 1, source: 1, target: 2, type: 0 },
        { id: 3, source: 2, target: 3, type: 0 },
      ],
    }
    setData(list)
  }

  const addMessage = (message: any) => {
    const maxLogLength = 5
    const newMessage = { message }
    const messagesDome = [newMessage, ...messages]
    if (messagesDome.length > maxLogLength) {
      messagesDome.length = maxLogLength
    }
    setMessages(messagesDome)
  }
  //划过事件
  const logDataUpdate = (type: any, action: any, item: any, id: any) => {
    console.log("item", item)
    // api()
  }
  const choose = (type: any) => {
    setCurrentZoom(type)
  }

  const menu = (
    <Menu>
      {sum.map((item) => (
        <>
          <Menu.Item>
            <div onClick={() => choose(item.id)} key={item.id}>
              {item.name}
            </div>
          </Menu.Item>
        </>
      ))}
    </Menu>
  )
  return (
    <div className="w-full h-full">
      <div>
        <Dropdown overlay={menu} placement="topRight" arrow>
          <Button>缩放</Button>
        </Dropdown>
      </div>
      <div className="gantt-container h-full">
        <Gantt tasks={data} zoom={currentZoom} onDataUpdated={logDataUpdate} />
      </div>
    </div>
  )
}

export default DHX
