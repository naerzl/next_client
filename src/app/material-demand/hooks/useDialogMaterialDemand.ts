import { TypeEBSDataList } from "@/app/gantt/types"
import React from "react"
import { MaterialDemandListData } from "@/app/material-demand/types"

const useDialogMaterialDemand = () => {
  const [dialogOpen, setDialogOpen] = React.useState(false)

  const [item, setItem] = React.useState<null | MaterialDemandListData>(null)

  const handleCloseDialogWithMaterialDemand = () => {
    setDialogOpen(false)
    setItem(null)
  }
  const handleOpenDialogWithMaterialDemand = (item: MaterialDemandListData) => {
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
