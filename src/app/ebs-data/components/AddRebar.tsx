import React from "react"
import {
  Button,
  DialogActions,
  Drawer,
  InputLabel,
  MenuItem,
  Select,
  TextField,
} from "@mui/material"
import { ErrorMessage } from "@hookform/error-message"
import { SubmitHandler, useForm } from "react-hook-form"
import useDebounce from "@/hooks/useDebounce"
import useSWRMutation from "swr/mutation"
import { reqGetDictionary, reqPostRebarData, reqPutRebarData } from "@/app/ebs-data/api"
import { DictionaryData, RebarData, TypePostRebarParams } from "@/app/ebs-data/types"
import { Connect_method_enum, REBAR_DICTIONARY_CLASS_ID } from "@/app/ebs-data/const"
import { LayoutContext } from "@/components/LayoutContext"
import ebsDataContext from "@/app/ebs-data/context/ebsDataContext"

type Props = {
  open: boolean
  handleCloseAddBridgeWithDrawer: () => void
  // eslint-disable-next-line no-unused-vars
  cb: (item: RebarData, isAdd: boolean) => void
  editItem: RebarData | null
}

type IForm = {
  rebar_no: string
  unit_length: number
  unit_weight: number
  number: number
}

const rebar_class = [
  { value: 20, label: "圆钢" },
  { value: 21, label: "螺纹钢" },
]

