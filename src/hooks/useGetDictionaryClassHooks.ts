import { DICTIONARY_CLASS_ID } from "@/libs/const"
import { DictionaryClassData, Option, TreeOption } from "@/types/api"
import useSWRMutation from "swr/mutation"
import { reqGetDictionaryClass } from "@/app/api"
import React, { useState } from "react"

type Props = {
  treeDataProps?: TreeOption[]
  dictionaryClassIds?: number[]
}

const BaseDictionaryClassId = [
  DICTIONARY_CLASS_ID.cement,
  DICTIONARY_CLASS_ID.water,
  DICTIONARY_CLASS_ID.fine_aggregate,
  DICTIONARY_CLASS_ID.coarse_aggregate,
  DICTIONARY_CLASS_ID.mineral_admixture,
  DICTIONARY_CLASS_ID.additive,
]

const useGetDictionaryClassHooks = (props: Props) => {
  let { treeDataProps, dictionaryClassIds } = props

  const { trigger: getDictionaryClassApi } = useSWRMutation(
    "/dictionary-class",
    reqGetDictionaryClass,
  )
  const [treeData, setTreeData] = useState<TreeOption[]>(treeDataProps ?? [])
  const flatDate = React.useRef<TreeOption[]>([])

  const getDictionaryClassList = async () => {
    const res = await getDictionaryClassApi({ is_all: 1 })
    let data = FilterByParentId(dictionaryClassIds ?? BaseDictionaryClassId, res)
    flatDate.current = data
    setTreeData(arrToTree(data))
  }

  const arrToTree = (arr: Option[], pId = 0) => {
    let list: TreeOption[] = []
    arr.forEach((item) => {
      if (item.pId == pId) {
        const children = arrToTree(arr, item.id)
        let obj = { ...item } as TreeOption
        if (children.length) {
          obj.children = children
        }
        list.push(obj)
      }
    })

    return list
  }

  const FilterByParentId = (parentIds: number[] = [], items: DictionaryClassData[]): Option[] => {
    return [
      ...filterByParentId(parentIds, items),
      ...items
        .filter(function (item: DictionaryClassData) {
          return parentIds.indexOf(item.id) > -1
        })
        .map(function (currentValue): Option {
          return {
            pId: 0,
            id: currentValue.id,
            value: currentValue.id.toString(),
            title: currentValue.name,
          }
        }),
    ]
  }

  const filterByParentId = (parentIds: number[] = [], items: DictionaryClassData[]): Option[] => {
    let currentParentIds: number[] = []
    let currentItems = items.reduce(
      (previousValue: Option[], currentValue: DictionaryClassData): Option[] => {
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

    let filterExtends: Option[] = []
    if (currentParentIds.length > 0) {
      filterExtends = filterByParentId(currentParentIds, items)
    }

    return [...currentItems, ...filterExtends]
  }

  const treeDataToFlagData = (arr: TreeOption[]) => {
    let list: TreeOption[] = []
    arr.forEach((item) => {
      list.push(item)
      if (item.children && item.children.length > 0) {
        list.push(...treeDataToFlagData(item.children))
      }
    })

    return list
  }

  React.useEffect(() => {
    if (treeDataProps) {
      flatDate.current = treeDataToFlagData(treeDataProps)
    } else {
      getDictionaryClassList()
    }
  }, [treeDataProps])

  return {
    treeData,
    flatDate,
  }
}

export default useGetDictionaryClassHooks
