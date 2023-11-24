"use client"
import React from "react"
import {
  Breadcrumbs,
  Button,
  InputBase,
  ListItemIcon,
  MenuItem,
  Select,
  SelectChangeEvent,
} from "@mui/material"
import Link from "@mui/material/Link"
import Typography from "@mui/material/Typography"
import SideBar from "@/app/member-department/components/SideBar"
import MemberDepartmentContext from "@/app/member-department/context/memberDepartmentContext"
import MemberDepartmentMain from "./MemberDepartmentMain"
import useSWR from "swr"
import {
  ReqGetUserListParams,
  RolesListData,
  UserListData,
  UserListDataPager,
} from "@/app/member-department/types"
import { reqGetRole, reqGetUserList } from "@/app/member-department/api"
import DialogUser from "@/app/member-department/components/DialogUser"
import useSWRMutation from "swr/mutation"
import AddOutlinedIcon from "@mui/icons-material/AddOutlined"
import DialogAuthSetting from "@/app/member-department/components/DialogAuthSetting"
import useAuthSettingDialog from "@/app/member-department/hooks/useAuthSettingDialog"
import { LayoutContext } from "@/components/LayoutContext"
import permissionJson from "@/config/permission.json"
import NoPermission from "@/components/NoPermission"
import { displayWithPermission } from "@/libs/methods"

type STATUS_TYPE = "normal" | "forbidden"

const select_option = [
  {
    value: "normal",
    label: "正常",
  },
  {
    value: "forbidden",
    label: "禁用",
  },
]

