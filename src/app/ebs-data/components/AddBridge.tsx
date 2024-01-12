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
import { reqPostBridgeBoredBasicData, reqPutBridgeBoredBasicData } from "@/app/ebs-data/api"
import { BridgeBoredBasicData, TypeApiPostBridgeBoredBasicDataParams } from "@/app/ebs-data/types"
import { CONSTRUCTION_TECHNOLOGY, DRILL_MODE, Pile_Type_Enum } from "@/app/ebs-data/const"
import { LayoutContext } from "@/components/LayoutContext"
import ebsDataContext from "@/app/ebs-data/context/ebsDataContext"
import { DictionaryData } from "@/app/gantt/types"
import { message } from "antd"
import { intoDoubleFixed3 } from "@/libs/methods"

type Props = {
  open: boolean
  handleCloseAddBridgeWithDrawer: () => void
  // eslint-disable-next-line no-unused-vars
  cb: (item: BridgeBoredBasicData, isAdd: boolean) => void
  editItem: BridgeBoredBasicData | null
}

type IForm = {
  pile_diameter: number
  pile_length: number
  pile_top_elevation: number
  rebar_cage_length: number
  liner_dictionary_id: number
  liner_number: number
}
export default function AddBridge(props: Props) {
  const { open, handleCloseAddBridgeWithDrawer, cb, editItem } = props

  const { projectId: PROJECT_ID } = React.useContext(LayoutContext)

  const ctx = React.useContext(ebsDataContext)

  const handleClose = () => {
    handleCloseAddBridgeWithDrawer()
  }

  const {
    handleSubmit,
    formState: { errors },
    register,
    setValue,
  } = useForm<IForm>({})

  const [pileTypeState, setPileTypeState] = React.useState("FRICTION")
  const [drillModeState, setDrillModeState] = React.useState("percussion_drill")

  const [constructionTechnology, setConstructionTechnology] =
    React.useState("dry_construction_drill")

  const { trigger: postBridgeBoredBasicDataApi } = useSWRMutation(
    "/basic-datum",
    reqPostBridgeBoredBasicData,
  )

  const { trigger: putBridgeBoredBasicDataApi } = useSWRMutation(
    "/basic-datum",
    reqPutBridgeBoredBasicData,
  )

  const handleSetFormValue = (item: BridgeBoredBasicData) => {
    const _metadata = JSON.parse(item.metadata)
    setValue("pile_length", _metadata.pile_length / 1000)
    setValue("pile_top_elevation", _metadata.pile_top_elevation / 1000)
    setValue("pile_diameter", _metadata.pile_diameter / 1000)
    setValue("rebar_cage_length", _metadata.rebar_cage_length / 1000)
    setDrillModeState(_metadata.drill_mode)
    setPileTypeState(_metadata.pile_type)
    setConstructionTechnology(_metadata.construction_technology)
  }

  React.useEffect(() => {
    if (Boolean(editItem)) {
      handleSetFormValue(editItem as BridgeBoredBasicData)
    }
  }, [editItem])

  const { run: onSubmit }: { run: SubmitHandler<IForm> } = useDebounce(async (values: IForm) => {
    const _metadata = {
      pile_diameter: intoDoubleFixed3(values.pile_diameter) * 1000,
      pile_length: intoDoubleFixed3(values.pile_length) * 1000,
      pile_top_elevation: intoDoubleFixed3(values.pile_top_elevation) * 1000,
      rebar_cage_length: intoDoubleFixed3(values.rebar_cage_length) * 1000,
      pile_type: pileTypeState,
      construction_technology: constructionTechnology,
      drill_mode: drillModeState,
    }

    let params = {
      ebs_id: ctx.ebsItem.id,
      engineering_listing_id: ctx.ebsItem.engineering_listing_id,
      project_id: PROJECT_ID,
      class: "bridge",
      metadata: JSON.stringify(_metadata),
    } as TypeApiPostBridgeBoredBasicDataParams & { id: number }

    if (Boolean(editItem)) {
      params.id = editItem!.id
      await putBridgeBoredBasicDataApi(params)
      cb(Object.assign(params), false)
    } else {
      const res = await postBridgeBoredBasicDataApi(params)
      cb(Object.assign({}, params, res), true)
    }

    handleClose()
  })

  return (
    <>
      <Drawer open={open} onClose={handleClose} anchor="right" sx={{ zIndex: 1601 }}>
        <div className="w-[500px] p-10">
          <header className="text-3xl text-[#44566C] mb-8">
            {Boolean(editItem) ? "修改基础数据" : "添加基础数据"}
          </header>
          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="mb-8 relative">
              <div className="flex items-start flex-col">
                <InputLabel htmlFor="pile_diameter" className="mr-3 w-20 text-left mb-2.5" required>
                  桩径:
                </InputLabel>
                <TextField
                  variant="outlined"
                  id="pile_diameter"
                  size="small"
                  fullWidth
                  error={Boolean(errors.pile_diameter)}
                  {...register("pile_diameter", { required: "请输入桩径" })}
                  placeholder="请输入桩径"
                />
              </div>
              <ErrorMessage
                errors={errors}
                name="pile_diameter"
                render={({ message }) => (
                  <p className="text-railway_error text-sm absolute">{message}</p>
                )}
              />
            </div>

            <div className="mb-8">
              <div className="flex items-start flex-col">
                <InputLabel htmlFor="pile_length" className="mr-3 w-20 text-left mb-2.5">
                  桩长:
                </InputLabel>
                <TextField
                  variant="outlined"
                  id="pile_length"
                  size="small"
                  fullWidth
                  error={Boolean(errors.pile_length)}
                  {...register("pile_length", { required: "请输入桩长" })}
                  placeholder="请输入桩长"
                />
              </div>
            </div>

            <div className="mb-8 relative">
              <div className="flex items-start flex-col">
                <InputLabel htmlFor="pile_top_elevation" className="mr-3 text-left mb-2.5" required>
                  桩顶标高（m）:
                </InputLabel>
                <TextField
                  variant="outlined"
                  id="pile_top_elevation"
                  size="small"
                  fullWidth
                  error={Boolean(errors.pile_top_elevation)}
                  {...register("pile_top_elevation", {
                    required: "请输入桩顶标高（m）",
                  })}
                  placeholder="请输入桩顶标高（m）"
                  className="flex-1"
                />
              </div>
              <ErrorMessage
                errors={errors}
                name="pile_top_elevation"
                render={({ message }) => (
                  <p className="text-railway_error text-sm absolute">{message}</p>
                )}
              />
            </div>

            <div className="mb-8 relative">
              <div className="flex items-start flex-col">
                <InputLabel htmlFor="pile_type" className="mr-3 w-20 text-left mb-2.5" required>
                  桩型:
                </InputLabel>
                <Select
                  MenuProps={{ sx: { zIndex: 1602 } }}
                  sx={{ flex: 1, color: "#303133", zIndex: 1602 }}
                  id="pile_type"
                  size="small"
                  value={pileTypeState}
                  onChange={(event) => {
                    setPileTypeState(event.target.value)
                  }}
                  fullWidth>
                  {Pile_Type_Enum.map((type) => (
                    <MenuItem value={type.value} key={type.value}>
                      {type.label}
                    </MenuItem>
                  ))}
                </Select>
              </div>
            </div>

            <div className="mb-8 relative">
              <div className="flex items-start flex-col">
                <InputLabel htmlFor="drill_mode" className="mr-3 w-20 text-left mb-2.5" required>
                  施工工艺:
                </InputLabel>
                <Select
                  MenuProps={{ sx: { zIndex: 1602 } }}
                  sx={{ flex: 1, color: "#303133", zIndex: 1602 }}
                  id="drill_mode"
                  size="small"
                  value={constructionTechnology}
                  onChange={(event) => {
                    setConstructionTechnology(event.target.value)
                  }}
                  fullWidth>
                  {CONSTRUCTION_TECHNOLOGY.map((type) => (
                    <MenuItem value={type.value} key={type.value}>
                      {type.label}
                    </MenuItem>
                  ))}
                </Select>
              </div>
            </div>

            <div className="mb-8 relative">
              <div className="flex items-start flex-col">
                <InputLabel htmlFor="drill_mode" className="mr-3 w-20 text-left mb-2.5" required>
                  钻孔方式:
                </InputLabel>
                <Select
                  MenuProps={{ sx: { zIndex: 1602 } }}
                  sx={{ flex: 1, color: "#303133", zIndex: 1602 }}
                  id="drill_mode"
                  size="small"
                  value={drillModeState}
                  onChange={(event) => {
                    setDrillModeState(event.target.value)
                  }}
                  fullWidth>
                  {DRILL_MODE.map((type) => (
                    <MenuItem value={type.value} key={type.value}>
                      {type.label}
                    </MenuItem>
                  ))}
                </Select>
              </div>
            </div>

            <div className="mb-8 relative">
              <div className="flex items-start flex-col">
                <InputLabel
                  htmlFor="rebar_cage_length"
                  className="mr-3 w-full text-left mb-2.5"
                  required>
                  钢筋笼长度（m）:
                </InputLabel>
                <TextField
                  variant="outlined"
                  id="rebar_cage_length"
                  size="small"
                  fullWidth
                  error={Boolean(errors.rebar_cage_length)}
                  {...register("rebar_cage_length", {
                    required: "请输入钢筋笼长度（m）",
                  })}
                  placeholder="请输入钢筋笼长度（m）"
                  className="flex-1"
                />
              </div>
              <ErrorMessage
                errors={errors}
                name="rebar_cage_length"
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
