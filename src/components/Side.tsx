"use client"
import React from "react"
import TuneOutlinedIcon from "@mui/icons-material/TuneOutlined"
import ArchiveOutlinedIcon from "@mui/icons-material/ArchiveOutlined"
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
import { usePathname, useRouter } from "next/navigation"

export const dynamic = "force-dynamic"

const pathList = [
  {
    path: "/unit-project/",
    open: "工程结构",
  },
  {
    path: "/working-point/",
    open: "工程结构",
  },
  {
    path: "/gantt/",
    open: "功能模块",
  },
]

function side() {
  const logo = "/static/images/logo.png"
  const pathName = usePathname()

  const router = useRouter()

  const [openList, setOpen] = React.useState<string[]>([])

  // 处理展开合并方法
  const handleClickOpen = (key: string) => {
    if (openList.includes(key)) {
      setOpen((pre) => pre.filter((item) => item !== key))
    } else {
      setOpen((pre) => [...pre, key])
    }
  }

  const changeIcon = (path: string) => {
    return pathName.startsWith(path) ? (
      <i className="w-2 h-2 rounded-full bg-[#44566c]"></i>
    ) : (
      <i className="w-2 h-2 rounded-full border-2 border-[#44566c]"></i>
    )
  }

  React.useEffect(() => {
    const obj = pathList.find((item) => pathName.startsWith(item.path))
    if (obj) {
      setOpen([obj!.open])
    }
  }, [])

  const goto = (path: string) => {
    router.push(path)
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
        <ListItemButton
          sx={{ color: "#44566c" }}
          onClick={() => {
            handleClickOpen("工程结构")
          }}>
          <ListItemIcon className="min-w-0 mr-2.5" sx={{ width: "1.5rem", height: "1.5rem" }}>
            <ArchiveOutlinedIcon />
          </ListItemIcon>
          <ListItemText>工程结构</ListItemText>
          {openList.includes("工程结构") ? <ExpandLess /> : <ExpandMore />}
        </ListItemButton>

        <Collapse in={openList.includes("工程结构")} timeout="auto" unmountOnExit>
          <List component="div" disablePadding>
            <ListItemButton
              sx={pathName == "/unit-project/" ? { bgcolor: "#eef0f1" } : {}}
              onClick={() => {
                goto("/unit-project")
              }}>
              <ListItemIcon
                className="min-w-0 mr-2.5 flex justify-center items-center"
                sx={{ width: "1.5rem", height: "1.5rem" }}>
                {changeIcon("/unit-project/")}
              </ListItemIcon>
              <ListItemText
                sx={{ color: pathName.startsWith("/unit-project/") ? "#44566c" : "#8697a8" }}>
                单位工程
              </ListItemText>
            </ListItemButton>

            <ListItemButton
              sx={pathName.startsWith("/working-point/") ? { bgcolor: "#eef0f1" } : {}}
              onClick={() => {
                goto("/working-point")
              }}>
              <ListItemIcon
                className="min-w-0 mr-2.5 flex justify-center items-center"
                sx={{ width: "1.5rem", height: "1.5rem" }}>
                {changeIcon("/working-point/")}
              </ListItemIcon>
              <ListItemText
                sx={{ color: pathName.startsWith("/working-point/") ? "#44566c" : "#8697a8" }}>
                工点数据
              </ListItemText>
            </ListItemButton>
          </List>
        </Collapse>

        <ListItemButton
          sx={{ color: "#44566c" }}
          onClick={() => {
            handleClickOpen("功能模块")
          }}>
          <ListItemIcon className="min-w-0 mr-2.5" sx={{ width: "1.5rem", height: "1.5rem" }}>
            <TuneOutlinedIcon />
          </ListItemIcon>
          <ListItemText>功能模块</ListItemText>
          {openList.includes("功能模块") ? <ExpandLess /> : <ExpandMore />}
        </ListItemButton>

        <Collapse in={openList.includes("功能模块")} timeout="auto" unmountOnExit>
          <List component="div" disablePadding>
            <ListItemButton
              sx={pathName.startsWith("/gantt/") ? { bgcolor: "#eef0f1" } : {}}
              onClick={() => {
                goto("/gantt")
              }}>
              <ListItemIcon
                className="min-w-0 mr-2.5 flex justify-center items-center"
                sx={{ width: "1.5rem", height: "1.5rem" }}>
                {changeIcon("/gantt/")}
              </ListItemIcon>
              <ListItemText sx={{ color: pathName.startsWith("/gantt/") ? "#44566c" : "#8697a8" }}>
                施工计划
              </ListItemText>
            </ListItemButton>
          </List>
        </Collapse>
      </List>
    </>
  )
}

export default side
