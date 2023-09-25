"use client"
import React from "react"
import useSWRMutation from "swr/mutation"
import UnitProjectContext from "@/app/unit-project/context/unitProjectContext"
import DialogProject from "@/app/unit-project/components/DialogProject"
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
import useHooksConfirm from "@/hooks/useHooksConfirm"

export default function UnitProjectPage() {
  const ctx = React.useContext(UnitProjectContext)

  const router = useRouter()

  const [dialogOpen, setDialogOpen] = React.useState(false)

  const { trigger: delProjectSubSection } = useSWRMutation(
    "/project-subsection",
    reqDelProjectSubSection,
  )

  const { handleConfirm } = useHooksConfirm()

  // 处理点击删除
  const handleClickDelete = (id: number) => {
    handleConfirm(async () => {
      await delProjectSubSection({ id })
      ctx.getProjectSubSection()
    })
  }

  // 表格配置列
  const columns = [
    {
      title: "编号",
      dataIndex: "code",
      key: "code",
    },
    {
      title: "单位工程名称",
      dataIndex: "name",
      key: "name",
    },
    {
      title: "专业名称",
      dataIndex: "subpart_name",
      key: "subpart_name",
    },
    {
      title: "开始里程",
      dataIndex: "start_mileage",
      key: "start_mileage",
    },
    {
      title: "开始",
      dataIndex: "start_tally",
      key: "start_tally",
    },
    {
      title: "结束里程",
      dataIndex: "end_mileage",
      key: "end_mileage",
    },
    {
      title: "结束",
      dataIndex: "end_tally",
      key: "end_tally",
    },
    {
      title: "长度m",
      dataIndex: "calculate_value",
      key: "calculate_value",
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
              setDialogOpen(true)
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
                <TableCell key={col.key} sx={{ width: col.key == "action" ? "150px" : "auto" }}>
                  {col.title}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {ctx.tableList.map((row) => (
              <TableRow key={row.code} sx={{ "&:last-child td, &:last-child th": { border: 0 } }}>
                <TableCell component="th" scope="row">
                  {row.code}
                </TableCell>
                <TableCell align="left">{row.name}</TableCell>
                <TableCell align="left">{row.subpart_name}</TableCell>
                <TableCell align="left">{row.start_mileage}</TableCell>
                <TableCell align="left">{row.start_tally}</TableCell>
                <TableCell align="left">{row.end_mileage}</TableCell>
                <TableCell align="left">{row.end_tally}</TableCell>
                <TableCell align="left">{row.calculate_value}</TableCell>
                <TableCell align="left">
                  <div className="flex justify-between">
                    <Button
                      className="bg-railway_blue text-white w-[120px]"
                      onClick={() => {
                        router.push(`/unit-project/ebs-detail?id=${row.id}`)
                      }}>
                      分部、分项结构
                    </Button>
                    <Button
                      onClick={() => {
                        handleClickDelete(row.id)
                      }}>
                      删除
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      <DialogProject open={dialogOpen} changeDialogOpen={changeDialogOpen}></DialogProject>
    </>
  )
}
