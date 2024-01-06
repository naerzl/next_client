"use client"
import * as React from "react"
import { TreeOption } from "@/types/api"

interface Props {
  treeData: TreeOption[]
  // eslint-disable-next-line no-unused-vars
  onChecked?: (checkedValue: number, checked: boolean, name: string) => void
}

type CheckOption = {
  pos: string
  id: number
  name: string
}

type Info = {
  pos: string
}

export default function TreeWithDIctionaryClass(props: Props) {
  const { treeData, onChecked } = props

  const [expand, setExpand] = React.useState<string[]>([])

  const handleExpand = async (val: string, type: boolean, info: Info) => {
    const newExpand = structuredClone(expand)
    if (type) {
      newExpand.push(val)
      setExpand(newExpand)

      return
    }
    setExpand(newExpand.filter((item) => !item.startsWith(val)))
  }

  const handleClickCheck = (value: CheckOption) => {
    let { pos, id, name } = value
    onChecked && onChecked(id, true, name)
  }

  const ArrToTree = (arr?: TreeOption[], indexStr = "") => {
    return arr?.map((item, index) => {
      let str = indexStr ? `${indexStr}-${index}` : `${index}`

      return (
        <ul key={str + item.id}>
          <li
            className="flex items-center gap-x-2"
            style={{ paddingLeft: str.split("-").length * 16 + "px" }}>
            <div className="aspect-square h-6 flex justify-center items-center">
              {item.children && item.children.length > 0 ? (
                expand.includes(str) ? (
                  <i
                    className="iconfont icon-xiangxiajiantou font-bold cursor-pointer"
                    onClick={() => {
                      handleExpand(str, false, { pos: str })
                    }}></i>
                ) : (
                  <i
                    className="iconfont icon-xiangyoujiantou font-bold cursor-pointer"
                    onClick={() => {
                      handleExpand(str, true, { pos: str })
                    }}></i>
                )
              ) : (
                <i></i>
              )}
            </div>

            <span
              className="whitespace-nowrap overflow-hidden text-ellipsis cursor-pointer"
              onClick={() => {
                handleClickCheck({ pos: str, id: item.id, name: item.title })
              }}>
              {item.title}
            </span>
          </li>
          {expand.includes(str) && ArrToTree(item.children, str)}
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
