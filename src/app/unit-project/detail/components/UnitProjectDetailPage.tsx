"use client"
import React from "react"
import useSWRMutation from "swr/mutation"
import { reqPostProjectSubSection, reqPutProjectSubSection } from "@/app/unit-project/api"
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Button,
  Card,
  CardContent,
  Checkbox,
  InputLabel,
  ListItemText,
  TextField,
  Typography,
} from "@mui/material"
import { ErrorMessage } from "@hookform/error-message"
import { useForm } from "react-hook-form"
import useDebounce from "@/hooks/useDebounce"
import { reqGetCodeCount, reqGetEBS } from "@/app/ebs-data/api"
import Tree from "./Tree"
import { TypeEBSDataList } from "@/app/ebs-data/types"
import { reqGetEngineeringListing } from "@/app/basic-engineering-management/api"
import { EngineeringListing } from "@/app/basic-engineering-management/types/index.d"
import ExpandMoreIcon from "@mui/icons-material/ExpandMore"
import { TypePostProjectSubSectionParams } from "@/app/unit-project/types"
import UnitProjectContext from "@/app/unit-project/context/unitProjectContext"
import { useRouter, useSearchParams } from "next/navigation"
import { LayoutContext } from "@/components/LayoutContext"
import { message } from "antd"
import permissionJson from "@/config/permission.json"
import NoPermission from "@/components/NoPermission"
import { reqGetProjectSubSection } from "@/app/working-point/api"
import { useConfirmationDialog } from "@/components/ConfirmationDialogProvider"

type IForm = {
  name: string
  start_mileage: number
  start_tally: number
  end_mileage: number
  end_tally: number
  calculate_value: number
}

// 转换数据 添加自定义字段 key
const changeTreeArr = (arr: TypeEBSDataList[], indexStr = "", flag: boolean): TypeEBSDataList[] => {
  if (!arr) arr = []
  return arr.map((item, index) => {
    let str = indexStr ? `${indexStr}-${index}` : `${index}`
    return {
      ...item,
      key: String(item.id),
      checkable: flag,
      disableCheckbox: !flag,
      children: changeTreeArr(item.children as TypeEBSDataList[], str, flag),
    }
  })
}

