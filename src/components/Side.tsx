"use client"
import React from "react"
import TuneOutlinedIcon from "@mui/icons-material/TuneOutlined"
import OutboxIcon from "@mui/icons-material/Outbox"
import ExpandLess from "@mui/icons-material/ExpandLess"
import ExpandMore from "@mui/icons-material/ExpandMore"
import HiveOutlinedIcon from "@mui/icons-material/HiveOutlined"
import SupervisedUserCircleOutlinedIcon from "@mui/icons-material/SupervisedUserCircleOutlined"
import EventAvailableOutlinedIcon from "@mui/icons-material/EventAvailableOutlined"
import HandymanOutlinedIcon from "@mui/icons-material/HandymanOutlined"
import SpeedOutlinedIcon from "@mui/icons-material/SpeedOutlined"
import {
  Collapse,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  ListSubheader,
  MenuItem,
  Select,
  SelectChangeEvent,
} from "@mui/material"
import { usePathname, useRouter } from "next/navigation"
import { reqGetCurrentProject } from "@/app/member-department/api"
import { ReqGetProjectCurrentResponse } from "@/app/member-department/types"
import { LayoutContext } from "@/components/LayoutContext"
export const dynamic = "force-dynamic"

const menuList: { [key: string]: any } = {
  commonLibrary: {
    title: "工程管理",
    icon: <HandymanOutlinedIcon />,
    children: {
      "basic-engineering-management": {
        path: "/basic-engineering-management",
        title: "构筑物",
      },
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

  materialManagement: {
    title: "物资管理",
    icon: <HiveOutlinedIcon />,
    children: {
      "material-approach": {
        path: "/material-approach",
        title: "物资进场",
      },
      "material-processing": {
        path: "/material-processing",
        title: "物资加工",
      },
      "material-receipt": {
        path: "/material-receipt",
        title: "物资领用",
      },
    },
  },
  testManagement: {
    title: "试验管理",
    icon: <SpeedOutlinedIcon />,
    children: {
      test: {
        path: "/test",
        title: "试验列表",
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
  userManagement: {
    title: "用户管理",
    icon: <SupervisedUserCircleOutlinedIcon />,
    open: false,
    children: {
      "member-department": {
        path: "/member-department",
        title: "成员部门",
        open: false,
      },
    },
  },
  completionManagement: {
    title: "竣工管理",
    icon: <EventAvailableOutlinedIcon />,
    open: false,
    children: {
      "completion-management": {
        path: "/completion-management",
        title: "竣工资料",
        open: false,
      },
    },
  },
  queue: {
    title: "导出管理",
    icon: <OutboxIcon />,
    open: false,
    children: {
      queue: {
        path: "/queue",
        title: "导出任务",
        open: false,
      },
    },
  },
}

function side() {
  const logo = "/static/images/logo.png"
  const pathName = usePathname()

  const router = useRouter()

  const ctxLayout = React.useContext(LayoutContext)

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

  const [projectList, setProjectList] = React.useState<ReqGetProjectCurrentResponse[]>([])
  const [currentProject, setCurrentProject] = React.useState<number>(0)

  React.useEffect(() => {
    console.log(pathName)
    if (!pathName.startsWith("/auth2") && pathName != "/") {
      reqGetCurrentProject("/project/current").then((res) => {
        setProjectList(res ?? [])
        const obj = res.find((item) => item.is_default == 1)
        if (obj) {
          console.log(obj)
          setCurrentProject(obj.project.id)
          ctxLayout.changeProject(obj.project.id)
        } else {
          setCurrentProject(res[0].project.id)
          ctxLayout.changeProject(res[0].project.id)
          console.log(ctxLayout.projectId)
        }
      })
    }
  }, [pathName])

  const handleChangeCurrentProject = (event: SelectChangeEvent<number>) => {
    const obj = projectList.find((item) => item.project.id == event.target.value)
    if (obj) {
      ctxLayout.changeProject(obj.project.id)
      setCurrentProject(obj.project.id)
    }
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
            <div className="text-base font-bold text-railway_303 flex-1">
              <Select
                fullWidth
                className="no-border-select"
                size="small"
                labelId="demo-simple-select-helper-label"
                id="no-border-select"
                value={currentProject}
                onChange={(event) => {
                  handleChangeCurrentProject(event)
                }}>
                <MenuItem disabled>
                  <i className="text-[#ababab]">请选择一个项目</i>
                </MenuItem>
                {projectList.map((item, index) => (
                  <MenuItem key={index} value={item.project.id}>
                    {item.project.name}
                  </MenuItem>
                ))}
              </Select>
            </div>
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
