"use client"
import React from "react"
import useDebounce from "@/hooks/useDebounce"
import UnitProjectContext from "@/app/unit-project/context/unitProjectContext"
import useSWRMutation from "swr/mutation"
import { reqGetSubSection, reqPostProjectSubSection } from "@/app/unit-project/api"
import { TypePostProjectSubSectionParams, TypeSubSectionData } from "@/app/unit-project/types"
import { PROJECT_ID } from "@/libs/const"
import {
  Drawer,
  InputLabel,
  MenuItem,
  TextField,
  Select,
  SelectChangeEvent,
  Button,
} from "@mui/material"
import { ErrorMessage } from "@hookform/error-message"
import { useForm } from "react-hook-form"

interface Props {
  open: boolean
  // eslint-disable-next-line no-unused-vars
  changeDialogOpen: (open: boolean) => void
}

interface Option extends TypeSubSectionData {
  value?: string | number | null
  label: React.ReactNode
  children?: Option[]
  isLeaf?: boolean
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
  const ctx = React.useContext(UnitProjectContext)
  const { open, changeDialogOpen } = props

  const handleCancel = () => {
    changeDialogOpen(false)
    reset()
  }

  const {
    handleSubmit,
    formState: { errors },
    register,
    reset,
  } = useForm<IForm>({})

  const [options, setOptions] = React.useState<Option[]>([])

  const [subpart, setSubpart] = React.useState<TypePostProjectSubSectionParams>({
    subpart_id: 0,
  } as TypePostProjectSubSectionParams)

  React.useEffect(() => {
    setOptions(
      ctx.professionList.map((item) => ({
        ...item,
        value: item.id,
        label: `${item.class_name ? item.class_name + "-" : ""}${item.name}`,
      })) as any,
    )
  }, [ctx.professionList.length])

  const { trigger: getSubSectionApi } = useSWRMutation("/subsection", reqGetSubSection)

  const { trigger: postProjectSubSection } = useSWRMutation(
    "/project-subsection",
    reqPostProjectSubSection,
  )

  // 提交表单事件（防抖）
  const { run: onSubmit } = useDebounce(async (value: any) => {
    // 深拷贝表单的对象 避免影响到表单展示
    const valueCopy = structuredClone(value)
    // 调用添加接口
    await postProjectSubSection(Object.assign({ project_id: PROJECT_ID }, valueCopy, subpart))
    // 重新获取列表
    ctx.getProjectSubSection()
    handleCancel()
  })

  const handleSelectChange = (event: SelectChangeEvent<number>) => {
    const obj = options.find((item) => item.id == event.target.value)

    setSubpart(
      Object.assign({}, subpart, {
        subpart_id: obj!.id,
        subpart_name: obj!.label,
        code: obj!.code,
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
                  表单名称:
                </InputLabel>
                <TextField
                  variant="outlined"
                  id="name"
                  size="small"
                  fullWidth
                  error={Boolean(errors.name)}
                  {...register("name", { required: "请输入名称" })}
                  placeholder="请输入名称"
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
                  关联角色:
                </InputLabel>
                <Select
                  value={subpart.subpart_id}
                  onChange={handleSelectChange}
                  MenuProps={{ sx: { zIndex: 1702, height: "400px" } }}
                  sx={{ flex: 1, color: "#303133", zIndex: 1602 }}
                  id="role_list"
                  placeholder="请选择一个专业"
                  size="small"
                  fullWidth>
                  {options.map((item: any) => (
                    <MenuItem value={item.value} key={item.value}>
                      {item.label}
                    </MenuItem>
                  ))}
                </Select>
              </div>
            </div>

            <div className="mb-8 relative">
              <div className="flex items-start flex-col">
                <InputLabel htmlFor="start_mileage" className="mr-3 w-20 text-left mb-2.5" required>
                  开始里程:
                </InputLabel>
                <TextField
                  variant="outlined"
                  id="start_mileage"
                  size="small"
                  fullWidth
                  error={Boolean(errors.start_mileage)}
                  {...register("start_mileage", { required: "请输入开始里程" })}
                  placeholder="请输入开始里程"
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
                  {...register("start_tally", { required: "请输入开始" })}
                  placeholder="请输入开始"
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

            <div className="mb-8 relative">
              <div className="flex items-start flex-col">
                <InputLabel htmlFor="end_mileage" className="mr-3 w-20 text-left mb-2.5" required>
                  结束里程:
                </InputLabel>
                <TextField
                  variant="outlined"
                  id="end_mileage"
                  size="small"
                  fullWidth
                  error={Boolean(errors.end_mileage)}
                  {...register("end_mileage", { required: "请输入结束里程" })}
                  placeholder="请输入结束里程"
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
                  {...register("end_tally", { required: "请输入结束" })}
                  placeholder="请输入结束"
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
            <div className="mb-8 relative">
              <div className="flex items-start flex-col">
                <InputLabel
                  htmlFor="calculate_value"
                  className="mr-3 w-20 text-left mb-2.5"
                  required>
                  表单名称:
                </InputLabel>
                <TextField
                  variant="outlined"
                  id="calculate_value"
                  size="small"
                  fullWidth
                  error={Boolean(errors.calculate_value)}
                  {...register("calculate_value", { required: "请输入长度m" })}
                  placeholder="请输入长度m"
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
      </Drawer>
    </>
  )
}
