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

const menuList: { [key: string]: any } = {
  commonLibrary: {
    title: "工程结构",
    icon: <ArchiveOutlinedIcon />,
    children: {
      "unit-project": {
        path: "/unit-project",
        title: "单位工程",
      },
      "working-point": {
        path: "/working-point",
        title: "工点数据",
      },
    },
  },
  dataTemplate: {
    title: "功能模块",
    icon: <TuneOutlinedIcon />,
    children: {
      gantt: {
        path: "/gantt",
        title: "施工计划",
      },
    },
  },
}

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
    for (const k in menuList) {
      for (const subK in menuList[k].children) {
        const flag = pathName.startsWith(menuList[k].children[subK].path)
        if (flag) {
          setOpen([k])
          return
        }
      }
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
        {Object.keys(menuList).map((key, index) => (
          <div key={index}>
            <ListItemButton
              sx={{ color: "#44566c" }}
              onClick={() => {
                handleClickOpen(key)
              }}>
              <ListItemIcon className="min-w-0 mr-2.5" sx={{ width: "1.5rem", height: "1.5rem" }}>
                {menuList[key].icon}
              </ListItemIcon>
              <ListItemText>{menuList[key].title}</ListItemText>
              {openList.includes(key) ? <ExpandLess /> : <ExpandMore />}
            </ListItemButton>

            <Collapse in={openList.includes(key)} timeout="auto" unmountOnExit>
              <List component="div" disablePadding>
                {Object.keys(menuList[key].children).map((k, i) => (
                  <ListItemButton
                    key={i}
                    sx={
                      pathName.startsWith(menuList[key].children[k].path)
                        ? { bgcolor: "#eef0f1" }
                        : {}
                    }
                    onClick={() => {
                      goto(menuList[key].children[k].path)
                    }}>
                    <ListItemIcon
                      className="min-w-0 mr-2.5 flex justify-center items-center"
                      sx={{ width: "1.5rem", height: "1.5rem" }}>
                      {changeIcon(menuList[key].children[k].path)}
                    </ListItemIcon>
                    <ListItemText
                      sx={{
                        color: pathName.startsWith(menuList[key].children[k].path)
                          ? "#44566c"
                          : "#8697a8",
                      }}>
                      {menuList[key].children[k].title}
                    </ListItemText>
                  </ListItemButton>
                ))}
              </List>
            </Collapse>
          </div>
        ))}
      </List>
    </>
  )
}

export default side
