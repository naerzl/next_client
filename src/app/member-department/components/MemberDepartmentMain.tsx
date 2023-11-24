"use client"
import React from "react"
import { Menu, MenuItem, Pagination } from "@mui/material"
import {
  ReqGetUserListParams,
  RolesListData,
  UserListData,
  UserListDataPager,
} from "@/app/member-department/types"
import { reqDelUser } from "@/app/member-department/api"
import useSWRMutation from "swr/mutation"
import Table from "@mui/material/Table"
import TableHead from "@mui/material/TableHead"
import TableRow from "@mui/material/TableRow"
import TableCell from "@mui/material/TableCell"
import TableBody from "@mui/material/TableBody"
import memberDepartmentContext from "@/app/member-department/context/memberDepartmentContext"
import { useConfirmationDialog } from "@/components/ConfirmationDialogProvider"
import { LayoutContext } from "@/components/LayoutContext"
import { displayWithPermission } from "@/libs/methods"
import permissionJson from "@/config/permission.json"

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

type Props = {
  tableData: UserListData[]
  // eslint-disable-next-line no-unused-vars
  handleRowEditStart: (item: UserListData) => void
  // eslint-disable-next-line no-unused-vars
  handleDelUserListSWR: (uid: string) => void
  // eslint-disable-next-line no-unused-vars
  handleTableCurrentPageNumberChange: (pageNum: number) => void
  tablePaper: UserListDataPager
  apiParams: ReqGetUserListParams
  handleSetApiParams: (item: ReqGetUserListParams) => void
}

const columns = [
  {
    title: "姓名",
    dataIndex: "name",
    key: "name",
    align: "left",
  },
  {
    title: "手机号",
    dataIndex: "phone",
    key: "phone",
    align: "left",
  },
  // {
  //   align: "left",
  //   title: "账号状态",
  //   dataIndex: "status",
  //   key: "status",
  // },
  {
    align: "left",
    title: "角色",
    dataIndex: "role",
    key: "role",
  },
  {
    align: "left",
    title: "邮箱",
    dataIndex: "mail",
    key: "mail",
  },

  {
    width: "150px",
    title: "操作",
    key: "action",
  },
]

const findStatus = (value: string) => {
  const obj = select_option.find((item) => item.value == value)
  return obj ? obj.label : ""
}

const renderTableCellRole = (arr: RolesListData[]) => {
  const newArr = arr.filter((item) => item.class == "normal")
  return newArr.map((item) => item.name).join(",")
}

