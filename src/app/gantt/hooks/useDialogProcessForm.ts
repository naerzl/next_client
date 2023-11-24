import React from "react"
import { ProcessListData } from "../types"

export default function useDialogProcessForm() {
  const [dialogAddFormOpen, setDialogAddFormOpen] = React.useState(false)
  const [formItem, setFormItem] = React.useState<ProcessListData>({} as ProcessListData)

  const handleCloseDialogAddForm = () => {
    setDialogAddFormOpen(false)
    setFormItem({} as ProcessListData)
  }
  const handleOpenDialogAddForm = (item: ProcessListData) => {
    setDialogAddFormOpen(true)
    setFormItem(item)
  }

  return {
    dialogAddFormOpen,
    handleCloseDialogAddForm,
    handleOpenDialogAddForm,
    formItem,
  }
}
