import React from "react"
import useDebounce from "@/hooks/useDebounce"
import WorkingPointContext from "@/app/working-point/context/workingPointContext"
import useSWRMutation from "swr/mutation"
import { reqGetProjectSubSection, reqPostProjectSubSection } from "@/app/working-point/api"
import { TypePostProjectSubSectionParams } from "@/app/working-point/types"
import { reqGetEBS } from "@/app/ebs-data/api"
import { PROJECT_ID } from "@/libs/const"
import {
  Button,
  Drawer,
  InputLabel,
  MenuItem,
  Select,
  SelectChangeEvent,
  TextField,
} from "@mui/material"
import { ErrorMessage } from "@hookform/error-message"
import { useForm } from "react-hook-form"

interface Props {
  open: boolean
  // eslint-disable-next-line no-unused-vars
  changeDialogOpen: (open: boolean) => void
}

interface Option {
  value: number
  label: string
  code: string
}

interface UnitOptions {
  value: number
  label: string
  code: string
  subpart_name: string
  subpart_id: string
}

type IForm = {
  name: string
  start_mileage: number
  start_tally: number
  end_mileage: number
  end_tally: number
  calculate_value: number
}

export default function DialogProject(props: Props) {
  const ctx = React.useContext(WorkingPointContext)
  const { open, changeDialogOpen } = props

  const { trigger: getEBSApi } = useSWRMutation("/ebs", reqGetEBS)

  // 获取表格数据SWR请求
  const { trigger: getProjectSubSectionApi } = useSWRMutation(
    "/project-subsection",
    reqGetProjectSubSection,
  )

  const handleCancel = () => {
    changeDialogOpen(false)
    reset()
  }

  const {
    handleSubmit,
    formState: { errors },
    register,
    reset,
    trigger,
  } = useForm<IForm>({})

  const [unitOptions, setUnitOptions] = React.useState<UnitOptions[]>([])

  const [ebsOptions, setEBSOption] = React.useState<UnitOptions[]>([])

  React.useEffect(() => {
    getProjectSubSectionApi({ is_subset: 0, project_id: PROJECT_ID }).then((res) => {
      if (res && res.length > 0) {
        setUnitOptions(
          res.map(
            (item) => ({ ...item, label: item.name, value: item.id, code: item.code }) as any,
          ),
        )
      }
    })

    getEBSApi({ project_id: PROJECT_ID, is_hidde: 0 }).then((res) => {
      if (res && res.length > 0) {
        setEBSOption(
          res.map(
            (item) => ({ ...item, label: item.name, value: item.id, code: item.code }) as any,
          ),
        )
      }
    })
  }, [])

  const [formData, setFormData] = React.useState<TypePostProjectSubSectionParams>({
    parent_id: "",
    ebs_id: "",
  } as TypePostProjectSubSectionParams)

  const { trigger: postProjectSubSection } = useSWRMutation(
    "/project-subsection/sub",
    reqPostProjectSubSection,
  )

  // 提交表单事件（防抖）
  const { run: onSubmit } = useDebounce(async (value: any) => {
    // 深拷贝表单的对象 避免影响到表单展示
    const valueCopy = structuredClone(value)
    // 删除不需要的对象
    delete valueCopy.subpart
    delete valueCopy.unit
    // 调用添加接口
    await postProjectSubSection(Object.assign({ project_id: PROJECT_ID }, valueCopy, formData))
    // 重新获取列表
    ctx.getProjectSubSection()
    handleCancel()
  })

  // 渲染EBS专业
  const handleEBSSelect = (event: SelectChangeEvent<number | string>) => {
    console.log(event.target.value)
    const obj = ebsOptions.find((item) => item.value == event.target.value)
    console.log(obj)

    setFormData(
      Object.assign({}, formData, {
        ebs_id: obj!.value,
        ebs_name: obj!.label,
        ebs_code: obj!.code,
      }),
    )
  }

  // 选择单位工程专业
  const handleUnitSelect = (event: SelectChangeEvent<number | string>) => {
    const obj = unitOptions.find((item) => item.value == event.target.value)
    setFormData(
      Object.assign({}, formData, {
        parent_id: obj!.value,
        subpart_name: obj!.subpart_name,
        subpart_id: obj!.subpart_id,
      }),
    )
  }

  return (
    <>
      <Drawer open={open} onClose={handleCancel} anchor="right">
        <div className="w-[500px] p-10">
          <header className="text-3xl text-[#44566C] mb-8">添加单位工程</header>
          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="mb-8 relative">
              <div className="flex items-start flex-col">
                <InputLabel htmlFor="name" className="mr-3 w-20 text-left mb-2.5" required>
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
                <InputLabel htmlFor="percentage" className="mr-3 w-20 text-left mb-2.5">
                  单位工程:
                </InputLabel>
                <Select
                  onChange={handleUnitSelect}
                  value={formData.parent_id}
                  MenuProps={{ sx: { zIndex: 1702, height: "400px" } }}
                  sx={{ flex: 1, color: "#303133", zIndex: 1602 }}
                  id="role_list"
                  placeholder="请选择一个专业"
                  size="small"
                  fullWidth>
                  {unitOptions.map((item: any) => (
                    <MenuItem value={item.value} key={item.value}>
                      {item.label}
                    </MenuItem>
                  ))}
                </Select>
              </div>
            </div>

            <div className="mb-8">
              <div className="flex items-start flex-col">
                <InputLabel htmlFor="percentage" className="mr-3 w-20 text-left mb-2.5">
                  EBS专业:
                </InputLabel>
                <Select
                  value={formData.ebs_id}
                  onChange={handleEBSSelect}
                  MenuProps={{ sx: { zIndex: 1702, height: "400px" } }}
                  sx={{ flex: 1, color: "#303133", zIndex: 1602 }}
                  id="role_list"
                  placeholder="请选择一个专业"
                  size="small"
                  fullWidth>
                  {ebsOptions.map((item: any) => (
                    <MenuItem value={item.value} key={item.value}>
                      {item.label}
                    </MenuItem>
                  ))}
                </Select>
              </div>
            </div>

            <div className="mb-8 relative">
              <div className="flex items-start flex-col">
                <InputLabel htmlFor="start_tally" className="mr-3 w-20 text-left mb-2.5" required>
                  开始:
                </InputLabel>
                <TextField
                  variant="outlined"
                  id="start_tally"
                  size="small"
                  fullWidth
                  error={Boolean(errors.start_tally)}
                  {...register("start_tally", {
                    required: "请输入开始",
                    maxLength: {
                      value: 16,
                      message: "文本最多16个",
                    },
                    onBlur() {
                      trigger("start_tally")
                    },
                  })}
                  placeholder="请输入开始"
                  autoComplete="off"
                />
              </div>
              <ErrorMessage
                errors={errors}
                name="start_tally"
                render={({ message }) => (
                  <p className="text-railway_error text-sm absolute">{message}</p>
                )}
              />
            </div>

            <div className="mb-8 relative">
              <div className="flex items-start flex-col">
                <InputLabel htmlFor="end_tally" className="mr-3 w-20 text-left mb-2.5" required>
                  结束:
                </InputLabel>
                <TextField
                  variant="outlined"
                  id="end_tally"
                  size="small"
                  fullWidth
                  error={Boolean(errors.end_tally)}
                  {...register("end_tally", {
                    required: "请输入结束",
                    maxLength: {
                      value: 16,
                      message: "文本最多16个",
                    },
                    onBlur() {
                      trigger("end_tally")
                    },
                  })}
                  placeholder="请输入结束"
                  autoComplete="off"
                />
              </div>
              <ErrorMessage
                errors={errors}
                name="end_tally"
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
      </Drawer>
    </>
  )
}
