"use client"
import React from "react"
import {
  Button,
  Collapse,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Menu,
  MenuItem,
} from "@mui/material"
import AddOutlinedIcon from "@mui/icons-material/AddOutlined"
import DragIndicatorIcon from "@mui/icons-material/DragIndicator"
import memberDepartmentContext from "@/app/member-department/context/memberDepartmentContext"
import Empty from "@/components/Empty"
import { message } from "antd"
import DialogSideBar from "@/app/member-department/components/DialogSideBar"
import useMutation from "swr/mutation"
import { reqDelRole } from "@/app/member-department/api"
import { RolesListData } from "@/app/member-department/types"
import { useConfirmationDialog } from "@/components/ConfirmationDialogProvider"
import { PROJECT_ID } from "@/libs/const"

export default function sideBar() {
  const ctx = React.useContext(memberDepartmentContext)

  const { showConfirmationDialog: handleConfirm } = useConfirmationDialog()

  // 控制分类的展开折叠  存储格式为层级（xxx-xxx-xxx）
  const [collapseOpen, setCollapseOpen] = React.useState("")

  // 控制添加class的对话框变量
  const [dialogOpen, setDialogOpen] = React.useState(false)

  // 父级id
  const [parentId, setParentId] = React.useState<undefined | number>(undefined)

  // 添加子集和点击菜单存储被点击的层级
  const [addIndexStr, setAddIndexStr] = React.useState<string>("")

  // 控制菜单的位置
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null)

  const open = Boolean(anchorEl)

  // 关闭菜单
  const handleCloseMenu = () => {
    setAnchorEl(null)
  }

  // 关闭对话框
  const handleDialogClose = () => {
    setDialogOpen(false)
  }

  // 点击位置
  const handleClickListItemButton = async (roleItem: RolesListData, indexStr: string) => {
    // 如果展开的层级不相同 则更新
    if (collapseOpen != indexStr) {
      setCollapseOpen(indexStr)
      // 防止切换其它子集数据错乱的情况
    }
    // 设置全局currentId
    ctx.changeCurrentRoleFlag(roleItem.flag)
    // 获取对象的子集数据
    ctx.getSubClassList(roleItem.id, indexStr)
    // 如果是在其他的页面则跳转collection页面
  }

  // 处理添加
  const handleClickAddSub = (e: any, side: any, indexStr: string) => {
    e.stopPropagation()
    setAddIndexStr(indexStr)
    // 向dialog组件传递父级id
    setParentId(side.id)
    // 打开弹窗
    setDialogOpen(true)
  }

  // 获取到点击菜单要处理的Class 的id
  const [handleId, setHandleId] = React.useState(0)
  // 点击菜单事件
  const handleClickCaidanIcon = (event: any, id: number, str: string) => {
    event.stopPropagation()
    // 设置菜单打开的位置
    setAnchorEl(event.currentTarget)
    // 设置当前点击的侧边栏
    setHandleId(id)
    // 设置被点击的菜单要处理的层级
    setAddIndexStr(str)
  }

  // 点击添加分类
  const handleClickAddClass = () => {
    setParentId(undefined)
    setDialogOpen(true)
    setAddIndexStr("")
  }

  const [editItem, setEditItem] = React.useState<undefined | RolesListData>()

  const handleClickMenuEdit = () => {
    const indexArr = addIndexStr.split("-")
    // eslint-disable-next-line no-unused-vars
    const arr = ctx.sideBarList
    const obj = eval(`arr[${indexArr.join("].children[")}]`)
    setEditItem(obj)
    // 打开弹窗
    setDialogOpen(true)
    handleCloseMenu()
  }

  // 删除分类接口
  const { trigger: delRoleApi } = useMutation("/role", reqDelRole)

  // 点击菜单删除
  const handleClickMenuDel = () => {
    handleConfirm("你确定要删除吗？", async () => {
      if (handleId <= 0) return
      const indexArr = addIndexStr.split("-")
      // eslint-disable-next-line no-unused-vars
      const arr = ctx.sideBarList
      const resultArr = indexArr.length > 1 ? indexArr.slice(0, indexArr.length - 1) : indexArr

      const id = eval(`arr[${resultArr.join("].children[")}].id`)
      handleCloseMenu()
      await delRoleApi({ id: handleId, project_id: PROJECT_ID })
      message.success("删除成功")
      ctx.getSubClassList(id, indexArr.length > 1 ? resultArr.join("-") : "")
    })
  }

  const dialogSideBarCb = (item: RolesListData) => {
    // 判断是否需要重新获取
    let bool = false
    if (!Boolean(editItem)) {
      bool = collapseOpen.startsWith(addIndexStr)
    }
    console.log(addIndexStr)
    ctx.insertSideBarWithAddOrEdit(item, addIndexStr, !Boolean(editItem), bool)
    !collapseOpen && setCollapseOpen(addIndexStr)
  }

  const RenderListItem = (arr: RolesListData[], indexStr = "") => {
    return arr.map((item, index) => {
      let str = indexStr ? `${indexStr}-${index}` : `${index}`
      return (
        <div key={item.id}>
          <ListItemButton
            sx={{
              pl: indexStr ? indexStr?.split("-").length * 1 : 0,
              bgcolor: ctx.currentRoleFlag == item.flag ? "#f5f5f5" : "#fff",
            }}
            onClick={() => handleClickListItemButton(item, str)}>
            <ListItemIcon></ListItemIcon>
            <ListItemText>{item.name}</ListItemText>
            <ListItemIcon className="w-14 justify-end">
              {str?.split("-").length < 10 && (
                <AddOutlinedIcon
                  fontSize="small"
                  onClick={(e) => handleClickAddSub(e, item, str)}
                />
              )}
              <DragIndicatorIcon
                fontSize="small"
                onClick={(e) => {
                  handleClickCaidanIcon(e, item.id, str)
                }}
              />
            </ListItemIcon>
          </ListItemButton>
          <Collapse in={collapseOpen.startsWith(str)} timeout="auto" unmountOnExit>
            <List component="div" disablePadding>
              {item.children && item.children.length > 0 ? (
                RenderListItem(item.children, str)
              ) : (
                <></>
              )}
            </List>
          </Collapse>
        </div>
      )
    })
  }

  return (
    <div>
      {ctx.sideBarList.length > 0 ? (
        <List
          sx={{
            width: "100%",
            maxWidth: "15rem",
            minWidth: "15rem",
            bgcolor: "background.paper",
            color: "#303133",
          }}
          component="nav"
          aria-labelledby="nested-list-subheader">
          {RenderListItem(ctx.sideBarList)}
        </List>
      ) : (
        <Empty
          className="w-full  flex flex-col justify-center items-center"
          fontSize="3rem"
          color="#dce0e6"
          text={<div>暂时还没有数据</div>}
        />
      )}
      <Menu
        id="language"
        anchorEl={anchorEl}
        open={open}
        onClose={handleCloseMenu}
        MenuListProps={{
          "aria-labelledby": "basic-button",
        }}>
        <MenuItem onClick={handleClickMenuEdit}>修改</MenuItem>
        <MenuItem onClick={handleClickMenuDel}>删除</MenuItem>
      </Menu>
      <Button
        fullWidth
        variant="outlined"
        sx={{ fontSize: "1.5rem" }}
        className="h-12 border"
        onClick={handleClickAddClass}>
        +
      </Button>
      <DialogSideBar
        open={dialogOpen}
        close={handleDialogClose}
        parent_id={parentId}
        cb={dialogSideBarCb}
        editItem={editItem}
        setEditItem={setEditItem}
      />
    </div>
  )
}
