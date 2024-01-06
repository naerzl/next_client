import { TypeEBSDataList } from "@/app/gantt/types"
import React from "react"

const useDialogMaterialDemandWithUnitProject = () => {
  const [demandWithUnitProjectOpen, setDemandWithUnitProjectOpen] = React.useState(false)

  const [demandUnitProjectItem, setDemandUnitProjectItem] = React.useState<null | TypeEBSDataList>(
    null,
  )

  const handleCloseDialogWithMaterialDemandWithUnitProject = () => {
    setDemandWithUnitProjectOpen(false)
    setDemandUnitProjectItem(null)
  }
  const handleOpenDialogWithMaterialDemandWithUnitProject = (item: TypeEBSDataList) => {
    setDemandUnitProjectItem(item)
    setDemandWithUnitProjectOpen(true)
  }

  return {
    demandWithUnitProjectOpen,
    demandUnitProjectItem,
    handleCloseDialogWithMaterialDemandWithUnitProject,
    handleOpenDialogWithMaterialDemandWithUnitProject,
  }
}

export default useDialogMaterialDemandWithUnitProject
