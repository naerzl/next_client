"use client"
import React, { useState } from "react"
import { TreeSelect } from "antd"
import type { DefaultOptionType } from "antd/es/select"
import { reqGetDictionaryClass } from "@/app/api"
import useSWRMutation from "swr/mutation"
import { DictionaryClassData } from "@/types/api"
import { DICTIONARY_CLASS_ID } from "@/libs/const"

type Props = {
  // eslint-disable-next-line no-unused-vars
  onChange: (id: number, label: string) => void
  placeholder?: string
  disabled?: boolean
  value?: number
  treeData?: Omit<DefaultOptionType, "label">[]
}

type option = {
  pId: number
  id: number
  value: string
  title: string
}

type treeOption = {
  pId: number
  id: number
  value: string
  title: string
  children?: option[]
}

function SelectDictionaryClass(props: Props) {
  let {
    onChange: onChangeWithProps,
    placeholder,
    disabled,
    value: valueProps,
    treeData: treeDataProps,
  } = props

  const { trigger: getDictionaryClassApi } = useSWRMutation(
    "/dictionary-class",
    reqGetDictionaryClass,
  )

  const [value, setValue] = useState<number | undefined>(valueProps == 0 ? undefined : valueProps)
  const [treeData, setTreeData] = useState<Omit<DefaultOptionType, "label">[]>([])

  const getDictionaryClassList = async () => {
    const res = await getDictionaryClassApi({ is_all: 1 })
    let data = FilterByParentId(
      [
        DICTIONARY_CLASS_ID.cement,
        DICTIONARY_CLASS_ID.water,
        DICTIONARY_CLASS_ID.fine_aggregate,
        DICTIONARY_CLASS_ID.coarse_aggregate,
        DICTIONARY_CLASS_ID.mineral_admixture,
        DICTIONARY_CLASS_ID.additive,
      ],
      res,
    )
    console.log(data)
    console.log(arrToTree(data))
    setTreeData(data)
  }

  const arrToTree = (arr: option[], pId = 0) => {
    let list: treeOption[] = []
    arr.forEach((item) => {
      if (item.pId == pId) {
        const children = arrToTree(arr, item.id)
        let obj = { ...item } as treeOption
        if (children.length) {
          obj.children = children
        }
        list.push(obj)
      }
    })

    return list
  }

  const FilterByParentId = (parentIds: number[] = [], items: DictionaryClassData[]): option[] => {
    return [
      ...filterByParentId(parentIds, items),
      ...items
        .filter(function (item: DictionaryClassData) {
          return parentIds.indexOf(item.id) > -1
        })
        .map(function (currentValue): option {
          return {
            pId: 0,
            id: currentValue.id,
            value: currentValue.id.toString(),
            title: currentValue.name,
          }
        }),
    ]
  }

  const filterByParentId = (parentIds: number[] = [], items: DictionaryClassData[]): option[] => {
    let currentParentIds: number[] = []
    let currentItems = items.reduce(
      (previousValue: option[], currentValue: DictionaryClassData): option[] => {
        if (currentValue != undefined && parentIds.indexOf(currentValue.parent_id!) > -1) {
          previousValue.push({
            pId: currentValue.parent_id!,
            id: currentValue.id,
            value: currentValue.id.toString(),
            title: currentValue.name,
          })
          currentParentIds.push(currentValue.id)
        }
        return previousValue
      },
      [],
    )

    let filterExtends: option[] = []
    if (currentParentIds.length > 0) {
      filterExtends = filterByParentId(currentParentIds, items)
    }

    return [...currentItems, ...filterExtends]
  }

  const findTopNode = (id: number): any => {
    const findItem = treeData.find((item) => item.value == id)
    if (findItem && findItem.pId != 0) {
      return findTopNode(findItem.pId)
    }
    return findItem
  }

  React.useEffect(() => {
    if (treeDataProps) {
      setTreeData(treeDataProps)
    } else {
      getDictionaryClassList()
    }
  }, [treeDataProps])

  const onChange = (newValue: number, label: string[]) => {
    let topNode = findTopNode(newValue)
    setValue(newValue)
    onChangeWithProps(newValue, topNode.title)
  }
  return (
    <TreeSelect
      disabled={!!disabled}
      className="w-full h-full"
      treeDataSimpleMode
      style={{ width: "100%" }}
      value={value}
      dropdownStyle={{ maxHeight: 400, overflow: "auto" }}
      placeholder={placeholder ?? "请选择"}
      onChange={(newVale: any, label: any) => {
        onChange(newVale, label)
      }}
      // loadData={onLoadData}
      treeData={treeData}
    />
  )
}

export default SelectDictionaryClass
