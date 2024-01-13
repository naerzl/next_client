"use client"
import React from "react"

import { TreeOption } from "@/types/api"
import TreeWithDIctionaryClass from "@/components/TreeWithDIctionaryClass"
import { Menu } from "@mui/material"
import useGetDictionaryClassHooks from "@/hooks/useGetDictionaryClassHooks"

type Props = {
  // eslint-disable-next-line no-unused-vars
  onChange: (id: number, label: string) => void
  placeholder?: string
  disabled?: boolean
  value?: number
  treeData?: TreeOption[]
}

function SelectDictionaryClass(props: Props) {
  let {
    onChange: onChangeWithProps,
    placeholder,
    disabled,
    value: valueProps,
    treeData: treeDataProps,
  } = props

  const { treeData, flatDate } = useGetDictionaryClassHooks({ treeDataProps })

  const [nameView, setNameView] = React.useState("")
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null)
  const openMenu = Boolean(anchorEl)

  const handleCloseMenu = () => {
    setAnchorEl(null)
  }

  const findTopNode = (id: number): any => {
    const findItem = flatDate.current.find((item) => item.id == id)
    if (findItem && findItem.pId != 0) {
      return findTopNode(findItem.pId)
    }
    return findItem
  }
  const findFlatData = () => {
    const findItem = flatDate.current.find((item) => item.id == valueProps)
    console.log(findItem, valueProps)
    setNameView(findItem ? findItem.title : "")
  }

  React.useEffect(() => {
    valueProps && findFlatData()
  }, [valueProps])

  const onChange = (newValue: number, label: string) => {
    let topNode = findTopNode(newValue)
    setNameView(label)
    setAnchorEl(null)
    onChangeWithProps(newValue, topNode.title)
  }
  return (
    <div className="w-full">
      <div
        className="border h-10 w-full cursor-pointer border-[#c4c4c4] rounded flex items-center indent-3.5"
        onClick={(event) => {
          setAnchorEl(event.currentTarget)
        }}>
        {nameView ? nameView : <span className="text-railway_gray">请选择字典分类</span>}
      </div>
      <Menu
        id="basic-menu"
        sx={{ zIndex: 1700 }}
        anchorEl={anchorEl}
        open={openMenu}
        onClose={handleCloseMenu}
        MenuListProps={{
          "aria-labelledby": "basic-button",
          sx: { zIndex: 1700, width: "600px" },
        }}>
        <div className="max-h-[500px] overflow-y-auto w-full">
          <TreeWithDIctionaryClass
            treeData={treeData}
            onChecked={(checkedValue, checked, name) => {
              onChange(checkedValue, name)
            }}
          />
        </div>
      </Menu>
    </div>
  )
}

export default SelectDictionaryClass
