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
import { reqGetDictionary, reqPostConcreteData, reqPutConcreteData } from "@/app/ebs-data/api"
import { ConcreteData, DictionaryData, TypePostConcreteParams } from "@/app/ebs-data/types"
import { LayoutContext } from "@/components/LayoutContext"
import ebsDataContext from "@/app/ebs-data/context/ebsDataContext"
import { CONCRETE_DICTIONARY_CLASS_ID } from "@/app/ebs-data/const"

type Props = {
  open: boolean
  handleCloseAddConcreteWithDrawer: () => void
  // eslint-disable-next-line no-unused-vars
  cb: (item: ConcreteData, isAdd: boolean) => void
  editItem: ConcreteData | null
}

type IForm = {
  quantity: number
}
export default function AddConrete(props: Props) {
  const { open, handleCloseAddConcreteWithDrawer, cb, editItem } = props

  const ctx = React.useContext(ebsDataContext)

  const { projectId: PROJECT_ID } = React.useContext(LayoutContext)

  const handleClose = () => {
    handleCloseAddConcreteWithDrawer()
  }

  const { trigger: getDictionaryApi } = useSWRMutation("/dictionary", reqGetDictionary)

  const [dictionaryList, setDictionaryList] = React.useState<DictionaryData[]>([])

  const getDictionary = async () => {
    const res = await getDictionaryApi({ class_id: CONCRETE_DICTIONARY_CLASS_ID })
    setDictionaryList(res || [])
  }

  React.useEffect(() => {
    getDictionary()
  }, [])

  const [dictionaryId, setDictionaryId] = React.useState<number>(0)

  const { trigger: postConcreteDataApi } = useSWRMutation("/material-concrete", reqPostConcreteData)

  const { trigger: putConcreteDataApi } = useSWRMutation("/material-concrete", reqPutConcreteData)

  const handleSetFormValue = (item: ConcreteData) => {
    setDictionaryId(item.dictionary_id)
    setValue("quantity", item.quantity / 1000)
  }

  React.useEffect(() => {
    if (Boolean(editItem)) {
      handleSetFormValue(editItem as ConcreteData)
    }
  }, [editItem])

  const {
    handleSubmit,
    formState: { errors },
    register,
    setValue,
  } = useForm<IForm>({})

  const { run: onSubmit }: { run: SubmitHandler<IForm> } = useDebounce(async (values: IForm) => {
    let params = {
      engineering_listing_id: ctx.ebsItem.engineering_listing_id,
      project_id: PROJECT_ID,
      dictionary_id: dictionaryId,
      quantity: Number(Number(values.quantity).toFixed(3)) * 1000,
    } as TypePostConcreteParams & { id: number; dictionary: any }

    if (Boolean(editItem)) {
      params.id = editItem!.id
      await putConcreteDataApi(params)
      const dictionary = dictionaryList.find((item) => item.id == params.dictionary_id)
      params.dictionary = dictionary as any
      cb(Object.assign(params), false)
    } else {
      params.ebs_id = ctx.ebsItem.id
      const res = await postConcreteDataApi(params)

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
            {Boolean(editItem) ? "修改混凝土表" : "添加混凝土表"}
          </header>
          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="mb-8 relative">
              <div className="flex items-start flex-col">
                <InputLabel htmlFor="drill_mode" className="mr-3  text-left mb-2.5" required>
                  混凝土规格型号:
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
                <InputLabel htmlFor="liner_number" className="mr-3  text-left mb-2.5" required>
                  方量（m³）:
                </InputLabel>
                <TextField
                  variant="outlined"
                  id="liner_number"
                  size="small"
                  fullWidth
                  error={Boolean(errors.quantity)}
                  {...register("quantity", {
                    required: "请输入方量（m³）",
                  })}
                  placeholder="请输入方量（m³）"
                  className="flex-1"
                />
              </div>
              <ErrorMessage
                errors={errors}
                name="quantity"
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
