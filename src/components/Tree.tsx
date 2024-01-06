"use client"
import * as React from "react"
import { TypeEBSDataList } from "@/app/ebs-data/types"
import { MaterialProportionListData } from "@/app/proportion/types"

interface Props {
  treeData: TypeEBSDataList[]
  // eslint-disable-next-line no-unused-vars
  getSubEBSData: (info: Info, type: boolean) => Promise<any>
  // eslint-disable-next-line no-unused-vars
  onChecked?: (checkedValue: number, checked: boolean, name: string) => void
}

type CheckOption = {
  pos: string
  id: number
  name: string
}

type Info = {
  ebsItem: TypeEBSDataList
  pos: string
}

export default function Tree(props: Props) {
  const { treeData, getSubEBSData, onChecked } = props

  const [expand, setExpand] = React.useState<string[]>([])
  const [emptyChildren, setEmptyChildren] = React.useState<String[]>([])

  const handleExpand = async (val: string, type: boolean, info: Info) => {
    const newExpand = structuredClone(expand)
    if (type) {
      newExpand.push(val)
      setExpand(newExpand)
      const res = await getSubEBSData(info, type)
      if (res <= 0) {
        setEmptyChildren([...emptyChildren, val])
      }
      return
    }
    setExpand(newExpand.filter((item) => !item.startsWith(val)))
    setEmptyChildren((prevState) => prevState.filter((item) => !item.startsWith(val)))
    await getSubEBSData(info, type)
  }

  const renderName = (item: TypeEBSDataList): string => {
    let name = item.extend && item.extend.name ? item.extend.name : item.name
    if (item.is_loop) {
      name += `[${name}仅作为基础的工程结构模板，所有墩的工程结构基于此创建，已创建的墩不受影响。]`
    }
    return name
  }

  const handleClickCheck = (value: CheckOption) => {
    let { pos, id, name } = value
    onChecked && onChecked(id, true, name)
  }

  const ArrToTree = (arr?: TypeEBSDataList[], indexStr = "") => {
    return arr?.map((item, index) => {
      let str = indexStr ? `${indexStr}-${index}` : `${index}`

      return (
        <ul key={str + item.id}>
          <li
            className="flex items-center gap-x-2"
            style={{ paddingLeft: str.split("-").length * 16 + "px" }}>
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

            <span
              className="whitespace-nowrap overflow-hidden text-ellipsis cursor-pointer"
              onClick={() => {
                handleClickCheck({ pos: str, id: item.id, name: item.name })
              }}>
              {renderName(item)}
            </span>
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
