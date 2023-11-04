"use client"
import React from "react"
import WorkingPointContext from "@/app/working-point/context/workingPointContext"
import { useRouter } from "next/navigation"
import useSWRMutation from "swr/mutation"
import { reqDelProjectSubSection } from "@/app/working-point/api"
import { PROJECT_ID } from "@/libs/const"
import { Breadcrumbs, Button, InputAdornment, InputBase } from "@mui/material"
import Link from "@mui/material/Link"
import Typography from "@mui/material/Typography"
import TableHead from "@mui/material/TableHead"
import TableRow from "@mui/material/TableRow"
import TableCell from "@mui/material/TableCell"
import TableBody from "@mui/material/TableBody"
import IconButton from "@mui/material/IconButton"
import SearchIcon from "@mui/icons-material/Search"
import Table from "@mui/material/Table"
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline"
import EditOutlinedIcon from "@mui/icons-material/EditOutlined"
import { TypeProjectSubSectionData } from "@/app/working-point/types"

export default function WorkingPoint() {
  const ctx = React.useContext(WorkingPointContext)

  const router = useRouter()

  const [dialogOpen, setDialogOpen] = React.useState(false)

  const { trigger: delProjectSubSection } = useSWRMutation(
    "/project-subsection",
    reqDelProjectSubSection,
  )

  // 处理点击删除
  const handleClickDelete = async (id: number) => {
    await delProjectSubSection({ id })
    ctx.getProjectSubSection()
  }

  // 表格配置列
  const columns = [
    {
      title: "序号",
      dataIndex: "id",
      key: "id",
    },
    {
      title: "工点名称",
      dataIndex: "name",
      key: "name",
    },

    {
      title: "所属单位工程",
      dataIndex: "parent_name",
      key: "parent_name",
    },
    {
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

  const handleClickEdit = (row: TypeProjectSubSectionData) => {
    router.push(`/working-point/detail?spId=${row.parent_id}&siId=${row.id}`)
    ctx.changeEditItem(row)
  }

  return (
    <>
      <h3 className="font-bold text-[1.875rem]">工点数据</h3>
      <div className="mb-9 mt-7">
        <Breadcrumbs aria-label="breadcrumb" separator=">">
          <Link underline="hover" color="inherit" href="/dashboard">
            <i className="iconfont icon-homefill" style={{ fontSize: "14px" }}></i>
          </Link>
          <Typography color="text.primary" sx={{ fontSize: "14px" }}>
            工点数据
          </Typography>
        </Breadcrumbs>
      </div>
      <header className="flex justify-between mb-4">
        <div className="flex gap-2">
          <Button
            className="bg-railway_blue text-white"
            onClick={() => {
              router.push("/working-point/detail")
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
            {ctx.tableList.map((row: any) => (
              <TableRow key={row.id} sx={{ "&:last-child td, &:last-child th": { border: 0 } }}>
                <TableCell component="th" scope="row">
                  {row.id}
                </TableCell>
                <TableCell align="left">{row.name}</TableCell>
                <TableCell align="left">{row.parent ? row.parent.name : ""}</TableCell>
                <TableCell align="left">
                  <div className="flex justify-between">
                    <Button
                      variant="outlined"
                      onClick={() => {
                        handleClickEdit(row)
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
      {/*{dialogOpen && (*/}
      {/*  <DialogProject open={dialogOpen} changeDialogOpen={changeDialogOpen}></DialogProject>*/}
      {/*)}*/}
    </>
  )
}
