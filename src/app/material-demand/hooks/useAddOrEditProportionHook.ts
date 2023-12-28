import React from "react"
import { MaterialProportionListData } from "@/app/proportion/types"

export default function useAddOrEditProportionHook() {
  const [open, setOpen] = React.useState(false)

  const [proportionItem, setProportionItem] = React.useState<MaterialProportionListData | null>(
    null,
  )

  const handleOpenAddOrEditProportion = () => {
    setOpen(true)
  }
  const handleCloseAddOrEditProportion = () => {
    setOpen(false)
    setProportionItem(null)
  }

  const handleEditProportion = (items: MaterialProportionListData) => {
    setOpen(true)
    setProportionItem(items)
  }

  return {
    open,
    proportionItem,
    handleCloseAddOrEditProportion,
    handleEditProportion,
    handleOpenAddOrEditProportion,
  }
}
