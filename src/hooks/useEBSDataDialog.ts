import React from "react"
import { TypeEBSDataList } from "@/app/ebs-data/types"
import { Type_Is_system } from "@/app/ebs-data/components/TableTr"

export default function useEBSDataDialog() {
  const [dialogOpen, setDialogOpen] = React.useState(false)

  const [deletedDataList, setDeletedDataList] = React.useState<TypeEBSDataList[]>([])

  const [addType, setAddType] = React.useState<Type_Is_system>("system")

  const [isEdit, setIsEdit] = React.useState(false)

  const [item, setItem] = React.useState<TypeEBSDataList>({} as TypeEBSDataList)

  // 添加EBS结构
  const handleAddEBS = (
    item: TypeEBSDataList,
    delDataList: TypeEBSDataList[],
    type: Type_Is_system,
  ) => {
    setItem(item)
    setDialogOpen(true)
    setDeletedDataList(delDataList)
    setAddType(type)
  }

  const handleAddCustomEBS = (item: TypeEBSDataList, type: Type_Is_system) => {
    setDialogOpen(true)
    setItem(item)
    setAddType(type)
  }

  const handleEditCustomEBS = (item: TypeEBSDataList) => {
    setDialogOpen(true)
    setItem(item)
    setIsEdit(true)
    setAddType("userdefined")
  }

  const changeIsEdit = (edit: boolean) => {
    setIsEdit(edit)
  }

  const changeDialogOpen = (open: boolean) => {
    setDialogOpen(open)
  }
  return {
    item,
    dialogOpen,
    deletedDataList,
    addType,
    isEdit,
    handleAddEBS,
    changeIsEdit,
    changeDialogOpen,
    handleAddCustomEBS,
    handleEditCustomEBS,
  }
}
