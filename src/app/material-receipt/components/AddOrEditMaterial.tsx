import { Button, Drawer, InputLabel, MenuItem, Select, TextField } from "@mui/material"
import React from "react"
import { SubmitHandler, useForm } from "react-hook-form"
import useDebounce from "@/hooks/useDebounce"
import dayjs, { Dayjs } from "dayjs"
import { DateTimePicker } from "@mui/x-date-pickers/DateTimePicker"
import { ErrorMessage } from "@hookform/error-message"
import { DictionaryData, MaterialApproachData } from "@/app/material-approach/types"
import useSWRMutation from "swr/mutation"
import { reqGetDictionary, reqGetMaterialApproach } from "@/app/material-approach/api"
import { reqPostMaterialReceive, reqPutMaterialReceive } from "@/app/material-receipt/api"
import { TreeSelect, message, TreeSelectProps } from "antd"
import {
  PostMaterialReceiveParams,
  PutMaterialReceiveParams,
  MaterialReceiveData,
} from "@/app/material-receipt/types"
import { TypeApiGetEBSParams, TypeEBSDataList } from "@/app/ebs-data/types"
import { LayoutContext } from "@/components/LayoutContext"
import { reqGetEBS, reqGetEBSSystem } from "@/app/ebs-data/api"

type AllSelectType = {
  ebs_id: number | null
  test_id: number
  // machine_record_id: number
}

interface Props {
  open: boolean
  // eslint-disable-next-line no-unused-vars
  close: () => void
  editItem: null | MaterialReceiveData
  getDataList: () => void
}

