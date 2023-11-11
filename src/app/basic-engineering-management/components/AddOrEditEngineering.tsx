import { Button, Drawer, InputLabel, TextField, Switch, MenuItem, Select } from "@mui/material"
import React from "react"
import { SubmitHandler, useForm } from "react-hook-form"
import useDebounce from "@/hooks/useDebounce"
import { ErrorMessage } from "@hookform/error-message"
import useSWRMutation from "swr/mutation"
import { message, TreeSelectProps } from "antd"
import {
  EngineeringListing,
  PostEngineeringListingParams,
  PutEngineeringListingParams,
} from "@/app/basic-engineering-management/types/index.d"
import { TypeEBSDataList } from "@/app/gantt/types"
import { TypeApiGetEBSParams } from "@/app/ebs-data/types"
import {
  reqGetEngineeringListing,
  reqPostEngineeringListing,
  reqPutEngineeringListing,
} from "@/app/basic-engineering-management/api"
import { reqGetEBS, reqGetEBSSystem } from "@/app/ebs-data/api"
import { LayoutContext } from "@/components/LayoutContext"
import { useConfirmationDialog } from "@/components/ConfirmationDialogProvider"
import dayjs from "dayjs"

type AllSelectType = {
  ebs_id: number | null
  is_highspeed: number
}

interface Props {
  open: boolean
  // eslint-disable-next-line no-unused-vars
  close: () => void
  editItem: null | EngineeringListing
  getDataList: () => void
}

const findKmAndM = (str: string) => {
  const _startMileage = str.split(".")
  //
  const km = parseInt(String(Number(_startMileage[0]) / 1000))

  const float = _startMileage[1]
  const m = float
    ? (Number(_startMileage[0]) % 1000) + "." + float
    : Number(_startMileage[0]) % 1000

  return { km, m }
}

