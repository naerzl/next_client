"use client"
import React from "react"
import { Breadcrumbs, Button, InputBase, Pagination } from "@mui/material"
import Link from "@mui/material/Link"
import Typography from "@mui/material/Typography"
import TableHead from "@mui/material/TableHead"
import TableRow from "@mui/material/TableRow"
import TableCell from "@mui/material/TableCell"
import TableBody from "@mui/material/TableBody"
import Table from "@mui/material/Table"
import Loading from "@/components/loading"
import useSWRMutation from "swr/mutation"
import { displayWithPermission, findEnumValueWithLabel } from "@/libs/methods"
import { useConfirmationDialog } from "@/components/ConfirmationDialogProvider"
import { message } from "antd"
import { LayoutContext } from "@/components/LayoutContext"
import dayjs from "dayjs"
import permissionJson from "@/config/permission.json"
import NoPermission from "@/components/NoPermission"
import { BaseApiPager } from "@/types/api"
import useMaterialExport from "@/hooks/useMaterialExport"
import useAddOrEditProportionHook from "@/app/proportion/hooks/useAddOrEditProportionHook"
import { reqDelMaterialProportion, reqGetMaterialProportion } from "@/app/proportion/api"
import { GetMaterialProportionParams, MaterialProportionListData } from "@/app/proportion/types"
import AddOrEditProportion from "@/app/proportion/components/AddOrEditProportion"
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline"
import EditOutlinedIcon from "@mui/icons-material/EditOutlined"
import { EngineeringListing } from "@/app/basic-engineering-management/types/index.d"
import { reqGetEngineeringListing } from "@/app/basic-engineering-management/api"
import { CLASS_OPTION } from "@/app/proportion/const"
import { subConcreteDictionaryClass } from "@/app/material-processing/const"
import { reqGetDictionary } from "@/app/material-approach/api"

// 表格配置列
const columns = [
  {
    title: "物资类别",
    key: "id",
  },
  {
    title: "规格型号",
    key: "name",
  },
  {
    title: "属性",
    key: "ebs_name",
  },
  {
    title: "配合比名称",
    dataIndex: "class",
    key: "class",
  },
  {
    title: "关联构筑物",
    key: "关联构筑物",
  },
  {
    title: "说明",
    dataIndex: "说明",
    key: "说明",
  },
  {
    title: "操作",
    key: "action",
  },
]

