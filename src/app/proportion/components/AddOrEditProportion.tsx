import React from "react"
import {
  Button,
  Drawer,
  InputLabel,
  Menu,
  MenuItem,
  Select,
  Switch,
  TextField,
} from "@mui/material"
import { ErrorMessage } from "@hookform/error-message"
import {
  MaterialProportionListData,
  PostMaterialProportionParams,
  PutMaterialProportionParams,
} from "@/app/proportion/types"
import { SubmitHandler, useForm } from "react-hook-form"
import { DictionaryData } from "@/app/material-approach/types"
import useDebounce from "@/hooks/useDebounce"
import { message } from "antd"
import { CLASS_OPTION } from "@/app/proportion/const"
import { RequireTag } from "@/libs/other"
import useSWRMutation from "swr/mutation"
import { reqGetDictionary } from "@/app/material-approach/api"
import { intoDoubleFixed3 } from "@/libs/methods"
import { reqGetEngineeringListing } from "@/app/basic-engineering-management/api"
import { EngineeringListing } from "@/app/basic-engineering-management/types/index.d"
import dayjs from "dayjs"
import { LayoutContext } from "@/components/LayoutContext"
import Tree from "@/app/proportion/components/Tree"
import { reqGetEBS } from "@/app/ebs-data/api"
import { TypeApiGetEBSParams, TypeEBSDataList } from "@/app/ebs-data/types"
import { reqPostMaterialProportion, reqPutMaterialProportion } from "@/app/proportion/api"
import SelectDictionaryClass from "@/components/SelectDictionaryClass"
import { reqGetDictionaryClass } from "@/app/api"
import useGetDictionaryClassHooks from "@/hooks/useGetDictionaryClassHooks"
import { DICTIONARY_CLASS_ID } from "@/libs/const"
import Decimal from "decimal.js"

interface Props {
  open: boolean
  // eslint-disable-next-line no-unused-vars
  close: () => void
  editItem: null | MaterialProportionListData
  // eslint-disable-next-line no-unused-vars
  cb: (item?: MaterialProportionListData, isAdd?: boolean) => void
}

type MaterialListType = {
  dictionary_class_id: number
  dictionary_id: number
  quantity: number | string
  dictionaryList: DictionaryData[]
  name: string
  proportion: string
  isSwitch: boolean
  ingredients: { dictionary_id: number; quantity: number | string }[]
}