export default function AddOrEditEngineering(props: Props) {
  const { open, close, editItem, getDataList } = props

  const { projectId: PROJECT_ID } = React.useContext(LayoutContext)

  const handleClose = () => {
    close()
    reset()
  }

  const { trigger: getEngineeringListingApi, isMutating } = useSWRMutation(
    "/engineering-listing",
    reqGetEngineeringListing,
  )

  const { showConfirmationDialog } = useConfirmationDialog()

  React.useEffect(() => {
    if (editItem) {
      const { km: sKm, m: sM } = findKmAndM(editItem.start_mileage + "")
      const { km: eKm, m: eM } = findKmAndM(editItem.end_mileage + "")

      setValue("start_mileage1", Number(sKm))
      setValue("start_mileage2", Number(sM))

      setValue("end_mileage1", Number(eKm))
      setValue("end_mileage2", Number(eM))

      setValue("end_mileage", editItem.end_mileage)
      setValue("start_mileage", editItem.start_mileage)
      setValue("name", editItem.name)
      setAllSelectValue({
        ebs_id: editItem.ebs_id,
        is_highspeed: editItem.is_highspeed,
      })
    }
  }, [editItem])

  const [engineeringList, setEngineeringList] = React.useState<EngineeringListing[]>([])

  const getEngineeringListingDataList = async () => {
    const res = await getEngineeringListingApi({
      project_id: PROJECT_ID,
    })

    setEngineeringList(res)
  }

  React.useEffect(() => {
    getEngineeringListingDataList()
  }, [])

  const {
    handleSubmit,
    formState: { errors },
    register,
    reset,
    trigger,
    setValue,
  } = useForm<
    PostEngineeringListingParams & {
      start_mileage1: number
      start_mileage2: number
      end_mileage1: number
      end_mileage2: number
    }
  >()

  const { trigger: postEngineeringListingApi } = useSWRMutation(
    "/engineering-listing",
    reqPostEngineeringListing,
  )

  const { trigger: putEngineeringListingApi } = useSWRMutation(
    "/engineering-listing",
    reqPutEngineeringListing,
  )

  const handleSubmitFormCB = async (
    values: PostEngineeringListingParams & {
      start_mileage1: number
      start_mileage2: number
      end_mileage1: number
      end_mileage2: number
    },
  ) => {
    const params = {} as PostEngineeringListingParams & PutEngineeringListingParams
    params.project_id = PROJECT_ID
    Object.assign(params, allSelectValue)
    params.start_mileage = values.start_mileage1 * 1000 + Number(values.start_mileage2) + ""
    params.end_mileage = values.end_mileage1 * 1000 + Number(values.end_mileage2) + ""
    params.name = values.name

    if (Boolean(editItem)) {
      delete params["ebs_id"]
      params.id = editItem!.id
      await putEngineeringListingApi(params)
    } else {
      await postEngineeringListingApi(params)
    }
    message.success("操作成功")
    handleClose()
    getDataList()
  }

  const { run: onSubmit }: { run: SubmitHandler<PostEngineeringListingParams> } = useDebounce(
    async (
      values: PostEngineeringListingParams & {
        start_mileage1: number
        start_mileage2: number
        end_mileage1: number
        end_mileage2: number
      },
    ) => {
      if (!allSelectValue.ebs_id) return message.error("请选择EBS")

      const flagSome = engineeringList.some((item) => item.name.includes(values.name))

      flagSome
        ? showConfirmationDialog("该工程名已存在，确认添加？", () => {
            handleSubmitFormCB(values)
          })
        : handleSubmitFormCB(values)
    },
  )

  const [customError, setCustomError] = React.useState<any>({})

  const [allSelectValue, setAllSelectValue] = React.useState<AllSelectType>({
    ebs_id: 0,
    is_highspeed: 0,
  })

  const handleChangeAllSelectValue = (value: number, type: keyof AllSelectType) => {
    setAllSelectValue((prevState) => ({ ...prevState, [type]: value }))
  }

  const { trigger: getEBSSystemApi } = useSWRMutation("/ebs/system", reqGetEBSSystem)

  React.useEffect(() => {
    getEBSSystemApi({ subpart_class: "field", level: 1 }).then((res) => {
      if (res && res.length > 0) {
        setEBSOption(res.map((e) => ({ ...e, title: e.name, value: e.id }) as any))
      }
    })
  }, [])

  // 部门下拉框选项
  const [ebsOption, setEBSOption] = React.useState<TypeEBSDataList[]>([])

  const handleEBSSelectChange = (id: number | null) => {
    handleChangeAllSelectValue(id ?? 0, "ebs_id")
  }

  return (
    <Drawer open={open} onClose={handleClose} anchor="right">
      <div className="w-[500px] p-10">
        <header className="text-3xl text-[#44566C] mb-8">
          {!!editItem ? "修改构筑物" : "添加构筑物"}
        </header>
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="mb-8 relative">
            <div className="flex items-start flex-col">
              <InputLabel htmlFor="name" className="mr-3 w-full text-left mb-2.5">
                <span className="text-railway_error mr-0.5">*</span>构筑物名称:
              </InputLabel>
              <TextField
                variant="outlined"
                id="name"
                size="small"
                fullWidth
                error={Boolean(errors.name)}
                {...register("name", {
                  required: "请输入构筑物名称",
                  onBlur() {
                    trigger("name")
                  },
                })}
                label="请输入构筑物名称"
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

          <div className="mb-8 relative">
            <div className="flex items-start flex-col">
              <InputLabel htmlFor="certificate_number" className="mr-3 w-full text-left mb-2.5">
                <span className="text-railway_error mr-0.5">*</span>专业名称:
              </InputLabel>
              {Boolean(editItem) ? (
                <div>{editItem?.ebs.name}</div>
              ) : (
                <Select
                  value={allSelectValue.ebs_id}
                  onChange={(event) => {
                    handleEBSSelectChange(event.target.value as number)
                  }}
                  MenuProps={{ sx: { zIndex: 1702, height: "400px" } }}
                  sx={{ flex: 1, color: "#303133", zIndex: 1602 }}
                  id="role_list"
                  placeholder="请选择一个专业"
                  size="small"
                  fullWidth>
                  <MenuItem value={0}>
                    <i className="text-[#ababab]">请选择一个专业</i>
                  </MenuItem>
                  {ebsOption.map((item: any) => (
                    <MenuItem value={item.id} key={item.id}>
                      {item.name}
                    </MenuItem>
                  ))}
                </Select>
              )}
            </div>
          </div>

          <div className="mb-8 relative">
            <div className="flex items-start flex-col">
              <InputLabel htmlFor="name" className="mr-3 w-full text-left mb-2.5">
                <span className="text-railway_error mr-0.5">*</span>是否高速:
              </InputLabel>
              <Switch
                checked={allSelectValue.is_highspeed == 1}
                onChange={(_, checked) => {
                  handleChangeAllSelectValue(Number(checked), "is_highspeed")
                  setCustomError({})
                }}
              />
            </div>
            <ErrorMessage
              errors={customError}
              name="isHighSpeedSelect"
              render={({ message }) => (
                <p className="text-railway_error text-sm absolute">{message}</p>
              )}
            />
          </div>

          <div className="mb-8 relative">
            <div className="flex items-start flex-col">
              <InputLabel htmlFor="start_mileage" className="mr-3 w-full text-left mb-2.5">
                <span className="text-railway_error mr-0.5">*</span>开始里程:
              </InputLabel>
              <div className="flex w-full items-center gap-x-2">
                <div className="text-[#666666]">DK</div>
                <TextField
                  variant="outlined"
                  id="start_mileage"
                  size="small"
                  className="flex-1"
                  error={Boolean(errors.start_mileage1)}
                  {...register("start_mileage1", {
                    required: "请输入开始里程",
                    max: {
                      value: 999,
                      message: "数量为0-999",
                    },
                    min: {
                      value: 0,
                      message: "数量为0-999",
                    },
                    valueAsNumber: true,
                    onBlur() {
                      trigger("start_mileage1")
                    },
                  })}
                  label="km"
                  autoComplete="off"
                />
                <div className="text-[#666666]">+</div>
                <TextField
                  variant="outlined"
                  id="start_mileage"
                  size="small"
                  className="flex-1"
                  error={Boolean(errors.start_mileage2)}
                  {...register("start_mileage2", {
                    required: "请输入开始里程",
                    max: {
                      value: 999,
                      message: "数量为0-999",
                    },
                    min: {
                      value: 0,
                      message: "数量为0-999",
                    },
                    valueAsNumber: true,
                    onBlur() {
                      trigger("start_mileage2")
                    },
                  })}
                  label="m"
                  autoComplete="off"
                />
              </div>
            </div>
          </div>

          <div className="mb-8 relative">
            <div className="flex items-start flex-col">
              <InputLabel htmlFor="end_mileage" className="mr-3 w-full text-left mb-2.5">
                <span className="text-railway_error mr-0.5">*</span>结束里程:
              </InputLabel>
              <div className="flex w-full items-center gap-x-2">
                <div className="text-[#666666]">DK</div>
                <TextField
                  variant="outlined"
                  id="start_mileage"
                  size="small"
                  className="flex-1"
                  error={Boolean(errors.end_mileage1)}
                  {...register("end_mileage1", {
                    required: "请输入开始里程",
                    max: {
                      value: 999,
                      message: "数量为0-999",
                    },
                    min: {
                      value: 0,
                      message: "数量为0-999",
                    },
                    valueAsNumber: true,
                    onBlur() {
                      trigger("end_mileage1")
                    },
                  })}
                  label="km"
                  autoComplete="off"
                />
                <div className="text-[#666666]">+</div>
                <TextField
                  variant="outlined"
                  id="start_mileage"
                  size="small"
                  className="flex-1"
                  error={Boolean(errors.end_mileage2)}
                  {...register("end_mileage2", {
                    required: "请输入开始里程",
                    max: {
                      value: 999,
                      message: "数量为0-999",
                    },
                    min: {
                      value: 0,
                      message: "数量为0-999",
                    },
                    valueAsNumber: true,
                    onBlur() {
                      trigger("end_mileage2")
                    },
                  })}
                  label="m"
                  autoComplete="off"
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-2">
            <Button onClick={handleClose}>取消</Button>
            <Button type="submit" className="bg-railway_blue text-white">
              确定
            </Button>
          </div>
        </form>
      </div>
    </Drawer>
  )
}
