import { Button, Drawer, InputLabel, MenuItem, Select, TextField } from "@mui/material"
import React, { ChangeEvent } from "react"
import { FieldErrors, SubmitHandler, useForm } from "react-hook-form"
import useDebounce from "@/hooks/useDebounce"
import dayjs, { Dayjs } from "dayjs"
import { DateTimePicker } from "@mui/x-date-pickers/DateTimePicker"
import { ErrorMessage } from "@hookform/error-message"
import { CLASS_OPTION, PROCESSING_RESULT } from "@/app/material-approach/const/enum"
import {
  DictionaryClassListData,
  DictionaryData,
  MaterialApproachData,
  PostMaterialApproachParams,
  PutMaterialApproachParams,
} from "@/app/material-approach/types"
import { OAUTH2_ACCESS_TOKEN } from "@/libs/const"
import useSWRMutation from "swr/mutation"
import {
  reqGetDictionary,
  reqGetDictionaryClass,
  reqPostMaterialApproach,
  reqPostMaterialEntrust,
  reqPutMaterialApproach,
} from "@/app/material-approach/api"
import { message, TreeSelect, TreeSelectProps } from "antd"
import { styled } from "@mui/material/styles"
import CloudUploadIcon from "@mui/icons-material/CloudUpload"
import { getV1BaseURL } from "@/libs/fetch"
import { LayoutContext } from "@/components/LayoutContext"

const VisuallyHiddenInput = styled("input")({
  clip: "rect(0 0 0 0)",
  clipPath: "inset(50%)",
  height: 1,
  overflow: "hidden",
  position: "absolute",
  bottom: 0,
  left: 0,
  whiteSpace: "nowrap",
  width: 1,
})

interface Props {
  open: boolean
  // eslint-disable-next-line no-unused-vars
  close: () => void
  editItem: null | MaterialApproachData
  getDataList: () => void
}

