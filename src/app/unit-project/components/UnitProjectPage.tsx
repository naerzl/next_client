"use client"
import React from "react"
import useSWRMutation from "swr/mutation"
import UnitProjectContext from "@/app/unit-project/context/unitProjectContext"
import { reqDelProjectSubSection } from "@/app/unit-project/api"
import { useRouter } from "next/navigation"
import { PROJECT_ID } from "@/libs/const"
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
      title: "id",
      dataIndex: "code",
      key: "code",
    },
    {
      title: "单位工程名称",
      dataIndex: "name",
      key: "name",
    },
    {
      title: "基础工程",
      dataIndex: "subpart_name",
      key: "subpart_name",
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
            placeholder="搜索模板名称"
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
      <div className="bg-white border custom-scroll-bar shadow-sm min-h-[570px]">
        <Table sx={{ minWidth: 650 }} aria-label="simple table" stickyHeader>
          <TableHead sx={{ position: "sticky", top: "64px", zIndex: 5 }}>
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
              <TableRow key={row.id} sx={{ "&:last-child td, &:last-child th": { border: 0 } }}>
                <TableCell component="th" scope="row">
                  {row.id}
                </TableCell>
                <TableCell align="left">{row.name}</TableCell>
                <TableCell align="left">
                  {renderTableTd(row.engineering_listings, "name")}
                </TableCell>

                <TableCell align="left">
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
      </div>
    </>
  )
}
