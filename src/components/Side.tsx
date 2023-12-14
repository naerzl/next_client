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
import { reqPutProjectChangeDefault } from "@/app/api"
export const dynamic = "force-dynamic"

const menuList: { [key: string]: any } = {
  commonLibrary: {
    title: "工程管理",
    icon: <HandymanOutlinedIcon />,
    permissionTag: "project_management_module_read",
    children: {
      "basic-engineering-management": {
        path: "/basic-engineering-management",
        title: "构筑物",
        permissionTag: "structure_member_read",
      },
      "unit-project": {
        path: "/unit-project",
        title: "单位工程",
        permissionTag: "unit_project_member_read",
      },
      "working-point": {
        path: "/working-point",
        title: "工点数据",
        permissionTag: "station_data_member_read",
      },
    },
  },

  materialManagement: {
    title: "物资管理",
    icon: <HiveOutlinedIcon />,
    permissionTag: "material_management_module_read",
    children: {
      "material-approach": {
        path: "/material-approach",
        title: "物资进场",
        permissionTag: "material_approach_member_read",
      },
      "material-processing": {
        path: "/material-processing",
        title: "物资加工",
        permissionTag: "material_processing_member_read",
      },
      "material-receipt": {
        path: "/material-receipt",
        title: "物资领用",
        permissionTag: "receipt_of_materials_member_read",
      },
    },
  },
  testManagement: {
    title: "试验管理",
    icon: <SpeedOutlinedIcon />,
    permissionTag: "test_management_module_read",
    children: {
      test: {
        path: "/test",
        title: "试验列表",
        permissionTag: "test_list_member_read",
      },
    },
  },
  dataTemplate: {
    title: "功能模块",
    icon: <TuneOutlinedIcon />,
    permissionTag: "function_module_module_read",
    children: {
      gantt: {
        path: "/gantt",
        title: "施工计划",
        permissionTag: "construction_plan_member_read",
      },
    },
  },
  userManagement: {
    title: "用户管理",
    icon: <SupervisedUserCircleOutlinedIcon />,
    permissionTag: "user_management_module_read",
    open: false,
    children: {
      "member-department": {
        path: "/member-department",
        title: "成员列表",
        permissionTag: "member_management_member_read",
        open: false,
      },
    },
  },
  completionManagement: {
    title: "竣工管理",
    icon: <EventAvailableOutlinedIcon />,
    permissionTag: "completion_management_module_read",
    open: false,
    children: {
      "completion-management": {
        path: "/completion-management",
        title: "竣工资料",
        open: false,
        permissionTag: "completion_data_member_read",
      },
    },
  },
  queue: {
    title: "导出管理",
    icon: <OutboxIcon />,
    open: false,

    permissionTag: "export_management_module_read",
    children: {
      queue: {
        path: "/queue",
        title: "导出任务",
        permissionTag: "export_task_member_read",
        open: false,
      },
    },
  },
}

function side() {
  const pathName = usePathname()

  const router = useRouter()

  const ctxLayout = React.useContext(LayoutContext)

  const [openList, setOpen] = React.useState<string[]>([])

  React.useEffect(() => {}, [])

  function displayWithPermission(tag: string) {
    return ctxLayout.permissionTagList.includes(tag) ? {} : { display: "none" }
  }

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
        sx={{ width: "100%", maxWidth: "15rem", bgcolor: "background.paper", height: "100%" }}
        component="nav"
        aria-labelledby="nested-list-subheader">
        {Object.keys(menuList).map((key, index) => (
          <div key={index} style={displayWithPermission(menuList[key].permissionTag)}>
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
                    style={displayWithPermission(menuList[key].children[k].permissionTag)}
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
