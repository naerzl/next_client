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
import { reqGetDictionary, reqPostConcreteData, reqPutConcreteData } from "@/app/gantt/api"
import { ConcreteData, DictionaryData, TypePostConcreteParams } from "../types"
import { PROJECT_ID } from "@/libs/const"
import { Connect_method_enum, Drill_Mode_Enum, Pile_Type_Enum } from "@/app/gantt/const"
import ganttContext from "@/app/gantt/context/ganttContext"

type Props = {
  open: boolean
  handleCloseAddConcreteWithDrawer: () => void
  // eslint-disable-next-line no-unused-vars
  cb: (item: ConcreteData, isAdd: boolean) => void
  editItem: ConcreteData | null
}

type IForm = {
  rebar_no: string
  unit_length: number
  unit_weight: number
  number: number
}
export default function AddConrete(props: Props) {
  const { open, handleCloseAddConcreteWithDrawer, cb, editItem } = props

  const ctx = React.useContext(ganttContext)

  const handleClose = () => {
    handleCloseAddConcreteWithDrawer()
  }

  const { trigger: getDictionaryApi } = useSWRMutation("/dictionary", reqGetDictionary)

  const [dictionaryList, setDictionaryList] = React.useState<DictionaryData[]>([])

  const getDictionary = async () => {
    const res = await getDictionaryApi({})
    setDictionaryList(res || [])
  }

  React.useEffect(() => {
    getDictionary()
  }, [])

  const { handleSubmit } = useForm<IForm>({})

  const [dictionaryId, setDictionaryId] = React.useState<number>(0)

  const { trigger: postConcreteDataApi } = useSWRMutation("/material-concrete", reqPostConcreteData)

  const { trigger: putConcreteDataApi } = useSWRMutation("/material-concrete", reqPutConcreteData)

  const handleSetFormValue = (item: ConcreteData) => {
    setDictionaryId(item.dictionary_id)
  }

  React.useEffect(() => {
    if (Boolean(editItem)) {
      handleSetFormValue(editItem as ConcreteData)
    }
  }, [editItem])

  const { run: onSubmit }: { run: SubmitHandler<IForm> } = useDebounce(async (values: IForm) => {
    let params = {
      project_id: PROJECT_ID,
      dictionary_id: dictionaryId,
    } as TypePostConcreteParams & { id: number; dictionary: any }

    if (Boolean(editItem)) {
      params.id = editItem!.id
      await putConcreteDataApi(params)
      const dictionary = dictionaryList.find((item) => item.id == params.dictionary_id)
      params.dictionary = dictionary as any
      cb(Object.assign(params), false)
    } else {
      params.ebs_id = ctx.ebsItem.id
      params.project_si_id = ctx.ebsItem.project_si_id.replace(/[a-zA-z]/, "")
      params.project_sp_id = ctx.ebsItem.project_sp_id.replace(/[a-zA-z]/, "")
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
                <InputLabel htmlFor="drill_mode" className="mr-3 w-20 text-left mb-2.5" required>
                  字典:
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
