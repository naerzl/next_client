"use client"
import React from "react"
import { Breadcrumbs, Button } from "@mui/material"
import Link from "@mui/material/Link"
import Typography from "@mui/material/Typography"
import useSWRMutation from "swr/mutation"
import { reqGetMaterialTest } from "@/app/test/api"
import Table from "@mui/material/Table"
import TableHead from "@mui/material/TableHead"
import TableRow from "@mui/material/TableRow"
import TableCell from "@mui/material/TableCell"
import TableBody from "@mui/material/TableBody"
import { dateToYYYYMM } from "@/libs/methods"
import { TestDataList } from "@/app/test/types"
import { TEST_TYPE_OPTION } from "@/app/test/const"
import EditOutlinedIcon from "@mui/icons-material/EditOutlined"
import ZoomInIcon from "@mui/icons-material/ZoomIn"
import { useLookTestDetail } from "@/app/test/hooks/useLookTestDetail"
import LookTestDetaill from "@/app/test/components/LookTestDetaill"

const columns = [
  {
    title: "序号",
    dataIndex: "index",
    key: "index",
  },
  {
    title: "委托单编号",
    dataIndex: "entrust_number",
    key: "entrust_number",
  },
  {
    title: "委托单文件地址",
    dataIndex: "entrust_file_url",
    key: "entrust_file_url",
  },
  {
    title: "试验报告编号",
    dataIndex: "test_number",
    key: "test_number",
  },

  {
    title: "试验报告文件地址",
    dataIndex: "test_report_file_url",
    key: "test_report_file_url",
  },
  {
    title: "试验类型",
    dataIndex: "class",
    key: "class",
  },
  {
    title: "试验时间",
    dataIndex: "tested_at",
    key: "tested_at",
  },
  {
    title: "试验员",
    dataIndex: "tested_by",
    key: "tested_by",
  },
  {
    title: "记录者",
    dataIndex: "creator",
    key: "creator",
  },
  {
    title: "操作",
    key: "action",
  },
]

function findClassName(value: string) {
  const testItem = TEST_TYPE_OPTION.find((item) => item.value == value)
  return testItem ? testItem.label : ""
}

export default function TestPage() {
  const { trigger: getMaterialTestApi } = useSWRMutation("/material-test", reqGetMaterialTest)

  const [testList, setTestList] = React.useState<TestDataList[]>([])

  const { handleCloseLookTestDetailDrawer, handleLookTestDetailOpen, detailItem, drawerOpen } =
    useLookTestDetail()
  const getMaterialTestList = async () => {
    const res = await getMaterialTestApi({})
    setTestList(res.items)
  }

  React.useEffect(() => {
    getMaterialTestList()
  }, [])

  return (
    <>
      <h3 className="font-bold text-[1.875rem]">试验列表</h3>
      <div className="mb-9 mt-7">
        <Breadcrumbs aria-label="breadcrumb" separator=">">
          <Link underline="hover" color="inherit" href="/dashboard">
            <i className="iconfont icon-homefill" style={{ fontSize: "14px" }}></i>
          </Link>
          <Typography color="text.primary" sx={{ fontSize: "14px" }}>
            试验列表
          </Typography>
        </Breadcrumbs>
      </div>
      <header className="flex justify-between mb-4">
        <div className="flex gap-2"></div>
        <div></div>
      </header>
      <div className="bg-white border custom-scroll-bar shadow-sm flex-1 overflow-y-auto">
        <Table sx={{ minWidth: 650 }} aria-label="simple table" stickyHeader>
          <TableHead sx={{ position: "sticky", top: "0", zIndex: 5 }}>
            <TableRow>
              {columns.map((col, index) => (
                <TableCell key={index} sx={{ width: col.key == "action" ? "210px" : "auto" }}>
                  {col.title}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {testList.map((row, index) => (
              <TableRow sx={{ "&:last-child td, &:last-child th": { border: 0 } }} key={row.id}>
                <TableCell>{index + 1}</TableCell>
                <TableCell>{row.entrust_number}</TableCell>
                <TableCell align="left">{row.entrust_file_url}</TableCell>
                <TableCell align="left">{row.test_number}</TableCell>
                <TableCell align="left">{row.test_report_file_url}</TableCell>
                <TableCell align="left">{findClassName(row.class)}</TableCell>
                <TableCell align="left">{dateToYYYYMM(row.tested_at)}</TableCell>
                <TableCell align="left">{row.tested_by}</TableCell>
                <TableCell align="left">{row.creator}</TableCell>
                <TableCell align="left">
                  <div className="flex justify-between">
                    <Button
                      variant="outlined"
                      onClick={() => {
                        handleLookTestDetailOpen(row)
                      }}
                      startIcon={<ZoomInIcon />}>
                      查看详情
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        {drawerOpen && (
          <LookTestDetaill
            editItem={detailItem}
            open={drawerOpen}
            close={handleCloseLookTestDetailDrawer}
          />
        )}
      </div>
    </>
  )
}
