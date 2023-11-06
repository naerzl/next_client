import { Button, Drawer, InputLabel, MenuItem, Select, TextField } from "@mui/material"
import React, { Fragment } from "react"
import { SubmitHandler, useForm } from "react-hook-form"
import useDebounce from "@/hooks/useDebounce"

import { ErrorMessage } from "@hookform/error-message"
import {
  DictionaryClassListData,
  DictionaryData,
  MaterialApproachData,
} from "@/app/material-approach/types"
import useSWRMutation from "swr/mutation"
import {
  reqGetDictionary,
  reqGetDictionaryClass,
  reqGetMaterialApproach,
} from "@/app/material-approach/api"
import { message } from "antd"
import { CLASS_OPTION } from "@/app/material-processing/const"
import {
  MaterialProcessingData,
  PostMaterialProcessingParams,
  PutMaterialProcessingParams,
} from "@/app/material-processing/types"
import AddIcon from "@mui/icons-material/Add"
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline"
import IconButton from "@mui/material/IconButton"
import { reqPostMaterialMachine, reqPutMaterialMachine } from "@/app/material-processing/api"
import { LayoutContext } from "@/components/LayoutContext"

interface Props {
  open: boolean
  // eslint-disable-next-line no-unused-vars
  close: () => void
  editItem: null | MaterialProcessingData
  getDataList: () => void
}

type IForm = {
  blanking_personnel: string
  welder: string
  processors: string
  mixer: string
  quantity: number
  desc: number
}

type MaterialItem = {
  project_material_id: number | string
  dictionary_id: number | string
  quantity: number | string
  class: string
}

type RelateData = {
  materials: MaterialItem[]
  blanking_personnel: string
  welder: string
  processors: string
  mixer: string
}

