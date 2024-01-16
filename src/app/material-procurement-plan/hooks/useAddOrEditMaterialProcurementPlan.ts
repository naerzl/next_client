import React from "react"
import { MaterialProcurementPlanData } from "@/app/material-procurement-plan/types"

const useAddOrEditMaterialProcurementPlan = () => {
  const [open, setOpen] = React.useState(false)

  const [procurementPlanItem, setProcurementPlanItem] =
    React.useState<null | MaterialProcurementPlanData>(null)

  const handleCloseDialog = () => {
    setOpen(false)
    setProcurementPlanItem(null)
  }

  const handleOpenDialogWithAdd = () => {
    setOpen(true)
  }

  const handleOpenDialogWithEdit = (item: MaterialProcurementPlanData) => {
    setOpen(true)
    setProcurementPlanItem(item)
  }

  return {
    open,
    procurementPlanItem,
    handleCloseDialog,
    handleOpenDialogWithAdd,
    handleOpenDialogWithEdit,
  }
}

export default useAddOrEditMaterialProcurementPlan
