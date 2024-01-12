"use client"
import React from "react"
import { Breadcrumbs, Button, Chip, InputBase, Pagination } from "@mui/material"
import Link from "@mui/material/Link"
import Typography from "@mui/material/Typography"
import TableHead from "@mui/material/TableHead"
import TableRow from "@mui/material/TableRow"
import TableCell from "@mui/material/TableCell"
import TableBody from "@mui/material/TableBody"
import Table from "@mui/material/Table"
import Loading from "@/components/loading"
import useSWRMutation from "swr/mutation"
import { message } from "antd"
import { LayoutContext } from "@/components/LayoutContext"
import permissionJson from "@/config/permission.json"
import NoPermission from "@/components/NoPermission"

import { BaseApiPager } from "@/types/api"
import { reqGetMaterialLossCoefficient } from "@/app/material-loss-coefficient/api"
import {
  GetMaterialLossCoefficientParams,
  MaterialLossCoefficientListData,
} from "@/app/material-loss-coefficient/types"

const columns = [
  {
    title: "损耗系数名称",
    dataIndex: "id",
    key: "id",
  },
  {
    title: "工程专业",
    dataIndex: "name",
    key: "name",
  },
  {
    title: "类别/加工类型",
    dataIndex: "ebs_name",
    key: "ebs_name",
  },
  {
    title: "损耗系数%",
    dataIndex: "class",
    key: "class",
  },
  {
    title: "操作",
    key: "action",
  },
]
export default function MaterialLossCoefficientPage() {
  const { projectId: PROJECT_ID, permissionTagList } = React.useContext(LayoutContext)

  const [swrState, setSWRState] = React.useState<GetMaterialLossCoefficientParams>({
    page: 1,
    limit: 10,
    // project_id: PROJECT_ID,
  })

  const { trigger: getMaterialLossCoefficientApi, isMutating } = useSWRMutation(
    "/loss-coefficient",
    reqGetMaterialLossCoefficient,
  )

  const [materialDemandList, setMaterialDemandList] = React.useState<
    MaterialLossCoefficientListData[]
  >([])
  const [pager, setPager] = React.useState<BaseApiPager>({} as BaseApiPager)

  const getDataList = async () => {
    let params = {} as GetMaterialLossCoefficientParams
    for (let swrStateKey in swrState) {
      // @ts-ignore
      if (swrState[swrStateKey] && swrState[swrStateKey] != "null") {
        // @ts-ignore
        params[swrStateKey] = swrState[swrStateKey]
      }
    }

    const res = await getMaterialLossCoefficientApi(params)

    setMaterialDemandList(res.items)
    setPager(res.pager)
  }

  React.useEffect(() => {
    getDataList()
  }, [])

  const handleChangeSearchOption = (
    value: string,
    type: keyof GetMaterialLossCoefficientParams,
  ) => {
    setSWRState((prevState) => ({ ...prevState, [type]: value }))
  }

  const handleSearchMaterialApproachList = async () => {
    let params = {} as GetMaterialLossCoefficientParams
    for (let swrStateKey in swrState) {
      // @ts-ignore
      if (swrState[swrStateKey] && swrState[swrStateKey] != "null") {
        // @ts-ignore
        params[swrStateKey] = swrState[swrStateKey]
      }
    }

    const res = await getMaterialLossCoefficientApi(params)

    setMaterialDemandList(res.items)
    setPager(res.pager)
  }

  const handlePaginationChange = async (val: any, type: keyof GetMaterialLossCoefficientParams) => {
    let params = {} as GetMaterialLossCoefficientParams
    for (let swrStateKey in swrState) {
      // @ts-ignore
      if (swrState[swrStateKey] && swrState[swrStateKey] != "null") {
        // @ts-ignore
        params[swrStateKey] = swrState[swrStateKey]
      }
    }
    if (type == "limit") {
      params.page = 1
    }
    // @ts-ignore
    params[type] = val
    setSWRState(params)
    const res = await getMaterialLossCoefficientApi(params)

    setMaterialDemandList(res.items)
    setPager(res.pager)
  }

  if (!permissionTagList.includes(permissionJson.material_approach_member_read)) {
    return <NoPermission />
  }

  return (
    <>
      <h3 className="font-bold text-[1.875rem]">损耗系数管理</h3>
      <div className="mb-9 mt-7">
        <Breadcrumbs aria-label="breadcrumb" separator=">">
          <Link underline="hover" color="inherit" href="/dashboard">
            <i className="iconfont icon-homefill" style={{ fontSize: "14px" }}></i>
          </Link>
          <Typography color="text.primary" sx={{ fontSize: "14px" }}>
            损耗系数管理
          </Typography>
        </Breadcrumbs>
      </div>
      <header className="flex justify-between mb-4">
        <div className="flex gap-x-2">
          <InputBase
            className="w-[12rem] h-10 border  px-2 shadow bg-white"
            placeholder="请输入物资名称"
            onChange={(event) => {}}
          />
          <Button
            className="bg-railway_blue text-white"
            onClick={() => {
              handleSearchMaterialApproachList()
            }}>
            搜索
          </Button>
        </div>
      </header>
      {isMutating ? (
        <Loading />
      ) : (
        <div className="flex-1 overflow-hidden">
          <div className="h-full relative border">
            <div
              className="bg-white  custom-scroll-bar shadow-sm overflow-y-auto "
              style={{ height: "calc(100% - 32px)" }}>
              <Table sx={{ minWidth: 650 }} aria-label="simple table" stickyHeader>
                <TableHead sx={{ position: "sticky", top: "0", zIndex: 5 }}>
                  <TableRow>
                    {columns.map((col, index) => (
                      <TableCell align="center" key={index}>
                        {col.title}
                      </TableCell>
                    ))}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {materialDemandList.map((row) => (
                    <TableRow key={row.id}>
                      <TableCell align="center">{row.name}</TableCell>
                      <TableCell align="center">{row.ebses?.[0]?.name}</TableCell>
                      <TableCell align="center">{row.dictionary_class?.name}</TableCell>
                      <TableCell align="center">{row.loss_coefficient}</TableCell>
                      <TableCell align="center"></TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
            <div className="absolute bottom-0 w-full flex justify-center items-center gap-x-2 bg-white border-t">
              <span>共{pager.count}条</span>
              <select
                value={swrState.limit}
                className="border"
                onChange={(event) => {
                  handlePaginationChange(event.target.value, "limit")
                }}>
                <option value={10}>10条/页</option>
                <option value={20}>20条/页</option>
                <option value={50}>50条/页</option>
              </select>
              <Pagination
                page={swrState.page}
                count={pager.count ? Math.ceil(pager.count / pager.limit) : 1}
                variant="outlined"
                shape="rounded"
                onChange={(event, page) => {
                  handlePaginationChange(page, "page")
                }}
              />
            </div>
          </div>
        </div>
      )}
    </>
  )
}