export default function AddOrEditMaterial(props: Props) {
  const { open, close, editItem, getDataList } = props

  const { projectId: PROJECT_ID } = React.useContext(LayoutContext)

  const handleClose = () => {
    close()
    reset()
  }

  const { trigger: getDictionaryApi } = useSWRMutation("/dictionary", reqGetDictionary)

  const { trigger: postMaterialEntrustApi } = useSWRMutation(
    "/material-entrust",
    reqPostMaterialEntrust,
  )

  const { trigger: getDictionaryClassApi } = useSWRMutation(
    "/dictionary-class",
    reqGetDictionaryClass,
  )

  const [dictionaryClass, setDictionaryClass] = React.useState<number>()

  const [dictionaryList, setDictionaryList] = React.useState<DictionaryData[]>([])

  const [dictionaryClassList, setDictionaryClassList] = React.useState<DictionaryClassListData[]>(
    [],
  )

  const [dictionaryId, setDictionaryId] = React.useState(0)

  const getDictionary = async () => {
    const res = await getDictionaryApi({})
    setDictionaryList(res)
  }

  React.useEffect(() => {
    getDictionaryApi(dictionaryClass ? { class_id: dictionaryClass } : {}).then((res) => {
      setDictionaryList(res)
    })
  }, [dictionaryClass])

  const getDictionaryClass = async () => {
    const res = await getDictionaryClassApi({ page: 1, limit: 20 })
    setDictionaryClassList(res || [])
  }

  React.useEffect(() => {
    getDictionaryClass()
  }, [])

  const handleDictionarySelectChange = (newValue: number, node: any) => {
    console.log(newValue, node)
    setDictionaryClass(newValue)
  }

  const onLoadData: TreeSelectProps["loadData"] = (node) => {
    return new Promise(async (resolve) => {
      console.log(node)
      const { id, pos } = node

      const res = await getDictionaryClassApi({ page: 1, limit: 1, parent_id: id })
      const indexArr = pos.split("-")
      indexArr.splice(0, 1)
      const newList = structuredClone(dictionaryClassList)
      const str = "newList[" + indexArr.join("].children[") + "].children"

      eval(str + "=res")
      setDictionaryClassList(newList)

      resolve(undefined)
    })
  }

  React.useEffect(() => {
    if (editItem) {
      setValue("handling_suggestions", editItem.handling_suggestions)
      setValue("desc", editItem.desc)
      setValue("certificate_number", editItem.certificate_number)
      setValue("supplier", editItem.supplier)
      setValue("arrivaled_quantity", editItem.arrivaled_quantity)
      setValue("manufacturer", editItem.manufacturer)
      setValue("storage_location", editItem.storage_location)
      setQualified(editItem.status)
      setTimeAt(dayjs(editItem.arrivaled_at))
    }
  }, [editItem])

  const [timeAt, setTimeAt] = React.useState<Dayjs | null>(dayjs(new Date()))

  const [qualified, setQualified] = React.useState("qualified")

  const [classValue, setClassValue] = React.useState("null")

  const {
    handleSubmit,
    formState: { errors },
    register,
    reset,
    trigger,
    setValue,
  } = useForm<PostMaterialApproachParams>()

  const { trigger: postMaterialApproach } = useSWRMutation(
    "/material-approach",
    reqPostMaterialApproach,
  )

  const { trigger: putMaterialApproach } = useSWRMutation(
    "/material-approach",
    reqPutMaterialApproach,
  )

  const { run: onSubmit }: { run: SubmitHandler<PostMaterialApproachParams> } = useDebounce(
    async (values: PostMaterialApproachParams) => {
      // if (dictionaryId <= 0) {
      //   message.error("请选择物资名称")
      //   setCustomError({ dictionaryId: { message: "请选择物资名称" } })
      //   return
      // }
      let params = {} as PostMaterialApproachParams & PutMaterialApproachParams
      params.handling_suggestions = values.handling_suggestions
      params.desc = values.desc
      params.certificate_number = values.certificate_number
      params.supplier = values.supplier
      params.arrivaled_quantity = values.arrivaled_quantity
      params.manufacturer = values.manufacturer
      params.storage_location = values.storage_location
      params.arrivaled_at = timeAt?.format("YYYY-MM-DD HH:mm:ss") as string
      params.status = qualified
      params.project_id = PROJECT_ID
      params.dictionary_id = dictionaryId
      params.class = classValue
      // params.dictionary_id = 1

      if (Boolean(editItem)) {
        params.id = editItem!.id
        await putMaterialApproach(params)
      } else {
        await postMaterialApproach(params)
      }
      message.success("操作成功")
      handleClose()
      getDataList()
    },
  )

  const [customError, setCustomError] = React.useState<any>({})

  const handleUpload = async (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files!.length <= 0) return

    const token = localStorage.getItem(OAUTH2_ACCESS_TOKEN as string)

    const file = e.target.files![0]

    console.log(file)

    const fd = new FormData()
    fd.append("file", file)
    fd.append("project_id", "1")

    const res = await fetch(getV1BaseURL("/material-entrust"), {
      method: "post",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: fd,
    }).then((res) => res.json())

    message.success("上传成功")
  }

  return (
    <Drawer open={open} onClose={handleClose} anchor="right">
      <div className="w-[500px] p-10">
        <header className="text-3xl text-[#44566C] mb-8">
          {!!editItem ? "修改物资进场信息" : "添加物资进场信息"}
        </header>
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="mb-8 relative">
            <div className="flex items-start flex-col">
              <InputLabel htmlFor="name" className="mr-3 w-full text-left mb-2.5" required>
                到货日期:
              </InputLabel>
              <DateTimePicker
                // views={["year", "month", "day"]}
                format="YYYY-MM-DD HH:mm"
                ampm={false}
                label="到货日期"
                value={timeAt}
                className="w-full"
                onChange={(newValue) => {
                  setTimeAt(newValue)
                }}
              />
            </div>
          </div>

          <div className="mb-8 relative">
            <div className="flex items-start flex-col">
              <InputLabel htmlFor="name" className="mr-3 w-full text-left mb-2.5" required>
                物资类别:
              </InputLabel>

              <Select
                MenuProps={{ sx: { zIndex: 1702, height: "400px" } }}
                sx={{ flex: 1, color: "#303133", zIndex: 1602 }}
                id="role_list"
                size="small"
                value={classValue}
                onChange={(event) => {
                  setClassValue(event.target.value)
                }}
                fullWidth>
                <MenuItem value="null" disabled>
                  <i className="text-[#ababab]">请选择一个物资类别</i>
                </MenuItem>
                {CLASS_OPTION.map((item: any) => (
                  <MenuItem value={item.value} key={item.value}>
                    {item.label}
                  </MenuItem>
                ))}
              </Select>
            </div>
          </div>

          <div className="mb-8 relative">
            <div className="flex items-start flex-col">
              <InputLabel htmlFor="name" className="mr-3 w-full text-left mb-2.5" required>
                物资名称:
              </InputLabel>
              <div className="grid grid-cols-2 w-full gap-x-2">
                {/*<Select*/}
                {/*  MenuProps={{ sx: { zIndex: 1702, height: "25rem" } }}*/}
                {/*  sx={{ flex: 1, color: "#303133", zIndex: 1602 }}*/}
                {/*  id="zidian"*/}
                {/*  size="small"*/}
                {/*  value={dictionaryClass}*/}
                {/*  onChange={(event) => {*/}
                {/*    setDictionaryClass(+event.target.value)*/}
                {/*  }}*/}
                {/*  fullWidth>*/}
                {/*  <MenuItem value={0}>全部</MenuItem>*/}
                {/*  {dictionaryClassList.map((item: any) => (*/}
                {/*    <MenuItem value={item.id} key={item.id}>*/}
                {/*      {item.name}*/}
                {/*    </MenuItem>*/}
                {/*  ))}*/}
                {/*</Select>*/}

                <TreeSelect
                  placement="topLeft"
                  style={{ width: "100%" }}
                  value={dictionaryClass}
                  dropdownStyle={{ maxHeight: 400, overflow: "auto", zIndex: 2000 }}
                  placeholder="选择一个物资分类"
                  onSelect={handleDictionarySelectChange}
                  loadData={onLoadData}
                  fieldNames={{ label: "name", value: "id" }}
                  size="large"
                  treeData={dictionaryClassList}
                />

                <Select
                  MenuProps={{ sx: { zIndex: 1702, height: "25rem" } }}
                  sx={{ flex: 1, color: "#303133", zIndex: 1602 }}
                  id="zidian"
                  size="small"
                  value={dictionaryId}
                  error={Boolean(customError["dictionaryId"])}
                  onChange={(event) => {
                    console.log(event.target.value)
                    setDictionaryId(+event.target.value)
                    setCustomError({})
                  }}
                  fullWidth>
                  <MenuItem value={0} disabled>
                    <i className="text-[#ababab]">请选择一个物资</i>
                  </MenuItem>
                  {dictionaryList.map((item: any) => (
                    <MenuItem value={item.id} key={item.id}>
                      {item.name}
                    </MenuItem>
                  ))}
                </Select>
              </div>
            </div>
            <ErrorMessage
              errors={customError}
              name="dictionaryId"
              render={({ message }) => (
                <p className="text-railway_error text-sm absolute">{message}</p>
              )}
            />
          </div>

          <div className="mb-8 relative">
            <div className="flex items-start flex-col">
              <InputLabel htmlFor="name" className="mr-3 w-full text-left mb-2.5" required>
                到货数量:
              </InputLabel>
              <TextField
                variant="outlined"
                id="name"
                size="small"
                fullWidth
                type="number"
                error={Boolean(errors.arrivaled_quantity)}
                {...register("arrivaled_quantity", {
                  required: "请输入到货数据",
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
                    trigger("arrivaled_quantity")
                    console.log(errors)
                  },
                })}
                label="到货数量"
                autoComplete="off"
              />
            </div>
            <ErrorMessage
              errors={errors}
              name="arrivaled_quantity"
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
                合格证编号:
              </InputLabel>
              <TextField
                variant="outlined"
                id="certificate_number"
                size="small"
                fullWidth
                error={Boolean(errors.certificate_number)}
                {...register("certificate_number", {
                  required: "请输入合格证编号",
                  onBlur() {
                    trigger("certificate_number")
                  },
                })}
                label="合格证编号"
                autoComplete="off"
              />
            </div>
            <ErrorMessage
              errors={errors}
              name="certificate_number"
              render={({ message }) => (
                <p className="text-railway_error text-sm absolute">{message}</p>
              )}
            />
          </div>

          <div className="mb-8 relative">
            <div className="flex items-start flex-col">
              <InputLabel htmlFor="manufacturer" className="mr-3 w-full text-left mb-2.5" required>
                生产厂商:
              </InputLabel>
              <TextField
                variant="outlined"
                id="manufacturer"
                size="small"
                fullWidth
                error={Boolean(errors.manufacturer)}
                {...register("manufacturer", {
                  required: "请输入生产厂家",
                  onBlur() {
                    trigger("manufacturer")
                  },
                })}
                label="生产厂商"
                autoComplete="off"
              />
            </div>
            <ErrorMessage
              errors={errors}
              name="manufacturer"
              render={({ message }) => (
                <p className="text-railway_error text-sm absolute">{message}</p>
              )}
            />
          </div>

          <div className="mb-8 relative">
            <div className="flex items-start flex-col">
              <InputLabel htmlFor="name" className="mr-3 w-full text-left mb-2.5" required>
                处理结果:
              </InputLabel>

              <Select
                MenuProps={{ sx: { zIndex: 1702, height: "400px" } }}
                sx={{ flex: 1, color: "#303133", zIndex: 1602 }}
                id="role_list"
                size="small"
                value={qualified}
                onChange={(event) => {
                  setQualified(event.target.value)
                }}
                fullWidth>
                {PROCESSING_RESULT.map((item: any) => (
                  <MenuItem value={item.value} key={item.value}>
                    {item.label}
                  </MenuItem>
                ))}
              </Select>
            </div>
          </div>

          <div className="mb-8 relative">
            <div className="flex items-start flex-col">
              <InputLabel
                htmlFor="handling_suggestions"
                className="mr-3 w-full text-left mb-2.5"
                required>
                处理意见:
              </InputLabel>
              <TextField
                variant="outlined"
                id="handling_suggestions"
                size="small"
                fullWidth
                error={Boolean(errors.handling_suggestions)}
                {...register("handling_suggestions", {
                  required: "请输入处理意见",
                  onBlur() {
                    trigger("handling_suggestions")
                  },
                })}
                label="处理意见"
                autoComplete="off"
              />
            </div>
            <ErrorMessage
              errors={errors}
              name="handling_suggestions"
              render={({ message }) => (
                <p className="text-railway_error text-sm absolute">{message}</p>
              )}
            />
          </div>

          <div className="mb-8 relative">
            <div className="flex items-start flex-col">
              <InputLabel
                htmlFor="storage_location"
                className="mr-3 w-full text-left mb-2.5"
                required>
                储存场所:
              </InputLabel>
              <TextField
                variant="outlined"
                id="storage_location"
                size="small"
                fullWidth
                error={Boolean(errors.storage_location)}
                {...register("storage_location", {
                  required: "请输入储存场所",
                  onBlur() {
                    trigger("storage_location")
                  },
                })}
                label="储存场所"
                autoComplete="off"
              />
            </div>
            <ErrorMessage
              errors={errors}
              name="storage_location"
              render={({ message }) => (
                <p className="text-railway_error text-sm absolute">{message}</p>
              )}
            />
          </div>

          <div className="mb-8 relative">
            <div className="flex items-start flex-col">
              <InputLabel htmlFor="supplier" className="mr-3 w-full text-left mb-2.5" required>
                供货单位:
              </InputLabel>
              <TextField
                variant="outlined"
                id="supplier"
                size="small"
                fullWidth
                error={Boolean(errors.supplier)}
                {...register("supplier", {
                  required: "请输入供货单位",
                  onBlur() {
                    trigger("supplier")
                  },
                })}
                label="供货单位"
                autoComplete="off"
              />
            </div>
            <ErrorMessage
              errors={errors}
              name="supplier"
              render={({ message }) => (
                <p className="text-railway_error text-sm absolute">{message}</p>
              )}
            />
          </div>

          <div className="mb-8 relative">
            <div className="flex items-start flex-col">
              <InputLabel htmlFor="desc" className="mr-3 w-full text-left mb-2.5" required>
                备注:
              </InputLabel>
              <TextField
                variant="outlined"
                id="desc"
                size="small"
                fullWidth
                error={Boolean(errors.desc)}
                {...register("desc", {
                  required: "请输入备注",
                  onBlur() {
                    trigger("desc")
                  },
                })}
                label="备注"
                autoComplete="off"
              />
            </div>
            <ErrorMessage
              errors={errors}
              name="desc"
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