export default function UnitProjectDetailPage() {
  const ctx = React.useContext(UnitProjectContext)

  const { projectId: PROJECT_ID, permissionTagList } = React.useContext(LayoutContext)

  const router = useRouter()

  const searchParams = useSearchParams()
  const handleCancel = () => {
    reset()
    router.back()
  }

  const {
    handleSubmit,
    formState: { errors },
    register,
    reset,
    trigger,
    setValue,
  } = useForm<IForm>({})

  const { trigger: postProjectSubSection } = useSWRMutation(
    "/project-subsection",
    reqPostProjectSubSection,
  )

  const { trigger: putProjectSubSectionApi } = useSWRMutation(
    "/project-subsection",
    reqPutProjectSubSection,
  )

  const { trigger: getEngineeringListingApi } = useSWRMutation(
    "/engineering-listing",
    reqGetEngineeringListing,
  )

  // 获取表格数据SWR请求
  const { trigger: getProjectSubSectionApi } = useSWRMutation(
    "/project-subsection",
    reqGetProjectSubSection,
  )

  const [engineeringList, setEngineeringList] = React.useState<EngineeringListing[]>([])

  const getEngineeringListingList = async () => {
    const res = await getEngineeringListingApi({ project_id: PROJECT_ID })
    setEngineeringList(res)
  }

  React.useEffect(() => {
    getEngineeringListingList()
  }, [])

  React.useEffect(() => {
    if (ctx.tableList.length <= 0) {
      ctx.getProjectSubSection()
    }

    if (engineeringList.length > 0 && searchParams.get("spId")) {
      const _editItem = ctx.tableList.find((item) => item.id == +searchParams.get("spId")!)

      if (_editItem) {
        setValue("name", _editItem.name)
        if (_editItem.engineering_listings) {
          const selectArr = _editItem.engineering_listings.map((item) => {
            getEBSData(item.id).then((EBSData: any[]) => {
              setEBSAll((prevState) => [...prevState, EBSData])
            })

            return item.id
          })
          console.log(relateTo.current)
          relateTo.current = selectArr.map(() => [])
          isEdited.current = selectArr.map(() => 0)

          setEngineeringSelect(selectArr)
        }
      }
    }
  }, [engineeringList])

  const { trigger: getCodeCountApi } = useSWRMutation("/ebs/code-count", reqGetCodeCount)

  // 获取EBS结构数据
  const { trigger: getEBSApi } = useSWRMutation("/ebs", reqGetEBS)

  // 提交表单事件（防抖）
  const { run: onSubmit } = useDebounce(async (value: any) => {
    const params = {} as TypePostProjectSubSectionParams

    params.name = value.name
    params.project_id = PROJECT_ID

    let related = engineeringSelect.map((engId, index) => {
      let obj = {
        engineering_listing_id: engId,
        ebs_ids: JSON.stringify(relateTo.current[index]),
        is_edited: isEdited.current[index],
      }

      if (isCanSelect.code) {
        Object.assign(obj, {
          parent_code: isCanSelect.code,
          parent_level: isCanSelect.level,
        })
      }
      return obj
    })

    params.related_to = JSON.stringify(related)
    if (searchParams.get("spId")) {
      params.id = +searchParams.get("spId")!
      await putProjectSubSectionApi(params)
    } else {
      const relateToIsEmpty = relateTo.current.some((item) => item.length <= 0)

      if (related.length <= 0) return message.error("请关联构筑物")
      if (relateToIsEmpty) return message.error("保存失败，请选择工程构造")
      await postProjectSubSection(params)
    }

    ctx.getProjectSubSection()
    handleCancel()
  })

  const [engineeringSelect, setEngineeringSelect] = React.useState<number[]>([])

  const [ebsAll, setEBSAll] = React.useState<any[][]>([])

  const getEBSData = async (engineering_listing_id: number) => {
    const params: any = { project_id: PROJECT_ID, is_hidden: 0 }

    const obj = engineeringList.find((ele) => ele.id == engineering_listing_id)!
    console.log(obj)

    params["code"] = obj.ebs.code
    params["engineering_listing_id"] = obj.id

    const res = await getEBSApi(params)
    if (res) {
      if (res.length > 0) {
        // 获取子节点的code数组
        const codeArr = res.map((item) => item.code)
        // 获取子节点
        const resCount = await getCodeCountApi({
          code: JSON.stringify(codeArr),
          // code: JSON.stringify(["0102", "0101"]),
          level: 2,
          is_hidden: 0,
          project_id: PROJECT_ID,
        })

        if (Object.keys(resCount).length > 0) {
          return res.map((item_1) => ({
            ...item_1,
            childrenCount: resCount[String(item_1.code) as any] || {
              platform: 0,
              system: 0,
              userdefined: 0,
              none: 0,
            },
            isLeaf: false,
          }))
        } else {
          return res.map((item_2) => ({
            ...item_2,
            childrenCount: { platform: 0, system: 0, userdefined: 0, none: 0 },
            isLeaf: false,
          }))
        }
      }
    }
    return []
  }

  const [isCanSelect, setIsCanSelect] = React.useState<TypeEBSDataList>({} as TypeEBSDataList)
  const getSubEBSData = async (
    ebsItem: TypeEBSDataList,
    pos: string,
    i: number,
    type: boolean,
    engineeringId: number,
  ) => {
    const ebsAllValue = structuredClone(ebsAll)
    const treeValue = structuredClone(ebsAll[i])
    if (ebsItem.is_can_select == 1) setIsCanSelect(ebsItem)

    let arr: TypeEBSDataList[] = []
    // 展开
    if (type) {
      const params: any = { project_id: PROJECT_ID, is_hidden: 0 }

      params["level"] = ebsItem.level + 1
      params["code"] = ebsItem.code
      params["engineering_listing_id"] = engineeringId
      // if (searchParams.get("spId")) {
      //   params["project_sp_id"] = +searchParams.get("spId")!
      // }

      const res = await getEBSApi(params)

      arr = res.map((item) => ({ ...item, parent_id: ebsItem.id }))
      const indexArr = pos.split("-")
      const evalStr = `treeValue[${indexArr.join("].children[")}]`

      eval(`${evalStr}.children= arr`)

      ebsAllValue.splice(i, 1, treeValue)
      setEBSAll(ebsAllValue)
    } else {
      //   关闭
      const indexArr = pos.split("-")
      const evalStr = `treeValue[${indexArr.join("].children[")}]`
      eval(`${evalStr}.children=[]`)
      ebsAllValue.splice(i, 1, treeValue)
      setEBSAll(ebsAllValue)
    }

    return arr.length
  }

  const { showConfirmationDialog } = useConfirmationDialog()

  const relateTo = React.useRef<any[][]>([])
  const isEdited = React.useRef<number[]>([])

  const handleChangeCheckbox = async (checked: boolean, item: EngineeringListing) => {
    if (checked) {
      setEngineeringSelect((prevState) => [...prevState, item.id])
      const EBSData: any[] = await getEBSData(item.id)
      setEBSAll((prevState) => [...prevState, EBSData])
      relateTo.current = [...relateTo.current, []]
      isEdited.current = [...isEdited.current, 0]
      //   取消勾选构筑物
    } else {
      //操作
      const handle = () => {
        const index = engineeringSelect.indexOf(item.id)
        setEngineeringSelect((prevState) => prevState.filter((el) => el != item.id))
        const ebsArr = structuredClone(ebsAll)
        ebsArr.splice(index, 1)
        setEBSAll(ebsArr)
        relateTo.current.splice(index, 1)
        isEdited.current.splice(index, 1)
      }

      if (searchParams.get("spId")) {
        //  获取工点列表
        const res = await getProjectSubSectionApi({
          is_subset: 1,
          project_id: PROJECT_ID,
          parent_id: +searchParams.get("spId")!,
        })
        if (!isCanSelect.code) {
          showConfirmationDialog("该单位工程已关联工点数据，确认取消关联构筑物吗？", () => {})
          return
        } else {
          handle()
        }
      } else {
        handle()
      }
    }
  }

  const handleChecked = (checkedValue: any[], checked: boolean, index: number) => {
    console.log("tree触发了check")
    relateTo.current[index] = checkedValue
    isEdited.current[index] = 1
  }

  if (!permissionTagList.includes(permissionJson.unit_project_member_write)) {
    return <NoPermission />
  }

  return (
    <>
      <Card sx={{ minWidth: 275, height: "100%" }}>
        <CardContent className="flex h-full">
          <div className="h-full">
            <div className="w-[500px] p-10 flex flex-col h-full">
              <header className="text-3xl text-[#44566C] mb-8 h-9">
                {Boolean(searchParams.get("spId")) ? "编辑单位工程" : "添加单位工程"}
              </header>
              <form
                onSubmit={handleSubmit(onSubmit)}
                className="flex-1 flex flex-col overflow-y-auto">
                <div className="mb-8 relative">
                  <div className="flex items-start flex-col">
                    <InputLabel htmlFor="name" className="mr-3 w-full text-left mb-2.5">
                      <span className="text-railway_error mr-0.5">*</span>单位工程名称:
                    </InputLabel>
                    <TextField
                      variant="outlined"
                      id="name"
                      size="small"
                      fullWidth
                      error={Boolean(errors.name)}
                      {...register("name", {
                        required: "请输入单位工程名称",
                        maxLength: {
                          value: 30,
                          message: "文本最多30个",
                        },
                        onBlur() {
                          trigger("name")
                        },
                      })}
                      placeholder="请输入单位工程名称"
                      autoComplete="off"
                    />
                  </div>
                  <ErrorMessage
                    errors={errors}
                    name="name"
                    render={({ message }) => (
                      <p className="text-railway_error text-sm absolute">{message}</p>
                    )}
                  />
                </div>

                <div className="mb-8 relative overflow-y-auto flex-1">
                  <div className="flex items-start flex-col">
                    <InputLabel
                      id="demo-multiple-checkbox-label"
                      className="mr-3 w-full text-left mb-2.5">
                      {!searchParams.get("spId") && (
                        <span className="text-railway_error mr-0.5">*</span>
                      )}
                      关联构筑物
                    </InputLabel>

                    {engineeringList.map((item) => (
                      <div key={item.id} className="flex items-center">
                        <Checkbox
                          className="cursor-pointer"
                          checked={engineeringSelect.indexOf(item.id) > -1}
                          disabled={!!searchParams.get("spId")}
                          onChange={(_, checked) => {
                            handleChangeCheckbox(checked, item)
                          }}
                        />
                        <ListItemText
                          className="cursor-pointer"
                          primary={item.name}
                          onClick={() => {
                            // setCheckedKeys(related_to.current[item.id] ?? [])
                          }}
                        />
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <Button onClick={handleCancel}>取消</Button>
                  <Button type="submit" variant="contained" className="bg-railway_blue">
                    确定
                  </Button>
                </div>
              </form>
            </div>
          </div>
          <div className="mt-[12.5rem] ml-10 flex-1 overflow-y-auto">
            <div className="text-railway_gray mb-2">
              {engineeringSelect.length > 0 && (
                <>
                  <span className="text-railway_error mr-0.5">*</span>
                  关联工程结构
                </>
              )}
            </div>

            {engineeringSelect.map((id, index) => {
              const item = engineeringList.find((item) => item.id == id)!

              return (
                <Accordion sx={{ width: "100%" }} key={index}>
                  <AccordionSummary
                    expandIcon={<ExpandMoreIcon />}
                    aria-controls="panel2a-content"
                    id="panel2a-header">
                    <Typography>{item?.name}</Typography>
                  </AccordionSummary>
                  <AccordionDetails>
                    <Tree
                      treeData={ebsAll[index]}
                      onChecked={(checkedValue, checked) => {
                        handleChecked(checkedValue, checked, index)
                      }}
                      getSubEBSData={({ ebsItem, pos, engineeringId }, type) => {
                        return getSubEBSData(ebsItem, pos, index, type, engineeringId)
                      }}
                      engineeringId={id}
                    />
                  </AccordionDetails>
                </Accordion>
              )
            })}
          </div>
        </CardContent>
      </Card>
    </>
  )
}