export default function AddRebar(props: Props) {
  const { open, handleCloseAddBridgeWithDrawer, cb, editItem } = props

  const ctx = React.useContext(ebsDataContext)

  const { projectId: PROJECT_ID } = React.useContext(LayoutContext)

  const handleClose = () => {
    handleCloseAddBridgeWithDrawer()
  }

  const { trigger: getDictionaryApi } = useSWRMutation("/dictionary", reqGetDictionary)

  const [dictionaryList, setDictionaryList] = React.useState<DictionaryData[]>([])

  const getDictionary = async () => {
    let list: DictionaryData[] = []
    for (const key in rebar_class) {
      const res = await getDictionaryApi({ class_id: rebar_class[key].value })
      list.push(...res)
    }
    setDictionaryList(list)
  }

  React.useEffect(() => {
    getDictionary()
  }, [])

  const {
    handleSubmit,
    formState: { errors },
    register,
    setValue,
  } = useForm<IForm>({})

  const [connectMethod, setConnectMethod] = React.useState("MACHINE")

  const [dictionaryId, setDictionaryId] = React.useState<number>(0)

  const { trigger: postRebarDataApi } = useSWRMutation("/material-rebar", reqPostRebarData)

  const { trigger: putRebarDataApi } = useSWRMutation("/material-rebar", reqPutRebarData)

  React.useEffect(() => {
    if (dictionaryId > 0) {
      const item = dictionaryList.find((item) => item.id == dictionaryId)
      if (item) {
        const attribute = JSON.parse(item!.properties)
        const _mapItem = attribute.find((item: any) => item.key == "单位重")
        if (_mapItem) {
          setValue("unit_weight", Number(Number(_mapItem.value).toFixed(3)))
        }
      }
    }
  }, [dictionaryId])

  const handleSetFormValue = (item: RebarData) => {
    setValue("rebar_no", item.rebar_no)
    setValue("number", item.number / 1000)
    setValue("unit_length", item.unit_length / 1000)
    setValue("unit_weight", item.unit_weight / 1000)
    setDictionaryId(item.dictionary_id)
    setConnectMethod(item.connect_method)
  }

  React.useEffect(() => {
    if (Boolean(editItem)) {
      handleSetFormValue(editItem as RebarData)
    }
  }, [editItem])

  const { run: onSubmit }: { run: SubmitHandler<IForm> } = useDebounce(async (values: IForm) => {
    console.log(values)
    let params = {
      project_id: PROJECT_ID,
      engineering_listing_id: ctx.ebsItem.engineering_listing_id,
      dictionary_id: dictionaryId as number,
      unit_length: Number(Number(values.unit_length).toFixed(3)) * 1000,
      unit_weight: Number(Number(values.unit_weight).toFixed(3)) * 1000,
      number: Number(Number(values.number).toFixed(3)) * 1000,
      rebar_no: values.rebar_no,
      connect_method: connectMethod,
    } as TypePostRebarParams & { id: number }

    if (Boolean(editItem)) {
      params.id = editItem!.id
      await putRebarDataApi(Object.assign(params))

      const dictionary = dictionaryList.find((item) => item.id == params.dictionary_id)
      params.dictionary = dictionary as any
      cb(Object.assign(params) as RebarData, false)
    } else {
      params.ebs_id = ctx.ebsItem.id
      const res = await postRebarDataApi(params)
      const dictionary = dictionaryList.find((item) => item.id == params.dictionary_id)
      params.dictionary = dictionary as any

      cb(Object.assign({}, params, res), true)
    }

    handleClose()
  })

  return (
    <>
      <Drawer open={open} onClose={handleClose} anchor="right" sx={{ zIndex: 1601 }}>
        <div className="w-[500px] p-10">
          <header className="text-3xl text-[#44566C] mb-8">
            {Boolean(editItem) ? "修改钢筋数量" : "添加钢筋数量"}
          </header>
          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="mb-8 relative">
              <div className="flex items-start flex-col">
                <InputLabel htmlFor="rebar_no" className="mr-3 w-20 text-left mb-2.5" required>
                  钢筋编号:
                </InputLabel>
                <TextField
                  variant="outlined"
                  id="rebar_no"
                  size="small"
                  fullWidth
                  error={Boolean(errors.rebar_no)}
                  {...register("rebar_no", { required: "请输入钢筋编号" })}
                  placeholder="请输入钢筋编号"
                />
              </div>
              <ErrorMessage
                errors={errors}
                name="rebar_no"
                render={({ message }) => (
                  <p className="text-railway_error text-sm absolute">{message}</p>
                )}
              />
            </div>

            <div className="mb-8 relative">
              <div className="flex items-start flex-col">
                <InputLabel htmlFor="drill_mode" className="mr-3 w-20 text-left mb-2.5" required>
                  型号规格:
                </InputLabel>
                <Select
                  MenuProps={{ sx: { zIndex: 1602 } }}
                  sx={{ flex: 1, color: "#303133", zIndex: 1602 }}
                  id="drill_mode"
                  size="small"
                  value={dictionaryId}
                  onChange={(event) => {
                    setDictionaryId(event.target.value as number)
                  }}
                  fullWidth>
                  {dictionaryList.map((item) => (
                    <MenuItem value={item.id} key={item.id}>
                      {item.name}
                    </MenuItem>
                  ))}
                </Select>
              </div>
            </div>

            <div className="mb-8 relative">
              <div className="flex items-start flex-col">
                <InputLabel htmlFor="unit_length" className="mr-3 text-left mb-2.5">
                  单根长（m）:
                </InputLabel>
                <TextField
                  variant="outlined"
                  id="unit_length"
                  size="small"
                  fullWidth
                  error={Boolean(errors.unit_length)}
                  {...register("unit_length", { required: "请输入单根长（m）" })}
                  placeholder="请输入单根长（m）"
                />
              </div>
              <ErrorMessage
                errors={errors}
                name="unit_length"
                render={({ message }) => (
                  <p className="text-railway_error text-sm absolute">{message}</p>
                )}
              />
            </div>

            <div className="mb-8 relative">
              <div className="flex items-start flex-col">
                <InputLabel htmlFor="unit_weight" className="mr-3  text-left mb-2.5" required>
                  单位重（kg/m）:
                </InputLabel>
                <TextField
                  variant="outlined"
                  id="unit_weight"
                  size="small"
                  fullWidth
                  disabled
                  error={Boolean(errors.unit_weight)}
                  {...register("unit_weight", {
                    required: "请输入单位重（kg/m）",
                  })}
                  placeholder="请输入单位重（kg/m）"
                  className="flex-1"
                />
              </div>
              <ErrorMessage
                errors={errors}
                name="unit_weight"
                render={({ message }) => (
                  <p className="text-railway_error text-sm absolute">{message}</p>
                )}
              />
            </div>

            {/*<div className="mb-8 relative">*/}
            {/*  <div className="flex items-start flex-col">*/}
            {/*    <InputLabel htmlFor="pile_type" className="mr-3 w-20 text-left mb-2.5" required>*/}
            {/*      连接方式:*/}
            {/*    </InputLabel>*/}
            {/*    <Select*/}
            {/*      MenuProps={{ sx: { zIndex: 1602 } }}*/}
            {/*      sx={{ flex: 1, color: "#303133", zIndex: 1602 }}*/}
            {/*      id="pile_type"*/}
            {/*      size="small"*/}
            {/*      value={connectMethod}*/}
            {/*      onChange={(event) => {*/}
            {/*        setConnectMethod(event.target.value)*/}
            {/*      }}*/}
            {/*      fullWidth>*/}
            {/*      {Connect_method_enum.map((type) => (*/}
            {/*        <MenuItem value={type.value} key={type.value}>*/}
            {/*          {type.label}*/}
            {/*        </MenuItem>*/}
            {/*      ))}*/}
            {/*    </Select>*/}
            {/*  </div>*/}
            {/*</div>*/}

            <div className="mb-8 relative">
              <div className="flex items-start flex-col">
                <InputLabel htmlFor="number" className="mr-3 w-full text-left mb-2.5" required>
                  根数:
                </InputLabel>
                <TextField
                  variant="outlined"
                  id="number"
                  size="small"
                  fullWidth
                  error={Boolean(errors.number)}
                  {...register("number", {
                    required: "请输入根数",
                  })}
                  placeholder="请输入根数"
                  className="flex-1"
                />
              </div>
              <ErrorMessage
                errors={errors}
                name="number"
                render={({ message }) => (
                  <p className="text-railway_error text-sm absolute">{message}</p>
                )}
              />
            </div>

            <DialogActions>
              <Button onClick={handleClose}>取消</Button>
              <Button type="submit" variant="contained" className="bg-railway_blue">
                确定
              </Button>
            </DialogActions>
          </form>
        </div>
      </Drawer>
    </>
  )
}