export default function AddOrEditMaterial(props: Props) {
  const { open, close, editItem, getDataList } = props

  const { projectId: PROJECT_ID } = React.useContext(LayoutContext)

  const handleClose = () => {
    close()
    reset()
  }

  const { trigger: getMaterialApproachApi } = useSWRMutation(
    "/material-approach",
    reqGetMaterialApproach,
  )

  const [materialApproachList, setMaterialApproachList] = React.useState<MaterialApproachData[]>([])

  const [materialApproachId, setMaterialApproachId] = React.useState(0)

  const getMaterialApproach = async () => {
    const res = await getMaterialApproachApi({
      page: 1,
      limit: 200,
      project_id: PROJECT_ID,
      has_test: true,
    })
    console.log(res.items)
    setMaterialApproachList(res.items)
  }

  React.useEffect(() => {
    getMaterialApproach()
  }, [])

  React.useEffect(() => {
    if (editItem) {
      setValue("desc", editItem.desc)
      setValue("construction_team_full_name", editItem.construction_team_full_name)
      setValue("received_quantity", editItem.received_quantity)
      setAllSelectValue({
        ebs_id: editItem.ebs_id,
        test_id: editItem.test_id,
        // machine_record_id: +editItem.machine_record_id,
      })
      setMaterialApproachId(editItem.dictionary_id)
      setTimeAt(dayjs(editItem.received_at))
    }
  }, [editItem])

  const [timeAt, setTimeAt] = React.useState<Dayjs | null>(dayjs(new Date()))

  const {
    handleSubmit,
    formState: { errors },
    register,
    reset,
    trigger,
    setValue,
  } = useForm<PostMaterialReceiveParams>({
    defaultValues: {
      test_id: 0,
    },
  })

  const { trigger: postMaterialReceive } = useSWRMutation(
    "/material-receive",
    reqPostMaterialReceive,
  )

  const { trigger: putMaterialApproach } = useSWRMutation(
    "/material-receive",
    reqPutMaterialReceive,
  )

  const { run: onSubmit }: { run: SubmitHandler<PostMaterialReceiveParams> } = useDebounce(
    async (values: PostMaterialReceiveParams) => {
      if (!materialApproachId) {
        message.error("请选择物资名称")
        setCustomError({ materialApproachId: { message: "请选择物资名称" } })
        return
      }
      let params = {} as PostMaterialReceiveParams & PutMaterialReceiveParams
      params.desc = values.desc
      params.construction_team_full_name = values.construction_team_full_name
      params.received_quantity = values.received_quantity
      params.received_at = timeAt?.format("YYYY-MM-DD HH:mm:ss") as string
      params.project_id = PROJECT_ID
      params.project_material_id = materialApproachId

      const materialApproachItem = materialApproachList.find((e) => e.id == materialApproachId)
      params.dictionary_id = materialApproachItem!.dictionary_id

      Object.assign(params, allSelectValue)

      if (Boolean(editItem)) {
        params.id = editItem!.id
        await putMaterialApproach(params)
      } else {
        await postMaterialReceive(params)
      }
      message.success("操作成功")
      handleClose()
      getDataList()
    },
  )

  const [customError, setCustomError] = React.useState<any>({})

  const [allSelectValue, setAllSelectValue] = React.useState<AllSelectType>({
    test_id: 0,
    ebs_id: null,
    // machine_record_id: 0,
  })

  const handleChangeAllSelectValue = (value: number, type: keyof AllSelectType) => {
    setAllSelectValue((prevState) => ({ ...prevState, [type]: value }))
  }

  const { trigger: getEBSApi } = useSWRMutation("/ebs/system", reqGetEBSSystem)

  React.useEffect(() => {
    getEBSApi({ subpart_class: "field", level: 1 }).then((res) => {
      console.log(res)
      if (res && res.length > 0) {
        setEBSOption(res.map((e) => ({ ...e, title: e.name, value: e.id })))
      }
    })
  }, [])

  const [ebsOption, setEBSOption] = React.useState<
    (TypeEBSDataList & { title: string; value: number; children?: any[]; isLeaf?: boolean })[]
  >([])

  const onLoadData: TreeSelectProps["loadData"] = (node) => {
    return new Promise(async (resolve) => {
      console.log(node)
      const { id, pos, code, level } = node

      const getEBSParams = {
        code,
        level: level + 1,
        subpart_class: "field",
      } as any

      const res = await getEBSApi(getEBSParams)
      const reslut = res.map((item) => ({ ...item, title: item.name, value: item.id }))
      const indexArr = pos.split("-")
      indexArr.splice(0, 1)
      const newArr = structuredClone(ebsOption)
      const str = "newArr[" + indexArr.join("].children[") + "].children"
      console.log(reslut, indexArr, str)
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
          {!!editItem ? "修改物资领用信息" : "添加物资领用信息"}
        </header>
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="mb-8 relative">
            <div className="flex items-start flex-col">
              <InputLabel htmlFor="name" className="mr-3 w-full text-left mb-2.5" required>
                到货日期:
              </InputLabel>
              <DateTimePicker
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
              <InputLabel
                htmlFor="materialApproachID"
                className="mr-3 w-full text-left mb-2.5"
                required>
                物资进场:
              </InputLabel>
              <Select
                MenuProps={{ sx: { zIndex: 1702, height: "25rem" } }}
                sx={{ width: "100%", color: "#303133", zIndex: 1602 }}
                id="materialApproachID"
                size="small"
                error={Boolean(customError["materialApproachId"])}
                value={materialApproachId}
                onChange={(event) => {
                  setMaterialApproachId(+event.target.value)
                  setCustomError({})
                }}
                fullWidth>
                <MenuItem value={0} disabled>
                  <i className="text-[#ababab]">请选择一个物资进场数据</i>
                </MenuItem>
                {materialApproachList.map((item: any) => (
                  <MenuItem value={item.id} key={item.id}>
                    {item.dictionary.name}
                  </MenuItem>
                ))}
              </Select>
            </div>
            <ErrorMessage
              errors={customError}
              name="materialApproachID"
              render={({ message }) => (
                <p className="text-railway_error text-sm absolute">{message}</p>
              )}
            />
          </div>

          <div className="mb-8 relative">
            <div className="flex items-start flex-col">
              <InputLabel htmlFor="name" className="mr-3 w-full text-left mb-2.5" required>
                领用数量:
              </InputLabel>
              <TextField
                variant="outlined"
                id="name"
                size="small"
                fullWidth
                type="number"
                error={Boolean(errors.received_quantity)}
                {...register("received_quantity", {
                  required: "请输入领用数据",
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
                    trigger("received_quantity")
                    console.log(errors)
                  },
                })}
                label="到货数量"
                autoComplete="off"
              />
            </div>
            <ErrorMessage
              errors={errors}
              name="received_quantity"
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
                EBS:
              </InputLabel>
              <TreeSelect
                placement="topLeft"
                style={{ width: "100%" }}
                value={allSelectValue.ebs_id}
                dropdownStyle={{ maxHeight: 400, overflow: "auto", zIndex: 2000 }}
                onSelect={handleEBSSelectChange}
                loadData={onLoadData}
                placeholder="请选择一个EBS结构"
                size="large"
                treeData={ebsOption}
              />
            </div>
          </div>

          <div className="mb-8 relative">
            <div className="flex items-start flex-col">
              <InputLabel
                htmlFor="certificate_number"
                className="mr-3 w-full text-left mb-2.5"
                required>
                试验:
              </InputLabel>
              <Select
                MenuProps={{ sx: { zIndex: 1702, height: "25rem" } }}
                sx={{ flex: 1, color: "#303133", zIndex: 1602 }}
                id="zidian"
                size="small"
                fullWidth
                value={allSelectValue.test_id}
                defaultValue={0}
                onChange={(event) => {
                  handleChangeAllSelectValue(+event.target.value, "test_id")
                }}>
                <MenuItem value={0}>全部</MenuItem>
                <MenuItem value={1}>测试试验</MenuItem>
              </Select>
            </div>
          </div>

          <div className="mb-8 relative">
            <div className="flex items-start flex-col">
              <InputLabel
                htmlFor="certificate_number"
                className="mr-3 w-full text-left mb-2.5"
                required>
                加工记录:
              </InputLabel>
              <Select
                MenuProps={{ sx: { zIndex: 1702, height: "25rem" } }}
                sx={{ flex: 1, color: "#303133", zIndex: 1602 }}
                id="zidian"
                size="small"
                // value={allSelectValue.machine_record_id}
                // onChange={(event) => {
                //   handleChangeAllSelectValue(+event.target.value, "machine_record_id")
                // }}
                defaultValue={0}
                fullWidth>
                <MenuItem value={0}>全部</MenuItem>
                <MenuItem value={1}>加工记录</MenuItem>
              </Select>
            </div>
          </div>

          <div className="mb-8 relative">
            <div className="flex items-start flex-col">
              <InputLabel
                htmlFor="construction_team_full_name"
                className="mr-3 w-full text-left mb-2.5"
                required>
                施工队（全称）:
              </InputLabel>
              <TextField
                variant="outlined"
                id="construction_team_full_name"
                size="small"
                fullWidth
                error={Boolean(errors.construction_team_full_name)}
                {...register("construction_team_full_name", {
                  required: "请输入施工队",
                  onBlur() {
                    trigger("construction_team_full_name")
                  },
                })}
                label="生产厂商"
                autoComplete="off"
              />
            </div>
            <ErrorMessage
              errors={errors}
              name="construction_team_full_name"
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