export default function memberDepartmentPage() {
  const { projectId: PROJECT_ID, permissionTagList } = React.useContext(LayoutContext)

  const params = {
    // status: "normal",
    page: 1,
    limit: 10,
    project_id: PROJECT_ID,
  } as ReqGetUserListParams
  // 获取表格数据的参数
  const [apiParams, setApiParams] = React.useState(params)

  const { trigger: getUserApi } = useSWRMutation("/user", reqGetUserList)

  const [userList, setUserList] = React.useState<UserListData[]>([])
  const [tablePaper, setTablePaper] = React.useState<UserListDataPager>({} as UserListDataPager)

  const getUserListData = async () => {
    const res = await getUserApi(apiParams)
    setUserList(res.items)
    setTablePaper(res.pager)
  }

  React.useEffect(() => {
    getUserListData()
  }, [apiParams])

  const { data: sideBarList, mutate: mutateSideBar } = useSWR(
    () => "/role",
    (url) => reqGetRole(url, { arg: { project_id: PROJECT_ID } }),
    {
      revalidateIfStale: false,
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
    },
  )

  const handleSetApiParams = (item: ReqGetUserListParams) => {
    setApiParams(item)
  }

  const { trigger: getRoleApi } = useSWRMutation("/role", reqGetRole)

  // 控制新增和修改的 弹窗
  const [dialogOpen, setDialogOpen] = React.useState(false)

  // 是否是编辑
  const [isEdit, setIsEdit] = React.useState(false)

  // 编辑时操作的哪一项
  const [rowItem, setRowItem] = React.useState({} as UserListData)

  // 处理关闭弹窗函数
  const handleClose = () => {
    setDialogOpen(false)
  }

  const [searchParams, setSearchParams] = React.useState<ReqGetUserListParams>(
    {} as ReqGetUserListParams,
  )
  // 处理头部下拉框 值的改变
  const handleSearchParamsChange = (value: string | number, type: keyof ReqGetUserListParams) => {
    setSearchParams((prevState) => ({ ...prevState, [type]: value, page: 1, limit: 100 }))
  }

  // 处理编辑开始 （）
  const handleRowEditStart = (item: UserListData) => {
    setDialogOpen(true)
    setIsEdit(true)
    setRowItem(item)
  }

  // 删除 弹窗编辑结束的函数 （重置编辑的数据）
  const handleEditEnd = () => {
    setIsEdit(false)
    setRowItem({} as UserListData)
    setDialogOpen(false)
  }

  // 选中当前的分类id
  const [currentRoleFlag, setCurrentRoleFlag] = React.useState("")
  const changeCurrentRoleFlag = (currentId: string) => {
    setCurrentRoleFlag(currentId)
    setApiParams((prevState) => ({ ...prevState, role_flag: currentId }))
  }

  const handleSearchButtonClick = () => {
    setApiParams((prevState) => ({ ...prevState, ...searchParams }))
  }

  const getSubClassList = async (id: number, indexStr: string) => {
    // 如果不传indexStr的话获取第一层级的
    if (indexStr == "") {
      const res = await getRoleApi({ project_id: PROJECT_ID })
      await mutateSideBar(res, false)
      return
    }
    const indexArr = indexStr.split("-")
    // 深拷贝数据
    const newArr = structuredClone(sideBarList)
    // eslint-disable-next-line no-unused-vars
    const res = await getRoleApi({ parent_id: id, project_id: PROJECT_ID })
    const str = "newArr[" + indexArr?.join("].children[") + "].children"
    eval(str + "=res")
    await mutateSideBar(newArr, false)
  }

  const changeSideBarList = () => {}

  // 新增或修改插入sidebar
  const insertSideBarWithAddOrEdit = async (
    item: RolesListData,
    indexStr: string,
    idAdd: boolean,
    bool: boolean,
  ) => {
    // 深拷贝原始数据
    const newSideBar = structuredClone(sideBarList)
    // 判断是否是添加
    if (idAdd) {
      // 判断是否为第一层级
      if (indexStr == "") {
        // 如果是第一层级直接在第一层数据里面push
        newSideBar?.push(item)
      } else {
        // 如果不是第一层数据 通过eval插入数据
        const indexArr = indexStr.split("-")
        const str = "newSideBar[" + indexArr?.join("].children[") + "].children"
        // 判断子层级是否需要重新获取数据 （bool 为true 则不需要）
        if (bool) {
          eval(str) ? eval(str + ".push(item)") : eval(str + "=[item]")
        } else {
          // eslint-disable-next-line no-unused-vars
          const res = await getRoleApi({
            parent_id: eval("newSideBar[" + indexArr?.join("].children[") + "]").id,
            project_id: PROJECT_ID,
          })
          eval(str + "=res")
        }
      }
    } else {
      const indexArr = indexStr.split("-")
      const str = "newSideBar[" + indexArr?.join("].children[") + "]"
      eval(str + "=item")
    }

    // 更新数据
    await mutateSideBar(newSideBar, false)
  }

  const handleDialogUserEndCb = async (item: UserListData, isAdd: boolean) => {
    getUserListData()
  }

  const handleDelUserListSWR = async (uid: string) => {
    getUserListData()
  }

  const handleTableCurrentPageNumberChange = (num: number) => {
    setApiParams((prevState) => ({ ...prevState, page: num }))
  }

  const { dialogAuthSettingOpen, handleOpenDialogAuthSetting, handleCloseDialogAuthSetting } =
    useAuthSettingDialog()

  if (!permissionTagList.includes(permissionJson.member_management_member_read)) {
    return <NoPermission />
  }

  return (
    <>
      <MemberDepartmentContext.Provider
        value={{
          currentRoleFlag,
          changeCurrentRoleFlag,
          sideBarList: sideBarList ? sideBarList : [],
          getSubClassList,
          changeSideBarList,
          insertSideBarWithAddOrEdit,
        }}>
        <h3 className="font-bold text-[1.875rem]">成员列表</h3>
        <div className="mb-9 mt-7">
          <Breadcrumbs aria-label="breadcrumb" separator=">">
            <Link underline="hover" color="inherit" href="/dashboard">
              <i className="iconfont icon-homefill" style={{ fontSize: "14px" }}></i>
            </Link>
            <Typography color="text.primary" sx={{ fontSize: "14px" }}>
              成员列表
            </Typography>
          </Breadcrumbs>
        </div>
        <header className="flex justify-between mb-6">
          <div className="flex gap-x-2 items-center">
            {/*<span>账号状态：</span>*/}
            {/*<Select value={apiParams.status} onChange={handleChange} size="small" className="w-32">*/}
            {/*  <MenuItem value="">全部</MenuItem>*/}
            {/*  {select_option.map((item) => (*/}
            {/*    <MenuItem value={item.value} key={item.value}>*/}
            {/*      <ListItemIcon>{item.label}</ListItemIcon>*/}
            {/*    </MenuItem>*/}
            {/*  ))}*/}
            {/*</Select>*/}
            <InputBase
              className="w-[12rem] h-10 border  px-2 shadow bg-white"
              placeholder="请输入姓名"
              value={searchParams.name}
              onChange={(event) => {
                handleSearchParamsChange(event.target.value, "name")
              }}
            />
            <InputBase
              className="w-[12rem] h-10 border  px-2 shadow bg-white"
              placeholder="请输入手机号"
              value={searchParams.phone}
              onChange={(event) => {
                handleSearchParamsChange(event.target.value, "phone")
              }}
            />
            <Button
              className="bg-railway_blue text-white"
              onClick={() => {
                handleSearchButtonClick()
              }}>
              搜索
            </Button>
          </div>
          <div>
            {/*<Button*/}
            {/*  variant="contained"*/}
            {/*  startIcon={<SettingsOutlinedIcon />}*/}
            {/*  className="bg-railway_blue mr-2.5"*/}
            {/*  onClick={() => {*/}
            {/*    handleOpenDialogAuthSetting()*/}
            {/*  }}>*/}
            {/*  权限设置*/}
            {/*</Button>*/}
            <Button
              style={displayWithPermission(
                permissionTagList,
                permissionJson.member_management_member_write,
              )}
              variant="contained"
              className="bg-railway_blue"
              startIcon={<AddOutlinedIcon />}
              onClick={() => {
                setDialogOpen(true)
              }}>
              添加成员
            </Button>
          </div>
        </header>
        <div className="bg-white border custom-scroll-bar shadow-sm min-h-[570px] flex flex-1">
          {/*<aside className="w-60 h-full  mr-3 bg-white ">*/}
          {/*  <SideBar />*/}
          {/*</aside>*/}
          <div className="flex-1 border-t border-l">
            <MemberDepartmentMain
              tableData={userList}
              handleRowEditStart={handleRowEditStart}
              handleDelUserListSWR={handleDelUserListSWR}
              handleTableCurrentPageNumberChange={handleTableCurrentPageNumberChange}
              tablePaper={tablePaper}
              apiParams={apiParams}
              handleSetApiParams={handleSetApiParams}
            />
          </div>
        </div>
        {dialogOpen && (
          <DialogUser
            open={dialogOpen}
            close={handleClose}
            isEdit={isEdit}
            item={rowItem}
            handleEditEnd={handleEditEnd}
            cb={handleDialogUserEndCb}
          />
        )}
        {dialogAuthSettingOpen && (
          <DialogAuthSetting
            open={dialogAuthSettingOpen}
            handleCloseDialogAuthSetting={handleCloseDialogAuthSetting}></DialogAuthSetting>
        )}
      </MemberDepartmentContext.Provider>
    </>
  )
}