export default function AddOrEditProportion(props: Props) {
  const { open, close, editItem, cb } = props

  const { projectId: PROJECT_ID } = React.useContext(LayoutContext)

  const {
    handleSubmit,
    formState: { errors },
    register,
    trigger,
    setValue,
  } = useForm<PostMaterialProportionParams>()

  const { trigger: getDictionaryListApi } = useSWRMutation("/dictionary", reqGetDictionary)

  const { trigger: getEngineeringListingApi } = useSWRMutation(
    "/engineering-listing",
    reqGetEngineeringListing,
  )

  const { trigger: getDictionaryClassApi } = useSWRMutation(
    "/dictionary-class",
    reqGetDictionaryClass,
  )

  const { trigger: getEBSApi } = useSWRMutation("/ebs", reqGetEBS)

  const { trigger: postMaterialProportionApi } = useSWRMutation(
    "/material-proportion",
    reqPostMaterialProportion,
  )

  const { trigger: putMaterialProportionApi } = useSWRMutation(
    "/material-proportion",
    reqPutMaterialProportion,
  )

  const [engineeringList, setEngineeringList] = React.useState<EngineeringListing[]>([])

  const { treeData } = useGetDictionaryClassHooks({})

  const getEngineeringList = async () => {
    const res = await getEngineeringListingApi({ project_id: PROJECT_ID })
    const newArr = res.sort((a, b) => {
      return dayjs(b.created_at).unix() - dayjs(a.created_at).unix()
    })

    setEngineeringList(newArr)
  }

  React.useEffect(() => {
    getEngineeringList()
  }, [])

  const [classValue, setClassValue] = React.useState(0)

  const handleDictionaryClassSelectChange = (val: number) => {
    setClassValue(val)
  }

  const [dictionaryList, setDictionaryList] = React.useState<DictionaryData[]>([])

  const handleGetDictionary = async () => {
    const res = await getDictionaryListApi({ class_id: classValue })
    setDictionaryList(res)
  }

  React.useEffect(() => {
    classValue > 0 && handleGetDictionary()
  }, [classValue])

  const handleEditSetValue = async (item: MaterialProportionListData) => {
    setValue("name", item.name)
    setClassValue(item.dictionary?.dictionary_class_id ?? 0)
    setDictionaryId(item.dictionary_id)
    setProportion(item.proportion)
    let materials = JSON.parse(item.materials)
    let arr: Array<MaterialListType> = []

    console.log(materials)
    for (const materialsKey in materials) {
      let item = materials[materialsKey]
      const res = await getDictionaryListApi({ class_id: item.ingredients[0].dictionary_class_id })

      const sumQuantity = item.ingredients.reduce((pre: number, item: any) => {
        return Decimal.add(pre, item.quantity).toNumber()
      }, 0)

      let obj = {
        dictionary_id: item.ingredients[0].dictionary_id,
        quantity: sumQuantity,
        dictionaryList: res,
        dictionary_class_id: item.ingredients[0].dictionary_class_id,
        isSwitch: item.is_single != 1,
        proportion: item.proportion ?? "",
      } as MaterialListType
      if (item.is_single == 1) {
        obj.ingredients = []
      } else {
        obj.ingredients = item.ingredients.map((el: any) => {
          return {
            dictionary_id: el.dictionary_id,
            quantity: el.quantity,
          }
        })
      }

      arr.push(obj)
    }

    setMaterialList(arr)
    setEngineeringListingId(item.usages[0].engineeringListing_id)
    let ebsIds: number[] = []
    let ebsItems: TypeEBSDataList[] = []
    for (const usagesKey in item.usages) {
      let el = item.usages[usagesKey]
      ebsIds.push(el.ebs_id)
      const res = await getEBSApi({
        id: el.ebs_id,
        project_id: PROJECT_ID,
        is_hidden: 0,
        engineering_listing_id: el.engineeringListing_id,
      })
      if (res.length == 1) {
        ebsItems.push(res[0])
      }
    }

    setCheckedArr(ebsIds)
    setCheckedEBSList(ebsItems)
  }

  React.useEffect(() => {
    if (!!editItem) {
      handleEditSetValue(editItem)
    }
  }, [editItem])

  const [dictionaryId, setDictionaryId] = React.useState(0)

  const [proportion, setProportion] = React.useState("")

  const [materialList, setMaterialList] = React.useState<MaterialListType[]>([])

  const handleChangeProportionState = (val: string) => {
    let cleanedString = val.replace(/[^0-9.:]/g, "")
    setProportion(cleanedString)
  }

  const oldProportion = React.useRef<String>("")
  const handleBlurProportionState = async (val: string) => {
    const arr = val.split(":")

    const res = await getDictionaryListApi({ class_id: DICTIONARY_CLASS_ID.cement })

    if (materialList.length != arr.length) {
      setMaterialList(
        arr.map((str, index) => {
          if (index == 0) {
            return {
              dictionary_id: 0,
              dictionary_class_id: DICTIONARY_CLASS_ID.cement,
              dictionaryList: res,
              quantity: "",
              name: "水泥",
              proportion: "",
              isSwitch: false,
              ingredients: [],
            }
          }
          return {
            dictionary_id: 0,
            dictionary_class_id: 0,
            dictionaryList: [],
            quantity: "",
            proportion: "",
            name: "",
            isSwitch: false,
            ingredients: [],
          }
        }),
      )
    }

    oldProportion.current = val
  }

  const handleChangeMaterialDictionaryClassState = (index: number, val: any, name: string) => {
    getDictionaryListApi({ class_id: val }).then((res) => {
      const cloneList = structuredClone(materialList)
      cloneList[index]["dictionaryList"] = res
      cloneList[index]["dictionary_class_id"] = val
      cloneList[index]["dictionary_id"] = 0
      cloneList[index]["name"] = name
      if (cloneList[index].isSwitch && cloneList[index].ingredients.length > 0) {
        cloneList[index].ingredients = cloneList[index].ingredients.map((ing) => {
          ing.dictionary_id = 0
          return ing
        })
      }
      setMaterialList(cloneList)
    })
  }

  const handleChangeMaterialListState = (index: number, type: keyof MaterialListType, val: any) => {
    const proportionArr = proportion.split(":")

    if (type == "dictionary_class_id") {
      getDictionaryListApi({ class_id: val }).then((res) => {
        const cloneList = structuredClone(materialList)
        cloneList[index]["dictionaryList"] = res
        cloneList[index]["dictionary_class_id"] = val
        cloneList[index]["dictionary_id"] = 0
        setMaterialList(cloneList)
      })
      return
    }

    if (index == 0 && type == "quantity") {
      const newList = proportionArr.map((item, index) => {
        let obj: MaterialListType = structuredClone(materialList[index])
        if (index == 0) {
          obj.quantity = val
        } else {
          let num = (val / Number(proportionArr[0])) * Number(item)
          let flag = Number.isInteger(num)
          obj.quantity = flag ? num : intoDoubleFixed3(num)
        }

        if (obj.isSwitch && obj.ingredients.length > 0) {
          let proArr = obj.proportion.split(":")
          obj.ingredients = obj.ingredients.map((ing, index) => {
            ing.quantity = Decimal.div(Number(proArr[index]), 10).mul(obj.quantity).toNumber()
            return ing
          })
        }
        return obj
      })
      if (proportionArr[0]) {
        setMaterialList(newList)
      } else {
        const cloneList = structuredClone(materialList)
        // @ts-ignore
        cloneList[index][type] = val
        setMaterialList(cloneList)
      }
      return
    }
    const cloneList = structuredClone(materialList)
    // @ts-ignore
    cloneList[index][type] = val
    setMaterialList(cloneList)
  }

  const handleChangeSwitch = (checked: boolean, index: number) => {
    const cloneList = structuredClone(materialList)
    cloneList[index].isSwitch = checked
    setMaterialList(cloneList)
  }

  const handleChangeSubDictionary = (val: number, index: number, subIndex: number) => {
    const cloneList = structuredClone(materialList)
    cloneList[index].ingredients[subIndex].dictionary_id = val
    setMaterialList(cloneList)
  }

  const handleChangeSubProportion = (val: string, index: number) => {
    const cloneList = structuredClone(materialList)
    cloneList[index].proportion = val
    setMaterialList(cloneList)
  }
  const handleBlurSubProportion = (index: number) => {
    const cloneList = structuredClone(materialList)
    const row = cloneList[index]
    if (!row.proportion) return
    const arr = row.proportion.split(":")

    const sum = arr.reduce((previousValue, currentValue) => {
      return Decimal.add(previousValue, Number(currentValue)).toNumber()
    }, 0)
    if (sum != 10) return message.warning("配比需等于10")

    row.ingredients = arr.map((str) => {
      let obj: any = {
        quantity: "",
        dictionary_id: 0,
      }
      if (row.quantity) {
        obj.quantity = Decimal.div(Number(str), 10).mul(row.quantity).toNumber()
      }

      return obj
    })
    setMaterialList(cloneList)
  }

  const [engineeringListingId, setEngineeringListingId] = React.useState<number>(0)

  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null)
  const openMenu = Boolean(anchorEl)

  const handleCloseMenu = () => {
    setAnchorEl(null)
  }

  const [ebsAll, setEBSAll] = React.useState<any[]>([])

  const getEBSData = async (engineering_listing_id: number) => {
    const params: TypeApiGetEBSParams = {
      project_id: PROJECT_ID,
      is_hidden: 0,
      engineering_listing_id,
    }

    const res = await getEBSApi(params)

    const engineeringItem = engineeringList.find((item) => item.id == engineering_listing_id)

    let arr = res
    if (engineeringItem) {
      arr = arr.filter((item) => item.id == engineeringItem.ebs_id)
    }
    setEBSAll(arr)
    return []
  }

  React.useEffect(() => {
    engineeringListingId && engineeringList.length > 0 && getEBSData(engineeringListingId)
  }, [engineeringListingId, engineeringList])

  const getSubEBSData = async (ebsItem: TypeEBSDataList, pos: string, type: boolean) => {
    const ebsAllValue = structuredClone(ebsAll)

    let arr: TypeEBSDataList[] = []
    // 展开
    if (type) {
      const ebsParams = {
        project_id: PROJECT_ID,
        level: ebsItem.level + 1,
        code: ebsItem.code,
        is_hidden: 0,
        engineering_listing_id: engineeringListingId,
      } as TypeApiGetEBSParams

      arr = await getEBSApi(ebsParams)

      const indexArr = pos.split("-")
      const evalStr = `ebsAllValue[${indexArr.join("].children[")}]`

      eval(`${evalStr}.children= arr`)

      setEBSAll(ebsAllValue)
    } else {
      //   关闭
      const indexArr = pos.split("-")
      const evalStr = `ebsAllValue[${indexArr.join("].children[")}]`
      eval(`${evalStr}.children=[]`)
      setEBSAll(ebsAllValue)
    }

    return arr.length
  }

  const [checkedArr, setCheckedArr] = React.useState<number[]>([])

  const [checkedEBSList, setCheckedEBSList] = React.useState<TypeEBSDataList[]>([])

  const handleChecked = (
    checkedValue: number[],
    checked: boolean,
    checkedEBSList: TypeEBSDataList[],
  ) => {
    setCheckedEBSList(checkedEBSList)
    setCheckedArr(checkedValue)
  }

  const { run: onSubmit }: { run: SubmitHandler<PostMaterialProportionParams> } = useDebounce(
    async (values: PostMaterialProportionParams) => {
      // 验证数据

      const materials = materialList.map((item) => {
        const obj: any = {
          name: item.name,
          is_single: item.isSwitch ? 0 : 1,
          proportion: item.proportion,
          ingredients: [],
        }
        if (item.isSwitch) {
          obj.ingredients = item.ingredients.map((ing, index) => {
            return {
              position: index + 1,
              quantity: ing.quantity,
              dictionary_id: ing.dictionary_id,
              dictionary_class_id: item.dictionary_class_id,
            }
          })
        } else {
          obj.ingredients = [
            {
              position: 1,
              quantity: Number(item.quantity),
              dictionary_id: item.dictionary_id,
              dictionary_class_id: item.dictionary_class_id,
            },
          ]
        }

        return obj
      })

      if (!proportion || !dictionaryId || materials.length <= 0)
        return message.warning("数据请填写完整")

      let params = {
        project_id: PROJECT_ID,
        name: values.name,
        proportion: proportion,
        dictionary_id: dictionaryId,
        dictionary_class_id: classValue,
        engineering_listing_id: engineeringListingId,
        materials: JSON.stringify(materials),
        ebs_ids: JSON.stringify(checkedArr),
      } as PostMaterialProportionParams & PutMaterialProportionParams

      if (!!editItem) {
        params.id = editItem.id
        if (engineeringListingId == 0) {
          // @ts-ignore
          delete params.engineering_listing_id
          // @ts-ignore
          delete params.ebs_ids
        }
        await putMaterialProportionApi(params)
      } else {
        if (!engineeringListingId || checkedArr.length <= 0)
          return message.warning("数据请填写完整")
        await postMaterialProportionApi(params)
      }

      cb()
      close()
    },
  )

  return (
    <Drawer open={open} onClose={close} anchor="right">
      <div className="w-[600px] p-10">
        <header className="text-3xl text-[#44566C] mb-8">
          {!!editItem ? "修改配合比" : "添加配合比"}
        </header>
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="mb-8 relative">
            <div className="flex items-start flex-col">
              <InputLabel htmlFor="name" className="mr-3 w-full text-left mb-2.5">
                <RequireTag>物资类别:</RequireTag>
              </InputLabel>

              <Select
                MenuProps={{ sx: { zIndex: 1702, height: "400px" } }}
                sx={{ color: "#303133", zIndex: 1602 }}
                id="role_list"
                size="small"
                value={classValue}
                onChange={(event) => {
                  handleDictionaryClassSelectChange(+event.target.value)
                }}
                fullWidth>
                <MenuItem value={0} disabled>
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
              <InputLabel htmlFor="name" className="mr-3 w-full text-left mb-2.5">
                <RequireTag>规格型号:</RequireTag>
              </InputLabel>

              <Select
                MenuProps={{ sx: { zIndex: 1702, height: "400px" } }}
                sx={{ color: "#303133", zIndex: 1602 }}
                id="role_list"
                size="small"
                value={dictionaryId}
                onChange={(event) => {
                  setDictionaryId(+event.target.value)
                }}
                fullWidth>
                <MenuItem value={0} disabled>
                  <i className="text-[#ababab]">请选择一个规格型号</i>
                </MenuItem>
                {dictionaryList.map((item: any) => (
                  <MenuItem value={item.id} key={item.id}>
                    {item.name}
                  </MenuItem>
                ))}
              </Select>
            </div>
          </div>

          <div className="mb-8 relative">
            <div className="flex items-start flex-col">
              <InputLabel htmlFor="certificate_number" className="mr-3 w-full text-left mb-2.5">
                <RequireTag>配合比名称:</RequireTag>
              </InputLabel>
              <TextField
                variant="outlined"
                id="name"
                size="small"
                fullWidth
                error={Boolean(errors.name)}
                {...register("name", {
                  required: "请输入配合比名称",
                  onBlur() {
                    trigger("name")
                  },
                })}
                placeholder="配合比名称"
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
              <InputLabel htmlFor="manufacturer" className="mr-3 w-full text-left mb-2.5">
                <RequireTag>配合比:</RequireTag>
              </InputLabel>
              <TextField
                variant="outlined"
                id="manufacturer"
                size="small"
                fullWidth
                value={proportion}
                onChange={(event) => {
                  handleChangeProportionState(event.target.value)
                }}
                onBlur={(event) => {
                  handleBlurProportionState(event.target.value)
                }}
                placeholder="配合比"
                autoComplete="off"
              />
            </div>
          </div>

          <div className="mb-8 relative">
            <div className="flex items-start flex-col">
              <InputLabel htmlFor="desc" className="mr-3 w-full text-left mb-2.5">
                <RequireTag> 所需物资:</RequireTag>
              </InputLabel>
              <div className="w-full">
                <ul className="w-full">
                  {materialList.map((item, index) =>
                    index == 0 ? (
                      <li className="w-full flex gap-x-2 mb-2" key={index}>
                        <div className="w-[11.25rem]">
                          <SelectDictionaryClass
                            treeData={treeData}
                            value={item.dictionary_class_id}
                            onChange={(id: number, label) => {
                              handleChangeMaterialDictionaryClassState(index, id, label)
                            }}></SelectDictionaryClass>
                        </div>
                        <Select
                          MenuProps={{ sx: { zIndex: 1702, height: "400px" } }}
                          sx={{ color: "#303133", zIndex: 1602, width: "12.5rem" }}
                          id="role_list"
                          size="small"
                          value={item.dictionary_id}
                          onChange={(event) => {
                            handleChangeMaterialListState(
                              index,
                              "dictionary_id",
                              +event.target.value,
                            )
                          }}>
                          <MenuItem value={0} disabled>
                            <i className="text-[#ababab]">请选择一个规格型号</i>
                          </MenuItem>
                          {item.dictionaryList.map((item: any) => (
                            <MenuItem value={item.id} key={item.id}>
                              {item.name}
                            </MenuItem>
                          ))}
                        </Select>
                        <TextField
                          variant="outlined"
                          size="small"
                          className="w-[4.75rem]"
                          placeholder="数量"
                          autoComplete="off"
                          value={item.quantity}
                          onChange={(event) => {
                            let str = event.target.value.replace(/[^0-9.]/g, "")
                            handleChangeMaterialListState(index, "quantity", str)
                          }}
                        />
                      </li>
                    ) : (
                      <li className="w-full flex gap-x-2 mb-2 flex-col" key={index}>
                        <div className="flex gap-x-4">
                          <div className="w-[11.25rem]">
                            <SelectDictionaryClass
                              treeData={treeData}
                              value={item.dictionary_class_id}
                              onChange={(id: number, label) => {
                                handleChangeMaterialDictionaryClassState(index, id, label)
                              }}></SelectDictionaryClass>
                          </div>
                          <div className="flex-1">
                            <span>多个规格型号：</span>
                            <Switch
                              checked={item.isSwitch}
                              onChange={(event, checked) => {
                                handleChangeSwitch(checked, index)
                              }}></Switch>
                          </div>
                        </div>
                        <div className="mt-2">
                          {item.isSwitch ? (
                            <>
                              <div className="mb-2">
                                <TextField
                                  variant="outlined"
                                  size="small"
                                  placeholder="请输入比值"
                                  autoComplete="off"
                                  value={item.proportion}
                                  onChange={(event) => {
                                    handleChangeSubProportion(event.target.value, index)
                                  }}
                                  onBlur={() => {
                                    handleBlurSubProportion(index)
                                  }}
                                />
                              </div>
                              {item.ingredients.map((subRow, subIndex) => (
                                <div className="flex gap-x-2 mb-2" key={subIndex}>
                                  <Select
                                    MenuProps={{ sx: { zIndex: 1702, height: "400px" } }}
                                    sx={{ color: "#303133", zIndex: 1602, width: "12.5rem" }}
                                    id="role_list"
                                    size="small"
                                    value={subRow.dictionary_id}
                                    onChange={(event) => {
                                      handleChangeSubDictionary(
                                        Number(event.target.value),
                                        index,
                                        subIndex,
                                      )
                                    }}>
                                    <MenuItem value={0} disabled>
                                      <i className="text-[#ababab]">请选择一个规格型号</i>
                                    </MenuItem>
                                    {item.dictionaryList.map((item: any) => (
                                      <MenuItem value={item.id} key={item.id}>
                                        {item.name}
                                      </MenuItem>
                                    ))}
                                  </Select>
                                  <TextField
                                    disabled
                                    variant="outlined"
                                    size="small"
                                    className="w-[4.75rem]"
                                    placeholder="数量"
                                    autoComplete="off"
                                    value={subRow.quantity}
                                  />
                                </div>
                              ))}
                            </>
                          ) : (
                            <div className="flex gap-x-2">
                              <Select
                                MenuProps={{ sx: { zIndex: 1702, height: "400px" } }}
                                sx={{ color: "#303133", zIndex: 1602, width: "12.5rem" }}
                                id="role_list"
                                size="small"
                                value={item.dictionary_id}
                                onChange={(event) => {
                                  handleChangeMaterialListState(
                                    index,
                                    "dictionary_id",
                                    +event.target.value,
                                  )
                                }}>
                                <MenuItem value={0} disabled>
                                  <i className="text-[#ababab]">请选择一个规格型号</i>
                                </MenuItem>
                                {item.dictionaryList.map((item: any) => (
                                  <MenuItem value={item.id} key={item.id}>
                                    {item.name}
                                  </MenuItem>
                                ))}
                              </Select>
                              <TextField
                                disabled
                                variant="outlined"
                                size="small"
                                className="w-[4.75rem]"
                                placeholder="数量"
                                autoComplete="off"
                                value={item.quantity}
                              />
                            </div>
                          )}
                        </div>
                      </li>
                    ),
                  )}
                </ul>
              </div>
            </div>
          </div>

          <div className="mb-8 relative">
            <div className="flex items-start flex-col">
              <InputLabel htmlFor="desc" className="mr-3 w-full text-left mb-2.5">
                <RequireTag>配合比用于具体工程结构:</RequireTag>
              </InputLabel>
              <div className="w-full">
                <Select
                  disabled={!!editItem}
                  MenuProps={{ sx: { zIndex: 1702, height: "400px" } }}
                  sx={{ color: "#303133", zIndex: 1602, flex: 1 }}
                  id="role_list"
                  size="small"
                  fullWidth
                  value={engineeringListingId}
                  onChange={(event) => {
                    setEngineeringListingId(Number(event.target.value))
                    setCheckedArr([])
                    setCheckedEBSList([])
                  }}>
                  <MenuItem value={0}>
                    <i className="text-[#ababab]">请选择一个构筑物</i>
                  </MenuItem>
                  {engineeringList.map((item: any) => (
                    <MenuItem value={item.id} key={item.id}>
                      {item.name}
                    </MenuItem>
                  ))}
                </Select>
              </div>
            </div>
          </div>

          <div className="mb-8 relative">
            <div className="flex items-start flex-col">
              <InputLabel htmlFor="desc" className="mr-3 w-full text-left mb-2.5">
                <RequireTag>关联工程结构:</RequireTag>
              </InputLabel>
              <div className="w-full">
                <div
                  className="border h-10 w-full cursor-pointer border-[#c4c4c4] rounded flex items-center indent-3.5"
                  onClick={(event) => {
                    setAnchorEl(event.currentTarget)
                  }}>
                  {checkedEBSList.map((item) => item.name).join(",")}
                </div>
                <Menu
                  anchorEl={anchorEl}
                  open={openMenu}
                  onClose={handleCloseMenu}
                  MenuListProps={{
                    "aria-labelledby": "basic-button",
                  }}>
                  <div
                    className="max-h-[500px] overflow-y-auto"
                    style={{ width: `${anchorEl?.getBoundingClientRect().width}px` }}>
                    {engineeringListingId ? (
                      <Tree
                        checkedEBSList={checkedEBSList}
                        editItem={editItem}
                        checkArr={checkedArr}
                        treeData={ebsAll}
                        onChecked={(checkedValue, checked, checkedEBSList) => {
                          handleChecked(checkedValue, checked, checkedEBSList)
                        }}
                        getSubEBSData={({ ebsItem, pos }, type) => {
                          return getSubEBSData(ebsItem, pos, type)
                        }}
                      />
                    ) : (
                      <div className="w-full text-center text-[#ababab]">请先选择构筑物</div>
                    )}
                  </div>
                </Menu>
              </div>
            </div>
          </div>

          <div className="mb-8 relative">
            <div className="flex items-start flex-col">
              <InputLabel htmlFor="desc" className="mr-3 w-full text-left mb-2.5">
                备注:
              </InputLabel>
              <TextField
                variant="outlined"
                id="desc"
                size="small"
                fullWidth
                error={Boolean(errors.desc)}
                {...register("desc")}
                placeholder="备注"
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
            <Button onClick={close}>取消</Button>
            <Button type="submit" className="bg-railway_blue text-white">
              确定
            </Button>
          </div>
        </form>
      </div>
    </Drawer>
  )
}
