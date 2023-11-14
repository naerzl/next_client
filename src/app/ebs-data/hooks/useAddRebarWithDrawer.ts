import React from "react"
import { RebarData } from "@/app/gantt/types"

const useAddRebarWithDrawer = () => {
  const [open, setOpen] = React.useState(false)

  const [editItem, setEditItem] = React.useState<RebarData | null>(null)

  const handleOpenAddRebarWithDrawer = () => {
    setOpen(true)
  }

  const handleCloseAddRebarWithDrawer = () => {
    setOpen(false)
    setEditItem(null)
  }

  const handleEditRebarWithDrawer = (item: RebarData) => {
    setOpen(true)
    setEditItem(item)
  }

  return {
    open,
    handleEditRebarWithDrawer,
    handleCloseAddRebarWithDrawer,
    handleOpenAddRebarWithDrawer,
    editItem,
  }
}

export default useAddRebarWithDrawer
