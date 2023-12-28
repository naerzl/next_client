import { TypeEBSDataList } from "@/app/gantt/types"
import React from "react"

const useDialogMaterialDemand = () => {
  const [dialogOpen, setDialogOpen] = React.useState(false)

  const [item, setItem] = React.useState<null | TypeEBSDataList>(null)

  const handleCloseDialogWithMaterialDemand = () => {
    setDialogOpen(false)
    setItem(null)
  }
  const handleOpenDialogWithMaterialDemand = (item: TypeEBSDataList) => {
    setItem(item)
    setDialogOpen(true)
  }

  return {
    dialogOpen,
    item,
    handleCloseDialogWithMaterialDemand,
    handleOpenDialogWithMaterialDemand,
  }
}

export default useDialogMaterialDemand
