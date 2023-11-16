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
import {
  reqGetDictionary,
  reqPostRebarData,
  reqPostSpacerData,
  reqPutRebarData,
  reqPutSpacerData,
} from "@/app/ebs-data/api"
import {
  AcousticTubeListData,
  DictionaryData,
  TypePostAcousticTubeParams,
} from "@/app/ebs-data/types"
import {
  ACOUSTIC_TUBE_DICTIONARY_CLASS_ID,
  REBAR_DICTIONARY_CLASS_ID,
  SPACER_DICTIONARY_CLASS_ID,
} from "@/app/ebs-data/const"
import { LayoutContext } from "@/components/LayoutContext"
import ebsDataContext from "@/app/ebs-data/context/ebsDataContext"

type Props = {
  open: boolean
  handleCloseAddBridgeWithDrawer: () => void
  // eslint-disable-next-line no-unused-vars
  cb: (item: AcousticTubeListData, isAdd: boolean) => void
  editItem: AcousticTubeListData | null
}

type IForm = {
  quantity: number
}
export default function AddSpacer(props: Props) {
  const { open, handleCloseAddBridgeWithDrawer, cb, editItem } = props

  const ctx = React.useContext(ebsDataContext)

  const { projectId: PROJECT_ID } = React.useContext(LayoutContext)

  const handleClose = () => {
    handleCloseAddBridgeWithDrawer()
  }

  const { trigger: getDictionaryApi } = useSWRMutation("/dictionary", reqGetDictionary)

  const [dictionaryList, setDictionaryList] = React.useState<DictionaryData[]>([])

  const getDictionary = async () => {
    const res = await getDictionaryApi({ class_id: SPACER_DICTIONARY_CLASS_ID })
    console.log(res)
    setDictionaryList(res || [])
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

  const [dictionaryId, setDictionaryId] = React.useState<number>(0)

  const { trigger: postRebarDataApi } = useSWRMutation("/material-spacer", reqPostSpacerData)

  const { trigger: putRebarDataApi } = useSWRMutation("/material-spacer", reqPutSpacerData)

  const handleSetFormValue = (item: AcousticTubeListData) => {
    setValue("quantity", item.quantity / 1000)

    setDictionaryId(item.dictionary_id)
  }

  React.useEffect(() => {
    if (Boolean(editItem)) {
      handleSetFormValue(editItem as AcousticTubeListData)
    }
  }, [editItem])

  const { run: onSubmit }: { run: SubmitHandler<IForm> } = useDebounce(async (values: IForm) => {
    let params = {
      project_id: PROJECT_ID,
      engineering_listing_id: ctx.ebsItem.engineering_listing_id,
      dictionary_id: dictionaryId as number,
      ebs_id: ctx.ebsItem.id,
      quantity: values.quantity * 1000,
    } as TypePostAcousticTubeParams & { id: number }

    console.log(params)
    if (Boolean(editItem)) {
      params.id = editItem!.id
      await putRebarDataApi(Object.assign(params))

      cb(Object.assign(params) as AcousticTubeListData, false)
    } else {
      const res = await postRebarDataApi(params as any)

      cb(Object.assign({}, params, res), true)
    }

    handleClose()
  })

  return (
    <>
      <Drawer open={open} onClose={handleClose} anchor="right" sx={{ zIndex: 1601 }}>
        <div className="w-[500px] p-10">
          <header className="text-3xl text-[#44566C] mb-8">
            {Boolean(editItem) ? "修改声测管表" : "添加声测管表"}
          </header>
          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="mb-8 relative">
              <div className="flex items-start flex-col">
                <InputLabel htmlFor="drill_mode" className="mr-3 w-20 text-left mb-2.5" required>
                  规格型号:
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
                <InputLabel htmlFor="number" className="mr-3 w-full text-left mb-2.5" required>
                  数量:
                </InputLabel>
                <TextField
                  variant="outlined"
                  id="number"
                  size="small"
                  fullWidth
                  error={Boolean(errors.quantity)}
                  {...register("quantity", {
                    required: "请输入数量",
                  })}
                  placeholder="请输入数量"
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
