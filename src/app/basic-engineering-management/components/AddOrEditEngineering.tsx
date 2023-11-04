import { Button, Drawer, InputLabel, TextField, Switch, MenuItem, Select } from "@mui/material"
import React from "react"
import { SubmitHandler, useForm } from "react-hook-form"
import useDebounce from "@/hooks/useDebounce"
import { ErrorMessage } from "@hookform/error-message"
import { PROJECT_ID } from "@/libs/const"
import useSWRMutation from "swr/mutation"
import { reqPostMaterialReceive, reqPutMaterialReceive } from "@/app/material-receipt/api"
import { TreeSelect, message, TreeSelectProps } from "antd"
import {
  EngineeringListing,
  PostEngineeringListingParams,
  PutEngineeringListingParams,
} from "@/app/basic-engineering-management/types/index.d"
import { TypeEBSDataList } from "@/app/gantt/types"
import { TypeApiGetEBSParams } from "@/app/ebs-data/types"
import {
  reqPostEngineeringListing,
  reqPutEngineeringListing,
} from "@/app/basic-engineering-management/api"
import { reqGetEBS } from "@/app/ebs-data/api"

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

  const handleClose = () => {
    close()
    reset()
  }

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

  const { trigger: getEBSApi } = useSWRMutation("/ebs", reqGetEBS)

  React.useEffect(() => {
    getEBSApi({ is_hidden: 0, project_id: PROJECT_ID, level: 1 }).then((res) => {
      if (res && res.length > 0) {
        setEBSOption(res.map((e) => ({ ...e, title: e.name, value: e.id }) as any))
      }
    })
  }, [])

  // 部门下拉框选项
  const [ebsOption, setEBSOption] = React.useState<
    (TypeEBSDataList & { title: string; value: number; children?: any[]; isLeaf?: boolean })[]
  >([])

  const onLoadData: TreeSelectProps["loadData"] = (node) => {
    return new Promise(async (resolve) => {
      const { pos, code, level } = node

      const getEBSParams = {
        code,
        project_id: PROJECT_ID,
        level: level + 1,
      } as TypeApiGetEBSParams

      const res = await getEBSApi(getEBSParams)
      const reslut = res.map((item) => ({ ...item, title: item.name, value: item.id }))
      const indexArr = pos.split("-")
      indexArr.splice(0, 1)
      const newArr = structuredClone(ebsOption)
      const str = "newArr[" + indexArr.join("].children[") + "].children"
      eval(str + "=reslut")
      setEBSOption(newArr)
      resolve(undefined)
    })
  }

  const handleEBSSelectChange = (id: number | null) => {
    handleChangeAllSelectValue(id ?? 0, "ebs_id")
  }

  return (
    <Drawer open={open} onClose={handleClose} anchor="right">
      <div className="w-[500px] p-10">
        <header className="text-3xl text-[#44566C] mb-8">
          {!!editItem ? "修改工程" : "添加工程"}
        </header>
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="mb-8 relative">
            <div className="flex items-start flex-col">
              <InputLabel htmlFor="name" className="mr-3 w-full text-left mb-2.5" required>
                工程:
              </InputLabel>
              <TextField
                variant="outlined"
                id="name"
                size="small"
                fullWidth
                error={Boolean(errors.name)}
                {...register("name", {
                  required: "请输入领用数据",
                  onBlur() {
                    trigger("name")
                  },
                })}
                label="工程"
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
              <InputLabel
                htmlFor="certificate_number"
                className="mr-3 w-full text-left mb-2.5"
                required>
                选择专业:
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
              <InputLabel htmlFor="name" className="mr-3 w-full text-left mb-2.5" required>
                是否高速:
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
              <InputLabel htmlFor="start_mileage" className="mr-3 w-full text-left mb-2.5" required>
                开始里程:
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
                  label="千米"
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
                  label="米"
                  autoComplete="off"
                />
              </div>
            </div>
            <ErrorMessage
              errors={errors}
              name="start_mileage"
              render={({ message }) => (
                <p className="text-railway_error text-sm absolute">{message}</p>
              )}
            />
          </div>

          <div className="mb-8 relative">
            <div className="flex items-start flex-col">
              <InputLabel htmlFor="end_mileage" className="mr-3 w-full text-left mb-2.5" required>
                结束里程:
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
                  label="千米"
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
                  label="米"
                  autoComplete="off"
                />
              </div>
            </div>
            <ErrorMessage
              errors={errors}
              name="end_mileage"
              render={({ message }) => (
                <p className="text-railway_error text-sm absolute">{message}</p>
              )}
            />
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