export default function memberDepartmentMain(props: Props) {
  const {
    tableData: tableList,
    handleRowEditStart,
    handleDelUserListSWR,
    tablePaper,
    apiParams,
    handleSetApiParams,
  } = props

  const { projectId: PROJECT_ID, permissionTagList } = React.useContext(LayoutContext)

  const ctx = React.useContext(memberDepartmentContext)

  const { showConfirmationDialog: handleConfirm } = useConfirmationDialog()

  const { trigger: delUserApi } = useSWRMutation("/user", reqDelUser)

  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null)
  const open = Boolean(anchorEl)

  const [handleRow, setHandleRow] = React.useState({} as UserListData)
  const handleClickMenuIcon = (event: any, row: UserListData) => {
    setAnchorEl(event.currentTarget)
    setHandleRow(row)
  }

  const handleClickMenuDel = () => {
    handleConfirm("你确定要删除吗？", async () => {
      handleCloseMenu()
      await delUserApi({
        id: handleRow.unionid,
        unionid: handleRow.unionid,
        project_id: PROJECT_ID,
      })

      handleDelUserListSWR(handleRow.unionid)
    })
  }

  const handleCloseMenu = () => {
    setAnchorEl(null)
  }

  const handleRowEdit = () => {
    setAnchorEl(null)
    handleRowEditStart(handleRow)
  }

  const handleTableCurrentPageNumberChange = (page: number) => {
    handleSetApiParams({ ...apiParams, page })
  }

  const handleInputChange = (val: number) => {
    const count = Math.ceil(tablePaper.count / tablePaper.limit)
    if (val > count) return
    handleSetApiParams({ ...apiParams, page: val })
  }

  const handleInputKeyDown = (event: any) => {
    if (event.keyCode == 13) {
      handleInputChange(+event.target.value)
    }
  }

  return (
    <>
      <div className="relative h-full">
        <div
          style={{ width: "100%", height: "100%", paddingBottom: "38px" }}
          className="overflow-y-auto">
          <Table sx={{ minWidth: 650 }} aria-label="simple table" stickyHeader>
            <TableHead sx={{ position: "sticky", top: "0", zIndex: 5 }}>
              <TableRow>
                {columns.map((col) => (
                  <TableCell key={col.key} sx={{ width: col.key == "action" ? "150px" : "auto" }}>
                    {col.title}
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {tableList &&
                tableList?.map((row, index) => (
                  <TableRow key={row.unionid}>
                    <TableCell align="left">{row.name}</TableCell>
                    <TableCell align="left">{row.phone}</TableCell>
                    {/*<TableCell align="left">{findStatus(row.status)}</TableCell>*/}
                    <TableCell align="left">{renderTableCellRole(row.roles || [])}</TableCell>
                    <TableCell align="left">{row.mail}</TableCell>
                    <TableCell align="left">
                      {(permissionTagList.includes(
                        permissionJson.member_management_member_delete,
                      ) ||
                        permissionTagList.includes(
                          permissionJson.member_management_member_update,
                        )) && (
                        <div className="flex justify-between">
                          <i
                            className="iconfont icon-gengduo text-[1.25rem] cursor-pointer"
                            onClick={(event) => {
                              handleClickMenuIcon(event, row)
                            }}></i>
                          <Menu
                            id="basic-menu"
                            anchorEl={anchorEl}
                            open={open}
                            onClose={handleCloseMenu}
                            MenuListProps={{
                              "aria-labelledby": "basic-button",
                            }}>
                            <MenuItem
                              style={displayWithPermission(
                                permissionTagList,
                                permissionJson.member_management_member_update,
                              )}
                              onClick={() => {
                                handleRowEdit()
                              }}>
                              <div className="flex gap-x-1.5 items-center">
                                <i
                                  className="iconfont icon-bianji w-4 aspect-square cursor-pointer"
                                  title="修改"></i>
                                <span>修改</span>
                              </div>
                            </MenuItem>
                            <MenuItem
                              style={displayWithPermission(
                                permissionTagList,
                                permissionJson.member_management_member_delete,
                              )}
                              onClick={() => {
                                handleClickMenuDel()
                              }}>
                              <div className="flex gap-x-1.5 items-center">
                                <i
                                  className="iconfont icon-shanchu w-4 aspect-square cursor-pointer"
                                  title="删除"></i>
                                <span>删除</span>
                              </div>
                            </MenuItem>
                          </Menu>
                        </div>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
            </TableBody>
          </Table>
          <div className="absolute bottom-0 w-full flex justify-center items-center gap-x-2 bg-white">
            <span>共{tablePaper.count}条</span>
            <select
              className="border"
              value={apiParams.limit}
              onChange={(event) => {
                handleSetApiParams({ ...apiParams, limit: +event.target.value, page: 1 })
              }}>
              <option value={10}>10条/页</option>
              <option value={20}>20条/页</option>
              <option value={50}>50条/页</option>
            </select>
            <Pagination
              count={tablePaper.count ? Math.ceil(tablePaper.count / tablePaper.limit) : 1}
              page={apiParams.page}
              variant="outlined"
              shape="rounded"
              onChange={(event, page) => {
                handleTableCurrentPageNumberChange(page)
              }}
            />
          </div>
        </div>
      </div>
    </>
  )
}
