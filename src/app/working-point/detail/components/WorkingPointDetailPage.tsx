"use client"
import React from "react"
import useSWRMutation from "swr/mutation"
import { reqGetProjectSubSection } from "@/app/unit-project/api"
import {
  Button,
  InputLabel,
  TextField,
  CardContent,
  Card,
  AccordionSummary,
  Accordion,
  AccordionDetails,
  Typography,
  Select,
  MenuItem,
} from "@mui/material"
import { ErrorMessage } from "@hookform/error-message"
import { useForm } from "react-hook-form"
import useDebounce from "@/hooks/useDebounce"
import { reqGetEBS } from "@/app/ebs-data/api"
import Tree from "./Tree"
import { TypeEBSDataList } from "@/app/ebs-data/types"
import { EngineeringListing } from "@/app/basic-engineering-management/types/index.d"
import ExpandMoreIcon from "@mui/icons-material/ExpandMore"
import { TypePostProjectSubSectionParams } from "@/app/working-point/types"
import { useRouter, useSearchParams } from "next/navigation"
import { reqPostProjectSubSection, reqPutProjectSubSection } from "@/app/working-point/api"
import WorkingPointContext from "@/app/working-point/context/workingPointContext"
import { LayoutContext } from "@/components/LayoutContext"

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

export default function WorkingPointDetailPage() {
  const ctx = React.useContext(WorkingPointContext)

  const { projectId: PROJECT_ID } = React.useContext(LayoutContext)

  const searchParams = useSearchParams()

  const router = useRouter()

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

  const { trigger: postProjectSubSection } = useSWRMutation(
    "/project-subsection/sub",
    reqPostProjectSubSection,
  )

  const { trigger: putProjectSubSectionApi } = useSWRMutation(
    "/project-subsection/sub",
    reqPutProjectSubSection,
  )

  const { trigger: getProjectSubSectionApi } = useSWRMutation(
    "/project-subsection",
    reqGetProjectSubSection,
  )

  const [engineeringList, setEngineeringList] = React.useState<any[]>([])
  const [projectSubSection, setProjectSubSection] = React.useState<any[]>([])

  const getProjectSubSectionList = async () => {
    const res = await getProjectSubSectionApi({ project_id: PROJECT_ID })
    setProjectSubSection(res)
  }

  React.useEffect(() => {
    getProjectSubSectionList()
  }, [])

  const [projectState, setProjectState] = React.useState<number>(0)

  React.useEffect(() => {
    if (projectState > 0 && projectSubSection.length > 0) {
      console.log(projectSubSection, projectState)
      const unitProjectItem = projectSubSection.find((item) => item.id == projectState)
      setEngineeringList(unitProjectItem.engineering_listings)
    }
  }, [projectState, projectSubSection])

  React.useEffect(() => {
    if (ctx.tableList.length <= 0) {
      ctx.getProjectSubSection()
    }
    if (ctx.tableList.length > 0 && searchParams.get("siId")) {
      const _editItem = ctx.tableList.find((item: any) => item.id == +searchParams.get("siId")!)
      console.log(_editItem)
      if (_editItem) {
        setValue("name", _editItem.name)
        setProjectState(+_editItem.parent_id)
        setEngineeringList(_editItem.engineering_listings)
        setEngineeringSelect(+_editItem.engineering_listings[0].id)
      }
    }
  }, [ctx.tableList, engineeringList])

  // 获取EBS结构数据
  const { trigger: getEBSApi } = useSWRMutation("/ebs", reqGetEBS)

  // 提交表单事件（防抖）
  const { run: onSubmit } = useDebounce(async (value: any) => {
    const params = {} as TypePostProjectSubSectionParams

    params.name = value.name
    params.project_id = PROJECT_ID
    params.parent_id = String(projectState)
    params.ebs_ids = JSON.stringify(relateTo.current)
    params.engineering_listing_id = engineeringSelect
    if (searchParams.get("siId")) {
      params.id = +searchParams.get("siId")!
      await putProjectSubSectionApi(params)
    } else {
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
    params["project_sp_id"] = projectState
    params["code"] = obj.ebs_code

    const res = await getEBSApi(params)

    setEBSAll(res)
    return []
  }

  React.useEffect(() => {
    if (engineeringSelect > 0 && projectState > 0) {
      getEBSData(engineeringSelect)
    }
  }, [engineeringSelect, projectState])

  const getSubEBSData = async (ebsItem: TypeEBSDataList, pos: string, type: boolean) => {
    const ebsAllValue = structuredClone(ebsAll)

    let arr: TypeEBSDataList[] = []
    // 展开
    if (type) {
      const res = await getEBSApi({
        project_id: PROJECT_ID,
        level: ebsItem.level + 1,
        code: ebsItem.code,
        is_hidden: 0,
        engineering_listing_id: engineeringSelect,
        project_sp_id: String(projectState),
      })

      arr = res

      const indexArr = pos.split("-")
      const evalStr = `ebsAllValue[${indexArr.join("].children[")}]`

      eval(`${evalStr}.children= arr`)

      console.log(arr)

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
      <Card sx={{ minWidth: 275, height: "100%" }}>
        <CardContent className="flex">
          <div>
            <div className="w-[500px] p-10">
              <header className="text-3xl text-[#44566C] mb-8">
                {Boolean(searchParams.get("siId")) ? "编辑工点" : "添加工点"}
              </header>
              <form onSubmit={handleSubmit(onSubmit)}>
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
                          value: 16,
                          message: "文本最多16个",
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

                <div className="mb-8">
                  <div className="flex items-start flex-col">
                    <InputLabel htmlFor="role_list" className="mr-3 w-full text-left mb-2.5">
                      关联单位工程:
                    </InputLabel>

                    <Select
                      id="h_subpart_code"
                      fullWidth
                      value={projectState}
                      size="small"
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

                {engineeringList.length > 0 && (
                  <div className="mb-8">
                    <div className="flex items-start flex-col">
                      <InputLabel htmlFor="role_list" className="mr-3 w-full text-left mb-2.5">
                        关联构筑物:
                      </InputLabel>

                      <Select
                        id="h_subpart_code"
                        fullWidth
                        value={engineeringSelect}
                        size="small"
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
                <div>
                  <Button onClick={handleCancel}>取消</Button>
                  <Button type="submit" variant="contained" className="bg-railway_blue">
                    确定
                  </Button>
                </div>
              </form>
            </div>
          </div>
          <div className="mt-10 ml-10 flex-1">
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
