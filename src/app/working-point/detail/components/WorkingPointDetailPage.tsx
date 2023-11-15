"use client"
import React from "react"
import useSWRMutation from "swr/mutation"
import { reqGetProjectSubSection } from "@/app/unit-project/api"
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Button,
  Card,
  CardContent,
  InputLabel,
  MenuItem,
  Select,
  TextField,
  Typography,
} from "@mui/material"
import { ErrorMessage } from "@hookform/error-message"
import { useForm } from "react-hook-form"
import useDebounce from "@/hooks/useDebounce"
import { reqGetEBS } from "@/app/ebs-data/api"
import Tree from "./Tree"
import { TypeApiGetEBSParams, TypeEBSDataList } from "@/app/ebs-data/types"
import ExpandMoreIcon from "@mui/icons-material/ExpandMore"
import { TypePostProjectSubSectionParams } from "@/app/working-point/types"
import { useRouter, useSearchParams } from "next/navigation"
import { reqPostProjectSubSection, reqPutProjectSubSection } from "@/app/working-point/api"
import WorkingPointContext from "@/app/working-point/context/workingPointContext"
import { LayoutContext } from "@/components/LayoutContext"
import { message } from "antd"

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
      disableCheckbox: !flag,
      children: changeTreeArr(item.children as TypeEBSDataList[], str, flag),
    }
  })
}