export default function ProportionPage() {
  const { projectId: PROJECT_ID, permissionTagList } = React.useContext(LayoutContext)

  const {
    open,
    proportionItem,
    handleEditProportion,
    handleCloseAddOrEditProportion,
    handleOpenAddOrEditProportion,
  } = useAddOrEditProportionHook()

  const { showConfirmationDialog } = useConfirmationDialog()

  const [swrState, setSWRState] = React.useState<GetMaterialProportionParams>({
    page: 1,
    limit: 10,
    project_id: PROJECT_ID,
  })

  const { trigger: getMaterialProportionApi, isMutating } = useSWRMutation(
    "/material-proportion",
    reqGetMaterialProportion,
    // fetcher,
  )

  const { trigger: delMaterialProportionApi } = useSWRMutation(
    "/material-proportion",
    reqDelMaterialProportion,
  )

  const { trigger: getEngineeringListingApi } = useSWRMutation(
    "/engineering-listing",
    reqGetEngineeringListing,
  )

  const { trigger: getDictionaryListApi } = useSWRMutation("/dictionary", reqGetDictionary)

  const [materialProportionList, setMaterialProportionList] = React.useState<
    MaterialProportionListData[]
  >([])
  const [pager, setPager] = React.useState<BaseApiPager>({} as BaseApiPager)

  const [engineeringList, setEngineeringList] = React.useState<EngineeringListing[]>([])

  const getEngineeringList = async () => {
    const res = await getEngineeringListingApi({ project_id: PROJECT_ID })
    const newArr = res.sort((a, b) => {
      return dayjs(b.created_at).unix() - dayjs(a.created_at).unix()
    })

    setEngineeringList(newArr)
  }

  const getDataList = async () => {
    let params = {} as GetMaterialProportionParams
    for (let swrStateKey in swrState) {
      // @ts-ignore
      if (swrState[swrStateKey] && swrState[swrStateKey] != "null") {
        // @ts-ignore
        params[swrStateKey] = swrState[swrStateKey]
      }
    }

    const res = await getMaterialProportionApi(params)
    setMaterialProportionList(res.items)
    setPager(res.pager)
  }

  React.useEffect(() => {
    getDataList()
    getEngineeringList()
  }, [])

  const handleChangeSearchOption = (value: string, type: keyof GetMaterialProportionParams) => {
    setSWRState((prevState) => ({ ...prevState, [type]: value }))
  }

  const handleSearchMaterialApproachList = async () => {
    let params = {} as GetMaterialProportionParams
    for (let swrStateKey in swrState) {
      // @ts-ignore
      if (swrState[swrStateKey] && swrState[swrStateKey] != "null") {
        // @ts-ignore
        params[swrStateKey] = swrState[swrStateKey]
      }
    }

    const res = await getMaterialProportionApi(params)
    setMaterialProportionList(res.items)
    setPager(res.pager)
  }

  const handlePaginationChange = async (val: any, type: keyof GetMaterialProportionParams) => {
    let params = {} as GetMaterialProportionParams
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
    const res = await getMaterialProportionApi(params)

    setMaterialProportionList(res.items)
    setPager(res.pager)
  }

  // 删除物资进场数据
  const handleDelMaterialApproach = (id: number) => {
    showConfirmationDialog("确认要删除吗？", async () => {
      await delMaterialProportionApi({ id, project_id: PROJECT_ID })
      message.success("操作成功")
      setMaterialProportionList((prevState) => prevState.filter((e) => e.id != id))
    })
  }

  const handleEditMaterialApproach = (materialData: MaterialProportionListData) => {
    handleEditProportion(materialData)
  }

  const handleAddOrEditCallBack = (item?: MaterialProportionListData, isAdd?: boolean) => {
    getDataList()
  }

  const getProportionDictionary = async (row: MaterialProportionListData) => {
    if (row.materials) {
      let arr = JSON.parse(row.materials)
      let attributes = []
      for (const arrKey in arr) {
        let arrItem = arr[arrKey]
        let dictionaryClassName = subConcreteDictionaryClass.find(
          (classItem) => classItem.id == arrItem.dictionary_class_id,
        )!.label
        const dictionaryData = await getDictionaryListApi({ class_id: arrItem.dictionary_class_id })

        const dictionaryFindItem = dictionaryData.find((item) => item.id == arrItem.dictionary_id)
        let dictionaryName = dictionaryFindItem ? dictionaryFindItem.name : ""
        attributes.push({
          key: dictionaryClassName,
          value: `WZ-${dictionaryName}-${arrItem.quantity}`,
        })
      }
      return attributes
    }
    return []
  }

  function renderProperty(str: string, row: MaterialProportionListData) {
    const arr: { key: string; value: string }[] | any = JSON.parse(str || "[]")

    if (arr instanceof Array) {
      let filterProper = arr.filter((item) => {
        return !item.value.startsWith("WZ")
      })
      // const attributes = await getProportionDictionary(row)
      // filterProper.push(...attributes)

      return filterProper.map((item, index) => {
        if (item.key == "配合比") {
          return (
            <div key={index}>
              <span>
                {item.key}： {row.proportion}
              </span>
            </div>
          )
        }
        return (
          <div key={index}>
            <span>
              {item.key}： {item.value}
            </span>
          </div>
        )
      })
    } else {
      return <></>
    }
  }

  if (!permissionTagList.includes(permissionJson.material_approach_member_read)) {
    return <NoPermission />
  }

  return (
    <>
      <h3 className="font-bold text-[1.875rem]">配合比设置</h3>
      <div className="mb-9 mt-7">
        <Breadcrumbs aria-label="breadcrumb" separator=">">
          <Link underline="hover" color="inherit" href="/dashboard">
            <i className="iconfont icon-homefill" style={{ fontSize: "14px" }}></i>
          </Link>
          <Typography color="text.primary" sx={{ fontSize: "14px" }}>
            配合比设置
          </Typography>
        </Breadcrumbs>
      </div>
      <header className="flex justify-between mb-4">
        <div className="flex gap-x-2">
          <InputBase
            className="w-[12rem] h-10 border  px-2 shadow bg-white"
            placeholder="请输入配合比"
            value={swrState.proportion}
            onChange={(event) => {
              handleChangeSearchOption(event.target.value, "proportion")
            }}
          />

          <Button
            className="bg-railway_blue text-white"
            onClick={() => {
              handleSearchMaterialApproachList()
            }}>
            搜索
          </Button>
        </div>
        <div>
          <Button
            style={displayWithPermission(
              permissionTagList,
              permissionJson.material_approach_member_write,
            )}
            className="bg-railway_blue text-white"
            onClick={() => {
              handleOpenAddOrEditProportion()
            }}>
            添加
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
                      <TableCell key={index}>{col.title}</TableCell>
                    ))}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {materialProportionList.map((row) => (
                    <TableRow key={row.id}>
                      <TableCell component="th" scope="row">
                        {
                          findEnumValueWithLabel(
                            CLASS_OPTION,
                            row.dictionary?.dictionary_class_id.toString(),
                          )?.label
                        }
                      </TableCell>
                      <TableCell align="left">{row.dictionary?.name}</TableCell>
                      <TableCell align="left">
                        {renderProperty(row?.dictionary?.properties, row)}
                      </TableCell>
                      <TableCell align="left">{row.name}</TableCell>
                      <TableCell align="left">
                        {
                          engineeringList.find(
                            (item) => item.id == row?.usages[0].engineeringListing_id,
                          )?.name
                        }
                      </TableCell>
                      <TableCell align="left"></TableCell>
                      <TableCell align="left" className="w-[220px]">
                        <div className="flex justify-center gap-x-2 ">
                          <Button
                            variant="outlined"
                            onClick={() => {
                              handleEditMaterialApproach(row)
                            }}
                            startIcon={<EditOutlinedIcon />}>
                            编辑
                          </Button>
                          <Button
                            variant="outlined"
                            color="error"
                            onClick={() => {
                              handleDelMaterialApproach(row.id)
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

      {open && (
        <AddOrEditProportion
          open={open}
          close={handleCloseAddOrEditProportion}
          editItem={proportionItem}
          cb={handleAddOrEditCallBack}
        />
      )}
    </>
  )
}
