"use client"
import React from "react"
import useSWRMutation from "swr/mutation"
import UnitProjectContext from "@/app/unit-project/context/unitProjectContext"
import { reqPostProjectSubSection } from "@/app/unit-project/api"
import { PROJECT_ID } from "@/libs/const"
import {
  Button,
  InputLabel,
  TextField,
  SelectChangeEvent,
  CardContent,
  Card,
  Checkbox,
  ListItemText,
} from "@mui/material"
import { ErrorMessage } from "@hookform/error-message"
import { useForm } from "react-hook-form"
import useDebounce from "@/hooks/useDebounce"
import { Tree } from "antd"
import { reqGetCodeCount, reqGetEBS } from "@/app/ebs-data/api"
import { TypeEBSDataList } from "@/app/ebs-data/types"
import { useSearchParams } from "next/navigation"
import { reqGetEngineeringListing } from "@/app/basic-engineering-management/api"
import { EngineeringListing } from "@/app/basic-engineering-management/types/index.d"

type IForm = {
  name: string
  start_mileage: number
  start_tally: number
  end_mileage: number
  end_tally: number
  calculate_value: number
}

// 转换数据 添加自定义字段 key
const changeTreeArr = (arr: TypeEBSDataList[], indexStr = "", flag: boolean): TypeEBSDataList[] => {
  if (!arr) arr = []
  return arr.map((item, index) => {
    let str = indexStr ? `${indexStr}-${index}` : `${index}`
    return {
      ...item,
      key: String(item.id),
      checkable: flag,
      disableCheckbox: !flag,
      children: changeTreeArr(item.children as TypeEBSDataList[], str, flag),
    }
  })
}