export default function WorkingPointDetailPage() {
  const ctx = React.useContext(WorkingPointContext)

  const { projectId: PROJECT_ID } = React.useContext(LayoutContext)

  const searchParams = useSearchParams()

  const router = useRouter()

  // 处理取消按钮
  const handleCancel = () => {
    router.push("/working-point")
    reset()
  }

  const {
    handleSubmit,
    formState: { errors },
    register,
    reset,
    trigger,
    setValue,
  } = useForm<IForm>({})

  // 添加单位工程接口
  const { trigger: postProjectSubSection } = useSWRMutation(
    "/project-subsection/sub",
    reqPostProjectSubSection,
  )

  // 修改单位工程接口
  const { trigger: putProjectSubSectionApi } = useSWRMutation(
    "/project-subsection/sub",
    reqPutProjectSubSection,
  )

  // 获取单位工程接口
  const { trigger: getProjectSubSectionApi } = useSWRMutation(
    "/project-subsection",
    reqGetProjectSubSection,
  )

  // 构筑物列表
  const [engineeringList, setEngineeringList] = React.useState<any[]>([])

  // 单位工程列表
  const [projectSubSection, setProjectSubSection] = React.useState<any[]>([])

  // 获取单位工程列表
  const getProjectSubSectionList = async () => {
    const res = await getProjectSubSectionApi({ project_id: PROJECT_ID })
    setProjectSubSection(res)
  }

  React.useEffect(() => {
    getProjectSubSectionList()
    ctx.getProjectSubSection()
  }, [])

  const [projectState, setProjectState] = React.useState<number>(0)

  React.useEffect(() => {
    if (ctx.tableList.length > 0 && searchParams.get("siId")) {
      // 通过上下文 找到编辑的工点
      const _editItem = ctx.tableList.find((item: any) => item.id == +searchParams.get("siId")!)
      // 找到编辑的对象
      if (_editItem) {
        setValue("name", _editItem.name)
        if (_editItem.parent_id) {
          setProjectState(+_editItem.parent_id)
        }
        if (_editItem.engineering_listings && _editItem.engineering_listings.length > 0) {
          setEngineeringSelect(+_editItem.engineering_listings[0].id)
        }
      }
    }
  }, [ctx.tableList])

  // 单位工程切换时修改购猪物的列表
  React.useEffect(() => {
    if (projectState > 0 && projectSubSection.length > 0) {
      const unitProjectItem = projectSubSection.find((item) => item.id == projectState)
      setEngineeringList(unitProjectItem.engineering_listings)
    }
  }, [projectState, projectSubSection])

  // 获取EBS结构数据
  const { trigger: getEBSApi } = useSWRMutation("/ebs", reqGetEBS)

  // 提交表单事件（防抖）
  const { run: onSubmit } = useDebounce(async (value: any) => {
    if (!projectState) {
      message.error("请选择一个单位工程")
      return
    }
    const params = {} as TypePostProjectSubSectionParams

    params.name = value.name
    params.project_id = PROJECT_ID
    params.ebs_ids = JSON.stringify(relateTo.current)
    if (engineeringSelect) {
      params.engineering_listing_id = engineeringSelect
    }
    params.parent_id = String(projectState)
    if (projectState) {
    }
    if (searchParams.get("siId")) {
      params.id = +searchParams.get("siId")!
      await putProjectSubSectionApi(params)
    } else {
      if (!params.parent_id || !params.engineering_listing_id) {
        return message.error("请选择单位工程和构筑物")
      }
      await postProjectSubSection(params)
    }

    ctx.getProjectSubSection()
    handleCancel()
  })

  const [engineeringSelect, setEngineeringSelect] = React.useState<number>(0)

  const [ebsAll, setEBSAll] = React.useState<any[]>([])

  const getEBSData = async (engineering_listing_id: number) => {
    const params: any = { project_id: PROJECT_ID, is_hidden: 0 }

    const obj = engineeringList.find((item) => item.id == engineering_listing_id)!

    params["engineering_listing_id"] = engineering_listing_id
    // params["project_sp_id"] = projectState
    params["code"] = obj?.ebs_code

    const res = await getEBSApi(params)

    setEBSAll(res)
    return []
  }

  React.useEffect(() => {
    if (engineeringSelect > 0 && projectState > 0 && engineeringList.length > 0) {
      getEBSData(engineeringSelect)
    }
  }, [engineeringSelect, projectState, engineeringList])

  const getSubEBSData = async (ebsItem: TypeEBSDataList, pos: string, type: boolean) => {
    const ebsAllValue = structuredClone(ebsAll)

    let arr: TypeEBSDataList[] = []
    // 展开
    if (type) {
      const ebsParams = {
        project_id: PROJECT_ID,
        level: ebsItem.level + 1,
        code: ebsItem.code,
        is_hidden: 0,
        engineering_listing_id: engineeringSelect,
        // project_sp_id: String(projectState),
      } as TypeApiGetEBSParams
      // if (searchParams.get("siId")) {
      //   ebsParams.project_si_id = searchParams.get("siId")!
      // }

      arr = await getEBSApi(ebsParams)

      const indexArr = pos.split("-")
      const evalStr = `ebsAllValue[${indexArr.join("].children[")}]`

      eval(`${evalStr}.children= arr`)

      setEBSAll(ebsAllValue)
    } else {
      //   关闭
      const indexArr = pos.split("-")
      const evalStr = `ebsAllValue[${indexArr.join("].children[")}]`
      eval(`${evalStr}.children=[]`)
      setEBSAll(ebsAllValue)
    }

    return arr.length
  }

  const relateTo = React.useRef<any[]>([])

  const handleChecked = (checkedValue: any[], checked: boolean) => {
    relateTo.current = checkedValue
  }

  return (
    <>
      <Card sx={{ minWidth: 275, height: "100%", overflowY: "auto" }}>
        <CardContent className="flex">
          <div>
            <div className="w-[500px] p-10">
              <header className="text-3xl text-[#44566C] mb-8">
                {Boolean(searchParams.get("siId")) ? "编辑工点" : "添加工点"}
              </header>
              <form onSubmit={handleSubmit(onSubmit)}>
                <div className="mb-8">
                  <div className="flex items-start flex-col">
                    <InputLabel htmlFor="role_list" className="mr-3 w-full text-left mb-2.5">
                      单位工程:
                    </InputLabel>

                    <Select
                      id="h_subpart_code"
                      fullWidth
                      value={projectState}
                      size="small"
                      defaultValue={0}
                      onChange={(event) => {
                        setProjectState(+event.target.value)
                      }}>
                      <MenuItem value={0}>
                        <i className="text-[#ababab]">请选择一个单位工程</i>
                      </MenuItem>
                      {projectSubSection.map((item) => (
                        <MenuItem value={item.id} key={item.id}>
                          {item.name}
                        </MenuItem>
                      ))}
                    </Select>
                  </div>
                </div>

                {projectState > 0 && (
                  <div className="mb-8">
                    <div className="flex items-start flex-col">
                      <InputLabel htmlFor="role_list" className="mr-3 w-full text-left mb-2.5">
                        构筑物:
                      </InputLabel>

                      <Select
                        id="h_subpart_code"
                        fullWidth
                        value={engineeringSelect}
                        size="small"
                        defaultValue={0}
                        onChange={(event) => {
                          setEngineeringSelect(+event.target.value)
                        }}>
                        <MenuItem value={0}>
                          <i className="text-[#ababab]">请选择一个构筑物</i>
                        </MenuItem>
                        {engineeringList.map((item) => (
                          <MenuItem value={item.id} key={item.id}>
                            {item.name}
                          </MenuItem>
                        ))}
                      </Select>
                    </div>
                  </div>
                )}

                <div className="mb-8 relative">
                  <div className="flex items-start flex-col">
                    <InputLabel htmlFor="name" className="mr-3 w-full text-left mb-2.5" required>
                      工点名称:
                    </InputLabel>
                    <TextField
                      variant="outlined"
                      id="name"
                      size="small"
                      fullWidth
                      error={Boolean(errors.name)}
                      {...register("name", {
                        required: "请输入工点名称",
                        maxLength: {
                          value: 30,
                          message: "文本最多30个",
                        },
                        onBlur() {
                          trigger("name")
                        },
                      })}
                      placeholder="请输入工点名称"
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
                <div>
                  <Button onClick={handleCancel}>取消</Button>
                  <Button type="submit" variant="contained" className="bg-railway_blue">
                    确定
                  </Button>
                </div>
              </form>
            </div>
          </div>
          <div className="mt-[8.5rem] ml-10 flex-1">
            {!!engineeringSelect && (
              <Accordion sx={{ width: "100%" }}>
                <AccordionSummary
                  expandIcon={<ExpandMoreIcon />}
                  aria-controls="panel2a-content"
                  id="panel2a-header">
                  <Typography>
                    {engineeringList.find((item) => item.id == engineeringSelect)?.name}
                  </Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <Tree
                    projectState={projectState}
                    treeData={ebsAll}
                    onChecked={(checkedValue, checked) => {
                      handleChecked(checkedValue, checked)
                    }}
                    getSubEBSData={({ ebsItem, pos }, type) => {
                      return getSubEBSData(ebsItem, pos, type)
                    }}
                  />
                </AccordionDetails>
              </Accordion>
            )}
          </div>
        </CardContent>
      </Card>
    </>
  )
}