export default function AddOrEditMaterial(props: Props) {
  const { open, close, editItem, getDataList } = props

  const { projectId: PROJECT_ID } = React.useContext(LayoutContext)

  const handleClose = () => {
    close()
    reset()
    setDictionaryId(0)
    setDictionaryClass(0)
    setConcreteFormList([])
    setRebarFormList([])
    setCustomError({})
  }

  const { trigger: getDictionaryApi } = useSWRMutation("/dictionary", reqGetDictionary)

  const { trigger: getMaterialApproachApi } = useSWRMutation(
    "/material-approach",
    reqGetMaterialApproach,
  )

  const { trigger: postMaterialMachineApi } = useSWRMutation(
    "/material-machine",
    reqPostMaterialMachine,
  )

  const { trigger: putMaterialMachineApi } = useSWRMutation(
    "/material-machine",
    reqPutMaterialMachine,
  )

  const { trigger: getDictionaryClassApi } = useSWRMutation(
    "/dictionary-class",
    reqGetDictionaryClass,
  )

  const [dictionaryClass, setDictionaryClass] = React.useState(0)

  const [dictionaryList, setDictionaryList] = React.useState<DictionaryData[]>([])

  const [dictionaryClassList, setDictionaryClassList] = React.useState<DictionaryClassListData[]>(
    [],
  )

  const [dictionaryId, setDictionaryId] = React.useState(0)

  const getDictionaryClass = async () => {
    const res = await getDictionaryClassApi({ page: 1, limit: 20 })
    setDictionaryClassList(res || [])
  }

  React.useEffect(() => {
    getDictionaryClass()
  }, [])

  React.useEffect(() => {
    getDictionaryApi(dictionaryClass ? { class_id: dictionaryClass } : {}).then((res) => {
      setDictionaryList(res)
    })
  }, [dictionaryClass])

  const [materialApproachList, setMaterialApproachList] = React.useState<MaterialApproachData[]>([])

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
      setValue("quantity", editItem.quantity)
      setValue("desc", editItem.desc)
      setClassSelect(editItem.class)
      setDictionaryId(editItem.dictionary_id)
      const jsonData: RelateData = JSON.parse(editItem.relate_data)
      if (editItem.class == "rebar") {
        setValue("blanking_personnel", jsonData.blanking_personnel)
        setValue("welder", jsonData.welder)
        setValue("processors", jsonData.processors)
        setRebarFormList(jsonData.materials)
      } else if (editItem.class == "concrete") {
        setValue("mixer", jsonData.mixer)
        setConcreteFormList(jsonData.materials)
      }
    }
  }, [editItem])

  const [classSelect, setClassSelect] = React.useState<string>("none")

  const {
    handleSubmit,
    formState: { errors },
    register,
    reset,
    trigger,
    setValue,
  } = useForm<IForm>()

  const checkMaterialList = (): boolean => {
    switch (classSelect) {
      case "rebar":
        return (
          rebarFormList.length == 0 ||
          rebarFormList.some((item) => {
            return !item.quantity || !Boolean(item.project_material_id)
          })
        )
      case "concrete":
        return (
          concreteFormList.length == 0 ||
          concreteFormList.some((item) => {
            return !item.quantity || !Boolean(item.project_material_id)
          })
        )
      default:
        return true
    }
  }

  const { run: onSubmit }: { run: SubmitHandler<IForm> } = useDebounce(async (values: IForm) => {
    if (!dictionaryId) {
      setCustomError({ dictionaryId: { message: "请选择物资名称" } })
      return message.warning("请选物资名称")
    }

    const flag = checkMaterialList()
    if (flag) return message.warning("请完善物资信息")

    let params = {} as PostMaterialProcessingParams & PutMaterialProcessingParams

    Object.assign(params, values)
    params.class = classSelect
    if (classSelect == "rebar") {
      const obj = {
        materials: [],
        blanking_personnel: "",
        welder: "",
        processors: "",
      }

      const arr = rebarFormList.map((item) => {
        const approachItem = materialApproachList.find((ele) => ele.id == item.project_material_id)
        return {
          ...item,
          class: "rebar",
          dictionary_id: approachItem!.dictionary_id,
          quantity: +item.quantity,
        }
      })

      obj.materials = arr as any
      obj.blanking_personnel = values.blanking_personnel
      obj.welder = values.welder
      obj.processors = values.processors
      params.relate_data = JSON.stringify(obj)
    } else if (classSelect == "concrete") {
      const obj = {
        materials: [],
        mixer: "",
      }

      const arr = concreteFormList.map((item) => {
        const approachItem = materialApproachList.find((ele) => ele.id == item.project_material_id)
        return {
          ...item,
          class: "rebar",
          dictionary_id: approachItem!.dictionary_id,
          quantity: +item.quantity,
        }
      })

      obj.materials = arr as any
      obj.mixer = values.mixer
      params.relate_data = JSON.stringify(obj)
    }

    if (!!editItem) {
      params.id = editItem.id
      params.dictionary_id = dictionaryId
      await putMaterialMachineApi(params as PutMaterialProcessingParams)
    } else {
      params.project_id = PROJECT_ID
      params.dictionary_id = dictionaryId
      await postMaterialMachineApi(params as PostMaterialProcessingParams)
    }
    message.success("操作成功")
    getDataList()
    handleClose()
  })

  const [customError, setCustomError] = React.useState<any>({})

  const [rebarFormList, setRebarFormList] = React.useState<MaterialItem[]>([])

  const [concreteFormList, setConcreteFormList] = React.useState<MaterialItem[]>([])

  const handleChangeRebarFormList = (val: any, k: keyof MaterialItem, index: number) => {
    const newList = structuredClone(rebarFormList)
    console.log(newList)
    newList[index][k] = val

    setRebarFormList(newList)
  }

  const handleChangeConcreteFormList = (val: any, k: keyof MaterialItem, index: number) => {
    const newList = structuredClone(concreteFormList)
    newList[index][k] = val

    setConcreteFormList(newList)
  }

  function renderConcreteForm() {
    return (
      <>
        <div className="bg-[#fafafa]">
          <div className="flex justify-end">
            <Button
              variant="outlined"
              startIcon={<AddIcon />}
              onClick={() => {
                setConcreteFormList((prevState) => [
                  ...prevState,
                  {
                    project_material_id: 0,
                    dictionary_id: 0,
                    quantity: "",
                    class: "",
                  },
                ])
              }}>
              添加物资
            </Button>
          </div>
          {concreteFormList.map((ele, index) => (
            <Fragment key={index}>
              <div className="mb-4 relative">
                <div className="flex items-start flex-col">
                  <div className="w-full flex justify-between">
                    <InputLabel htmlFor="name" className="mr-3 w-full text-left mb-2.5" required>
                      物资名称:
                    </InputLabel>
                    <IconButton
                      onClick={() => {
                        setConcreteFormList((prevState) => {
                          const newArr = structuredClone(prevState)
                          newArr.splice(index, 1)
                          return newArr
                        })
                      }}>
                      <DeleteOutlineIcon />
                    </IconButton>
                  </div>
                  <div className=" w-full gap-x-2">
                    <Select
                      MenuProps={{ sx: { zIndex: 1702, height: "25rem" } }}
                      sx={{ flex: 1, color: "#303133", zIndex: 1602 }}
                      id="zidian"
                      size="small"
                      value={ele.project_material_id}
                      onChange={(event) => {
                        handleChangeConcreteFormList(
                          event.target.value,
                          "project_material_id",
                          index,
                        )
                      }}
                      fullWidth>
                      <MenuItem value={0} disabled>
                        <i className="text-[#ababab]">请选择一个物资</i>
                      </MenuItem>
                      {materialApproachList.map((ele) => (
                        <MenuItem value={ele.id} key={ele.id}>
                          {ele.dictionary?.name ?? ""}
                        </MenuItem>
                      ))}
                    </Select>
                  </div>
                </div>
              </div>

              <div className="mb-8 relative">
                <div className="flex items-start flex-col">
                  <InputLabel
                    htmlFor="certificate_number"
                    className="mr-3 w-full text-left mb-2.5"
                    required>
                    数量:
                  </InputLabel>
                  <TextField
                    variant="outlined"
                    id="certificate_number"
                    size="small"
                    type="number"
                    fullWidth
                    value={ele.quantity}
                    onChange={(event) => {
                      handleChangeConcreteFormList(event.target.value, "quantity", index)
                    }}
                    label="数量"
                    autoComplete="off"
                  />
                </div>
              </div>
            </Fragment>
          ))}
        </div>

        <div className="mb-8 relative">
          <div className="flex items-start flex-col">
            <InputLabel htmlFor="mixer" className="mr-3 w-full text-left mb-2.5" required>
              拌和员:
            </InputLabel>
            <TextField
              key={"mixer"}
              variant="outlined"
              id="mixer"
              size="small"
              fullWidth
              {...register("mixer", {
                required: "请输入拌和员",
                onBlur() {
                  trigger("mixer")
                },
              })}
              label="拌和员"
              autoComplete="off"
            />
          </div>
          <ErrorMessage
            errors={errors}
            name="mixer"
            render={({ message }) => (
              <p className="text-railway_error text-sm absolute">{message}</p>
            )}
          />
        </div>
      </>
    )
  }

  function renderRebarForm() {
    return (
      <>
        <div className="">
          <div className="flex justify-end">
            <Button
              variant="outlined"
              startIcon={<AddIcon />}
              onClick={() => {
                setRebarFormList((prevState) => [
                  ...prevState,
                  {
                    project_material_id: 0,
                    dictionary_id: 0,
                    quantity: "",
                    class: "",
                  },
                ])
              }}>
              添加物资
            </Button>
          </div>
          {rebarFormList.map((ele, index) => (
            <div key={index} className="border my-4 rounded py-4 bg-[#fafafa]">
              <h3 className="text-center text-railway_303">物资-{index + 1}</h3>
              <div className="mb-4 relative">
                <div className="flex items-start flex-col">
                  <div className="w-full flex justify-between">
                    <InputLabel htmlFor="name" className="text-left mb-2.5" required>
                      物资名称:
                    </InputLabel>
                    <IconButton
                      onClick={() => {
                        setRebarFormList((prevState) => {
                          const newArr = structuredClone(prevState)
                          newArr.splice(index, 1)
                          return newArr
                        })
                      }}>
                      <DeleteOutlineIcon />
                    </IconButton>
                  </div>
                  <div className=" w-full gap-x-2">
                    <Select
                      MenuProps={{ sx: { zIndex: 1702, height: "25rem" } }}
                      sx={{ flex: 1, color: "#303133", zIndex: 1602 }}
                      id="zidian"
                      size="small"
                      value={ele.project_material_id}
                      onChange={(event) => {
                        handleChangeRebarFormList(event.target.value, "project_material_id", index)
                      }}
                      fullWidth>
                      <MenuItem value={0} disabled>
                        <i className="text-[#ababab]">请选择一个字典</i>
                      </MenuItem>
                      {materialApproachList.map((ele) => (
                        <MenuItem value={ele.id} key={ele.id}>
                          {ele.dictionary?.name ?? ""}
                        </MenuItem>
                      ))}
                    </Select>
                  </div>
                </div>
              </div>

              <div className="relative">
                <div className="flex items-start flex-col">
                  <InputLabel
                    htmlFor="certificate_number"
                    className="mr-3 w-full text-left mb-2.5"
                    required>
                    数量:
                  </InputLabel>
                  <TextField
                    variant="outlined"
                    id="certificate_number"
                    size="small"
                    type="number"
                    fullWidth
                    value={ele.quantity}
                    onChange={(event) => {
                      handleChangeRebarFormList(event.target.value, "quantity", index)
                    }}
                    label="数量"
                    autoComplete="off"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mb-8 relative">
          <div className="flex items-start flex-col">
            <InputLabel
              htmlFor="blanking_personnel"
              className="mr-3 w-full text-left mb-2.5"
              required>
              下料人员:
            </InputLabel>
            <TextField
              variant="outlined"
              id="blanking_personnel"
              size="small"
              fullWidth
              error={Boolean(errors.blanking_personnel)}
              {...register("blanking_personnel", {
                required: "请输入下料人员",
                onBlur() {
                  trigger("blanking_personnel")
                },
              })}
              label="下料人员"
              autoComplete="off"
            />
          </div>
          <ErrorMessage
            errors={errors}
            name="blanking_personnel"
            render={({ message }) => (
              <p className="text-railway_error text-sm absolute">{message}</p>
            )}
          />
        </div>

        <div className="mb-8 relative">
          <div className="flex items-start flex-col">
            <InputLabel htmlFor="welder" className="mr-3 w-full text-left mb-2.5" required>
              焊接员:
            </InputLabel>
            <TextField
              variant="outlined"
              id="welder"
              size="small"
              fullWidth
              error={Boolean(errors.welder)}
              {...register("welder", {
                required: "请输入焊接员",
                onBlur() {
                  trigger("welder")
                },
              })}
              label="焊接员"
              autoComplete="off"
            />
          </div>
          <ErrorMessage
            errors={errors}
            name="welder"
            render={({ message }) => (
              <p className="text-railway_error text-sm absolute">{message}</p>
            )}
          />
        </div>

        <div className="mb-8 relative">
          <div className="flex items-start flex-col">
            <InputLabel htmlFor="processors" className="mr-3 w-full text-left mb-2.5" required>
              加工员:
            </InputLabel>
            <TextField
              variant="outlined"
              id="processors"
              size="small"
              fullWidth
              error={Boolean(errors.processors)}
              {...register("processors", {
                required: "请输入加工员",
                onBlur() {
                  trigger("processors")
                },
              })}
              label="加工员"
              autoComplete="off"
            />
          </div>
          <ErrorMessage
            errors={errors}
            name="processors"
            render={({ message }) => (
              <p className="text-railway_error text-sm absolute">{message}</p>
            )}
          />
        </div>
      </>
    )
  }

  function renderForm(val: string) {
    switch (val) {
      case "rebar":
        return renderRebarForm()
      case "concrete":
        return renderConcreteForm()
      default:
        return <></>
    }
  }

  return (
    <Drawer open={open} onClose={handleClose} anchor="right">
      <div className="w-[500px] p-10">
        <header className="text-3xl text-[#44566C] mb-8">
          {!!editItem ? "修改物资加工信息" : "添加物资加工信息"}
        </header>
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="mb-8 relative">
            <div className="flex items-start flex-col">
              <InputLabel
                id="demo-simple-select-standard-label"
                htmlFor="name"
                className="mr-3 w-full text-left mb-2.5"
                required>
                分类:
              </InputLabel>

              <Select
                labelId="demo-simple-select-standard-label"
                MenuProps={{ sx: { zIndex: 1702, height: "400px" } }}
                sx={{ flex: 1, color: "#303133", zIndex: 1602 }}
                id="role_list"
                size="small"
                value={classSelect}
                onChange={(event) => {
                  setClassSelect(event.target.value)
                }}
                fullWidth>
                <MenuItem value={"none"} disabled>
                  <i className="text-[#ababab]">请选择一个分类</i>
                </MenuItem>
                {CLASS_OPTION.map((item: any) => (
                  <MenuItem value={item.value} key={item.value}>
                    {item.label}
                  </MenuItem>
                ))}
              </Select>
            </div>
          </div>

          <div className="mb-4 relative">
            <div className="flex items-start flex-col">
              <InputLabel htmlFor="name" className="mr-3 w-full text-left mb-2.5" required>
                物资名称:
              </InputLabel>
              <div className="grid grid-cols-2 w-full gap-x-2">
                <Select
                  MenuProps={{ sx: { zIndex: 1702, height: "25rem" } }}
                  sx={{ flex: 1, color: "#303133", zIndex: 1602 }}
                  id="zidian"
                  size="small"
                  value={dictionaryClass}
                  onChange={(event) => {
                    setDictionaryClass(+event.target.value)
                  }}
                  fullWidth>
                  <MenuItem value={0}>全部</MenuItem>
                  {dictionaryClassList.map((item: any) => (
                    <MenuItem value={item.id} key={item.id}>
                      {item.name}
                    </MenuItem>
                  ))}
                </Select>

                <Select
                  MenuProps={{ sx: { zIndex: 1702, height: "25rem" } }}
                  sx={{ flex: 1, color: "#303133", zIndex: 1602 }}
                  id="zidian"
                  size="small"
                  error={Boolean(customError["dictionaryId"])}
                  value={dictionaryId}
                  onChange={(event) => {
                    setCustomError((pre: any) => {
                      delete pre["dictionaryId"]
                      return pre
                    })
                    setDictionaryId(event.target.value as number)
                  }}
                  fullWidth>
                  <MenuItem value={0} disabled>
                    <i className="text-[#ababab]">请选择一个字典</i>
                  </MenuItem>
                  {dictionaryList.map((ele) => (
                    <MenuItem value={ele.id} key={ele.id}>
                      {ele.name}
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

          {renderForm(classSelect)}

          <div className="mb-8 relative">
            <div className="flex items-start flex-col">
              <InputLabel htmlFor="quantity" className="mr-3 w-full text-left mb-2.5" required>
                使用数量:
              </InputLabel>
              <TextField
                variant="outlined"
                id="quantity"
                size="small"
                fullWidth
                type="number"
                error={Boolean(errors.quantity)}
                {...register("quantity", {
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
                    trigger("quantity")
                  },
                })}
                label="使用数量"
                autoComplete="off"
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
