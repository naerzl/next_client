"use client"
import React from "react"
import ExpandLess from "@mui/icons-material/ExpandLess"
import ExpandMore from "@mui/icons-material/ExpandMore"

import {
  Collapse,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  ListSubheader,
} from "@mui/material"

// 菜单项接口
interface MenuItemXItem {
  // 跳转路径，可选
  path?: string
  // 显示标题
  title: string
  // 图标，可选
  icon?: JSX.Element
  // 是否开启
  open: boolean
  // 子项
  children?: MenuItemX
}

// 菜单列表接口
export interface MenuItemX {
  // 默认子项是通过 key做索引定位 正常情况下应该和路由一致
  [key: string]: MenuItemXItem
}

// 响应事件数据接口
export interface ItemCombination {
  // 聚焦项
  item: MenuItemXItem
  // 聚焦项索引值
  index: string
  // 聚焦项上级
  parentItem?: MenuItemXItem
  // 聚焦项上级索引值
  parentIndex?: string
}

// 点击事件类型
// eslint-disable-next-line no-unused-vars
export type clickEvent = (currentItems: ItemCombination, previousItems?: ItemCombination) => boolean

export const changeMenu = (
  items: MenuItemX,
  item: ItemCombination,
  previousItem?: ItemCombination,
) => {
  let currentItems = { ...items }
  // 这里处理只有父级的数据
  if (previousItem && previousItem.index) {
    if (typeof previousItem.parentIndex != "undefined") {
      let innerItem = currentItems[previousItem.parentIndex!]
      innerItem.open = false
      // 如果当前只点击了上级 就不改变之前的下级状态
      if (typeof item.parentIndex != "undefined") {
        innerItem.children![previousItem.index].open = false
      }
      currentItems[previousItem.parentIndex!] = innerItem
    } else {
      // 当前的上级打开
      currentItems[previousItem.index].open = false
    }
  }

  if (typeof item.parentIndex != "undefined") {
    let innerItem = currentItems[item.parentIndex!]

    innerItem.open = true
    innerItem.children![item.index].open = true

    currentItems[item.parentIndex!] = innerItem
  } else {
    // 当前的上级打开
    currentItems[item.index].open = true
  }

  return currentItems
}

// 数据传递规范接口
interface Props {
  // 菜单列表
  items: MenuItemX
  onClick: clickEvent
}

function Side(props: Props) {
  // logo 图片地址
  const logo = "/static/images/logo.png"

  // 用户接收当前菜单位置，对于点击完后来说就是上一个菜单位置
  let previousItems = {} as ItemCombination

  // 点击事件
  const whenOnClick = (
    item: MenuItemXItem,
    index: string,
    parentItem?: MenuItemXItem,
    parentIndex?: string,
  ) => {
    // 处理对外暴露的事件回调
    props.onClick(
      {
        item,
        index,
        parentItem,
        parentIndex,
      },
      previousItems,
    )
  }

  // 渲染子菜单
  const RenderChildrenItem = (
    item: MenuItemXItem,
    index: string,
    parentItem: MenuItemXItem,
    parentIndex: string,
  ) => {
    // 如果当前子项处理开启的状态，让预定义的数据接收该项相关数据
    if (item.open) {
      previousItems = {} as ItemCombination
      previousItems.item = item
      previousItems.index = index
      previousItems.parentItem = parentItem
      previousItems.parentIndex = parentIndex
    }

    return (
      <ListItemButton
        key={item.title + "-" + index}
        sx={item.open ? { bgcolor: "#eef0f1" } : {}}
        onClick={() => whenOnClick(item, index, parentItem, parentIndex)}>
        <ListItemIcon
          key={item.title + "icon" + index}
          className="min-w-0 mr-2.5 flex justify-center items-center"
          sx={{ width: "1.5rem", height: "1.5rem" }}>
          {item.open ? (
            <i className="w-2 h-2 rounded-full bg-[#44566c]"></i>
          ) : (
            <i className="w-2 h-2 rounded-full border-2 border-[#44566c]"></i>
          )}
        </ListItemIcon>
        <ListItemText
          key={item.title + "-text-" + index}
          sx={{ color: item.open ? "#44566c" : "#8697a8" }}>
          {item.title}
        </ListItemText>
      </ListItemButton>
    )
  }

  // 渲染父级菜单
  const RenderParentItem = (item: MenuItemXItem, index: string) => {
    if (item.open) {
      previousItems = {} as ItemCombination
      previousItems.item = item
      previousItems.index = index
    }
    return (
      <ListItemButton
        key={item.title + index}
        sx={{ color: "#44566c" }}
        onClick={() => whenOnClick(item, index)}>
        <ListItemIcon className="min-w-0 mr-2.5" sx={{ width: "1.5rem", height: "1.5rem" }}>
          {item.icon}
        </ListItemIcon>
        <ListItemText>{item.title}</ListItemText>
        {!item.open ? <ExpandLess /> : <ExpandMore />}
      </ListItemButton>
    )
  }

  return (
    <>
      <List
        sx={{ width: "100%", maxWidth: "15rem", bgcolor: "background.paper" }}
        component="nav"
        aria-labelledby="nested-list-subheader"
        subheader={
          <ListSubheader
            component="div"
            id="nested-list-subheader"
            className="h-16 flex items-center gap-1 max-h-16"
            sx={{ fontSize: "24px" }}>
            <img src={logo} alt="" className="w-10 h-10" />
            <div className="text-base font-bold text-railway_303">工程数字化管理系统</div>
          </ListSubheader>
        }>
        {Object.keys(props.items).map((index) => {
          const item = props.items[index]
          return (
            <div key={item.title + "-div-" + index}>
              {RenderParentItem(item, index)}
              {item.children && (
                <Collapse
                  key={item.title + "-Collapse-" + index}
                  in={item.open}
                  timeout="auto"
                  unmountOnExit>
                  <List key={item.title + "-list-" + index} component="div" disablePadding>
                    {Object.keys(item.children).map((cIndex) =>
                      RenderChildrenItem(item.children![cIndex], cIndex, item, index),
                    )}
                  </List>
                </Collapse>
              )}
            </div>
          )
        })}
      </List>
    </>
  )
}

export default Side
