import React from "react"
import { MaterialReceiveData } from "@/app/material-receipt/types"

export function useAddOrEditMaterial() {
  const [drawerOpen, setDrawerOpen] = React.useState(false)

  const [editItem, setEditItem] = React.useState<MaterialReceiveData | null>(null)

  const handleAddMaterial = () => {
    setDrawerOpen(true)
  }

  const handleEditMaterial = (item: MaterialReceiveData) => {
    setDrawerOpen(true)
    setEditItem(item)
  }

  const handleCloseMaterialWithDrawer = () => {
    setDrawerOpen(false)
    setEditItem(null)
  }

  return {
    drawerOpen,
    editItem,
    handleAddMaterial,
    handleEditMaterial,
    handleCloseMaterialWithDrawer,
  }
}
