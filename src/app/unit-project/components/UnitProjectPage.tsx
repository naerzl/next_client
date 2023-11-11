"use client"
import React from "react"
import useSWRMutation from "swr/mutation"
import UnitProjectContext from "@/app/unit-project/context/unitProjectContext"
import { reqDelProjectSubSection } from "@/app/unit-project/api"
import { useRouter } from "next/navigation"
import { Breadcrumbs, InputAdornment, InputBase, Button } from "@mui/material"
import Link from "@mui/material/Link"
import Typography from "@mui/material/Typography"
import Table from "@mui/material/Table"
import TableBody from "@mui/material/TableBody"
import TableCell from "@mui/material/TableCell"
import TableHead from "@mui/material/TableHead"
import TableRow from "@mui/material/TableRow"
import IconButton from "@mui/material/IconButton"
import SearchIcon from "@mui/icons-material/Search"
import { useConfirmationDialog } from "@/components/ConfirmationDialogProvider"
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline"
import EditOutlinedIcon from "@mui/icons-material/EditOutlined"
import { LayoutContext } from "@/components/LayoutContext"
import { dateToUTCCustom } from "@/libs/methods"
import Tooltip from "@mui/material/Tooltip"

const renderTableTd = (arr: any[], type: "name" | "ebs"): string => {
  switch (type) {
    case "ebs":
      return arr.map((item) => item.ebs_name).join("，")
    case "name":
      return arr.map((item) => item.name + `(${item.ebs_name})`).join("，")
    default:
      return ""
  }
}

export default function UnitProjectPage() {
  const ctx = React.useContext(UnitProjectContext)

  const { projectId: PROJECT_ID } = React.useContext(LayoutContext)

  const router = useRouter()

  const [dialogOpen, setDialogOpen] = React.useState(false)

  const { trigger: delProjectSubSection } = useSWRMutation(
    "/project-subsection",
    reqDelProjectSubSection,
  )

  const { showConfirmationDialog } = useConfirmationDialog()

  // 处理点击删除
  const handleClickDelete = (id: number) => {
    showConfirmationDialog("确认删除吗？", async () => {
      await delProjectSubSection({ id })
      ctx.getProjectSubSection()
    })
  }

  // 表格配置列
  const columns = [
    {
      title: "创建时间",
      dataIndex: "create_at",
      key: "create_at",
    },
    {
      title: "单位工程名称",
      dataIndex: "name",
      key: "name",
    },
    {
      title: "关联构筑物",
      dataIndex: "subpart_name",
      key: "subpart_name",
    },
    {
      title: "创建人",
      dataIndex: "creator",
      key: "creator",
    },
    {
      width: "400px",
      title: "操作",
      key: "action",
    },
  ]

  const changeDialogOpen = (open: boolean) => {
    setDialogOpen(open)
  }

  const handleClickSearch = (value: string) => {
    ctx.getProjectSubSection({ name: value, project_id: PROJECT_ID })
  }

  return (
    <>
      <h3 className="font-bold text-[1.875rem]">单位工程</h3>
      <div className="mb-9 mt-7">
        <Breadcrumbs aria-label="breadcrumb" separator=">">
          <Link underline="hover" color="inherit" href="/dashboard">
            <i className="iconfont icon-homefill" style={{ fontSize: "14px" }}></i>
          </Link>
          <Typography color="text.primary" sx={{ fontSize: "14px" }}>
            单位工程
          </Typography>
        </Breadcrumbs>
      </div>
      <header className="flex justify-between mb-4">
        <div className="flex gap-2">
          <Button
            className="bg-railway_blue text-white"
            onClick={() => {
              router.push("/unit-project/detail")
              ctx.changeEditItem(null)
            }}>
            添加
          </Button>
        </div>
        <div>
          <InputBase
            className="w-[18.125rem] h-10 border  px-2 shadow bg-white"
            placeholder="请输入单位工程名称"
            onBlur={(event) => {
              handleClickSearch(event.target.value)
            }}
            endAdornment={
              <InputAdornment position="end">
                <IconButton
                  type="button"
                  edge="end"
                  sx={{ p: "10px" }}
                  aria-label="search"
                  disableRipple>
                  <SearchIcon />
                </IconButton>
              </InputAdornment>
            }
          />
        </div>
      </header>
      <div className="bg-white border custom-scroll-bar shadow-sm flex-1 overflow-y-auto">
        <Table sx={{ minWidth: 650 }} aria-label="simple table" stickyHeader>
          <TableHead sx={{ position: "sticky", top: "0px", zIndex: 5 }}>
            <TableRow>
              {columns.map((col) => (
                <TableCell key={col.key} sx={{ width: col.key == "action" ? "210px" : "auto" }}>
                  {col.title}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {ctx.tableList.map((row) => (
              <TableRow key={row.id}>
                <TableCell align="left" className="min-w-[146px]">
                  {dateToUTCCustom(row.create_at, "YYYY-MM-DD HH:mm")}
                </TableCell>
                <TableCell align="left" className="min-w-[146px]">
                  {row.name}
                </TableCell>
                <TableCell
                  align="left"
                  className="w-2/5 text-ellipsis overflow-hidden"
                  title={renderTableTd(row.engineering_listings, "name")}>
                  <div className="w-[40rem] whitespace-nowrap text-ellipsis overflow-hidden">
                    {renderTableTd(row.engineering_listings, "name")}
                  </div>
                </TableCell>
                <TableCell align="left" className="min-w-[146px]">
                  {row.creator}
                </TableCell>

                <TableCell align="left" className="min-w-[210px]">
                  <div className="flex justify-between">
                    <Button
                      variant="outlined"
                      onClick={() => {
                        router.push(`/unit-project/detail?spId=${row.id}`)
                        ctx.changeEditItem(row)
                      }}
                      startIcon={<EditOutlinedIcon />}>
                      编辑
                    </Button>
                    <Button
                      variant="outlined"
                      color="error"
                      onClick={() => {
                        handleClickDelete(row.id)
                      }}
                      startIcon={<DeleteOutlineIcon />}>
                      删除
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        <div className="relative px-4 h-14 w-full overflow-hidden">
          <div className="h-0.5 bg-[#8f8f8f] w-100 absolute  top-1/2 left-1/2 -translate-y-1/2 -translate-x-1/2"></div>
          <h6 className="absolute  top-1/2 left-1/2 -translate-y-1/2 -translate-x-1/2 bg-white w-28 h-8 text-[#545454] text-center leading-8 text-sm">
            我是有底线的
          </h6>
        </div>
      </div>
    </>
  )
}
