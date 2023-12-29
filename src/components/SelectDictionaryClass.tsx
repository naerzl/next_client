"use client"
import React, { useState } from "react"
import type { TreeSelectProps } from "antd"
import { TreeSelect } from "antd"
import type { DefaultOptionType } from "antd/es/select"
import { subConcreteDictionaryClass } from "@/app/material-processing/const"
import { reqGetDictionaryClass } from "@/app/api"
import useSWRMutation from "swr/mutation"
import {DictionaryClassData} from "@/types/api";
import {DICTIONARY_CLASS_ID} from "@/libs/const";

type Props = {
  // eslint-disable-next-line no-unused-vars
  onChange: (id: number) => void
  placeholder?: string
  disabled?: boolean
}


type option = {
  pId: number,
  id: number,
  value: string,
  title: string,
}

function SelectDictionaryClass(props: Props) {
  let { onChange: onChangeWithProps, placeholder, disabled } = props

  const { trigger: getDictionaryClassApi } = useSWRMutation(
    "/dictionary-class",
    reqGetDictionaryClass,
  )

  const [value, setValue] = useState<number>()
  const [treeData, setTreeData] = useState<Omit<DefaultOptionType, "label">[]>([])

  const getDictionaryClassList = async () => {
    const res = await getDictionaryClassApi({ is_all: 1 })
    setTreeData(filterByParentId([DICTIONARY_CLASS_ID.concrete], res))
  }

  const filterByParentId = (parentIds: number[] = [], items: DictionaryClassData[], currentParentId = 0): option[] => {
    return items.reduce((previousValue:option[], currentValue: DictionaryClassData):option[] => {
      let currentParentIds: number[] = []
      if(currentValue != undefined && parentIds.indexOf(currentValue.parent_id!) > -1) {
        previousValue.push({
          pId: currentParentId,
          id: currentValue.id,
          value: currentValue.id.toString(),
          title: currentValue.name,
        })
        currentParentIds.push(currentValue.id)
      }

      let filterExtends: option[] = []
      if (currentParentIds.length > 0) {
        filterExtends = filterByParentId(currentParentIds, items, ++currentParentId)
      }

      return [...previousValue, ...filterExtends]
    }, [])
  }

  React.useEffect(() => {
    getDictionaryClassList()
  }, [])
  const onLoadData: TreeSelectProps["loadData"] = ({ id }) =>
    new Promise(async (resolve) => {
      const res = await getDictionaryClassApi({ parent_id: id })
      if (res.length > 0) {
        let classList = res.map((item) => {
          return {
            pId: id,
            id: item.id,
            value: item.id,
            title: item.name,
          }
        })
        setTreeData((prevState) => prevState.concat(classList))
      } else {
        const cloneData = structuredClone(treeData)
        const obj = cloneData.find((item) => item.id == id)
        console.log(obj)
      }

      resolve(undefined)
    })

  const onChange = (newValue: number) => {
    setValue(newValue)
    onChangeWithProps(newValue)
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
      onChange={onChange}
      loadData={onLoadData}
      treeData={treeData}
    />
  )
}

export default SelectDictionaryClass
