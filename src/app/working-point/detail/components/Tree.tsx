"use client"
import * as React from "react"
import { TypeEBSDataList } from "@/app/ebs-data/types"
import { useSearchParams } from "next/navigation"
import { XIABU } from "@/app/unit-project/const"

interface Props {
  // eslint-disable-next-line no-unused-vars
  treeData: any[]
  getSubEBSData: (info: Info, type: boolean) => Promise<any>
  onChecked?: (checkedValue: any[], checked: boolean) => void
  projectState: number
}

type Info = {
  ebsItem: TypeEBSDataList
  pos: string
}

const findCheckedId = (arr: TypeEBSDataList[], siID: number): number[] => {
  let checkArr: number[] = []

  arr.forEach((item) => {
    if (item.extend && item.extend.project_si_id == siID && item.is_can_select == 0) {
      checkArr.push(item.id)
    }
    if (item.children && item.children.length > 0) {
      return checkArr.push(...findCheckedId(item.children, siID))
    }
  })

  return checkArr
}

export default function Tree(props: Props) {
  const { treeData, getSubEBSData, onChecked, projectState } = props

  const searchParams = useSearchParams()

  const IS_EDIT = Boolean(searchParams.get("spId"))

  React.useEffect(() => {
    if (IS_EDIT && treeData) {
      const editChecked = findCheckedId(treeData, +searchParams.get("siId")!)
      if (editChecked.length > 0) {
        setChecked(editChecked)
        onChecked?.(editChecked, true)
      }
    }
  }, [searchParams, treeData])

  const handleSelectTree = async (event: React.SyntheticEvent, value: string) => {
    console.log(event, value)
  }

  const [expand, setExpand] = React.useState<string[]>([])
  const [emptyChildren, setEmptyChildren] = React.useState<String[]>([])

  const handleExpand = async (val: string, type: boolean, info: Info) => {
    const newExpand = structuredClone(expand)
    if (type) {
      newExpand.push(val)
      setExpand(newExpand)
      const res = await getSubEBSData(info, type)
      console.log(res)
      if (res <= 0) {
        setEmptyChildren([...emptyChildren, val])
      }
      return
    }
    setExpand(newExpand.filter((item) => !item.startsWith(val)))
    setEmptyChildren((prevState) => prevState.filter((item) => !item.startsWith(val)))
    await getSubEBSData(info, type)
  }

  const [checked, setChecked] = React.useState<number[]>([])

  const [fCheckEd, setFChecked] = React.useState<number[]>([])

  const handleChecked = (value: number, type: boolean) => {
    const newChecked = structuredClone(checked)
    if (type) {
      newChecked.push(value)
      setChecked(newChecked)
      onChecked?.(newChecked, type)
      return
    }
    const checkedValue = newChecked.filter((item) => item !== value)
    setChecked(checkedValue)
    onChecked?.(checkedValue, type)
  }

  const handleFChecked = (value: number, pos: string, type: boolean) => {
    const newFChecked = structuredClone(fCheckEd)
    const posArr = pos.split("-")

    const pEBSItem: TypeEBSDataList = eval(`treeData[${posArr.join("].children[")}]`)
    let cEBSId: number[] = []
    if (IS_EDIT) {
      cEBSId = pEBSItem
        .children!.filter(
          (item) =>
            item.is_loop != 1 ||
            (item.extend
              ? item.extend.project_sp_id == +searchParams.get("spId")! &&
                (item.extend.project_si_id == null ||
                  item.extend.project_si_id == +searchParams.get("siId")!)
              : false),
        )
        .map((item) => item.id)
    } else {
      cEBSId = pEBSItem
        .children!.filter(
          (item) => item.is_loop != 1 || (!!item.extend && item.extend.project_si_id == null),
        )
        .map((item) => item.id)
    }
    if (type) {
      newFChecked.push(value)
      setFChecked(newFChecked)

      const newChecked = Array.from(new Set([...checked, ...cEBSId]))
      setChecked(newChecked)
      console.log(newChecked, cEBSId, pEBSItem)
      onChecked?.(newChecked, type)
      return
    }
    const FCheckedValue = newFChecked.filter((item) => item !== value)
    setFChecked(FCheckedValue)

    const checkedValue = checked.filter((item) => !cEBSId.includes(item))
    setChecked(checkedValue)
    onChecked?.(checkedValue, type)
  }

  const renderName = (item: TypeEBSDataList): string => {
    let name = item.extend && item.extend.name ? item.extend.name : item.name
    if (item.is_loop) {
      name += `[${name}仅作为基础的工程结构模板，所有墩的工程结构基于此创建，已创建的墩不受影响。]`
    }
    return name
  }

  const [rote, setRote] = React.useState(0)

  const ArrToTree = (arr: any[], indexStr = "") => {
    return arr?.map((item, index) => {
      let str = indexStr ? `${indexStr}-${index}` : `${index}`

      return (
        <ul key={str + item.id}>
          <li
            className="flex items-center gap-x-2"
            style={
              item.is_loop == 1
                ? { display: "none", paddingLeft: str.split("-").length * 16 + "px" }
                : { paddingLeft: str.split("-").length * 16 + "px" }
            }>
            <div className="aspect-square h-6 flex justify-center items-center">
              {emptyChildren.includes(str) ? (
                <i
                  className="iconfont  icon-shuaxin  font-bold cursor-pointer transition"
                  onClick={() => {
                    handleExpand(str, true, { ebsItem: item, pos: str })
                  }}></i>
              ) : expand.includes(str) ? (
                <i
                  className="iconfont icon-xiangxiajiantou font-bold cursor-pointer"
                  onClick={() => {
                    handleExpand(str, false, { ebsItem: item, pos: str })
                  }}></i>
              ) : (
                <i
                  className="iconfont icon-xiangyoujiantou font-bold cursor-pointer"
                  onClick={() => {
                    handleExpand(str, true, { ebsItem: item, pos: str })
                  }}></i>
              )}
            </div>

            <div className="flex">
              {IS_EDIT
                ? item.class == "none" &&
                  item.extend &&
                  (!item.extend.project_si_id ||
                    item.extend.project_si_id == +searchParams.get("siId")!) &&
                  item.extend.project_sp_id == +searchParams.get("spId")! &&
                  (checked.includes(item.id) ? (
                    <i
                      className="w-4 h-4 border bg-railway_blue cursor-pointer"
                      onClick={() => {
                        handleChecked(item.id, false)
                      }}></i>
                  ) : (
                    <i
                      className="w-4 h-4 border cursor-pointer"
                      onClick={() => {
                        handleChecked(item.id, true)
                      }}></i>
                  ))
                : item.extend &&
                  item.extend.project_sp_id == projectState &&
                  !item.extend.project_si_id &&
                  (checked.includes(item.id) ? (
                    <i
                      className="w-4 h-4 border bg-railway_blue cursor-pointer"
                      onClick={() => {
                        handleChecked(item.id, false)
                      }}></i>
                  ) : (
                    <i
                      className="w-4 h-4 border cursor-pointer"
                      onClick={() => {
                        handleChecked(item.id, true)
                      }}></i>
                  ))}

              {item.is_can_select == 1 &&
                XIABU.includes(item.code) &&
                expand.includes(str) &&
                (fCheckEd.includes(item.id) ? (
                  <i
                    className="w-4 h-4 border bg-railway_blue cursor-pointer"
                    onClick={() => {
                      handleFChecked(item.id, str, false)
                    }}></i>
                ) : (
                  <i
                    className="w-4 h-4 border cursor-pointer"
                    onClick={() => {
                      handleFChecked(item.id, str, true)
                    }}></i>
                ))}
            </div>

            <span>{renderName(item)}</span>
          </li>
          {ArrToTree(item.children, str)}
        </ul>
      )
    })
  }

  return (
    <>
      <div>{ArrToTree(treeData)}</div>
    </>
  )
}