export default function UnitProjectDetailPage() {
  const handleCancel = () => {
    reset()
  }

  const {
    handleSubmit,
    formState: { errors },
    register,
    reset,
    trigger,
  } = useForm<IForm>({})

  const [treeData, setTreeData] = React.useState<TypeEBSDataList[]>([])

  const { trigger: postProjectSubSection } = useSWRMutation(
    "/project-subsection",
    reqPostProjectSubSection,
  )

  const { trigger: getEngineeringListingApi } = useSWRMutation(
    "/engineering-listing",
    reqGetEngineeringListing,
  )

  const [engineeringList, setEngineeringList] = React.useState<EngineeringListing[]>([])

  const getEngineeringListingList = async () => {
    const res = await getEngineeringListingApi({ project_id: PROJECT_ID })
    setEngineeringList(res)
  }

  React.useEffect(() => {
    getEngineeringListingList()
  }, [])

  const { trigger: getCodeCountApi } = useSWRMutation("/ebs/code-count", reqGetCodeCount)

  // 获取EBS结构数据
  const { trigger: getEBSApi } = useSWRMutation("/ebs", reqGetEBS)

  // 渲染节点下面的children 树结构方法
  const renderTreeArr = (data: TypeEBSDataList[], indexStr: string) => {
    const newData = structuredClone(treeData)
    if (indexStr == "") {
      const flag = engineeringSelect.includes(Number(basicId))
      const newArr = changeTreeArr(data, "", flag)
      console.log(newArr)
      setTreeData(newArr)

      return
    }

    const indexArr = indexStr.split("-")
    const str = `newData[${indexArr.join("].children[")}]`
    eval(str + ".children=data")

    const flag = engineeringSelect.includes(Number(basicId))
    const newArr = changeTreeArr(newData, "", flag)
    setTreeData(newArr)
  }

  const [basicId, setBasicId] = React.useState<null | number>(null)

  const [loadedKeys, setLoadedKeys] = React.useState<string[]>([])

  React.useEffect(() => {
    const params: any = { project_id: PROJECT_ID, is_hidden: 0 }

    if (basicId) {
      const obj = engineeringList.find((item) => item.id == basicId)!

      params["code"] = obj.ebs.code
      params["engineering_listing_id"] = obj.id

      getEBSApi(params).then(async (res) => {
        if (res) {
          if (res.length > 0) {
            // 获取子节点的code数组
            const codeArr = res.map((item) => item.code)
            // 获取子节点
            const resCount = await getCodeCountApi({
              code: JSON.stringify(codeArr),
              // code: JSON.stringify(["0102", "0101"]),
              level: 2,
              is_hidden: 0,
              project_id: PROJECT_ID,
            })
            if (Object.keys(resCount).length > 0) {
              const childrenArr = res.map((item) => ({
                ...item,
                childrenCount: resCount[String(item.code) as any] || {
                  platform: 0,
                  system: 0,
                  userdefined: 0,
                  none: 0,
                },
                isLeaf: false,
              }))

              renderTreeArr(childrenArr, "")
            } else {
              const childrenArr = res.map((item) => ({
                ...item,
                childrenCount: { platform: 0, system: 0, userdefined: 0, none: 0 },
                isLeaf: false,
              }))
              // renderTreeArr(childrenArr, "")
            }
          }
        }
      })
    }

    setExpandedKeys([])
    setLoadedKeys([])
  }, [basicId])

  const onLoadData = (obj: any) => {
    return new Promise<void>(async (resolve) => {
      const { pos } = obj
      const res = await getEBSApi({
        project_id: PROJECT_ID,
        level: obj.level + 1,
        is_hidden: 0,
        code: obj.code,
        engineering_listing_id: basicId!,
      })

      if (res.length > 0) {
        // 获取子节点的code数组
        const codeArr = res.map((item) => item.code)
        // 获取子节点
        const resCount = await getCodeCountApi({
          code: JSON.stringify(codeArr),
          level: obj.level + 2,
          is_hidden: 0,
          project_id: PROJECT_ID,
        })
        if (Object.keys(resCount).length > 0) {
          const childrenArr = res.map((item) => {
            return {
              ...item,
              childrenCount: resCount[String(item.code) as any] || {
                platform: 0,
                system: 0,
                userdefined: 0,
                none: 0,
              },
              isLeaf: !resCount[String(item.code) as any],
            }
          })

          renderTreeArr(childrenArr, pos.slice(2))
        } else {
          const childrenArr = res.map((item) => ({
            ...item,
            childrenCount: { platform: 0, system: 0, userdefined: 0, none: 0 },
            isLeaf: true,
          }))
          renderTreeArr(childrenArr, pos.slice(2))
        }
      }
      setLoadedKeys((prevState) => Array.from(new Set([...prevState, obj.key])))
      resolve()
    })
  }

  // 提交表单事件（防抖）
  const { run: onSubmit } = useDebounce(async (value: any) => {
    const params = {} as any
    params.project_id = PROJECT_ID
    params.name = value.name
    const arr = engineeringSelect.map((id) => {
      return {
        engineering_listing_id: id,
        ebs_ids: JSON.stringify(related_to.current[`${id}`]),
      }
    })
    params.related_to = JSON.stringify(arr)

    const res = await postProjectSubSection(params)
    // ctx.getProjectSubSection()
    // handleCancel()
  })

  const [expandedKeys, setExpandedKeys] = React.useState<React.Key[]>([])
  const [checkedKeys, setCheckedKeys] = React.useState<React.Key[]>([])
  const [selectedKeys, setSelectedKeys] = React.useState<React.Key[]>([])
  const [autoExpandParent, setAutoExpandParent] = React.useState<boolean>(true)

  const onExpand = (expandedKeysValue: React.Key[]) => {
    setExpandedKeys(expandedKeysValue)
    setAutoExpandParent(false)
  }

  const onCheck = (checkedKeysValue: any, info: any) => {
    setCheckedKeys(checkedKeysValue)
    related_to.current[`${basicId}`] = checkedKeysValue.map((id: any) => Number(id))
    console.log(related_to.current)
  }

  const onSelect = (selectedKeysValue: React.Key[], info: any) => {
    console.log("onSelect", info)
    setSelectedKeys(selectedKeysValue)
  }

  const [engineeringSelect, setEngineeringSelect] = React.useState<number[]>([])

  const related_to = React.useRef<any>({})

  React.useEffect(() => {
    const flag = engineeringSelect.includes(Number(basicId))
    setTreeData((prevState) => changeSelectedTree(prevState, flag))
  }, [engineeringSelect])

  const changeSelectedTree = (arr: TypeEBSDataList[], flag = true): TypeEBSDataList[] => {
    return arr.map((item) => {
      return {
        ...item,
        checkable: flag,
        disableCheckbox: !flag,
        children: item.children ? changeSelectedTree(item.children, flag) : [],
      }
    })
  }

  return (
    <>
      <Card sx={{ minWidth: 275, height: "100%" }}>
        <CardContent className="flex">
          <div>
            <div className="w-[500px] p-10">
              <header className="text-3xl text-[#44566C] mb-8">添加单位工程</header>
              <form onSubmit={handleSubmit(onSubmit)}>
                <div className="mb-8 relative">
                  <div className="flex items-start flex-col">
                    <InputLabel htmlFor="name" className="mr-3 w-full text-left mb-2.5" required>
                      单位工程名称:
                    </InputLabel>
                    <TextField
                      variant="outlined"
                      id="name"
                      size="small"
                      fullWidth
                      error={Boolean(errors.name)}
                      {...register("name", {
                        required: "请输入单位工程名称",
                        maxLength: {
                          value: 16,
                          message: "文本最多16个",
                        },
                        onBlur() {
                          trigger("name")
                        },
                      })}
                      placeholder="请输入单位工程名称"
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
                      id="demo-multiple-checkbox-label"
                      className="mr-3 w-full text-left mb-2.5"
                      required>
                      关联基础工程
                    </InputLabel>

                    {engineeringList.map((item) => (
                      <div key={item.id} className="flex items-center">
                        <Checkbox
                          className="cursor-pointer"
                          checked={engineeringSelect.indexOf(item.id) > -1}
                          onChange={(_, checked) => {
                            if (checked) {
                              setEngineeringSelect((prevState) => [...prevState, item.id])
                              related_to.current[`${item.id}`] = []
                            } else {
                              delete related_to.current[`${item.id}`]
                              setEngineeringSelect((prevState) =>
                                prevState.filter((el) => el != item.id),
                              )
                            }
                          }}
                        />
                        <ListItemText
                          className="cursor-pointer"
                          primary={item.name}
                          onClick={() => {
                            setCheckedKeys(related_to.current[item.id] ?? [])
                            setBasicId(item.id)
                          }}
                        />
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <Button onClick={handleCancel}>取消</Button>
                  <Button type="submit" variant="contained" className="bg-railway_blue">
                    确定
                  </Button>
                </div>
              </form>
            </div>
          </div>
          <div className="mt-10 ml-10">
            <Tree
              multiple
              checkable
              loadedKeys={loadedKeys}
              onExpand={onExpand}
              expandedKeys={expandedKeys}
              autoExpandParent={autoExpandParent}
              onCheck={onCheck}
              checkedKeys={checkedKeys}
              onSelect={onSelect}
              selectedKeys={selectedKeys}
              treeData={treeData as any[]}
              fieldNames={{ title: "name", key: "id" }}
              loadData={onLoadData}
              onRightClick={(...arg) => {
                console.log(arg)
              }}
            />
          </div>
        </CardContent>
      </Card>
    </>
  )
}
